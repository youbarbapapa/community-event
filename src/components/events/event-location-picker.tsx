"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { clientEnv } from "@/env-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export type Coordinates = {
  lng: number;
  lat: number;
};

export type LocationSelection = {
  coordinates: Coordinates;
  formattedAddress: string;
  addressLine1: string;
  city: string;
  borough: string;
  postcode: string;
};

type GeocodeAddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

type GeocodeResult = {
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components: GeocodeAddressComponent[];
};

const defaultCenter = { lat: 51.546, lng: -0.102 };

type Props = {
  value?: LocationSelection | null;
  onChange?: (selection: LocationSelection | null) => void;
  onStatusChange?: (status: string) => void;
};

export function EventLocationPicker({ value, onChange, onStatusChange }: Props) {
  const [postcode, setPostcode] = useState("");
  const [selection, setSelection] = useState<LocationSelection | null>(value ?? null);
  const [status, setStatus] = useState<string>("Awaiting postcode");
  const [isLoading, setIsLoading] = useState(false);
  const [center, setCenter] = useState(defaultCenter);

  const loaderOptions: Parameters<typeof useJsApiLoader>[0] = {
    id: "google-maps-script",
    googleMapsApiKey: clientEnv.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    language: "en",
    region: "GB",
    libraries: ["maps"],
  };
  const { isLoaded } = useJsApiLoader(loaderOptions);

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  useEffect(() => {
    if (value) {
      setSelection(value);
      setCenter(value.coordinates);
    }
  }, [value]);

  const updateSelection = useCallback(
    (next: LocationSelection | null, message: string) => {
      setSelection(next);
      if (next?.coordinates) {
        setCenter(next.coordinates);
      }
      setStatus(message);
      onChange?.(next);
    },
    [onChange],
  );

  function parseAddress(result: GeocodeResult): LocationSelection | null {
    const components = result.address_components ?? [];
    const get = (...types: string[]) =>
      components.find((component) =>
        types.every((type) => component.types.includes(type)),
      )?.long_name;
    const address1 =
      get("street_number") && get("route")
        ? `${get("street_number")} ${get("route")}`
        : result.formatted_address;
    const city = get("postal_town") ?? get("locality") ?? "";
    const borough =
      get("administrative_area_level_2") ??
      get("administrative_area_level_1") ??
      city;
    const postcodeComponent = get("postal_code") ?? "";
    const { lat, lng } = result.geometry.location;

    return {
      coordinates: { lat, lng },
      formattedAddress: result.formatted_address,
      addressLine1: address1,
      city,
      borough,
      postcode: postcodeComponent,
    };
  }

  async function lookupPostcode() {
    if (!postcode) return;
    if (!clientEnv.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      setStatus("Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable postcode search.");
      return;
    }

    const sanitized = postcode.replace(/\s+/g, "").toUpperCase();
    if (!/^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/.test(sanitized)) {
      setStatus("Please enter a valid UK postcode.");
      return;
    }

    setIsLoading(true);
    setStatus("Searching Google Maps...");
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(postcode)}&region=uk&key=${clientEnv.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
      );
      if (!response.ok) {
        throw new Error("Lookup failed");
      }
      const data: { results?: GeocodeResult[] } = await response.json();
      const result = data.results?.[0];
      if (!result) {
        setStatus("No results for that postcode. Try another.");
        return;
      }
      const parsed = parseAddress(result);
      if (!parsed) {
        setStatus("Unable to parse address. Try again.");
        return;
      }
      updateSelection(parsed, `Pinned ${parsed.formattedAddress}`);
    } catch (error) {
      console.error(error);
      setStatus("Something went wrong contacting Google Maps.");
    } finally {
      setIsLoading(false);
    }
  }

  const markerPosition = useMemo(
    () => selection?.coordinates ?? center,
    [selection, center],
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="postcode">Postcode search</Label>
        <div className="flex flex-col gap-3 md:flex-row">
          <Input
            id="postcode"
            placeholder="N1 2XH"
            value={postcode}
            onChange={(event) => setPostcode(event.target.value.toUpperCase())}
            className="md:flex-1"
          />
          <Button onClick={lookupPostcode} disabled={isLoading} className="md:w-40">
            {isLoading ? "Locating..." : "Locate on map"}
          </Button>
        </div>
        <p className="text-xs text-[--color-muted-foreground]">{status}</p>
      </div>
      {clientEnv.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
        isLoaded ? (
          <div className="overflow-hidden rounded-3xl border border-[--color-border]">
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "260px" }}
              center={markerPosition}
              zoom={selection ? 15 : 12}
              options={{ disableDefaultUI: true, zoomControl: true }}
              onClick={(event) => {
                if (!event.latLng || !selection) return;
                updateSelection(
                  {
                    ...selection,
                    coordinates: { lat: event.latLng.lat(), lng: event.latLng.lng() },
                  },
                  "Dropped pin on map",
                );
              }}
            >
              <Marker
                position={markerPosition}
                draggable
                onDragEnd={(event) => {
                  if (!event.latLng || !selection) return;
                  updateSelection(
                    {
                      ...selection,
                      coordinates: { lat: event.latLng.lat(), lng: event.latLng.lng() },
                    },
                    "Location fine-tuned on map",
                  );
                }}
              />
            </GoogleMap>
          </div>
        ) : (
          <div className="min-h-[260px] animate-pulse rounded-3xl border border-[--color-border] bg-[--color-muted]/30" />
        )
      ) : (
        <div className="flex min-h-[240px] flex-col items-center justify-center rounded-3xl border border-dashed border-[--color-border] text-center text-sm text-[--color-muted-foreground]">
          <p>Add a Google Maps key to render the interactive map preview.</p>
          <p className="text-xs">
            Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your env file.
          </p>
        </div>
      )}
      <p className="text-xs text-[--color-muted-foreground]">
        Drag the pin to fine tune the venue entrance. Lat/lng are stored with the
        event so we can show it on the borough map.
      </p>
      {selection && (
        <div className="rounded-2xl bg-[--color-muted]/40 p-4 text-sm text-[--color-foreground]">
          <p className="font-semibold">Selected address</p>
          <p>{selection.formattedAddress}</p>
        </div>
      )}
    </div>
  );
}
