"use client";

import { useMemo } from "react";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import type { EventView } from "@/types/domain";
import { clientEnv } from "@/env-client";

type Props = {
  events: EventView[];
};

const containerStyle = {
  width: "100%",
  height: "360px",
};

const defaultCenter = { lat: 51.546, lng: -0.1055 };

const officialIcon =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    `<svg width="28" height="38" viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg"><path d="M14 0C6.27 0 .014 6.185.014 13.855c0 8.254 9.45 18.675 13.2 23.069a1.03 1.03 0 001.572 0c3.752-4.394 13.2-14.815 13.2-23.069C27.986 6.185 21.73 0 14 0z" fill="%23EC6C24"/><circle cx="14" cy="14" r="6" fill="white"/></svg>`,
  );

const communityIcon =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    `<svg width="28" height="38" viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg"><path d="M14 0C6.27 0 .014 6.185.014 13.855c0 8.254 9.45 18.675 13.2 23.069a1.03 1.03 0 001.572 0c3.752-4.394 13.2-14.815 13.2-23.069C27.986 6.185 21.73 0 14 0z" fill="%236366F1"/><circle cx="14" cy="14" r="6" fill="white"/></svg>`,
  );

export function EventMap({ events }: Props) {
  const loaderOptions = {
    id: "google-maps-script",
    googleMapsApiKey: clientEnv.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    language: "en",
    region: "GB",
    libraries: ["maps"],
  } as const;
  const { isLoaded } = useJsApiLoader(loaderOptions);

  const markers = useMemo(
    () =>
      events.filter(
        (event): event is EventView & { latitude: number; longitude: number } =>
          typeof event.latitude === "number" && typeof event.longitude === "number",
      ),
    [events],
  );

  if (!clientEnv.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-[--color-border] text-center text-sm text-[--color-muted-foreground]">
        <p>Add your Google Maps API key to preview the live map.</p>
        <p className="text-xs">
          Set <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> in <code>.env</code>.
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-[360px] animate-pulse rounded-3xl border border-[--color-border] bg-[--color-muted]/30" />
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-[--color-border]">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={12}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          styles: [
            {
              featureType: "poi",
              stylers: [{ visibility: "off" }],
            },
            {
              featureType: "transit",
              stylers: [{ visibility: "off" }],
            },
          ],
        }}
      >
        {markers.map((event) => (
          <Marker
            key={event.id}
            position={{ lat: event.latitude, lng: event.longitude }}
            title={event.title}
            icon={{
              url: event.status === "official" ? officialIcon : communityIcon,
            }}
          />
        ))}
      </GoogleMap>
    </div>
  );
}
