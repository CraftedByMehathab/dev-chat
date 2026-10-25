import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { ArrowUpIcon } from "lucide-react";
import React, { useState } from "react";

type PromptInputProps = {
  onSubmit: (text: string) => void;
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
    onSubmit(text);
  };
  return (
    <form ref={formRef} onSubmit={handleOnSubmit}>
      <InputGroup>
        <InputGroupTextarea
          value={text}
          onChange={(event) => setText(event.target.value)}
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
