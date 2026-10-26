"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { chatPath, homePath } from "@/lib/paths";
import { createOwnedThread } from "@/lib/threads";

export type NewChatState = { error: string } | null;

/** Starts a new chat and opens it. Actions are public POST endpoints, so auth is checked here too. */
export async function startNewChat(): Promise<NewChatState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect(homePath());

  let threadId: string;
  try {
    threadId = await createOwnedThread(userId);
  } catch (err) {
    console.error("startNewChat: could not create thread", err);
    // Returned, not thrown: Next hides thrown error messages in production
    return { error: "Could not start a new chat. Please try again." };
  }

  // Outside the try: redirect() works by throwing
  redirect(chatPath(threadId));
}
