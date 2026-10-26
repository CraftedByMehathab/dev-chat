// One shared LangGraph client for all API routes.
import "server-only";
import { Client } from "@langchain/langgraph-sdk";
import { optionalEnv, requireEnv } from "@/lib/env";

export const LANGGRAPH_ASSISTANT_ID = requireEnv("LANGGRAPH_ASSISTANT_ID");

/** The createAgent node that writes AI messages; state updates made "as" it end the turn. */
export const LANGGRAPH_MODEL_NODE = "model_request";

export const langgraphClient = new Client({
  apiUrl: requireEnv("LANGGRAPH_SERVER_URL"),
  apiKey: optionalEnv("LANGGRAPH_API_KEY"), // empty locally
});
