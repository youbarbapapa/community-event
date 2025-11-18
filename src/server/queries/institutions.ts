import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { InstitutionVerificationStatus } from "@prisma/client";
import type { InstitutionSummary } from "@/types/domain";
import { prisma } from "@/lib/prisma";

type InstitutionWithCounts = Prisma.InstitutionGetPayload<{
  include: {
    description: true;
    _count: {
      select: { events: true };
    };
  };
}>;

function mapInstitution(institution: InstitutionWithCounts): InstitutionSummary {
  const isVerified =
    institution.verificationStatus === InstitutionVerificationStatus.VERIFIED;

  return {
    id: institution.id,
    slug: institution.slug,
    createdById: institution.createdById,
    name: institution.name,
    category: institution.category.replace("_", " "),
    borough: institution.borough,
    addressLine1: institution.addressLine1,
    addressLine2: institution.addressLine2,
    postcode: institution.postcode,
    status: isVerified ? "verified" : "pending",
    verificationStatus: institution.verificationStatus,
    eventsCount: institution._count.events,
    contactEmail: institution.contactEmail,
    isClaimable: !isVerified,
    description: institution.description,
  };
}

export const getInstitutions = cache(async (): Promise<InstitutionSummary[]> => {
  const institutions = await prisma.institution.findMany({
    include: {
      _count: { select: { events: true } },
    },
    orderBy: { name: "asc" },
  });
  return institutions.map(mapInstitution);
});

export const getInstitutionOptions = cache(async () => {
  return prisma.institution.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
});

export const getVerifiedInstitutionCount = cache(async () => {
  return prisma.institution.count({
    where: { verificationStatus: InstitutionVerificationStatus.VERIFIED },
  });
});

export async function getInstitutionById(id: string) {
  const institution = await prisma.institution.findUnique({
    where: { id },
    include: {
      _count: { select: { events: true } },
      events: {
        where: { status: { not: "HIDDEN" } },
        select: { id: true, title: true, slug: true, startAt: true },
        orderBy: { startAt: "asc" },
        take: 10,
      },
    },
  });
  if (!institution) return null;

  return {
    ...mapInstitution(institution),
    description: institution.description,
    website: institution.website,
    events: institution.events,
  };
}
