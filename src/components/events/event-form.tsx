"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  EventLocationPicker,
  type LocationSelection,
} from "@/components/events/event-location-picker";
import type { EventActionState } from "@/server/actions/event-actions";

const formInitialState: EventActionState = { status: "idle" };

export type EventFormInitialValues = {
  title?: string;
  institutionId?: string | null;
  summary?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  audience?: string;
  cost?: string;
  bookingUrl?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  borough?: string | null;
  postcode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

type Props = {
  institutions: {
    id: string;
    name: string;
  }[];
  action: (prevState: EventActionState, formData: FormData) => Promise<EventActionState>;
  submitLabel: string;
  initialValues?: EventFormInitialValues;
  sideContent?: ReactNode;
};

export function EventForm({
  institutions,
  action,
  submitLabel,
  initialValues,
  sideContent,
}: Props) {
  const initialLocation = useMemo<LocationSelection | null>(() => {
    if (
      !initialValues ||
      initialValues.latitude == null ||
      initialValues.longitude == null ||
      !initialValues.addressLine1
    ) {
      return null;
    }
    return {
      coordinates: { lat: initialValues.latitude, lng: initialValues.longitude },
      formattedAddress: `${initialValues.addressLine1}, ${initialValues.borough ?? initialValues.city ?? ""}`.trim(),
      addressLine1: initialValues.addressLine1,
      city: initialValues.city ?? "",
      borough: initialValues.borough ?? "",
      postcode: initialValues.postcode ?? "",
    };
  }, [initialValues]);
  const [state, formAction] = useActionState<EventActionState, FormData>(
    action,
    formInitialState,
  );
  const [location, setLocation] = useState<LocationSelection | null>(initialLocation);
  const [locationStatus, setLocationStatus] = useState(
    initialLocation ? `Pinned ${initialLocation.addressLine1}` : "Awaiting postcode",
  );

  const formClasses = [
    "grid gap-8",
    sideContent ? "lg:grid-cols-[2fr,1fr]" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const resolvedAddressLine1 =
    location?.addressLine1 ?? initialValues?.addressLine1 ?? "";
  const resolvedCity = location?.city ?? initialValues?.city ?? "";
  const resolvedBorough = location?.borough ?? initialValues?.borough ?? "";
  const resolvedPostcode = location?.postcode ?? initialValues?.postcode ?? "";
  const resolvedLat =
    location?.coordinates?.lat ?? initialValues?.latitude ?? "";
  const resolvedLng =
    location?.coordinates?.lng ?? initialValues?.longitude ?? "";

  return (
    <form action={formAction} className={formClasses}>
      <Card className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="title">Event title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Stay & Play for toddlers"
              required
              defaultValue={initialValues?.title ?? ""}
            />
          </div>
          <div>
            <Label htmlFor="institutionId">Institution</Label>
            <Select
              id="institutionId"
              name="institutionId"
              defaultValue={initialValues?.institutionId ?? ""}
            >
              <option value="">Community-run (no institution)</option>
              {institutions.map((institution) => (
                <option key={institution.id} value={institution.id}>
                  {institution.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              required
              defaultValue={initialValues?.date ?? ""}
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label htmlFor="startTime">Start time</Label>
              <Input
                id="startTime"
                name="startTime"
                type="time"
                required
                defaultValue={initialValues?.startTime ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="endTime">End time</Label>
              <Input
                id="endTime"
                name="endTime"
                type="time"
                required
                defaultValue={initialValues?.endTime ?? ""}
              />
            </div>
          </div>
        </div>
        <div>
          <Label htmlFor="summary">Summary</Label>
          <Textarea
            id="summary"
            name="summary"
            required
            placeholder="Briefly describe what attendees can expect..."
            defaultValue={initialValues?.summary ?? ""}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="audience">Audience</Label>
            <Select
              id="audience"
              name="audience"
              defaultValue={initialValues?.audience ?? "family"}
            >
              <option value="family">Family</option>
              <option value="children">Under 5s</option>
              <option value="teens">Teens</option>
              <option value="adults">Adults</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="cost">Cost</Label>
            <Select id="cost" name="cost" defaultValue={initialValues?.cost ?? "free"}>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </Select>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Location</h3>
          <EventLocationPicker
            value={location}
            onChange={(coords) => setLocation(coords)}
            onStatusChange={setLocationStatus}
          />
          <p className="text-xs text-[--color-muted-foreground]">{locationStatus}</p>
          <div className="rounded-3xl border border-[--color-border] bg-[--color-muted]/30 p-4 text-sm text-[--color-foreground]">
            <p className="font-semibold">Venue address</p>
            {resolvedAddressLine1 ? (
              <div className="mt-2 space-y-1">
                <p>{resolvedAddressLine1}</p>
                <p>
                  {resolvedCity}, {resolvedBorough}
                </p>
                <p className="uppercase tracking-wide">{resolvedPostcode}</p>
              </div>
            ) : (
              <p className="text-[--color-muted-foreground]">
                Use the postcode search above to pin the venue. The address will appear
                here.
              </p>
            )}
          </div>
        </div>
        <div>
          <Label htmlFor="bookingUrl">Booking link (optional)</Label>
          <Input
            id="bookingUrl"
            name="bookingUrl"
            type="url"
            placeholder="https://"
            defaultValue={initialValues?.bookingUrl ?? ""}
          />
        </div>
        <div className="space-y-2">
          <input type="hidden" name="addressLine1" value={resolvedAddressLine1} />
          <input
            type="hidden"
            name="addressLine2"
            value={initialValues?.addressLine2 ?? ""}
          />
          <input type="hidden" name="city" value={resolvedCity} />
          <input type="hidden" name="borough" value={resolvedBorough} />
          <input type="hidden" name="postcode" value={resolvedPostcode} />
          <input type="hidden" name="latitude" value={`${resolvedLat}`} />
          <input type="hidden" name="longitude" value={`${resolvedLng}`} />
          {state.status === "error" && (
            <p className="text-sm text-red-500">{state.message}</p>
          )}
          {state.status === "success" && (
            <p className="text-sm text-emerald-600">{state.message}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <EventFormSubmitButton label={submitLabel} />
        </div>
      </Card>
      {sideContent && <div className="space-y-6">{sideContent}</div>}
    </form>
  );
}

function EventFormSubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button variant="primary" type="submit" disabled={pending} aria-busy={pending}>
      {pending ? "Saving..." : label}
    </Button>
  );
}
