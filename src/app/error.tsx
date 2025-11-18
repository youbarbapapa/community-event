"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-[--color-muted]/30 px-4 py-16">
        <Card className="max-w-lg space-y-6 text-center">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-[--color-muted-foreground]">
              Something snapped
            </p>
            <h1 className="text-3xl font-semibold text-[--color-foreground]">
              We’re juggling too many playdates
            </h1>
            <p className="text-sm text-[--color-muted-foreground]">
              A hiccup stopped us from loading this page. Take a breather, maybe sip that
              cold coffee, and we’ll get the toys back in the box.
            </p>
            <p className="text-sm font-medium text-[--color-foreground]">
              Need help right away?{" "}
              <a
                href="mailto:mathieu.bayou@gmail.com"
                className="text-[--color-accent] underline-offset-2 hover:underline"
              >
                Reach out to us
              </a>
              .
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="primary" onClick={reset}>
              Try again
            </Button>
            <Button asChild variant="ghost">
              <Link href="/">Back to safety</Link>
            </Button>
          </div>
          {error?.digest && (
            <p className="text-xs text-[--color-muted-foreground]">
              Error code: <span className="font-mono">{error.digest}</span>
            </p>
          )}
        </Card>
      </body>
    </html>
  );
}
