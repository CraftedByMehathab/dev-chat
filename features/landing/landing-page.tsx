import {
  ArrowRightIcon,
  MessagesSquareIcon,
  ShieldCheckIcon,
  SquareIcon,
  ZapIcon,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SignInWithCallback } from "@/features/auth/sign-in-button";
import { ThemeToggle } from "@/features/theme";

// Only claims the app can back up today
const FEATURES = [
  {
    icon: ZapIcon,
    title: "Answers as you read",
    body: "Replies stream in as they're written, so you can start reading straight away instead of waiting on a wall of text.",
  },
  {
    icon: SquareIcon,
    title: "Stop when you've seen enough",
    body: "Got what you needed? Press Stop and the run is cancelled on the server, not just hidden on screen.",
  },
  {
    icon: MessagesSquareIcon,
    title: "Conversations that stay",
    body: "Every chat is saved to your account. Close the tab, come back tomorrow on another device, and pick it up from the sidebar.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Private to you",
    body: "Sign in with GitHub, no new password. Your chats belong to your account, and nobody else can open them.",
  },
];

const PROMPTS = [
  "Explain this regex: ^(?=.*\\d)(?=.*[a-z]).{8,}$",
  "Write a debounce hook in TypeScript",
  "Why does my useEffect run twice?",
];

type LandingPageProps = { searchParams: PageProps<"/">["searchParams"] };

/** Marketing page for signed-out visitors; the proxy sends signed-in users to the app. */
export function LandingPage({ searchParams }: LandingPageProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-3">
            <Image
              src="/favicon.png"
              alt=""
              width={32}
              height={32}
              className="size-8"
            />
            <span className="font-heading text-lg font-semibold">Dev Chat</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <SignInWithCallback searchParams={searchParams} variant="outline" />
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <Glow className="-top-40 h-96 max-w-3xl opacity-25" />
          <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 pt-20 pb-16 text-center md:pt-28">
            <p className="rounded-full border bg-card px-4 py-1.5 font-mono text-xs tracking-widest text-muted-foreground uppercase">
              AI pair programmer
            </p>
            <h1 className="mt-6 max-w-3xl font-heading text-4xl leading-tight font-semibold tracking-tight text-balance md:text-6xl">
              Debug, design, refactor with an AI that{" "}
              <span className="text-primary">codes with you</span>.
            </h1>
            <p className="mt-5 max-w-xl text-balance text-muted-foreground">
              Ask about your code and watch the answer stream in. Stop it any
              time, and pick up any conversation right where you left off.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <SignInWithCallback
                searchParams={searchParams}
                className="h-11 px-6 text-base"
              />
              <Button variant="ghost" className="h-11 px-6 text-base" asChild>
                <a href="#features">
                  See what it can do
                  <ArrowRightIcon />
                </a>
              </Button>
            </div>

            <SampleExchange />
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-20"
        >
          <h2 className="text-center font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            Built for people who <span className="text-primary">ship</span>
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <li
                key={feature.title}
                className="rounded-xl border bg-card p-6 transition-colors hover:border-primary/50"
              >
                <feature.icon className="size-6 text-primary" />
                <h3 className="mt-4 font-heading text-lg font-semibold">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.body}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-24">
          <div className="relative overflow-hidden rounded-2xl border bg-card p-10 text-center md:p-14">
            <Glow className="-bottom-24 h-64 max-w-xl opacity-20" />
            <h2 className="relative font-heading text-2xl font-semibold tracking-tight md:text-3xl">
              Stuck on something?
            </h2>
            <p className="relative mt-3 text-muted-foreground">
              Ask your first question. That tough bug doesn&apos;t stand a
              chance.
            </p>
            <ul className="relative mt-8 flex flex-wrap items-center justify-center gap-2 font-mono text-xs text-muted-foreground">
              {PROMPTS.map((prompt) => (
                <li
                  key={prompt}
                  className="rounded-full border bg-background px-3 py-1.5"
                >
                  {prompt}
                </li>
              ))}
            </ul>
            <div className="relative mt-8 flex justify-center">
              <SignInWithCallback
                searchParams={searchParams}
                className="h-11 px-6 text-base"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 py-6">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 text-xs text-muted-foreground">
          <span>Dev Chat</span>
          <span className="font-mono">AI pair programmer</span>
        </div>
      </footer>
    </div>
  );
}

/** A static sample of a chat, styled like the app. */
function SampleExchange() {
  return (
    <figure className="mt-16 w-full max-w-2xl rounded-xl border bg-card p-5 text-left shadow-[0_20px_60px_-20px_var(--primary)]">
      <figcaption className="flex items-center gap-2 border-b pb-3 font-mono text-xs text-muted-foreground">
        <span className="size-2 rounded-full bg-primary" />
        dev chat · example
      </figcaption>
      <div className="mt-4 flex justify-end">
        <p className="max-w-[80%] rounded-2xl rounded-br-md bg-muted px-4 py-2.5 text-sm">
          Why does my useEffect run twice?
        </p>
      </div>
      <p className="mt-3 max-w-[90%] text-sm leading-relaxed">
        In development, React&apos;s Strict Mode mounts, unmounts and remounts
        your component once to surface missing cleanup early, so every effect
        runs twice. Return a cleanup function from the effect and the double run
        stops causing trouble. Production only runs it once.
      </p>
    </figure>
  );
}

/** Soft lime glow behind a section. */
function Glow({ className }: { className: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 mx-auto rounded-full bg-primary blur-3xl ${className}`}
    />
  );
}
