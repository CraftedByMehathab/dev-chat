"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";

import { startNewChat } from "./actions";

export function NewChatButton() {
  const [state, formAction, isPending] = useActionState(startNewChat, null);

  return (
    <form action={formAction}>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Starting…" : "New chat"}
      </Button>
      {state?.error && (
        <p className="text-destructive text-sm">{state.error}</p>
      )}
    </form>
  );
}
