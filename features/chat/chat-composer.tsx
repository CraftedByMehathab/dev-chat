import { PromptInput } from "./prompt-input";

type ChatComposerProps = {
  isStreaming: boolean;
  /** Return true when the message was accepted; the input clears only then. */
  onSend: (text: string) => boolean;
  onStop: () => void;
};

export function ChatComposer({
  isStreaming,
  onSend,
  onStop,
}: ChatComposerProps) {
  return (
    <div className="flex items-end gap-2 p-2">
      <div className="flex-1">
        <PromptInput disabled={isStreaming} onSubmit={onSend} />
      </div>
      {isStreaming && (
        <button
          type="button"
          onClick={onStop}
          className="rounded-md border px-3 py-2 text-sm"
        >
          Stop
        </button>
      )}
    </div>
  );
}
