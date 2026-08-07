import { createFileRoute } from "@tanstack/react-router";

import { PublicFooter, PublicHeader } from "@/components/layout/PublicHeader";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "The Academy — Executive & Personal Assistant Academy" },
      {
        name: "description",
        content:
          "How the Executive & Personal Assistant Academy teaches, assesses and certifies administrative professionals.",
      },
      { property: "og:title", content: "The Academy — EA Academy" },
      {
        property: "og:description",
        content: "Our teaching approach, assessment standard and certification process.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen">
      <PublicHeader />
      <article className="mx-auto max-w-3xl px-5 py-20">
        <h1 className="text-4xl">The Academy</h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          The Executive &amp; Personal Assistant Academy trains the professionals who hold
          organisations together. Our programmes are written by practising chiefs of staff and
          senior EAs, and are structured around the real rhythm of the role.
        </p>

        <h2 className="mt-12 text-2xl">How we teach</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Each course is broken into modules, and each module into short lessons — video, written
          briefings, and applied assignments. Progress is tracked lesson by lesson so you can
          return exactly where you left off.
        </p>

        <h2 className="mt-10 text-2xl">How we assess</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Modules close with a graded quiz and an explicit pass threshold. Attempts are recorded,
          scored instantly, and visible to your instructor.
        </p>

        <h2 className="mt-10 text-2xl">How we certify</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Complete every lesson in a course and a certificate is issued automatically with a unique
          code. Anyone — a recruiter, a board secretary, an employer — can verify that code on our
          public verification page.
        </p>
      </article>
      <PublicFooter />
    </div>
  );
}
