"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "Todos os campos são obrigatórios." };
  }

  // Verifica se o usuário já existe
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "Este e-mail já está em uso." };
  }

  // Criptografa a senha antes de salvar
  const hashedPassword = await bcrypt.hash(password, 10);

  // Cria o usuário no banco
  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // Redireciona para o login após o sucesso
  redirect("/login");
}
