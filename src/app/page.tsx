import { Hero } from "@/components/sections/hero";
import { EventMap } from "@/components/events/event-map";
import { EventList } from "@/components/events/event-list";
import { EventCalendar } from "@/components/events/event-calendar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUpcomingEvents, getEventCounts } from "@/server/queries/events";
import { getVerifiedInstitutionCount } from "@/server/queries/institutions";


export default async function HomePage() {
  const [events, eventCounts, verifiedInstitutions] = await Promise.all([
    getUpcomingEvents(24),
    getEventCounts(),
    getVerifiedInstitutionCount(),
  ]);
  const featured = events.slice(0, 3);
  const stats = [
    { label: "Official events verified", value: String(eventCounts.official) },
    { label: "Community submissions", value: String(eventCounts.community) },
    { label: "Upcoming events", value: String(events.length) },
    { label: "Verified institutions", value: String(verifiedInstitutions) },
  ];

  return (
    <div className="space-y-16">
      <Hero stats={stats} />

      <section className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Map view</h2>
            <Badge variant="outline">Live beta</Badge>
          </div>
          <EventMap events={events} />
        </div>
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">Coming up</h2>
            <p className="text-sm text-[--color-muted-foreground]">
              Filter by borough, category, or postcode to stay in the loop.
            </p>
          </div>
          <EventList events={featured} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <EventCalendar events={events} />
        <Card className="space-y-6">
          <div>
            <h3 className="text-2xl font-semibold">Quality safeguards</h3>
            <p className="text-sm text-[--color-muted-foreground]">
              Every listing is community-submitted and then verified by moderators or
              organisation admins, so parents can trust the detail.
            </p>
          </div>
          <div className="space-y-4">
            {[
              "Daily moderator verification queue",
              "Org admins can claim and edit their listings",
              "Community reports routed to staff within 48h",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl bg-[--color-muted]/40 p-4"
              >
                <span className="h-2 w-2 rounded-full bg-[--color-accent]" />
                <p className="text-sm">{item}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="space-y-6">
        <Card className="space-y-4 p-8">
          <h2 className="text-2xl font-semibold">Why we’re building this</h2>
          <p className="text-sm text-[--color-muted-foreground]">
            As parents in London we’ve spent too many weekends piecing together
            scattered flyers, Facebook posts, and crumpled library timetables just to
            find a toddler group or after-school club. Councils and children’s centres
            do incredible work, but their schedules still live on paper or PDFs.
          </p>
          <p className="text-sm text-[--color-muted-foreground]">
            Neighbourhood Commons is a free platform for families to contribute what
            they discover, for institutions to claim and maintain their listings, and
            for moderators to keep everything trustworthy. Know the perfect library
            storytime or sensory session? Add it. Want to help keep the calendar
            accurate? We’d love to hear from you at{" "}
            <a className="text-[--color-accent]" href="mailto:mas.bayoubourbon@gmail.com">
              mas.bayoubourbon@gmail.com
            </a>
            .
          </p>
        </Card>
      </section>
    </div>
  );
}
