import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { canManageEvent } from "@/lib/permissions";
import { getEventById } from "@/server/queries/events";
import { getInstitutionOptions } from "@/server/queries/institutions";
import {
  EventForm,
  type EventFormInitialValues,
} from "@/components/events/event-form";
import { updateEventAction } from "@/server/actions/event-actions";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Edit event | Neighbourhood Commons",
};

type Params = {
  params: {
    id: string;
  };
};

function formatDate(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function formatTime(value: string) {
  return new Date(value).toISOString().slice(11, 16);
}

export default async function EditEventPage({ params }: { params: Promise<Params["params"]> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect(`/api/auth/signin?callbackUrl=/events/${id}/edit`);
  }

  const event = await getEventById(id);
  if (!event) {
    notFound();
  }

  const allowed = await canManageEvent(session.user.id, session.user.role, event);
  if (!allowed) {
    redirect(`/events/${event.id}/${event.slug}`);
  }

  const institutions = await getInstitutionOptions();
  const initialValues: EventFormInitialValues = {
    title: event.title,
    institutionId: event.institutionId ?? undefined,
    summary: event.summary,
    date: formatDate(event.startAt),
    startTime: formatTime(event.startAt),
    endTime: formatTime(event.endAt),
    audience: event.tags[0] ?? "family",
    cost: event.costType ?? "free",
    bookingUrl: event.bookingUrl ?? "",
    addressLine1: event.addressLine1,
    addressLine2: event.addressLine2,
    city: event.city ?? "",
    borough: event.borough,
    postcode: event.postcode,
    latitude: event.latitude ?? null,
    longitude: event.longitude ?? null,
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-[--color-muted-foreground]">
          Manage event
        </p>
        <h1 className="text-3xl font-semibold">Edit {event.title}</h1>
        <p className="text-sm text-[--color-muted-foreground]">
          Changes are saved immediately and will be visible after review.
        </p>
      </div>
      <EventForm
        institutions={institutions}
        action={updateEventAction.bind(null, event.id)}
        submitLabel="Save changes"
        initialValues={initialValues}
        sideContent={
          <Card className="space-y-4">
            <h3 className="text-lg font-semibold">Need to delete?</h3>
            <p className="text-sm text-[--color-muted-foreground]">
              You can remove the event from its detail page if it is no longer happening.
            </p>
          </Card>
        }
      />
    </div>
  );
}
