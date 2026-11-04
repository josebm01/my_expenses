import { NextResponse, type NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const user = await getSessionUser(request.headers);
  const onLogin = request.nextUrl.pathname === "/login";

  if (!user && !onLogin) return NextResponse.redirect(new URL("/login", request.url));
  if (user && onLogin) return NextResponse.redirect(new URL("/", request.url));
  return NextResponse.next();
}

export const config = {
  // Todo excepto las rutas de Better Auth, los archivos estáticos y los íconos (los usa también /login).
  matcher: ["/((?!api/auth|_next/static|_next/image|icon|apple-icon).*)"],
};
