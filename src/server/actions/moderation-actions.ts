"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import {
  EventStatus,
  InstitutionMemberRole,
  InstitutionVerificationStatus,
  ReportStatus,
  Role,
} from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";

const resolveClaimSchema = z.object({
  claimId: z.string().min(1),
  decision: z.enum(["approve", "reject"]),
});

const resolveReportSchema = z.object({
  reportId: z.string().min(1),
  decision: z.enum(["resolve", "reject"]),
});

const updateEventStatusSchema = z.object({
  eventId: z.string().min(1),
  status: z.nativeEnum(EventStatus),
});

export type ModerationState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export const moderationInitialState: ModerationState = { status: "idle" };

export async function resolveClaimAction(
  prevState: ModerationState = moderationInitialState,
  formData: FormData,
): Promise<ModerationState> {
  void prevState;
  try {
    const moderator = await requireRole([Role.ADMIN, Role.MODERATOR]);
    const parsed = resolveClaimSchema.safeParse({
      claimId: formData.get("claimId"),
      decision: formData.get("decision"),
    });

    if (!parsed.success) {
      return { status: "error", message: "Invalid claim request." };
    }

    const { claimId, decision } = parsed.data;
    const claim = await prisma.institutionClaim.findUnique({
      where: { id: claimId },
    });

    if (!claim) {
      return { status: "error", message: "Claim not found." };
    }

    const status = decision === "approve" ? "APPROVED" : "REJECTED";

    const operations: Prisma.PrismaPromise<unknown>[] = [
      prisma.institutionClaim.update({
        where: { id: claimId },
        data: {
          status,
          reviewedById: moderator.id,
          reviewedAt: new Date(),
        },
      }),
      decision === "approve"
        ? prisma.institution.update({
            where: { id: claim.institutionId },
            data: {
              verificationStatus: InstitutionVerificationStatus.VERIFIED,
              verifiedAt: new Date(),
            },
          })
        : prisma.institution.update({
            where: { id: claim.institutionId },
            data: {
              verificationStatus: InstitutionVerificationStatus.PENDING,
            },
          }),
    ];

    if (decision === "approve") {
      operations.push(
        prisma.user.update({
          where: { id: claim.userId },
          data: { role: Role.ORG_ADMIN },
        }),
      );
      operations.push(
        prisma.institutionMember.upsert({
          where: {
            institutionId_userId: {
              institutionId: claim.institutionId,
              userId: claim.userId,
            },
          },
          update: {
            role: InstitutionMemberRole.ADMIN,
          },
          create: {
            institutionId: claim.institutionId,
            userId: claim.userId,
            role: InstitutionMemberRole.ADMIN,
          },
        }),
      );
    }

    await prisma.$transaction(operations);

    revalidatePath("/institutions");
    revalidatePath("/admin");

    return {
      status: "success",
      message: decision === "approve" ? "Claim approved." : "Claim rejected.",
    };
  } catch (error) {
    console.error(error);
    return { status: "error", message: "Unable to process moderation action." };
  }
}

export async function resolveReportAction(
  prevState: ModerationState = moderationInitialState,
  formData: FormData,
): Promise<ModerationState> {
  void prevState;
  try {
    const moderator = await requireRole([Role.ADMIN, Role.MODERATOR]);
    const parsed = resolveReportSchema.safeParse({
      reportId: formData.get("reportId"),
      decision: formData.get("decision"),
    });

    if (!parsed.success) {
      return { status: "error", message: "Invalid report request." };
    }

    const { reportId, decision } = parsed.data;
    await prisma.report.update({
      where: { id: reportId },
      data: {
        status: decision === "resolve" ? ReportStatus.RESOLVED : ReportStatus.REJECTED,
        resolvedById: moderator.id,
        resolvedAt: new Date(),
      },
    });

    revalidatePath("/admin");

    return {
      status: "success",
      message: decision === "resolve" ? "Report resolved." : "Report rejected.",
    };
  } catch (error) {
    console.error(error);
    return { status: "error", message: "Unable to update report." };
  }
}

export async function updateEventStatusAction(
  prevState: ModerationState = moderationInitialState,
  formData: FormData,
): Promise<ModerationState> {
  void prevState;
  try {
    await requireRole([Role.ADMIN, Role.MODERATOR]);
    const parsed = updateEventStatusSchema.safeParse({
      eventId: formData.get("eventId"),
      status: formData.get("status"),
    });

    if (!parsed.success) {
      return { status: "error", message: "Invalid event status update." };
    }

    const { eventId, status } = parsed.data;
    await prisma.event.update({
      where: { id: eventId },
      data: { status },
    });

    revalidatePath("/events");
    revalidatePath("/admin");

    return {
      status: "success",
      message: "Event status updated.",
    };
  } catch (error) {
    console.error(error);
    return { status: "error", message: "Unable to update event status." };
  }
}
