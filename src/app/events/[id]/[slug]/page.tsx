import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getEventById } from "@/server/queries/events";
import { auth } from "@/lib/auth";
import { canManageEvent } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { EventLocationMap } from "@/components/events/event-location-map";
import { ManageEventActions } from "@/components/events/manage-event-actions";

type Params = {
  params: {
    id: string;
    slug: string;
  };
};

export async function generateMetadata({ params }: { params: Promise<Params["params"]> }): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) {
    return {
      title: "Event not found",
    };
  }

  return {
    title: `${event.title} | Neighbourhood Commons`,
    description: event.summary,
    openGraph: {
      title: event.title,
      description: event.summary,
    },
  };
}

export default async function EventDetailPage({ params }: { params: Promise<Params["params"]> }) {
  const { id } = await params;
  const [event, session] = await Promise.all([getEventById(id), auth()]);
  if (!event) {
    notFound();
  }

  const managePermission = session?.user
    ? await canManageEvent(session.user.id, session.user.role, event)
    : false;

  const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeFormatter = new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "numeric",
  });
  const formattedDate = dateFormatter.format(new Date(event.startAt));
  const timeRange = `${timeFormatter.format(new Date(event.startAt))} – ${timeFormatter.format(new Date(event.endAt))}`;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="space-y-3 rounded-[32px] border border-[--color-border] bg-[--color-card] p-8 shadow-sm">
        <Badge variant={event.status === "official" ? "success" : "outline"}>
          {event.status === "official" ? "Official" : "Community"}
        </Badge>
        <h1 className="text-3xl font-semibold">{event.title}</h1>
        <p className="text-sm text-[--color-muted-foreground]">{event.summary}</p>
        <div className="grid gap-4 rounded-2xl bg-[--color-muted]/40 p-4 text-sm sm:grid-cols-2">
          <div>
            <p className="font-semibold text-[--color-foreground]">When</p>
            <p>{formattedDate}</p>
            <p>{timeRange}</p>
          </div>
          <div>
            <p className="font-semibold text-[--color-foreground]">Where</p>
            <p>{event.addressLine1}</p>
            {event.addressLine2 && <p>{event.addressLine2}</p>}
            <p>
              {event.borough}, {event.postcode}
            </p>
          </div>
        </div>
        {event.institutionId && event.institutionName && event.institutionSlug && (
          <Link
            className="text-sm font-medium text-[--color-accent]"
            href={`/institutions/${event.institutionId}/${event.institutionSlug}`}
          >
            Hosted by {event.institutionName}
          </Link>
        )}
        {!!managePermission && (
          <div className="pt-4">
            <ManageEventActions eventId={event.id} />
          </div>
        )}
      </div>
      {event.latitude && event.longitude && (
        <EventLocationMap latitude={event.latitude} longitude={event.longitude} />
      )}
    </div>
  );
}
