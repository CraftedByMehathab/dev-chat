// One shared LangGraph client for all API routes.
import "server-only";
import { Client } from "@langchain/langgraph-sdk";
import { optionalEnv, requireEnv } from "@/lib/env";

export const LANGGRAPH_ASSISTANT_ID = requireEnv("LANGGRAPH_ASSISTANT_ID");

export const langgraphClient = new Client({
  apiUrl: requireEnv("LANGGRAPH_SERVER_URL"),
  apiKey: optionalEnv("LANGGRAPH_API_KEY"), // empty locally
});
