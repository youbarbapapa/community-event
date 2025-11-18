import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { InstitutionVerificationStatus, ReportStatus } from "@prisma/client";
import type { AdminMetric } from "@/types/domain";
import { prisma } from "@/lib/prisma";
import { getEventCounts, getEventsAddedThisWeek } from "./events";

type ClaimWithRelations = Prisma.InstitutionClaimGetPayload<{
  include: {
    institution: true;
    user: true;
  };
}>;

type ReportWithRelations = Prisma.ReportGetPayload<{
  include: {
    institution: true;
    event: true;
    createdBy: true;
  };
}>;

export const getAdminDashboardData = cache(async () => {
  const [eventCounts, eventsThisWeek, verifiedInstitutions, pendingClaims, pendingReports] =
    await Promise.all([
      getEventCounts(),
      getEventsAddedThisWeek(),
      prisma.institution.count({
        where: { verificationStatus: InstitutionVerificationStatus.VERIFIED },
      }),
      prisma.institutionClaim.findMany({
        where: { status: "PENDING" },
        include: { institution: true, user: true },
        orderBy: { createdAt: "asc" },
        take: 20,
      }),
      prisma.report.findMany({
        where: { status: ReportStatus.OPEN },
        include: { institution: true, event: true, createdBy: true },
        orderBy: { createdAt: "asc" },
        take: 20,
      }),
    ]);

  const officialShare =
    eventCounts.total === 0
      ? 0
      : Math.round((eventCounts.official / eventCounts.total) * 100);

  const metrics: AdminMetric[] = [
    {
      label: "Events added last 7 days",
      value: String(eventsThisWeek),
      trend: eventsThisWeek > 0 ? "+active" : "Seed data needed",
    },
    {
      label: "Official share",
      value: `${officialShare}% official`,
      trend: `Community ${eventCounts.community}`,
    },
    {
      label: "Verified institutions",
      value: String(verifiedInstitutions),
      trend: `${pendingClaims.length} claims pending`,
    },
    {
      label: "Open reports",
      value: String(pendingReports.length),
      trend: "Target < 5",
    },
  ];

  return {
    metrics,
    pendingClaims,
    pendingReports,
  };
});

export type PendingClaim = ClaimWithRelations;
export type PendingReport = ReportWithRelations;
