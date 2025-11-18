import { cache } from "react";
import type { Prisma } from "@/generated/prisma/client";
import { EventStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import type { EventView } from "@/types/domain";
import { decimalToNumber } from "@/lib/utils";

type EventWithRelations = Prisma.EventGetPayload<{
  include: { institution: { select: { name: true; id: true; slug: true } } };
}>;

function mapEventToView(event: EventWithRelations): EventView {
  return {
    id: event.id,
    slug: event.slug,
    createdById: event.createdById,
    title: event.title,
    summary: event.summary,
    startAt: event.startAt.toISOString(),
    endAt: event.endAt.toISOString(),
    venue: event.addressLine1,
    addressLine1: event.addressLine1,
    addressLine2: event.addressLine2,
    city: event.city,
    postcode: event.postcode,
    borough: event.borough,
    bookingUrl: event.bookingUrl ?? null,
    tags: event.audienceTags,
    status: event.status === EventStatus.OFFICIAL ? "official" : "community",
    institutionName: event.institution?.name ?? null,
    institutionSlug: event.institution?.slug ?? null,
    institutionId: event.institution?.id ?? null,
    latitude: decimalToNumber(event.latitude),
    longitude: decimalToNumber(event.longitude),
    costType: event.costType,
  };
}

export const getUpcomingEvents = cache(async (limit = 24): Promise<EventView[]> => {
  const now = new Date();
  const events = await prisma.event.findMany({
    where: {
      startAt: { gte: now },
      status: { not: EventStatus.HIDDEN },
    },
    include: { institution: { select: { name: true, id: true, slug: true } } },
    orderBy: { startAt: "asc" },
    take: limit,
  });
  return events.map(mapEventToView);
});

export const getEventCounts = cache(async () => {
  const [official, community, total] = await Promise.all([
    prisma.event.count({ where: { status: EventStatus.OFFICIAL } }),
    prisma.event.count({ where: { status: EventStatus.COMMUNITY } }),
    prisma.event.count(),
  ]);

  return {
    official,
    community,
    total,
  };
});

export const getEventsAddedThisWeek = cache(async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return prisma.event.count({
    where: {
      createdAt: { gte: sevenDaysAgo },
    },
  });
});

export async function getEventById(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      institution: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });
  if (!event) return null;
  return mapEventToView(event);
}
