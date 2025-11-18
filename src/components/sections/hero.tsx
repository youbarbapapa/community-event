import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type HeroStat = {
  label: string;
  value: string;
};

type Props = {
  stats: HeroStat[];
};

export function Hero({ stats }: Props) {
  return (
    <section className="relative isolate overflow-hidden rounded-[48px] border border-[--color-border] bg-[radial-gradient(circle_at_top,hsl(var(--accent-secondary))/25%,transparent_60%),var(--gradient-primary)] px-8 py-16 text-white shadow-lg lg:px-16">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-6 text-white">
          <p className="text-sm uppercase tracking-[0.25em] text-white/70">
            Islington pilot
          </p>
          <h1 className="text-balance text-4xl font-semibold leading-tight sm:text-5xl">
            One calendar for council, library, and community events.
          </h1>
          <p className="text-lg text-white/80">
            Community volunteers submit events, organisations claim them, and
            parents keep track effortlessly with map, calendar, and reminders.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-white text-[hsl(var(--background))] hover:bg-white/90">
              <Link href="/events">Explore upcoming events</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="border border-white/40 bg-white/10 text-white hover:bg-white/20"
            >
              <Link href="/institutions/new">Register an institution</Link>
            </Button>
          </div>
        </div>
        <Card className="space-y-6 bg-[radial-gradient(circle_at_top,hsl(var(--accent))/65%,hsl(var(--accent-secondary))/75%)] p-6 text-white shadow-xl">
          <CardContent className="space-y-4">
            <h3 className="text-xl font-semibold">Live snapshot</h3>
            <dl className="grid gap-4 sm:grid-cols-2">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-white/10 p-4">
                  <dt className="text-xs uppercase tracking-wide text-white/80">
                    {stat.label}
                  </dt>
                  <dd className="text-3xl font-semibold">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
