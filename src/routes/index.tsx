import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Award, CalendarCheck, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

import { PublicFooter, PublicHeader } from "@/components/layout/PublicHeader";
import { formatPrice } from "@/components/layout/States";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import * as api from "@/services/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Executive & Personal Assistant Academy — Professional EA Training" },
      {
        name: "description",
        content:
          "Career-defining online training for executive and personal assistants. Structured courses, graded assessments and verifiable certificates.",
      },
      { property: "og:title", content: "Executive & Personal Assistant Academy" },
      {
        property: "og:description",
        content:
          "Structured EA training, graded assessments and verifiable certificates for the modern executive assistant.",
      },
    ],
  }),
  component: Landing,
});

const pillars = [
  {
    icon: CalendarCheck,
    title: "Built for the desk",
    body: "Diary command, inbox triage, travel logistics and board papers — taught the way the work actually arrives.",
  },
  {
    icon: ShieldCheck,
    title: "Assessed, not just watched",
    body: "Every module ends in a graded quiz with a pass threshold, so competence is demonstrated rather than assumed.",
  },
  {
    icon: Award,
    title: "Verifiable credentials",
    body: "Certificates carry a unique code any employer can check publicly in seconds.",
  },
];

function Landing() {
  const { data: courses } = useQuery({
    queryKey: ["courses", "featured"],
    queryFn: () => api.getPublishedCourses({ pageSize: 3 }),
  });

  return (
    <div className="min-h-screen">
      <PublicHeader />

      <section className="border-b border-edge bg-secondary/40">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-[1.1fr_0.9fr] md:py-28">
          <div>
            <Badge variant="outline" className="mb-6 rounded-full border-accent/60 bg-accent/10 text-accent-foreground">
              <Sparkles className="mr-1.5 size-3" /> Enrolment open
            </Badge>
            <h1 className="text-balance font-display text-4xl leading-[1.08] md:text-6xl">
              The profession behind every effective executive.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-3">
              A structured academy for executive and personal assistants — from diary strategy and
              stakeholder communication to board-level discretion. Learn, be assessed, and earn a
              credential that can be verified.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/courses">Browse the catalogue</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/auth">Create your account</Link>
              </Button>
            </div>
            <ul className="mt-10 grid gap-2 text-sm text-ink-3 sm:grid-cols-2">
              {[
                "Self-paced modules with progress tracking",
                "Graded quizzes with instant feedback",
                "Instructor-led course pathways",
                "Publicly verifiable certificates",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="rounded-lg border border-edge bg-card p-7 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-3">
                Curriculum snapshot
              </p>
              <div className="mt-5 space-y-5">
                {[
                  ["01", "Executive diary & priority command"],
                  ["02", "Inbox triage and written voice"],
                  ["03", "Travel, logistics & contingency planning"],
                  ["04", "Board papers, minutes and discretion"],
                  ["05", "Stakeholder influence without authority"],
                ].map(([n, t]) => (
                  <div key={n} className="flex gap-4 border-b border-edge/70 pb-4 last:border-0">
                    <span className="font-display text-sm text-accent">{n}</span>
                    <span className="text-sm">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-8 md:grid-cols-3">
          {pillars.map((p) => (
            <div key={p.title}>
              <p.icon className="size-5 text-accent" />
              <h3 className="mt-4 text-xl">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-3">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-8">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-3xl">Featured programmes</h2>
          <Link to="/courses" className="text-sm text-ink-3 hover:text-foreground">
            View all →
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {(courses?.items ?? []).map((c) => (
            <Card key={c.id} className="overflow-hidden">
              {c.thumbnailUrl && (
                <img
                  src={c.thumbnailUrl}
                  alt={`${c.title} course cover`}
                  loading="lazy"
                  width={1280}
                  height={720}
                  className="aspect-video w-full object-cover"
                />
              )}
              <CardContent className="p-6">
                <p className="text-xs uppercase tracking-widest text-ink-4">
                  {c.category} · {c.level}
                </p>
                <h3 className="mt-3 text-xl leading-snug">{c.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-ink-3">
                  {c.shortDescription}
                </p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="font-display text-lg">
                    {formatPrice(c.priceCents, c.currency)}
                  </span>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/courses/$slug" params={{ slug: c.slug }}>
                      Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
