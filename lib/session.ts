// Session reads for server components.
import "server-only";
import { connection } from "next/server";
import { auth } from "@/auth";

/**
 * The signed-in user's id, or null. Render callers inside a Suspense boundary.
 * connection() marks the render as request-time first: auth() calls
 * crypto.getRandomValues() before it reads cookies, which Next rejects while
 * prerendering.
 */
export async function getSessionUserId(): Promise<string | null> {
  await connection();
  const session = await auth();
  return session?.user?.id ?? null;
}
