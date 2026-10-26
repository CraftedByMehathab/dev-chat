# dev-chat

A chat app built with Next.js. You sign in with GitHub, and your messages stream back from a LangChain agent that runs on a LangGraph server. Chat threads are saved to Postgres, linked to the user who owns them.

## Stack

- **Web app**: Next.js 16 (App Router), React 19, Tailwind v4, shadcn/ui
- **Auth**: Auth.js v5 with GitHub OAuth
- **Database**: Postgres with Prisma 7
- **Agent**: LangChain `createAgent` with Anthropic models, served by the LangGraph CLI. It's a separate project in [`agent/`](agent/).

## Getting started

### 1. Start Postgres

```bash
docker compose up -d
```

This starts Postgres 15 on `localhost:5432` (database `dev_db`, user `postgres`, password `local_password_123`).

### 2. Run the agent

```bash
cd agent
cp .env.example .env   # then add ANTHROPIC_API_KEY
pnpm install
npx @langchain/langgraph-cli dev
```

Keep this running while you develop.

### 3. Configure the web app

Create `.env.local` in the repo root:

```bash
DATABASE_URL=postgresql://postgres:local_password_123@localhost:5432/dev_db

AUTH_SECRET=            # generate with: npx auth secret
AUTH_GITHUB_ID=         # GitHub OAuth app client ID
AUTH_GITHUB_SECRET=     # GitHub OAuth app client secret

LANGGRAPH_SERVER_URL=   # URL the LangGraph dev server prints, e.g. http://localhost:2024
LANGGRAPH_ASSISTANT_ID=agent
LANGGRAPH_API_KEY=      # leave empty for local dev
```

When you create the GitHub OAuth app, set its callback URL to `http://localhost:3000/api/auth/callback/github`.

### 4. Install, migrate and run

```bash
npm install            # also runs prisma generate
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command         | What it does                       |
| --------------- | ---------------------------------- |
| `npm run dev`   | Start the Next.js dev server       |
| `npm run build` | Generate the Prisma client and build |
| `npm run start` | Serve the production build         |
| `npm run lint`  | Run ESLint                         |

## How it works

1. Clicking **New chat** creates a LangGraph thread, saves it to the database under your user ID, and opens it at `/chat/<threadId>`. You can only open your own threads.
2. Each message goes to `POST /api/chat-stream`. That route checks you own the thread, runs the agent and streams the reply back as server-sent events.
3. The route only accepts `{ threadId, message }` and only sends AI text back. Tool calls and internal state stay on the server.
4. While a reply is streaming, the Stop button cancels the run. If you send a new message before the reply finishes, the app tells you to wait or press Stop.

## Project layout

```
app/              Pages and API routes (auth, chat-stream)
features/         Chat UI components
components/ui/    shadcn components
lib/chat-stream/  SSE protocol shared by client and server
prisma/           Schema and migrations
agent/            LangGraph agent (separate pnpm project)
```

To change the agent's tools, prompt or model, edit `agent/src/tools.ts`, `agent/src/prompts.ts` and `agent/src/agent.ts`.
