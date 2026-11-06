import "server-only";
import { betterAuth } from "better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_SECONDS = 90 * 24 * 60 * 60;

/** Solo el correo de `ALLOWED_EMAIL` puede entrar; si falta la variable, nadie entra. */
function isAllowedEmail(email: unknown): boolean {
  const allowed = process.env.ALLOWED_EMAIL?.trim().toLowerCase();
  return Boolean(allowed) && typeof email === "string" && email.toLowerCase() === allowed;
}

// Sin `database`, Better Auth funciona sin estado: la sesión vive en una cookie cifrada (JWE)
// y no hacen falta tablas de usuarios. Al vencer (90 días) hay que volver a entrar con Google.
export const auth = betterAuth({
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      prompt: "select_account",
    },
  },
  session: {
    expiresIn: SESSION_SECONDS,
    cookieCache: { enabled: true, maxAge: SESSION_SECONDS, strategy: "jwe" },
  },
  user: {
    // Corre en cada inicio de sesión con Google, con el correo que reporta Google.
    validateUserInfo: ({ user }) => (isAllowedEmail(user.email) ? undefined : { error: "email_not_allowed" }),
  },
  // Los errores del flujo de Google (correo rechazado, cancelación) regresan a /login?error=…
  onAPIError: { errorURL: "/login" },
});

/** Usuario de la sesión, o `null` si no hay sesión válida o el correo ya no está permitido. */
export async function getSessionUser(requestHeaders: Headers) {
  const session = await auth.api.getSession({ headers: requestHeaders });
  return session && isAllowedEmail(session.user.email) ? session.user : null;
}

/** Para Server Actions: no confían en el proxy y vuelven a verificar la sesión. */
export async function requireUser() {
  const user = await getSessionUser(await headers());
  if (!user) redirect("/login");
  return user;
}
