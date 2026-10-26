"use client";

import { MessageSquarePlusIcon } from "lucide-react";
import { useActionState } from "react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { startNewChat } from "./actions";

export function NewChatButton() {
  const [state, formAction, isPending] = useActionState(startNewChat, null);

  return (
    <form action={formAction}>
      <SidebarMenu>
        <SidebarMenuItem>
          {/* A menu button, not a Button, so it shrinks to an icon with the sidebar */}
          <SidebarMenuButton
            type="submit"
            disabled={isPending}
            tooltip="New chat"
            className="h-10 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
          >
            <MessageSquarePlusIcon />
            <span>{isPending ? "Starting…" : "New chat"}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      {state?.error && (
        <p className="px-2 pt-2 text-sm text-destructive group-data-[collapsible=icon]:hidden">
          {state.error}
        </p>
      )}
    </form>
  );
}
