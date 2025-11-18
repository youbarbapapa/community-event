"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  submitClaimAction,
  type ClaimActionState,
} from "@/server/actions/institution-actions";
import { ToastMessage } from "@/components/ui/toast-message";

type Props = {
  institutionId: string;
};

const initialState: ClaimActionState = { status: "idle" };

export function ClaimInstitutionForm({ institutionId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction] = useActionState<ClaimActionState, FormData>(
    submitClaimAction,
    initialState,
  );

  if (!isOpen) {
    return (
      <Button size="sm" onClick={() => setIsOpen(true)} type="button">
        Claim this institution
      </Button>
    );
  }

  return (
    <>
      <form action={formAction} className="w-full space-y-3 rounded-2xl border border-[--color-border] p-4">
        <input type="hidden" name="institutionId" value={institutionId} />
        <Textarea
          name="notes"
          placeholder="Provide context: council email, your role, or supporting details."
          required
        />
        <Input
          name="evidenceUrl"
          type="url"
          placeholder="Evidence link (optional)"
        />
        <div className="flex gap-3">
          <SubmitClaimButton />
          <CancelClaimButton onCancel={() => setIsOpen(false)} />
        </div>
      </form>
      {state.status !== "idle" && state.message && (
        <div className="pointer-events-none fixed right-4 top-4 z-50">
          <ToastMessage
            key={`${institutionId}-${state.status}-${state.message}`}
            message={state.message}
            variant={state.status === "error" ? "error" : "success"}
          />
        </div>
      )}
    </>
  );
}

function SubmitClaimButton() {
  const { pending } = useFormStatus();
  return (
    <Button size="sm" type="submit" disabled={pending} aria-busy={pending}>
      {pending ? "Submitting..." : "Submit claim"}
    </Button>
  );
}

function CancelClaimButton({ onCancel }: { onCancel: () => void }) {
  const { pending } = useFormStatus();
  return (
    <Button
      size="sm"
      variant="ghost"
      type="button"
      onClick={onCancel}
      disabled={pending}
    >
      Cancel
    </Button>
  );
}
