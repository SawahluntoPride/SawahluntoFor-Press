import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export type UserSession = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  organizationId: string | null;
  organization: { id: string; name: string; slug: string; type: string } | null;
};

export const getCurrentUser = cache(async (): Promise<UserSession | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const payload = await decrypt(token);
  if (!payload?.sub) return null;
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      organizationId: true,
      organization: {
        select: { id: true, name: true, slug: true, type: true },
      },
    },
  });
  return user;
});

export async function requireUser(): Promise<UserSession> {
  const user = await getCurrentUser();
  if (!user) {
    const { redirect } = await import("next/navigation");
    redirect("/login");
  }
  return user!;
}
