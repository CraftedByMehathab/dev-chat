import type { Metadata } from "next";
import { LandingPage } from "@/features/landing/landing-page";

export const metadata: Metadata = {
  title: "Dev Chat · AI pair programmer",
  description:
    "Dev Chat is an AI coding assistant that debugs, designs and refactors code with you, with streaming answers and conversations saved to your account.",
  openGraph: {
    title: "Dev Chat · AI pair programmer",
    description:
      "Debug, design, refactor with an AI that codes with you. Sign in with GitHub to start.",
    type: "website",
  },
};

export default function Home({ searchParams }: PageProps<"/">) {
  return <LandingPage searchParams={searchParams} />;
}
