import { redirect } from "next/navigation";
import { EventCreationForm } from "@/components/events/event-creation-form";
import { getInstitutionOptions } from "@/server/queries/institutions";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Create event | Neighbourhood Commons",
};

export default async function EventCreatePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin?callbackUrl=/events/new");
  }

  const institutions = await getInstitutionOptions();
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-[--color-muted-foreground]">
          Community submission
        </p>
        <h1 className="text-3xl font-semibold">Add an event</h1>
        <p className="text-sm text-[--color-muted-foreground]">
          Org admins can mark events as official once the institution is verified.
        </p>
      </div>
      <EventCreationForm institutions={institutions} />
    </div>
  );
}
