import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events, institutions] = await Promise.all([
    prisma.event.findMany({
      select: { id: true, slug: true, updatedAt: true },
      where: { status: { not: "HIDDEN" } },
      take: 1000,
    }),
    prisma.institution.findMany({
      select: { id: true, slug: true, updatedAt: true },
      take: 1000,
    }),
  ]);

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/institutions`,
      lastModified: new Date(),
    },
  ];

  const eventEntries = events.map((event) => ({
    url: `${baseUrl}/events/${event.id}/${event.slug}`,
    lastModified: event.updatedAt,
  }));

  const institutionEntries = institutions.map((institution) => ({
    url: `${baseUrl}/institutions/${institution.id}/${institution.slug}`,
    lastModified: institution.updatedAt,
  }));

  return [...staticEntries, ...eventEntries, ...institutionEntries];
}
