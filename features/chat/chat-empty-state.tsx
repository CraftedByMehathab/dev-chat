import { ChevronRightIcon } from "lucide-react";
import Image from "next/image";

const SUGGESTIONS = [
  "Explain this regex: ^(?=.*\\d)(?=.*[a-z]).{8,}$",
  "Write a debounce hook in TypeScript",
  "SQL vs NoSQL for a chat app?",
  "Why does my useEffect run twice?",
];

/** Shown before the first message; a suggestion sends its prompt as-is. */
export function ChatEmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 overflow-y-auto px-4 py-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <Image
          src="/logo.png"
          alt=""
          width={48}
          height={48}
          className="size-12 drop-shadow-[0_0_24px_var(--primary)]"
        />
        <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
          What are we building<span className="text-primary">?</span>
        </h2>
        <p className="text-muted-foreground">
          Debug, design, refactor — your AI pair programmer.
        </p>
      </div>
      <ul className="grid w-full max-w-3xl gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((suggestion) => (
          <li key={suggestion}>
            <button
              type="button"
              onClick={() => onPick(suggestion)}
              className="flex w-full items-center gap-2 rounded-lg border bg-card px-4 py-3 text-left text-sm transition-colors hover:border-primary/40 hover:bg-accent"
            >
              <ChevronRightIcon className="size-4 shrink-0 text-primary" />
              <span className="truncate">{suggestion}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
