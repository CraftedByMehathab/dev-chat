// Server-only helpers for reading environment variables.
import "server-only";

/** Returns the env var's value, or throws if it's missing or empty. */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

/** Returns the env var's value, or undefined if it's missing or empty. */
export function optionalEnv(name: string): string | undefined {
  return process.env[name] || undefined;
}
