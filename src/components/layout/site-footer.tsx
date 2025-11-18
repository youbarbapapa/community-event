import Link from "next/link";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-[--color-border]/60 bg-[--color-background]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-[--color-muted-foreground] md:flex-row md:items-center md:justify-between">
        <p>
          Made for {siteConfig.area}. Contact{" "}
          <a
            href={`mailto:${siteConfig.contactEmail}`}
            className="font-medium text-[--color-foreground]"
          >
            {siteConfig.contactEmail}
          </a>
          .
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="/privacy"
            className="transition hover:text-[--color-foreground]"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="transition hover:text-[--color-foreground]"
          >
            Terms
          </Link>
          <a
            href={siteConfig.links.github}
            className="transition hover:text-[--color-foreground]"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
