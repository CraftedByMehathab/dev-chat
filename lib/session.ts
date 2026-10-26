// Session reads for server components.
import "server-only";
import { connection } from "next/server";
import { auth } from "@/auth";

export type SessionUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
};

/**
 * The signed-in user, or null. Render callers inside a Suspense boundary.
 * connection() marks the render as request-time first: auth() calls
 * crypto.getRandomValues() before it reads cookies, which Next rejects while
 * prerendering.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  await connection();
  const user = (await auth())?.user;
  if (!user?.id) return null;
  return {
    id: user.id,
    name: user.name ?? null,
    email: user.email ?? null,
    image: user.image ?? null,
  };
}

export async function getSessionUserId(): Promise<string | null> {
  return (await getSessionUser())?.id ?? null;
}
