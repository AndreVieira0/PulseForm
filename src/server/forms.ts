"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/server/auth";
import { prisma } from "@/backend/db/prisma";
import { createFormSchema, createQuestionSchema, updateQuestionSchema } from "@/server/validators";

const MAX_QUESTIONS = 20;
const MAX_OPTION_LENGTH = 300;
const MAX_RESPONSE_LENGTH = 5000;

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
    .map(([, value]) => String(value).trim())
    .filter(Boolean);
}

export async function addQuestion(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const parsed = createQuestionSchema.safeParse({
    formId: String(formData.get("formId") ?? ""),
    text: String(formData.get("text") ?? ""),
    type: String(formData.get("type") ?? ""),
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

  if (finalOptions.some((option) => option.length > MAX_OPTION_LENGTH)) {
    return { error: `Cada alternativa deve ter no máximo ${MAX_OPTION_LENGTH} caracteres.` };
  }

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
    formId: String(formData.get("formId") ?? ""),
    questionId: String(formData.get("questionId") ?? ""),
    text: String(formData.get("text") ?? ""),
    type: String(formData.get("type") ?? ""),
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

  if (finalOptions.some((option) => option.length > MAX_OPTION_LENGTH)) {
    return { error: `Cada alternativa deve ter no máximo ${MAX_OPTION_LENGTH} caracteres.` };
  }

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
    include: { _count: { select: { responseItems: true } } },
  });

  if (!question || question.formId !== formId) {
    return { error: "Pergunta não encontrada." };
  }

  if (question._count.responseItems > 0) {
    return { error: "Não é possível remover uma pergunta que já possui respostas." };
  }

  await prisma.question.delete({ where: { id: questionId } });

  revalidatePath(`/dashboard/forms/${formId}`);
  return { success: true };
}

export async function submitResponse(formId: string, formData: FormData) {
  const form = await prisma.form.findUnique({
    where: { id: formId },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: { options: true },
      },
    },
  });

  if (!form || !form.isActive) {
    return { error: "Este formulário não está disponível." };
  }

  const items: { questionId: string; value: string }[] = [];

  for (const question of form.questions) {
    const rawValue = formData.get(`question-${question.id}`);
    const value = typeof rawValue === "string" ? rawValue.trim() : "";

    if (question.isRequired && !value) {
      return { error: `Responda à pergunta obrigatória: ${question.text}` };
    }

    if (!value) {
      continue;
    }

    if (question.type === "MULTIPLE_CHOICE") {
      if (!question.options.some((option) => option.id === value)) {
        return { error: "Uma das alternativas selecionadas é inválida." };
      }
    } else if (question.type === "SCALE") {
      if (!/^[1-5]$/.test(value)) {
        return { error: "A escala deve conter um valor entre 1 e 5." };
      }
    } else if (value.length > MAX_RESPONSE_LENGTH) {
      return { error: `A resposta deve ter no máximo ${MAX_RESPONSE_LENGTH} caracteres.` };
    }

    items.push({ questionId: question.id, value });
  }

  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  const ipAddress = forwardedFor?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip");

  await prisma.response.create({
    data: {
      formId,
      ipAddress: ipAddress || null,
      items: { create: items },
    },
  });

  return { success: true };
}

export async function toggleForm(formId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const form = await prisma.form.findFirst({
    where: { id: formId, userId: session.user.id },
  });

  if (!form) {
    return { error: "Formulário não encontrado." };
  }

  await prisma.form.update({
    where: { id: formId },
    data: { isActive: !form.isActive },
  });

  revalidatePath(`/dashboard/forms/${formId}`);
  revalidatePath(`/forms/${formId}`);
  return { success: true };
}
