import { AdminMetrics } from "@/components/admin/admin-metrics";
import { ModerationQueue } from "@/components/admin/moderation-queue";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAdminDashboardData } from "@/server/queries/admin";

export const metadata = {
  title: "Admin console | Neighbourhood Commons",
};

export default async function AdminPage() {
  const { metrics, pendingClaims, pendingReports } = await getAdminDashboardData();
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-semibold">Admin console</h1>
        <Badge variant="outline">Internal</Badge>
      </div>
      <AdminMetrics metrics={metrics} />
      <div className="grid gap-6 lg:grid-cols-2">
        <ModerationQueue claims={pendingClaims} reports={pendingReports} />
        <Card className="space-y-4">
          <h3 className="text-xl font-semibold">Volunteer moderators</h3>
          <p className="text-sm text-[--color-muted-foreground]">
            We’re onboarding moderators to maintain the &lt;48h SLA for claims and reports.
            Share onboarding packs and assign borough-specific scopes here.
          </p>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-2xl bg-[--color-muted]/40 p-4">
              <span>Amy (North borough)</span>
              <span className="text-[--color-muted-foreground]">12 reviews this week</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-[--color-muted]/40 p-4">
              <span>David (Libraries focus)</span>
              <span className="text-[--color-muted-foreground]">9 reviews</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
