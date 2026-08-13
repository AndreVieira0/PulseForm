"use server";

import { auth } from "@/backend/auth";
import { prisma } from "@/backend/db/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const MAX_QUESTIONS = 20;
const QUESTION_TYPES = ["TEXT", "MULTIPLE_CHOICE", "SCALE"] as const;
type QuestionType = (typeof QUESTION_TYPES)[number];

async function getOwnedForm(formId: string, userId: string) {
  const form = await prisma.form.findUnique({
    where: { id: formId },
    include: { _count: { select: { questions: true } } },
  });

  if (!form || form.userId !== userId) {
    return null;
  }

  return form;
}

export async function addQuestionAction(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const formId = formData.get("formId") as string;
  const text = (formData.get("text") as string)?.trim();
  const type = formData.get("type") as QuestionType;
  const isRequired = formData.get("isRequired") === "on";
  const optionsRaw = (formData.get("options") as string)?.trim();

  if (!formId || !text) {
    return { error: "Preencha o texto da pergunta." };
  }

  if (!QUESTION_TYPES.includes(type)) {
    return { error: "Tipo de pergunta inválido." };
  }

  const form = await getOwnedForm(formId, session.user.id);

  if (!form) {
    return { error: "Formulário não encontrado." };
  }

  if (form._count.questions >= MAX_QUESTIONS) {
    return { error: `Limite de ${MAX_QUESTIONS} perguntas por formulário.` };
  }

  const options =
    type === "MULTIPLE_CHOICE"
      ? optionsRaw
          .split("\n")
          .map((o) => o.trim())
          .filter(Boolean)
      : [];

  if (type === "MULTIPLE_CHOICE" && options.length < 2) {
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
        options.length > 0
          ? { create: options.map((optionText) => ({ text: optionText })) }
          : undefined,
    },
  });

  revalidatePath(`/dashboard/forms/${formId}`);
  return { success: true };
}

export async function deleteQuestionAction(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const formId = formData.get("formId") as string;
  const questionId = formData.get("questionId") as string;

  if (!formId || !questionId) {
    return { error: "Dados inválidos." };
  }

  const form = await getOwnedForm(formId, session.user.id);

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
