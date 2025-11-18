import { auth } from "@/lib/auth";
import type { Role } from "@/generated/prisma/enums";

export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("You must be signed in to perform this action.");
  }
  return session.user;
}

export async function requireRole(roles: Role[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new Error("You do not have permission to perform this action.");
  }
  return user;
}
