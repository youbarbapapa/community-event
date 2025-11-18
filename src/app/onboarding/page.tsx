import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";

export const metadata = {
  title: "Complete your profile | Neighbourhood Commons",
};

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  if (session.user.onboardingCompleted) {
    redirect("/");
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-10 rounded-[32px] border border-[--color-border] bg-[--color-card] px-8 py-12 shadow-sm">
      <div className="space-y-4 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-[--color-muted-foreground]">
          Welcome aboard
        </p>
        <h1 className="text-3xl font-semibold text-[--color-foreground]">
          Tell us how to address you
        </h1>
        <p className="text-sm text-[--color-muted-foreground]">
          Pick a username for event credits and RSVPs, and share your postcode so we
          can highlight the most relevant programming. This takes 30 seconds.
        </p>
      </div>
      <OnboardingForm
        defaultUsername={session.user.username}
        defaultPostcode={session.user.postcode}
      />
    </div>
  );
}
