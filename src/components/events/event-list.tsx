import type { EventView } from "@/types/domain";
import { EventCard } from "./event-card";

type Props = {
  events: EventView[];
};

export function EventList({ events }: Props) {
  return (
    <div className="grid gap-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
