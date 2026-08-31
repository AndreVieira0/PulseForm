import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const authSecret =
  process.env.AUTH_SECRET ??
  (process.env.NODE_ENV === "production"
    ? undefined
    : "pulseform-secret-key-desenvolvimento-123456");

export async function proxy(request: NextRequest) {
  const isProd = process.env.NODE_ENV === "production";
  const cookieName = isProd
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

  let token = null;

  if (authSecret) {
    // Verificar o formato padrão do NextAuth v5 (authjs.session-token)
    token = await getToken({
      req: request,
      secret: authSecret,
      cookieName,
      salt: cookieName,
    });

    // Fallback para o formato do NextAuth v4 (next-auth.session-token)
    if (!token) {
      token = await getToken({
        req: request,
        secret: authSecret,
      });
    }
  }

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
  ],
};
