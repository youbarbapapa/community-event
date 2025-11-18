import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function GET() {
  const [events, institutions] = await Promise.all([
    prisma.event.findMany({
      select: { id: true, slug: true },
      where: { status: { not: "HIDDEN" } },
      take: 500,
    }),
    prisma.institution.findMany({
      select: { id: true, slug: true },
      take: 500,
    }),
  ]);

  const urls = [
    `${baseUrl}/`,
    `${baseUrl}/events`,
    `${baseUrl}/institutions`,
    `${baseUrl}/events/new`,
    `${baseUrl}/institutions/new`,
    ...events.map((event) => `${baseUrl}/events/${event.id}/${event.slug}`),
    ...institutions.map(
      (institution) => `${baseUrl}/institutions/${institution.id}/${institution.slug}`,
    ),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `<url>
  <loc>${url}</loc>
</url>`,
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
