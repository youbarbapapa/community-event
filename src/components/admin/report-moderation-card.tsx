"use client";

import { useActionState, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ToastMessage } from "@/components/ui/toast-message";
import {
  moderationInitialState,
  resolveReportAction,
  updateEventStatusAction,
  type ModerationState,
} from "@/server/actions/moderation-actions";
import type { PendingReport } from "@/server/queries/admin";
import { EventStatus } from "@prisma/client";

type Props = {
  report: PendingReport;
};

const statusOptions = [
  { label: "Community", value: EventStatus.COMMUNITY },
  { label: "Official", value: EventStatus.OFFICIAL },
  { label: "Hide event", value: EventStatus.HIDDEN },
];

export function ReportModerationCard({ report }: Props) {
  const [reportState, reportAction] = useActionState<ModerationState, FormData>(
    resolveReportAction,
    moderationInitialState,
  );
  const [eventState, eventAction] = useActionState<ModerationState, FormData>(
    updateEventStatusAction,
    moderationInitialState,
  );
  const [eventStatus, setEventStatus] = useState(
    report.event?.status ?? EventStatus.COMMUNITY,
  );

  const formattedDate = useMemo(
    () =>
      new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(
        new Date(report.createdAt),
      ),
    [report.createdAt],
  );

  return (
    <div className="relative space-y-4 rounded-2xl border border-[--color-border] p-4">
      <div className="flex items-center justify-between text-sm text-[--color-muted-foreground]">
        <span>{report.targetType}</span>
        <span>{formattedDate}</span>
      </div>
      <div className="space-y-1">
        <h4 className="text-lg font-semibold text-[--color-foreground]">{report.reason}</h4>
        <p className="text-sm text-[--color-muted-foreground]">{report.description}</p>
        <p className="text-xs text-[--color-muted-foreground]">
          Reported by {report.createdBy.email}
        </p>
      </div>
      <form action={reportAction} className="flex flex-wrap gap-3">
        <input type="hidden" name="reportId" value={report.id} />
        <Button size="sm" variant="primary" name="decision" value="resolve">
          Resolve
        </Button>
        <Button size="sm" variant="ghost" name="decision" value="reject">
          Reject
        </Button>
      </form>
      {report.event && (
        <form action={eventAction} className="flex flex-wrap items-center gap-3">
          <input type="hidden" name="eventId" value={report.event.id} />
          <Select
            name="status"
            value={eventStatus}
            onChange={(event) => setEventStatus(event.target.value as EventStatus)}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Button size="sm" type="submit" variant="outline">
            Update event status
          </Button>
        </form>
      )}
      {reportState.status !== "idle" && reportState.message && (
        <div className="pointer-events-none absolute right-3 top-3">
          <ToastMessage
            key={`${report.id}-${reportState.status}-${reportState.message}`}
            message={reportState.message}
            variant={reportState.status === "error" ? "error" : "success"}
          />
        </div>
      )}
      {eventState.status !== "idle" && eventState.message && (
        <div className="pointer-events-none absolute right-3 top-3">
          <ToastMessage
            key={`${report.id}-event-${eventState.status}-${eventState.message}`}
            message={eventState.message}
            variant={eventState.status === "error" ? "error" : "success"}
          />
        </div>
      )}
    </div>
  );
}
