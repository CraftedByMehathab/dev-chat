import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/prisma";
import { dashboardPath, homePath } from "./lib/paths";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [GitHub],
  pages: {
    signIn: homePath(),
  },
  callbacks: {
    authorized: async ({ auth, request }) => {
      const pathname = request.nextUrl.pathname;

      if (pathname === homePath() && !!auth) {
        const newUrl = new URL(dashboardPath(), request.nextUrl.origin);
        return Response.redirect(newUrl);
      }

      // Logged in users are authenticated, otherwise redirect to login page
      return pathname.startsWith(dashboardPath()) ? !!auth : true;
    },
  },
});
