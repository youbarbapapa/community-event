export type EventView = {
  id: string;
  slug: string;
  createdById?: string;
  title: string;
  summary: string;
  startAt: string;
  endAt: string;
  venue: string;
  addressLine1: string;
  addressLine2?: string | null;
  city?: string | null;
  postcode: string;
  borough: string;
  bookingUrl?: string | null;
  tags: string[];
  status: "official" | "community";
  institutionName?: string | null;
  institutionSlug?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  costType: string;
  institutionId?: string | null;
};

export type InstitutionSummary = {
  id: string;
  slug: string;
  createdById?: string | null;
  name: string;
  category: string;
  borough: string;
  addressLine1: string;
  addressLine2?: string | null;
  postcode: string;
  status: "verified" | "claimed" | "pending";
  verificationStatus: string;
  eventsCount: number;
  contactEmail?: string | null;
  isClaimable: boolean;
  description?: string | null;
};

export type AdminMetric = {
  label: string;
  value: string;
  trend?: string;
};
