"use server";

import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/backend/db/prisma";
import { registerSchema } from "@/server/validators";

export async function registerUser(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

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

  try {
    await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: hashedPassword,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Este e-mail já está sendo usado por outra conta." };
    }
    throw error;
  }

  return { success: true };
}
