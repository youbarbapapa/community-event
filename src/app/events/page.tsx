import Link from "next/link";
import { EventFilters } from "@/components/events/event-filters";
import { EventList } from "@/components/events/event-list";
import { EventMap } from "@/components/events/event-map";
import { EventCalendar } from "@/components/events/event-calendar";
import { Button } from "@/components/ui/button";
import { getUpcomingEvents } from "@/server/queries/events";

export const metadata = {
  title: "Events | Neighbourhood Commons",
};

export default async function EventsPage() {
  const events = await getUpcomingEvents(48);
  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-[--color-muted-foreground]">
            Islington
          </p>
          <h1 className="text-3xl font-semibold">Events directory</h1>
          <p className="text-sm text-[--color-muted-foreground]">
            Save events privately or share your attendance with the community feed.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/events/new">Create event</Link>
        </Button>
      </div>

      <EventFilters />

      <div className="grid gap-8 lg:grid-cols-[0.9fr,1.1fr]">
        <EventCalendar events={events} />
        <EventMap events={events} />
      </div>

      <EventList events={events} />
    </div>
  );
}
