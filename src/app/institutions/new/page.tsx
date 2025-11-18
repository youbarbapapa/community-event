import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { InstitutionCreateForm } from "@/components/institutions/institution-create-form";

export const metadata = {
  title: "Register institution | Neighbourhood Commons",
};

export default async function InstitutionCreatePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin?callbackUrl=/institutions/new");
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-[--color-muted-foreground]">
          Community submission
        </p>
        <h1 className="text-3xl font-semibold">Register an institution</h1>
        <p className="text-sm text-[--color-muted-foreground]">
          Share libraries, children&apos;s centres, youth hubs, or community groups in
          your area. A platform admin will verify ownership, and organisation staff can
          claim the listing later.
        </p>
      </div>
      <InstitutionCreateForm />
    </div>
  );
}
