"use server";

import { redirect } from "next/navigation";
import { createForm, addQuestion, deleteQuestion, updateQuestion } from "@/server/forms";
import { auth } from "@/server/auth";

export async function createFormAction(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const result = await createForm(formData);

  if (result?.error) {
    throw new Error(result.error);
  }

  if (result?.formId) {
    redirect(`/dashboard/forms/${result.formId}`);
  }
}

export async function addQuestionAction(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return addQuestion(formData);
}

export async function updateQuestionAction(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return updateQuestion(formData);
}

export async function deleteQuestionAction(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const formId = String(formData.get("formId") ?? "");
  const questionId = String(formData.get("questionId") ?? "");

  if (!formId || !questionId) {
    return { error: "Dados inválidos." };
  }

  return deleteQuestion(formId, questionId, session.user.id);
}
