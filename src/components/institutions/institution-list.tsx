import type { InstitutionSummary } from "@/types/domain";
import { InstitutionCard } from "./institution-card";

export function InstitutionList({ institutions }: { institutions: InstitutionSummary[] }) {
  return (
    <div className="grid gap-6">
      {institutions.map((institution) => (
        <InstitutionCard key={institution.id} institution={institution} />
      ))}
    </div>
  );
}
