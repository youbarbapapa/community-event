"use client";

import { Card } from "@/components/ui/card";
import { EventForm } from "@/components/events/event-form";
import { createEventAction } from "@/server/actions/event-actions";

type Props = {
  institutions: {
    id: string;
    name: string;
  }[];
};

export function EventCreationForm({ institutions }: Props) {
  return (
    <EventForm
      institutions={institutions}
      action={createEventAction}
      submitLabel="Publish event"
      sideContent={
        <Card className="space-y-4">
          <h3 className="text-lg font-semibold">Verification</h3>
          <p className="text-sm text-[--color-muted-foreground]">
            Add supporting information (council email, poster, link) in the booking URL
            to speed up verification.
          </p>
        </Card>
      }
    />
  );
}
