import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getInstitutionById } from "@/server/queries/institutions";
import { Badge } from "@/components/ui/badge";

type Params = {
  params: {
    id: string;
    slug: string;
  };
};

export async function generateMetadata({ params }: { params: Promise<Params["params"]> }): Promise<Metadata> {
  const { id } = await params;
  const institution = await getInstitutionById(id);
  if (!institution) {
    return { title: "Institution not found" };
  }
  return {
    title: `${institution.name} | Neighbourhood Commons`,
    description: institution.description ?? undefined,
  };
}

export default async function InstitutionDetailPage({ params }: { params: Promise<Params["params"]> }) {
  const { id } = await params;
  const institution = await getInstitutionById(id);
  if (!institution) {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <div className="space-y-4 rounded-[32px] border border-[--color-border] bg-[--color-card] p-8 shadow-sm">
        <Badge variant={institution.status === "verified" ? "success" : "outline"}>
          {institution.status}
        </Badge>
        <h1 className="text-3xl font-semibold">{institution.name}</h1>
        {institution.description && (
          <p className="text-sm text-[--color-muted-foreground]">
            {institution.description}
          </p>
        )}
        <div className="grid gap-4 rounded-2xl bg-[--color-muted]/40 p-4 text-sm sm:grid-cols-2">
          <div>
            <p className="font-semibold text-[--color-foreground]">Address</p>
            <p>{institution.addressLine1}</p>
            {institution.addressLine2 && <p>{institution.addressLine2}</p>}
            <p>
              {institution.borough}, {institution.postcode}
            </p>
          </div>
          {institution.events && institution.events.length > 0 && (
            <div>
              <p className="font-semibold text-[--color-foreground]">Upcoming events</p>
              <ul className="mt-2 space-y-2">
                {institution.events.map((event) => (
                  <li key={event.id}>
                    <Link
                      className="text-sm text-[--color-accent]"
                      href={`/events/${event.id}/${event.slug}`}
                    >
                      {event.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
