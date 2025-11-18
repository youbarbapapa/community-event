"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { EventView } from "@/types/domain";

type Props = {
  event: EventView;
};

function formatGoogleDate(dateString: string) {
  const date = new Date(dateString);
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function EventCard({ event }: Props) {
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "error">("idle");
  const googleCalendarUrl = useMemo(() => {
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: event.title,
      details: event.summary,
      dates: `${formatGoogleDate(event.startAt)}/${formatGoogleDate(event.endAt)}`,
      location: `${event.addressLine1}, ${event.postcode}`,
      ctz: "Europe/London",
    });
    return `https://www.google.com/calendar/render?${params.toString()}`;
  }, [event]);

  async function handleShare() {
    try {
      if (typeof window === "undefined" || !navigator.clipboard) {
        throw new Error("Clipboard API unavailable");
      }
      const shareUrl = `${window.location.origin}/events/${event.id}/${event.slug}`;
      await navigator.clipboard.writeText(shareUrl);
      setShareStatus("copied");
      setTimeout(() => setShareStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to copy event link", error);
      setShareStatus("error");
      setTimeout(() => setShareStatus("idle"), 2000);
    }
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Badge variant={event.status === "official" ? "success" : "outline"}>
          {event.status === "official" ? "Official" : "Community"}
        </Badge>
        <span className="text-sm text-[--color-muted-foreground]">
          {new Intl.DateTimeFormat("en-GB", {
            weekday: "short",
            day: "numeric",
            month: "short",
          }).format(new Date(event.startAt))}
          {" · "}
          {new Intl.DateTimeFormat("en-GB", {
            hour: "numeric",
            minute: "numeric",
          }).format(new Date(event.startAt))}
        </span>
      </div>
      <div>
        <Link
          href={`/events/${event.id}/${event.slug}`}
          className="inline-flex flex-col gap-1"
        >
          <h3 className="text-xl font-semibold text-[--color-foreground]">
            {event.title}
          </h3>
          <p className="text-sm text-[--color-muted-foreground]">{event.summary}</p>
        </Link>
        {event.institutionName ? (
          <p className="text-xs uppercase tracking-wide text-[--color-muted-foreground]">
            {event.institutionName}
          </p>
        ) : null}
      </div>
      <div className="text-sm text-[--color-muted-foreground]">
        <p className="font-medium text-[--color-foreground]">{event.venue}</p>
        <p>
          {event.addressLine1} {event.addressLine2}
        </p>
        <p className="uppercase tracking-wide">{event.postcode}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {event.tags.map((tag) => (
          <Badge key={tag} variant="outline">
            {tag}
          </Badge>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <Button variant="primary" size="sm" asChild>
          <Link href={googleCalendarUrl} target="_blank" rel="noopener noreferrer">
            Save to calendar
          </Link>
        </Button>
        <Button variant="ghost" size="sm" onClick={handleShare}>
          {shareStatus === "copied"
            ? "Copied!"
            : shareStatus === "error"
              ? "Try again"
              : "Share"}
        </Button>
      </div>
    </Card>
  );
}
