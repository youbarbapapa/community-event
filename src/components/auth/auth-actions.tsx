import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export async function AuthActions() {
  const session = await auth();

  if (!session?.user) {
    return (
      <Button asChild variant="outline" size="sm">
        <Link href="/api/auth/signin">Sign in</Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-sm leading-tight text-[--color-muted-foreground]">
        <p className="font-medium text-[--color-foreground]">
          {session.user.firstName ?? session.user.name ?? "Welcome"}
        </p>
        <span className="text-xs uppercase tracking-wide">{session.user.role}</span>
      </div>
      <Button asChild variant="secondary" size="sm">
        <Link href="/api/auth/signout?callbackUrl=/">Sign out</Link>
      </Button>
    </div>
  );
}
