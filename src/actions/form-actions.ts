"use server";

import { auth } from "@/backend/auth";
import { prisma } from "@/backend/db/prisma";
import { redirect } from "next/navigation";

export async function createFormAction(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  if (!title || title.trim() === "") {
    return;
  }

  let dbUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!dbUser && session.user?.email) {
    dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
  }

  if (!dbUser) {
    throw new Error("Usuário não encontrado no banco de dados. Por favor, faça login novamente.");
  }

  const newForm = await prisma.form.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      userId: dbUser.id,
    },
  });

  redirect(`/dashboard/forms/${newForm.id}`);
}
