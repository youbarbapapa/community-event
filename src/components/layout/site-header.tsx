import Link from "next/link";
import { siteConfig } from "@/config/site";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthActions } from "@/components/auth/auth-actions";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import type { Role } from "@/generated/prisma/enums";

export async function SiteHeader() {
  const session = await auth();
  const role = (session?.user?.role ?? "COMMUNITY") as Role;
  const navigation = siteConfig.navigation.filter((item) => {
    if (item.href === "/admin") {
      return role === "ADMIN" || role === "MODERATOR";
    }
    return true;
  });

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[--color-border]/60 bg-[--color-background]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            {siteConfig.name}
          </Link>
          <nav className="hidden items-center gap-4 text-sm font-medium md:flex">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[--color-muted-foreground] transition hover:text-[--color-foreground]"
              >
                {item.label}
              </Link>
            ))}
            <Button asChild size="sm" variant="ghost">
              <Link href="/events/new">Add event</Link>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link href="/institutions/new">Register institution</Link>
            </Button>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <AuthActions />
        </div>
      </div>
    </header>
  );
}
