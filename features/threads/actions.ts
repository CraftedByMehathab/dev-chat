"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { homePath } from "@/lib/paths";
import { deleteOwnedThread } from "@/lib/threads";

export type DeleteThreadResult = { ok: true } | { ok: false; error: string };

/** Deletes one of the user's threads. Actions are public POST endpoints, so auth is checked here too. */
export async function deleteThread(
  threadId: string,
): Promise<DeleteThreadResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect(homePath());

  try {
    // Unknown and other users' threads look the same: not found
    if (
      typeof threadId !== "string" ||
      !(await deleteOwnedThread(threadId, userId))
    ) {
      return { ok: false, error: "Chat not found." };
    }
    return { ok: true };
  } catch (err) {
    console.error("deleteThread: could not delete thread", err);
    // Returned, not thrown: Next hides thrown error messages in production
    return { ok: false, error: "Could not delete the chat. Please try again." };
  }
}
