"use client";

import { useMemo } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { clientEnv } from "@/env-client";

type Props = {
  latitude: number;
  longitude: number;
};

const containerStyle = {
  width: "100%",
  height: "320px",
};

export function EventLocationMap({ latitude, longitude }: Props) {
  const loaderOptions: Parameters<typeof useJsApiLoader>[0] = {
    id: "google-maps-script",
    googleMapsApiKey: clientEnv.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    language: "en",
    region: "GB",
    libraries: ["maps"],
  };
  const { isLoaded } = useJsApiLoader(loaderOptions);

  const position = useMemo(() => ({ lat: latitude, lng: longitude }), [latitude, longitude]);

  if (!clientEnv.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-[--color-border] text-center text-sm text-[--color-muted-foreground]">
        <p>Add a Google Maps key to preview the venue map.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-[320px] animate-pulse rounded-3xl border border-[--color-border] bg-[--color-muted]/30" />
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-[--color-border]">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={position}
        zoom={15}
        options={{ disableDefaultUI: true, zoomControl: true }}
      >
        <Marker position={position} />
      </GoogleMap>
    </div>
  );
}
