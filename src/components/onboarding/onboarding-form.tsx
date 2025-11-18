"use client";

import { useActionState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  completeOnboardingAction,
  type OnboardingState,
} from "@/server/actions/profile-actions";
import { ToastMessage } from "@/components/ui/toast-message";

type Props = {
  defaultUsername?: string | null;
  defaultPostcode?: string | null;
};

const initialState: OnboardingState = { status: "idle" };

export function OnboardingForm({ defaultUsername, defaultPostcode }: Props) {
  const [state, formAction] = useActionState<OnboardingState, FormData>(
    completeOnboardingAction,
    initialState,
  );

  useEffect(() => {
    if (state.status === "success") {
      const timer = setTimeout(() => {
        window.location.href = "/";
      }, 1200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [state]);

  const usernameValue = state.values?.username ?? defaultUsername ?? "";
  const postcodeValue = state.values?.postcode ?? defaultPostcode ?? "";

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="username">Public username</Label>
        <Input
          key={`username-${usernameValue}`}
          id="username"
          name="username"
          placeholder="jess-events"
          defaultValue={usernameValue}
          autoComplete="off"
          required
        />
        <p className="text-xs text-[--color-muted-foreground]">
          This appears on events you create and on RSVPs.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="postcode">Postcode</Label>
        <Input
          key={`postcode-${postcodeValue}`}
          id="postcode"
          name="postcode"
          placeholder="N1 2XH"
          defaultValue={postcodeValue}
          autoComplete="postal-code"
          required
        />
        <p className="text-xs text-[--color-muted-foreground]">
          We use this to prioritise events in your area. You can change it later.
        </p>
      </div>
      {state.status === "error" && state.message && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/5 px-4 py-3 text-sm text-red-600">
          {state.message}
        </div>
      )}
      <Button type="submit" size="lg" className="w-full">
        Save and continue
      </Button>
      {state.status === "success" && state.message && (
        <div className="pointer-events-none fixed right-4 top-4 z-50">
          <ToastMessage message={state.message} />
        </div>
      )}
    </form>
  );
}
