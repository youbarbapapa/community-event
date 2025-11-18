"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventView } from "@/types/domain";
import "@/styles/fullcalendar.css";

type Props = {
  events: EventView[];
};

export function EventCalendar({ events }: Props) {
  return (
    <div className="rounded-3xl border border-[--color-border] bg-[--color-card] p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height="auto"
        headerToolbar={{
          start: "title",
          center: "",
          end: "dayGridMonth,timeGridWeek today prev,next",
        }}
        events={events.map((event) => ({
          id: event.id,
          title: event.title,
          start: event.startAt,
          end: event.endAt,
          display: "block",
        }))}
        eventColor="#ec6c24"
      />
    </div>
  );
}
