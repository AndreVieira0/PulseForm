import { headers } from "next/headers";
import { prisma } from "@/backend/db/prisma";

type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetAt: Date;
};

export const RATE_LIMITS = {
  login: { limit: 5, windowMs: 15 * 60 * 1000 },
  register: { limit: 5, windowMs: 60 * 60 * 1000 },
  publicSubmission: { limit: 10, windowMs: 10 * 60 * 1000 },
} as const;

export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);

  return prisma.$transaction(async (tx) => {
    await tx.rateLimit.deleteMany({
      where: {
        resetAt: {
          lte: now,
        },
      },
    });

    const existing = await tx.rateLimit.findUnique({
      where: { key },
    });

    if (!existing) {
      await tx.rateLimit.create({
        data: {
          key,
          count: 1,
          resetAt,
        },
      });

      return { success: true, remaining: limit - 1, resetAt };
    }

    if (existing.count >= limit) {
      console.warn(
        `[rate-limit] blocked key="${key}" limit=${limit} resetAt=${existing.resetAt.toISOString()}`
      );

      return { success: false, remaining: 0, resetAt: existing.resetAt };
    }

    const updated = await tx.rateLimit.update({
      where: { key },
      data: {
        count: {
          increment: 1,
        },
      },
    });

    return {
      success: true,
      remaining: Math.max(limit - updated.count, 0),
      resetAt: updated.resetAt,
    };
  });
}

export async function getRateLimitStatus(
  key: string,
  limit: number
): Promise<RateLimitResult> {
  const now = new Date();

  const existing = await prisma.rateLimit.findUnique({
    where: { key },
  });

  if (!existing || existing.resetAt <= now) {
    return { success: true, remaining: limit, resetAt: now };
  }

  return {
    success: existing.count < limit,
    remaining: Math.max(limit - existing.count, 0),
    resetAt: existing.resetAt,
  };
}

export function normalizeRateLimitValue(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9@._:-]/g, "_");
}

export async function getClientIp() {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  const forwardedIp = forwardedFor?.split(",")[0]?.trim();

  return (
    forwardedIp ||
    requestHeaders.get("x-real-ip") ||
    requestHeaders.get("cf-connecting-ip") ||
    "unknown"
  );
}
