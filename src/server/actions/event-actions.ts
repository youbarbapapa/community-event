"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { generateSlug } from "@/lib/utils";
import {
  EventStatus,
  InstitutionVerificationStatus,
  Role,
} from "@prisma/client";
import { canManageEvent } from "@/lib/permissions";

const eventSchema = z.object({
  title: z.string().min(3),
  institutionId: z.string().optional().nullable(),
  summary: z.string().min(10),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  audience: z.string(),
  costType: z.string().default("free"),
  addressLine1: z.string().min(3),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  borough: z.string().min(2),
  postcode: z.string().min(3),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  bookingUrl: z.string().url().optional().or(z.literal("")),
});

export type EventActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const initialState: EventActionState = { status: "idle" };

const eventActionSuccess = (message: string): EventActionState => ({
  status: "success",
  message,
});

const eventActionError = (message: string): EventActionState => ({
  status: "error",
  message,
});

type ParsedEventForm = z.infer<typeof eventSchema>;
type ParsedFormResult =
  | { success: true; data: ParsedEventForm }
  | { success: false; state: EventActionState };

function parseEventForm(formData: FormData): ParsedFormResult {
  const parsed = eventSchema.safeParse({
    title: formData.get("title"),
    institutionId: formData.get("institutionId"),
    summary: formData.get("summary"),
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    audience: formData.get("audience"),
    costType: formData.get("cost"),
    addressLine1: formData.get("addressLine1"),
    addressLine2: formData.get("addressLine2"),
    city: formData.get("city"),
    borough: formData.get("borough"),
    postcode: formData.get("postcode"),
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
    bookingUrl: formData.get("bookingUrl"),
  });

  if (!parsed.success) {
    return {
      success: false,
      state: eventActionError(
        parsed.error.issues[0]?.message ?? "Invalid form submission.",
      ),
    };
  }
  return { success: true, data: parsed.data };
}

type CoordinateResult =
  | { success: true; value: { lat: number; lng: number } }
  | { success: false; state: EventActionState };

function parseCoordinates(
  latitude?: string | null,
  longitude?: string | null,
): CoordinateResult {
  if (!latitude || !longitude) {
    return {
      success: false,
      state: eventActionError("Select a venue on the map before publishing."),
    };
  }
  const latValue = Number(latitude);
  const lngValue = Number(longitude);
  if (Number.isNaN(latValue) || Number.isNaN(lngValue)) {
    return {
      success: false,
      state: eventActionError("Map coordinates are invalid. Try dropping the pin again."),
    };
  }
  return { success: true, value: { lat: latValue, lng: lngValue } };
}

type InstitutionPath = { id: string; slug: string | null };

function revalidateEventCaches({
  eventId,
  slugs = [],
  institutions = [],
}: {
  eventId?: string;
  slugs?: (string | null | undefined)[];
  institutions?: (InstitutionPath | null | undefined)[];
}) {
  revalidatePath("/");
  revalidatePath("/events");
  if (eventId) {
    const uniqueSlugs = Array.from(
      new Set((slugs ?? []).filter((slug): slug is string => Boolean(slug))),
    );
    uniqueSlugs.forEach((slug) => {
      revalidatePath(`/events/${eventId}/${slug}`);
    });
  }
  const seen = new Set<string>();
  institutions.forEach((institution) => {
    if (!institution?.id || !institution.slug) return;
    const key = `${institution.id}-${institution.slug}`;
    if (seen.has(key)) return;
    seen.add(key);
    revalidatePath(`/institutions/${institution.id}/${institution.slug}`);
  });
}

async function resolveEventStatus({
  institutionId,
  userId,
  userRole,
  fallbackStatus = EventStatus.COMMUNITY,
}: {
  institutionId?: string | null;
  userId: string;
  userRole: Role;
  fallbackStatus?: EventStatus;
}) {
  if (!institutionId) {
    return fallbackStatus;
  }

  const institution = await prisma.institution.findUnique({
    where: { id: institutionId },
    select: {
      verificationStatus: true,
      members: {
        where: { userId },
        select: { id: true },
      },
    },
  });
  if (
    institution &&
    institution.verificationStatus === InstitutionVerificationStatus.VERIFIED &&
    institution.members.length > 0 &&
    userRole !== "COMMUNITY"
  ) {
    return EventStatus.OFFICIAL;
  }
  return fallbackStatus;
}

