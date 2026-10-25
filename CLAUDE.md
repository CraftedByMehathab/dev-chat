# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A Next.js 16 (App Router, React 19) chat UI that proxies conversations to a LangGraph agent. The repo has two separate projects:

- **Root**: the Next.js web app (npm, `package-lock.json`).
- **`agent/`**: a standalone LangChain `createAgent` project (pnpm, its own `package.json`, ESLint and tsconfig), served by the LangGraph server. `agent/langgraph.json` exposes the graph `agent` from `agent/src/agent.ts`.

## Commands

Web app (repo root):

```bash
docker compose up -d        # local Postgres 15 on :5432
npm install                 # postinstall runs `prisma generate`
npx prisma migrate dev      # apply migrations / create a new one after editing prisma/schema.prisma
npm run dev                 # Next dev server on :3000
npm run build               # prisma generate && next build
npm run lint                # eslint
```

Agent (`agent/`):

```bash
cd agent
pnpm install
npx @langchain/langgraph-cli dev   # how the LangGraph server is run locally (reads agent/.env)
pnpm start                          # run the sample questions in src/index.ts against the agent
pnpm lint
pnpm build                          # tsc
```

There is no test suite in either project.

## Environment

Root `.env.local` needs `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `LANGGRAPH_SERVER_URL`, `LANGGRAPH_ASSISTANT_ID`, and optionally `LANGGRAPH_API_KEY` (empty locally). `lib/langgraph.ts` calls `requireEnv` at import time, so a missing LangGraph variable crashes any route that imports it. The model API key (`ANTHROPIC_API_KEY`) belongs in `agent/.env`, not the web app.

## Architecture

**Request flow.** `features/chat.tsx` (client) → `POST /api/threads` on the first message → `POST /api/chat-stream` with `{ threadId, message }` → LangGraph server `runs.stream` → SSE back to the browser.

**Threads.** A chat thread's ID is the LangGraph thread ID. `app/api/threads/route.ts` creates the LangGraph thread first, then a `ChatThread` row in Postgres for ownership; if the DB insert fails it deletes the LangGraph thread. Every chat-stream request checks that the thread belongs to the session user before running.

**Chat stream security boundary.** `/api/chat-stream` is deliberately narrow, so keep it that way when changing it:
- The body is validated by a `.strict()` Zod schema (`ChatStreamRequestSchema`): only `threadId` and `message`, with a max length of `MAX_USER_MESSAGE_CHARS`.
- The server builds the run input itself (a single human message). The client can never inject AI, system or tool messages, or other state keys.
- Only AI message text goes to the browser. `extractStreamedAIMessages` drops tool calls, metadata, and human/tool/system messages.
- `multitaskStrategy: "reject"` makes LangGraph return 409 when a run is already active on the thread. It's mapped to the `THREAD_BUSY` error code.
- `req.signal` and `onDisconnect: "cancel"` are passed through, so the client's Stop button (AbortController) cancels the upstream run.

**SSE protocol (`lib/chat-stream/`).** `shared.ts` holds the event names (`token`, `done`, `error`), error codes and payload types used by both sides. `server.ts` is server-only (Zod schema, writer, LangGraph chunk filtering). `client.ts` parses SSE from a `fetch` body, since `EventSource` can't POST. A `token` event carries the **full text so far** for each AI message ID, not a delta, and the client upserts by ID. Errors that happen before streaming starts come back as JSON `{ error }` via `jsonError`, not SSE.

**Auth.** Auth.js v5 (`next-auth` beta) with the GitHub provider and Prisma adapter, in `auth.ts`. `proxy.ts` is the Next 16 replacement for `middleware.ts` and re-exports `auth`. Route handlers get the user through `await auth()` → `session.user.id`.

**Database.** Prisma 7 with the `prisma-client` generator, which outputs to `generated/prisma` (gitignored). Import from `@/generated/prisma/client`, not `@prisma/client`. The client is a singleton in `prisma.ts` at the repo root (`import { prisma } from "@/prisma"`), using the `@prisma/adapter-pg` driver adapter. The datasource URL lives in `prisma.config.ts`, not the schema.

**UI.** `components/ui/` holds shadcn components (style `radix-rhea`, Tailwind v4 through the `@tailwindcss/turbopack` loader in `next.config.ts`). App-level components live in `features/`. `next.config.ts` turns on `cacheComponents`.

**Conventions.** Server-only modules start with `import "server-only"`. Use `requireEnv`/`optionalEnv` from `lib/env.ts` for env vars, and `jsonError` from `lib/http.ts` for API errors.
