import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/backend/db/prisma";
import { checkRateLimit, getClientIp, normalizeRateLimitValue, RATE_LIMITS } from "@/server/security";

const authSecret = process.env.AUTH_SECRET ??
  (process.env.NODE_ENV === "production" ? undefined : "pulseform-dev-secret-change-me");

if (!authSecret) {
  throw new Error("AUTH_SECRET is required in production.");
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: authSecret,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).trim().toLowerCase();
        const clientIp = await getClientIp();
        const ipRateLimit = await checkRateLimit(
          `login:ip:${normalizeRateLimitValue(clientIp)}`,
          RATE_LIMITS.login.limit,
          RATE_LIMITS.login.windowMs
        );
        const emailRateLimit = await checkRateLimit(
          `login:${normalizeRateLimitValue(email)}`,
          RATE_LIMITS.login.limit,
          RATE_LIMITS.login.windowMs
        );

        if (!ipRateLimit.success || !emailRateLimit.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
});
