import { Card } from "@/components/ui/card";
import type { PendingClaim, PendingReport } from "@/server/queries/admin";
import { ClaimModerationCard } from "@/components/admin/claim-moderation-card";
import { ReportModerationCard } from "@/components/admin/report-moderation-card";

type Props = {
  claims: PendingClaim[];
  reports: PendingReport[];
};

export function ModerationQueue({ claims, reports }: Props) {
  return (
    <Card className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Institution claims</h3>
        <p className="text-sm text-[--color-muted-foreground]">
          Review supporting evidence and approve or reject claims within 48h.
        </p>
      </div>
      <div className="space-y-4">
        {claims.length === 0 && (
          <p className="text-sm text-[--color-muted-foreground]">No pending claims.</p>
        )}
        {claims.map((claim) => (
          <ClaimModerationCard key={claim.id} claim={claim} />
        ))}
      </div>
      <div>
        <h3 className="text-xl font-semibold">Reports</h3>
        <p className="text-sm text-[--color-muted-foreground]">
          Resolve community reports, adjust event status, and keep listings accurate.
        </p>
      </div>
      <div className="space-y-4">
        {reports.length === 0 && (
          <p className="text-sm text-[--color-muted-foreground]">No open reports.</p>
        )}
        {reports.map((report) => (
          <ReportModerationCard key={report.id} report={report} />
        ))}
      </div>
    </Card>
  );
}