export async function createEventAction(
  prevState: EventActionState = initialState,
  formData: FormData,
): Promise<EventActionState> {
  void prevState;
  try {
    const user = await requireUser();
    const parsed = parseEventForm(formData);
    if (!parsed.success) {
      return parsed.state;
    }
    const { data } = parsed;
    const coordinates = parseCoordinates(data.latitude, data.longitude);
    if (!coordinates.success) {
      return coordinates.state;
    }

    const startAt = new Date(`${data.date}T${data.startTime}`);
    const endAt = new Date(`${data.date}T${data.endTime}`);
    const slug = generateSlug(`${data.title}-${data.date}`);
    const normalizedInstitutionId = data.institutionId || undefined;
    const eventStatus = await resolveEventStatus({
      institutionId: normalizedInstitutionId,
      userId: user.id,
      userRole: user.role as Role,
      fallbackStatus: EventStatus.COMMUNITY,
    });

    const newEvent = await prisma.event.create({
      data: {
        slug,
        createdById: user.id,
        title: data.title,
        summary: data.summary,
        startAt,
        endAt,
        institutionId: normalizedInstitutionId,
        audienceTags: [data.audience],
        costType: data.costType,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        borough: data.borough,
        postcode: data.postcode,
        latitude: coordinates.value.lat,
        longitude: coordinates.value.lng,
        bookingUrl: data.bookingUrl || undefined,
        status: eventStatus,
      },
      select: {
        id: true,
        slug: true,
        institution: { select: { id: true, slug: true } },
      },
    });

    revalidateEventCaches({
      eventId: newEvent.id,
      slugs: [newEvent.slug],
      institutions: [newEvent.institution],
    });

    return eventActionSuccess("Event submitted for review.");
  } catch (error) {
    console.error(error);
    return eventActionError("Unable to create event right now.");
  }
}

export async function updateEventAction(
  eventId: string,
  prevState: EventActionState = initialState,
  formData: FormData,
): Promise<EventActionState> {
  void prevState;
  try {
    const user = await requireUser();
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        institution: { select: { id: true, slug: true } },
      },
    });
    if (!existingEvent) {
      return eventActionError("Event not found or may have been removed.");
    }

    const hasAccess = await canManageEvent(user.id, user.role as Role, {
      id: existingEvent.id,
      createdById: existingEvent.createdById,
      institutionId: existingEvent.institutionId,
    });

    if (!hasAccess) {
      return eventActionError("You do not have permission to edit this event.");
    }

    const parsed = parseEventForm(formData);
    if (!parsed.success) {
      return parsed.state;
    }
    const { data } = parsed;
    const coordinates = parseCoordinates(data.latitude, data.longitude);
    if (!coordinates.success) {
      return coordinates.state;
    }

    const startAt = new Date(`${data.date}T${data.startTime}`);
    const endAt = new Date(`${data.date}T${data.endTime}`);
    const slug = generateSlug(`${data.title}-${data.date}`);
    const normalizedInstitutionId = data.institutionId || undefined;
    const fallbackStatus =
      existingEvent.status === EventStatus.HIDDEN
        ? EventStatus.HIDDEN
        : EventStatus.COMMUNITY;
    const eventStatus = await resolveEventStatus({
      institutionId: normalizedInstitutionId,
      userId: user.id,
      userRole: user.role as Role,
      fallbackStatus,
    });

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        slug,
        title: data.title,
        summary: data.summary,
        startAt,
        endAt,
        institutionId: normalizedInstitutionId,
        audienceTags: [data.audience],
        costType: data.costType,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        borough: data.borough,
        postcode: data.postcode,
        latitude: coordinates.value.lat,
        longitude: coordinates.value.lng,
        bookingUrl: data.bookingUrl || undefined,
        status: eventStatus,
        lastEditedById: user.id,
      },
      select: {
        id: true,
        slug: true,
        institution: { select: { id: true, slug: true } },
      },
    });

    revalidateEventCaches({
      eventId: updatedEvent.id,
      slugs: [existingEvent.slug, updatedEvent.slug],
      institutions: [existingEvent.institution, updatedEvent.institution],
    });

    return eventActionSuccess("Event updated successfully.");
  } catch (error) {
    console.error(error);
    return eventActionError("Unable to update this event right now.");
  }
}

export async function deleteEventAction(eventId: string): Promise<EventActionState> {
  try {
    const user = await requireUser();
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        institution: { select: { id: true, slug: true } },
      },
    });
    if (!event) {
      return eventActionError("Event not found or already deleted.");
    }

    const hasAccess = await canManageEvent(user.id, user.role as Role, {
      id: event.id,
      createdById: event.createdById,
      institutionId: event.institutionId,
    });
    if (!hasAccess) {
      return eventActionError("You do not have permission to delete this event.");
    }

    await prisma.event.delete({ where: { id: eventId } });
    revalidateEventCaches({
      eventId: event.id,
      slugs: [event.slug],
      institutions: [event.institution],
    });

    return eventActionSuccess("Event deleted.");
  } catch (error) {
    console.error(error);
    return eventActionError("Unable to delete this event right now.");
  }
}
