import type { DefaultSession } from "next-auth";

// Module augmentation: session.user.id/role are always set by the jwt/session
// callbacks in src/lib/auth.ts, so we widen the types here instead of
// non-null-asserting `session.user.id` at every call site.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}
