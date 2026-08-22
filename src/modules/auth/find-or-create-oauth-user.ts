import { prisma } from "@/lib/prisma";

async function uniqueUsernameFrom(seed: string): Promise<string> {
  const base = (seed.split("@")[0] || "user").replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20) || "user";
  let username = base;
  let n = 0;
  while (await prisma.user.findUnique({ where: { username } })) {
    n += 1;
    username = `${base}${n}`;
  }
  return username;
}

/** OAuth sign-in (Google/Facebook) has no local password — find or create the app User row keyed by email. */
export async function findOrCreateOAuthUser(params: { email: string; displayName?: string | null }) {
  const existing = await prisma.user.findUnique({ where: { email: params.email } });
  if (existing) return existing;

  const username = await uniqueUsernameFrom(params.displayName || params.email);
  return prisma.user.create({
    data: {
      username,
      email: params.email,
      passwordHash: null,
      role: "CUSTOMER",
      wallet: { create: { balance: 0n } },
    },
  });
}
