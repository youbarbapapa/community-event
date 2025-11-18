"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { ToastMessage } from "@/components/ui/toast-message";
import {
  moderationInitialState,
  resolveClaimAction,
  type ModerationState,
} from "@/server/actions/moderation-actions";
import type { PendingClaim } from "@/server/queries/admin";

type Props = {
  claim: PendingClaim;
};

export function ClaimModerationCard({ claim }: Props) {
  const [state, formAction] = useActionState<ModerationState, FormData>(
    resolveClaimAction,
    moderationInitialState,
  );

  return (
    <form action={formAction} className="relative space-y-3 rounded-2xl border border-[--color-border] p-4">
      <input type="hidden" name="claimId" value={claim.id} />
      <div className="flex items-center justify-between text-sm text-[--color-muted-foreground]">
        <span>{claim.institution.name}</span>
        <span>
          {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(
            new Date(claim.createdAt),
          )}
        </span>
      </div>
      <p className="text-sm text-[--color-foreground]">
        Requested by {claim.user.firstName ?? claim.user.email}
      </p>
      <p className="text-sm text-[--color-muted-foreground]">{claim.notes}</p>
      {claim.evidenceUrl && (
        <a
          className="text-sm font-medium text-[--color-foreground]"
          href={claim.evidenceUrl}
          target="_blank"
          rel="noreferrer"
        >
          Review evidence
        </a>
      )}
      <ModerationButtons />
      {state.status !== "idle" && state.message && (
        <div className="pointer-events-none absolute right-3 top-3">
          <ToastMessage
            key={`${claim.id}-${state.status}-${state.message}`}
            message={state.message}
            variant={state.status === "error" ? "error" : "success"}
          />
        </div>
      )}
    </form>
  );
}

function ModerationButtons() {
  const { pending } = useFormStatus();
  return (
    <div className="mt-3 flex flex-wrap gap-3">
      <Button
        size="sm"
        variant="primary"
        name="decision"
        value="approve"
        disabled={pending}
        aria-busy={pending}
      >
        {pending ? "Processing..." : "Approve"}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        name="decision"
        value="reject"
        disabled={pending}
      >
        Reject
      </Button>
    </div>
  );
}
