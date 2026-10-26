import { getSessionUserId } from "@/lib/session";
import { listOwnedThreads } from "@/lib/threads";

import { ThreadListItems } from "./thread-list-items";

/** Reads the session, so render it inside a Suspense boundary. */
export async function ThreadList() {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const threads = await listOwnedThreads(userId);
  return <ThreadListItems threads={threads} />;
}
