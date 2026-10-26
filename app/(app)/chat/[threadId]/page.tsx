import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Chat } from "@/features/chat";
import { getSessionUserId } from "@/lib/session";
import { findOwnedThread } from "@/lib/threads";

export default function ChatPage({ params }: PageProps<"/chat/[threadId]">) {
  return (
    // params and the session are request data, so they stream in behind a boundary
    <Suspense>
      <OwnedChat params={params} />
    </Suspense>
  );
}

async function OwnedChat({
  params,
}: Pick<PageProps<"/chat/[threadId]">, "params">) {
  const { threadId } = await params;
  const userId = await getSessionUserId();

  // Unknown and other users' threads look the same: not found
  if (!userId || !(await findOwnedThread(threadId, userId))) notFound();

  // key: switching threads starts a fresh Chat instead of reusing state
  return <Chat key={threadId} threadId={threadId} />;
}
