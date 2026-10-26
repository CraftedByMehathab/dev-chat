"use client";

import { MessageSquareIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { chatsPath } from "@/lib/paths";
import type { OwnedThreadSummary } from "@/lib/threads";

import { DeleteThreadDialog } from "./delete-thread-dialog";
import { mergeThreadActivity, useThreadActivity } from "./thread-activity";

const lastActivityFormat = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function ThreadListItems({
  threads,
}: {
  threads: OwnedThreadSummary[];
}) {
  const pathname = usePathname();
  const { activity } = useThreadActivity();
  const merged = mergeThreadActivity(threads, activity);
  const [pendingDelete, setPendingDelete] = useState<OwnedThreadSummary | null>(
    null,
  );

  if (merged.length === 0) {
    return (
      <p className="px-2 py-1 text-sm text-muted-foreground group-data-[collapsible=icon]:hidden">
        No chats yet. Start one with New chat.
      </p>
    );
  }

  return (
    <SidebarMenu>
      <DeleteThreadDialog
        thread={pendingDelete}
        onClose={() => setPendingDelete(null)}
      />
      {merged.map((thread) => {
        const href = chatsPath(thread.id);
        const isActive = pathname === href;
        const lastActivity =
          thread.lastMessageAt &&
          lastActivityFormat.format(thread.lastMessageAt);

        // Rows show only the title; the time is in the hover hint
        const hint = lastActivity
          ? `${thread.title} · ${lastActivity}`
          : thread.title;

        return (
          <SidebarMenuItem key={thread.id}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              // Shown when collapsed to icons
              tooltip={hint}
              className="h-9"
            >
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                // Shown when expanded. Server and browser time zones can differ.
                title={hint}
                suppressHydrationWarning
              >
                <MessageSquareIcon
                  className={
                    isActive ? "text-primary" : "text-muted-foreground"
                  }
                />
                <span>{thread.title}</span>
              </Link>
            </SidebarMenuButton>
            {/* Hidden until hover or focus; hidden entirely when collapsed */}
            <SidebarMenuAction
              showOnHover
              aria-label={`Delete “${thread.title}”`}
              title="Delete chat"
              onClick={() => setPendingDelete(thread)}
              className="hover:text-destructive"
            >
              <Trash2Icon />
            </SidebarMenuAction>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
