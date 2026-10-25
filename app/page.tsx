import { Suspense } from "react";
import SignIn from "@/features/auth/signin";

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <Suspense>
      <SignIn searchParams={searchParams} />
    </Suspense>
  );
}
