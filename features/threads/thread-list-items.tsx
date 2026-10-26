"use client";

import { MessageSquareIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { chatsPath } from "@/lib/paths";
import type { OwnedThreadSummary } from "@/lib/threads";

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

  return (
    <SidebarMenu>
      {threads.map((thread) => {
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
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
