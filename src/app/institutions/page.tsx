import Link from "next/link";
import { InstitutionList } from "@/components/institutions/institution-list";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getInstitutions } from "@/server/queries/institutions";

export const metadata = {
  title: "Institutions | Neighbourhood Commons",
};

export default async function InstitutionsPage() {
  const institutions = await getInstitutions();
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-[--color-muted-foreground]">
            Official + community partners
          </p>
          <h1 className="text-3xl font-semibold">Institutions</h1>
          <p className="text-sm text-[--color-muted-foreground]">
            Community members can register new venues, and admins can claim them once
            verified by the platform team.
          </p>
        </div>
        <Button asChild size="lg" variant="outline">
          <Link href="/institutions/new">Register institution</Link>
        </Button>
      </div>

      <Card className="space-y-3">
        <h3 className="text-xl font-semibold">How claiming works</h3>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-[--color-muted-foreground]">
          <li>Community member submits an institution with baseline details.</li>
          <li>
            Organisation admin emails supporting evidence to mathieu.bayou@gmail.com or
            uploads via the dashboard.
          </li>
          <li>Platform admin or moderator reviews and flips status to verified.</li>
        </ol>
      </Card>

      <InstitutionList institutions={institutions} />
    </div>
  );
}
