"use server";

import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/backend/db/prisma";
import { registerSchema } from "@/server/validators";
import {
  checkRateLimit,
  getClientIp,
  getRateLimitStatus,
  normalizeRateLimitValue,
  RATE_LIMITS,
} from "@/server/security";

export async function getLoginRateLimitStatus(email: string) {
  const normalizedEmail = normalizeRateLimitValue(email);
  const clientIp = await getClientIp();
  const normalizedIp = normalizeRateLimitValue(clientIp);

  const [ipStatus, emailStatus] = await Promise.all([
    getRateLimitStatus(`login:ip:${normalizedIp}`, RATE_LIMITS.login.limit),
    getRateLimitStatus(`login:${normalizedEmail}`, RATE_LIMITS.login.limit),
  ]);

  if (!ipStatus.success || !emailStatus.success) {
    const resetAt =
      ipStatus.resetAt > emailStatus.resetAt ? ipStatus.resetAt : emailStatus.resetAt;

    return {
      blocked: true,
      resetAt: resetAt.toISOString(),
    };
  }

  return { blocked: false, resetAt: null };
}

export async function registerUser(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const clientIp = await getClientIp();

  const ipRateLimit = await checkRateLimit(
    `register:ip:${normalizeRateLimitValue(clientIp)}`,
    RATE_LIMITS.register.limit,
    RATE_LIMITS.register.windowMs
  );

  if (!ipRateLimit.success) {
    return { error: "Muitas tentativas de cadastro. Tente novamente mais tarde." };
  }

  const parsed = registerSchema.safeParse({ name, email, password });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const emailRateLimit = await checkRateLimit(
    `register:email:${normalizeRateLimitValue(parsed.data.email)}`,
    RATE_LIMITS.register.limit,
    RATE_LIMITS.register.windowMs
  );

  if (!emailRateLimit.success) {
    return { error: "Muitas tentativas para este e-mail. Tente novamente mais tarde." };
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
