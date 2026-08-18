"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/backend/db/prisma";
import { registerSchema } from "@/server/validators";

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const parsed = registerSchema.safeParse({ name, email, password });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existingUser) {
    return { error: "Este e-mail já está sendo usado por outra conta." };
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 10);

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashedPassword,
    },
  });

  return { success: true };
}
