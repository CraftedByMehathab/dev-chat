import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { ArrowUpIcon } from "lucide-react";
import React, { useState } from "react";

type PromptInputProps = {
  /** Return true when the message was accepted; the input clears only then. */
  onSubmit: (text: string) => boolean;
  formRef?: React.Ref<HTMLFormElement>;
  disabled?: boolean;
};

export const PromptInput = ({
  onSubmit,
  formRef,
  disabled,
}: PromptInputProps) => {
  const [text, setText] = useState("");
  const handleOnSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onSubmit(text)) setText("");
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends, Shift+Enter falls through to a newline. Skip while an IME
    // is composing so confirming a candidate doesn't send the message.
    if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return;
    e.preventDefault();
    e.currentTarget.form?.requestSubmit();
  };
  return (
    <form ref={formRef} onSubmit={handleOnSubmit}>
      <InputGroup>
        <InputGroupTextarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the agent to change your code..."
          className="p-3"
        />
        <InputGroupAddon align="block-end">
          <InputGroupButton
            type="submit"
            size="icon-sm"
            variant="default"
            className="ml-auto rounded-full"
            disabled={disabled}
            aria-label="Send"
          >
            <ArrowUpIcon />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
};
