import type { EventView } from "@/types/domain";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

type ManageableEvent = Pick<EventView, "id" | "createdById" | "institutionId">;

export async function canManageEvent(
  userId: string,
  role: Role,
  event: ManageableEvent,
): Promise<boolean> {
  if (role === "ADMIN" || role === "MODERATOR") {
    return true;
  }
  if (event.createdById && event.createdById === userId) {
    return true;
  }
  if (role === "ORG_ADMIN" && event.institutionId) {
    const membership = await prisma.institutionMember.findUnique({
      where: {
        institutionId_userId: {
          institutionId: event.institutionId,
          userId,
        },
      },
    });
    return Boolean(membership);
  }
  return false;
}

export async function canManageInstitution(
  userId: string,
  role: Role,
  institution: { id: string; createdById?: string | null },
): Promise<boolean> {
  if (role === "ADMIN" || role === "MODERATOR") {
    return true;
  }
  if (institution.createdById && institution.createdById === userId) {
    return true;
  }
  const membership = await prisma.institutionMember.findUnique({
    where: {
      institutionId_userId: {
        institutionId: institution.id,
        userId,
      },
    },
  });
  return Boolean(membership);
}
