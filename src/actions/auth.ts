"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Zod schema para validar os dados do registro
const registerSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  email: z.string().email("Por favor, forneça um e-mail válido."),
  password: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres.")
    .regex(/[a-zA-Z]/, "A senha deve conter pelo menos uma letra.")
    .regex(/[0-9]/, "A senha deve conter pelo menos um número."),
});

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Validação segura com Zod
  const parsed = registerSchema.safeParse({ name, email, password });
  
  if (!parsed.success) {
    // Retorna a primeira mensagem de erro encontrada na validação
    return { error: parsed.error.errors[0].message };
  }

  // Verifica se o e-mail já existe no banco
  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existingUser) {
    return { error: "Este e-mail já está sendo usado por outra conta." };
  }

  // Criptografa a senha antes de salvar
  const hashedPassword = await bcrypt.hash(parsed.data.password, 10);

  // Cria o usuário no banco
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashedPassword,
    },
  });

  return { success: true };
}
