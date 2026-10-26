import { notFound } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { SignOut } from "@/features/auth/signout";
import { Chat } from "@/features/chat";
import { findOwnedThread } from "@/lib/threads";

export default function ChatPage({ params }: PageProps<"/chat/[threadId]">) {
  return (
    <>
      <SignOut />
      {/* params and the session are request data, so they stream in behind a boundary */}
      <Suspense>
        <OwnedChat params={params} />
      </Suspense>
    </>
  );
}

async function OwnedChat({
  params,
}: Pick<PageProps<"/chat/[threadId]">, "params">) {
  const { threadId } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  // Unknown and other users' threads look the same: not found
  if (!userId || !(await findOwnedThread(threadId, userId))) notFound();

  // key: switching threads starts a fresh Chat instead of reusing state
  return <Chat key={threadId} threadId={threadId} />;
}
