"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { chatsPath, dashboardPath } from "@/lib/paths";
import type { OwnedThreadSummary } from "@/lib/threads";

import { deleteThread } from "./actions";
import { useThreadActivity } from "./thread-activity";

type DeleteThreadDialogProps = {
  /** The thread to confirm deleting; null keeps the dialog closed. */
  thread: Pick<OwnedThreadSummary, "id" | "title"> | null;
  onClose: () => void;
};

export function DeleteThreadDialog({
  thread,
  onClose,
}: DeleteThreadDialogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { removeThread } = useThreadActivity();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function close() {
    setError(null);
    onClose();
  }

  function confirmDelete(event: React.MouseEvent) {
    // Keep the dialog open until the action finishes
    event.preventDefault();
    if (!thread) return;

    startTransition(async () => {
      const result = await deleteThread(thread.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      removeThread(thread.id);
      close();
      // Replace, so Back doesn't return to the deleted chat
      if (pathname === chatsPath(thread.id)) router.replace(dashboardPath());
    });
  }

  return (
    <AlertDialog
      open={thread !== null}
      onOpenChange={(open) => !open && !isPending && close()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
          <AlertDialogDescription>
            “{thread?.title}” and all its messages will be deleted. This
            can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={confirmDelete}
          >
            {isPending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
