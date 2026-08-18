"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { prisma } from "@/backend/db/prisma";
import { createFormSchema, createQuestionSchema, updateQuestionSchema } from "@/server/validators";

const MAX_QUESTIONS = 20;

export async function getOwnedForm(formId: string, userId: string) {
  const form = await prisma.form.findUnique({
    where: { id: formId },
    include: { _count: { select: { questions: true } } },
  });

  if (!form || form.userId !== userId) {
    return null;
  }

  return form;
}

export async function createForm(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const parsed = createFormSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const userId = session.user.id;
  const dbUser = await prisma.user.findUnique({ where: { id: userId } });

  if (!dbUser) {
    throw new Error("Usuário não encontrado no banco de dados. Por favor, faça login novamente.");
  }

  const newForm = await prisma.form.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      userId: dbUser.id,
    },
  });

  return { success: true, formId: newForm.id };
}

function getDynamicOptions(formData: FormData) {
  return Array.from(formData.entries())
    .filter(([key]) => key.startsWith("option-"))
    .sort(([keyA], [keyB]) => {
      const indexA = Number(keyA.replace("option-", ""));
      const indexB = Number(keyB.replace("option-", ""));
      return indexA - indexB;
    })
    .map(([, value]) => String(value).trim());
}

export async function addQuestion(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const parsed = createQuestionSchema.safeParse({
    formId: formData.get("formId"),
    text: formData.get("text"),
    type: formData.get("type"),
    isRequired: formData.get("isRequired") === "on",
    options: getDynamicOptions(formData),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { formId, text, type, isRequired, options } = parsed.data;

  const form = await getOwnedForm(formId, session.user.id);

  if (!form) {
    return { error: "Formulário não encontrado." };
  }

  if (form._count.questions >= MAX_QUESTIONS) {
    return { error: `Limite de ${MAX_QUESTIONS} perguntas por formulário.` };
  }

  const finalOptions = type === "MULTIPLE_CHOICE"
    ? options.map((option) => option.trim()).filter(Boolean)
    : [];

  if (type === "MULTIPLE_CHOICE" && finalOptions.length < 2) {
    return { error: "Múltipla escolha exige pelo menos 2 opções." };
  }

  const maxOrder = await prisma.question.aggregate({
    where: { formId },
    _max: { order: true },
  });

  await prisma.question.create({
    data: {
      text,
      type,
      order: (maxOrder._max.order ?? -1) + 1,
      isRequired,
      formId,
      options:
        finalOptions.length > 0
          ? { create: finalOptions.map((optionText) => ({ text: optionText })) }
          : undefined,
    },
  });

  revalidatePath(`/dashboard/forms/${formId}`);
  return { success: true };
}

export async function updateQuestion(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const parsed = updateQuestionSchema.safeParse({
    formId: formData.get("formId"),
    questionId: formData.get("questionId"),
    text: formData.get("text"),
    type: formData.get("type"),
    isRequired: formData.get("isRequired") === "on",
    options: getDynamicOptions(formData),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { formId, questionId, text, type, isRequired, options } = parsed.data;

  const form = await getOwnedForm(formId, session.user.id);

  if (!form) {
    return { error: "Formulário não encontrado." };
  }

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { options: true },
  });

  if (!question || question.formId !== formId) {
    return { error: "Pergunta não encontrada." };
  }

  const finalOptions = type === "MULTIPLE_CHOICE"
    ? options.map((option) => option.trim()).filter(Boolean)
    : [];

  if (type === "MULTIPLE_CHOICE" && finalOptions.length < 2) {
    return { error: "Múltipla escolha exige pelo menos 2 opções." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.option.deleteMany({ where: { questionId } });

    await tx.question.update({
      where: { id: questionId },
      data: {
        text,
        type,
        isRequired,
        ...(type === "MULTIPLE_CHOICE"
          ? {
              options: {
                create: finalOptions.map((optionText) => ({ text: optionText })),
              },
            }
          : {}),
      },
    });
  });

  revalidatePath(`/dashboard/forms/${formId}`);
  return { success: true };
}

export async function deleteQuestion(formId: string, questionId: string, userId: string) {
  const form = await getOwnedForm(formId, userId);

  if (!form) {
    return { error: "Formulário não encontrado." };
  }

  const question = await prisma.question.findUnique({
    where: { id: questionId },
  });

  if (!question || question.formId !== formId) {
    return { error: "Pergunta não encontrada." };
  }

  await prisma.question.delete({ where: { id: questionId } });

  revalidatePath(`/dashboard/forms/${formId}`);
  return { success: true };
}
