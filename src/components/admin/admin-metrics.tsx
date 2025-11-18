import { Card } from "@/components/ui/card";
import type { AdminMetric } from "@/types/domain";

export function AdminMetrics({ metrics }: { metrics: AdminMetric[] }) {
  return (
    <Card className="grid gap-4 md:grid-cols-2">
      {metrics.map((metric) => (
        <div key={metric.label} className="rounded-2xl bg-[--color-muted]/40 p-4">
          <p className="text-xs uppercase tracking-wide text-[--color-muted-foreground]">
            {metric.label}
          </p>
          <p className="text-2xl font-semibold text-[--color-foreground]">
            {metric.value}
          </p>
          {metric.trend && (
            <p className="text-xs text-[--color-muted-foreground]">{metric.trend}</p>
          )}
        </div>
      ))}
    </Card>
  );
}
