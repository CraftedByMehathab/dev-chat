import { Suspense } from "react";
import { FaGithub } from "react-icons/fa";
import { Button } from "@/components/ui/button";

import { signInWithGitHub } from "./actions";

type SignInButtonProps = Pick<
  React.ComponentProps<typeof Button>,
  "size" | "variant" | "className"
> & {
  /** Where to go after sign-in; the dashboard when omitted. */
  callbackUrl?: string;
};

export function SignInButton({
  callbackUrl,
  ...buttonProps
}: SignInButtonProps) {
  return (
    <form action={signInWithGitHub}>
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
      <Button type="submit" {...buttonProps}>
        <FaGithub />
        Sign in with GitHub
      </Button>
    </form>
  );
}

type SearchParams = PageProps<"/">["searchParams"];

async function CallbackSignInButton({
  searchParams,
  ...buttonProps
}: SignInButtonProps & { searchParams: SearchParams }) {
  // Set by the proxy when it bounces a signed-out visitor from a private page
  const { callbackUrl } = await searchParams;
  return (
    <SignInButton
      {...buttonProps}
      callbackUrl={typeof callbackUrl === "string" ? callbackUrl : undefined}
    />
  );
}

/**
 * Sign-in that returns to the page the visitor was sent away from. Until the
 * search params resolve, the shell shows a working button that goes to the
 * dashboard.
 */
export function SignInWithCallback(
  props: SignInButtonProps & { searchParams: SearchParams },
) {
  const { searchParams, ...buttonProps } = props;
  return (
    <Suspense fallback={<SignInButton {...buttonProps} />}>
      <CallbackSignInButton searchParams={searchParams} {...buttonProps} />
    </Suspense>
  );
}
