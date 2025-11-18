"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  deleteEventAction,
  type EventActionState,
} from "@/server/actions/event-actions";

type Props = {
  eventId: string;
};

export function ManageEventActions({ eventId }: Props) {
  const router = useRouter();
  const [state, setState] = useState<EventActionState>({ status: "idle" });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (state.status === "success") {
      const timer = setTimeout(() => {
        router.replace("/events");
      }, 1200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [state, router]);

  const handleDelete = () => {
    if (!window.confirm("Delete this event? This action cannot be undone.")) {
      return;
    }
    startTransition(async () => {
      const result = await deleteEventAction(eventId);
      setState(result);
    });
  };

  return (
    <div className="space-y-2 rounded-2xl border border-dashed border-[--color-border] bg-[--color-muted]/30 p-4">
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href={`/events/${eventId}/edit`}>Edit event</Link>
        </Button>
        <Button
          variant="secondary"
          className="bg-red-50 text-red-600 hover:bg-red-100"
          onClick={handleDelete}
          disabled={isPending}
        >
          {isPending ? "Deleting..." : "Delete event"}
        </Button>
      </div>
      {state.status === "error" && (
        <p className="text-sm text-red-500">{state.message}</p>
      )}
      {state.status === "success" && (
        <p className="text-sm text-emerald-600">
          {state.message} Redirecting to events…
        </p>
      )}
    </div>
  );
}
