import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { InstitutionSummary } from "@/types/domain";
import { ClaimInstitutionForm } from "./claim-institution-form";

type Props = {
  institution: InstitutionSummary;
};

export function InstitutionCard({ institution }: Props) {
  const statusMap: Record<InstitutionSummary["status"], string> = {
    verified: "Verified",
    pending: "Pending review",
    claimed: "Claimed",
  };

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link href={`/institutions/${institution.id}/${institution.slug}`}>
            <h3 className="text-xl font-semibold">{institution.name}</h3>
          </Link>
          <p className="text-sm text-[--color-muted-foreground]">{institution.category}</p>
        </div>
        <Badge variant={institution.status === "verified" ? "success" : "outline"}>
          {statusMap[institution.status] ?? institution.status}
        </Badge>
      </div>
      <div className="text-sm text-[--color-muted-foreground]">
        <p>
          {institution.addressLine1} {institution.addressLine2}
        </p>
        <p>{institution.borough}</p>
        <p className="uppercase tracking-wide">{institution.postcode}</p>
        {institution.contactEmail && (
          <p className="text-xs">
            <a
              href={`mailto:${institution.contactEmail}`}
              className="text-[--color-foreground]"
            >
              {institution.contactEmail}
            </a>
          </p>
        )}
      </div>
      <div className="text-sm text-[--color-muted-foreground]">
        {institution.eventsCount} upcoming events listed
      </div>
      {institution.isClaimable ? (
        <ClaimInstitutionForm institutionId={institution.id} />
      ) : (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm">
            Manage events
          </Button>
        </div>
      )}
    </Card>
  );
}
