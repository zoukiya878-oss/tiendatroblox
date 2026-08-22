import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { findOrCreateOAuthUser } from "@/modules/auth/find-or-create-oauth-user";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // ponytail: trust the request Host header so OAuth redirect_uri matches
  // whichever origin the user actually hit (localhost or the ngrok tunnel) —
  // without this NextAuth falls back to a hardcoded localhost base URL in dev.
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/dang-nhap" },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!username || !password) return null;

        const user = await prisma.user.findFirst({
          where: { OR: [{ username }, { email: username }] },
        });
        if (!user || user.locked || !user.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.username, email: user.email, role: user.role };
      },
    }),
    // ponytail: buttons wired now, inert until GOOGLE_CLIENT_ID/SECRET are set in .env
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if ((account?.provider === "google" || account?.provider === "facebook") && token.email) {
        const dbUser = await findOrCreateOAuthUser({
          email: token.email,
          displayName: token.name,
        });
        token.id = dbUser.id;
        token.role = dbUser.role;
        return token;
      }
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
});
