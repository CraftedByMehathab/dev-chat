import { getSessionUserId } from "@/lib/session";
import { listOwnedThreads } from "@/lib/threads";

import { ThreadListItems } from "./thread-list-items";

/** Reads the session, so render it inside a Suspense boundary. */
export async function ThreadList() {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const threads = await listOwnedThreads(userId);
  if (threads.length === 0) {
    return (
      <p className="px-2 py-1 text-sm text-muted-foreground group-data-[collapsible=icon]:hidden">
        No chats yet. Start one with New chat.
      </p>
    );
  }

  return <ThreadListItems threads={threads} />;
}
