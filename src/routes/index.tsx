import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { PublicFooter, PublicHeader } from "@/components/layout/PublicHeader";
import { formatPrice } from "@/components/layout/States";
import { Button } from "@/components/ui/button";
import * as api from "@/services/api";
import type { Course } from "@/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Academy Hub — Enterprise LMS" },
      {
        name: "description",
        content:
          "Master the skills that matter most. Expert-led, structured courses for individuals and teams.",
      },
      { property: "og:title", content: "Academy Hub — Enterprise LMS" },
      {
        property: "og:description",
        content: "Expert-led, structured courses with verifiable certificates.",
      },
    ],
  }),
  component: Landing,
});

const categories = ["Engineering", "Data Science", "Design", "AI & ML", "Cloud"];

const features = [
  { n: "01", title: "Structured learning paths", body: "Curated modules sequenced by domain experts. Progress in order — build knowledge that actually compounds." },
  { n: "02", title: "Progress tracking & analytics", body: "Know exactly where you are. Visual dashboards surface completion rates, quiz scores, and time invested." },
  { n: "03", title: "Assessments at every stage", body: "Graded quizzes at the close of every module verify comprehension before you advance." },
  { n: "04", title: "Verified certificates", body: "Every certificate carries a unique code. Share confidently — employers can verify authenticity instantly." },
  { n: "05", title: "Team & organization learning", body: "Deploy at scale. Role-based access, group enrollment, and org-wide analytics in one place." },
  { n: "06", title: "Rich lesson formats", body: "Video, reading, and interactive quizzes woven into engaging sequences — not passive consumption." },
];

const testimonials = [
  {
    name: "Yuki Tanaka",
    org: "Senior Engineer · Stratos Tech",
    initials: "YT",
    body: "The most rigorous online course I've taken. The module structure and assessments made the knowledge genuinely stick.",
    course: "Advanced React Patterns & Architecture",
    color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  },
  {
    name: "Fatima Al-Rashid",
    org: "Data Analyst · Apex Industries",
    initials: "FA",
    body: "I went from zero Python to confidently presenting data analysis to senior stakeholders. The certificate carries real weight.",
    course: "Data Science Fundamentals",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  },
  {
    name: "Omar Hassan",
    org: "Product Designer · TechCorp SA",
    initials: "OH",
    body: "UX Design Mastery gave me the vocabulary and process to design with genuine user empathy.",
    course: "UX Design Mastery",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  },
];

function Landing() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: coursesData } = useQuery({
    queryKey: ["courses", "public-home", searchQuery, activeCategory],
    queryFn: () =>
      api.getPublishedCourses({
        search: searchQuery,
        category: activeCategory === "All" ? undefined : activeCategory,
        pageSize: 12,
      }),
  });

  const coursesList = coursesData?.items ?? [];
  const totalCount = coursesData?.total ?? coursesList.length;

  const stats = [
    { value: "8,400+", label: "Active learners" },
    { value: `${totalCount || 94}`, label: "Expert courses" },
    { value: "31.8K", label: "Enrollments" },
    { value: "4.7★", label: "Avg rating" },
  ];

  const featuredCourse = coursesList[0];
  const heroCards = coursesList.slice(0, 3);

  return (
    <div className="min-h-screen">
      <PublicHeader />

      {/* ─── Hero — dark cinematic split ────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #08081a 0%, #0d1025 50%, #0a0f1e 100%)" }}
      >
        {/* Noise grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`,
            mixBlendMode: "screen",
            opacity: 0.6,
          }}
        />
        {/* Indigo aurora */}
        <div className="absolute pointer-events-none" style={{ top: "-20%", left: "25%", width: 900, height: 600, background: "radial-gradient(ellipse, rgba(99,102,241,0.22) 0%, transparent 65%)", filter: "blur(60px)" }} />
        <div className="absolute pointer-events-none" style={{ bottom: "-10%", right: "10%", width: 500, height: 400, background: "radial-gradient(ellipse, rgba(139,92,246,0.14) 0%, transparent 65%)", filter: "blur(80px)" }} />
        {/* Hairline grid */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "72px 72px" }} />

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 pt-20 pb-24 lg:pt-24 lg:pb-32">
          <div className="grid lg:grid-cols-[1fr_440px] gap-12 lg:gap-8 items-center">

            {/* Left: editorial copy */}
            <div>
              {/* Eyebrow tag */}
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-8 border"
                style={{ background: "rgba(99,102,241,0.1)", borderColor: "rgba(99,102,241,0.35)", color: "#a5b4fc" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                Enterprise-grade learning
              </div>

              {/* Headline */}
              <h1
                className="font-display text-white leading-[0.9] mb-6 tracking-tight"
                style={{ fontSize: "clamp(3.2rem, 8vw, 6rem)", fontWeight: 600, letterSpacing: "-0.025em" }}
              >
                Knowledge<br />
                <em style={{ color: "#818cf8", fontStyle: "italic" }}>precisely</em><br />
                delivered.
              </h1>

              <p className="text-base sm:text-lg leading-relaxed mb-8 max-w-[420px]" style={{ color: "#94a3b8" }}>
                Expert-led, structured courses for individuals and teams — with the depth to build skills that actually transfer to your work.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 mb-12">
                <Button asChild size="lg" className="rounded-xl transition-all hover:opacity-90 active:scale-95" style={{ background: "#6366f1", boxShadow: "0 0 40px rgba(99,102,241,0.45)" }}>
                  <Link to="/courses">Explore courses</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-xl border transition-all hover:bg-white/5" style={{ borderColor: "rgba(255,255,255,0.18)", color: "#cbd5e1" }}>
                  <Link to="/auth">Start free →</Link>
                </Button>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 pt-8 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                {stats.map((s) => (
                  <div key={s.label}>
                    <div className="font-mono text-xl sm:text-2xl font-bold text-white mb-0.5">{s.value}</div>
                    <div className="text-xs font-mono" style={{ color: "#475569" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: fanned course card stack */}
            <div className="hidden lg:block relative h-[480px] select-none">
              {heroCards.map((course, i) => {
                const config = [
                  { rotate: -6, top: 0, right: 80, zIndex: 1, shadow: "0 32px 64px rgba(0,0,0,0.7)" },
                  { rotate: 4, top: 40, right: 10, zIndex: 2, shadow: "0 24px 48px rgba(0,0,0,0.6)" },
                  { rotate: -1.5, top: 90, right: 45, zIndex: 3, shadow: "0 16px 40px rgba(0,0,0,0.55)" },
                ];
                const c = config[i];
                return (
                  <Link
                    key={course.id}
                    to="/courses/$slug"
                    params={{ slug: course.slug }}
                    className="absolute w-[240px] rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 hover:rotate-0 cursor-pointer block"
                    style={{
                      transform: `rotate(${c.rotate}deg)`,
                      top: c.top,
                      right: c.right,
                      zIndex: c.zIndex,
                      boxShadow: c.shadow,
                      border: "1px solid rgba(255,255,255,0.09)",
                      background: "#151c2e",
                    }}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={course.thumbnailUrl || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80"}
                        alt={course.title}
                        className="w-full h-32 object-cover"
                        style={{ filter: "brightness(0.8) saturate(0.9)" }}
                      />
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.5))" }} />
                    </div>
                    <div className="p-4">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-widest mb-1.5" style={{ color: "#818cf8" }}>{course.category}</div>
                      <h3 className="text-sm font-semibold text-white leading-snug mb-3 line-clamp-2">{course.title}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono" style={{ color: "#64748b" }}>⏱️ {course.estimatedHours}h</span>
                        <span className="text-sm font-bold text-white">{formatPrice(course.priceCents, course.currency)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
              <div className="absolute bottom-0 right-20 w-48 h-16 pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.25), transparent)", filter: "blur(20px)" }} />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-20 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent, var(--bg))" }} />
      </section>

      {/* ─── Section divider: marquee stats strip ─────────────────────────── */}
      <div
        className="overflow-hidden py-4 border-y"
        style={{ background: "var(--surface-2)", borderColor: "var(--edge)" }}
      >
        <div className="flex gap-8 whitespace-nowrap" style={{ animation: "marquee-scroll 28s linear infinite" }}>
          {[...Array(4)].flatMap(() => stats.map((s, i) => (
            <span key={`${i}-${Math.random()}`} className="inline-flex items-center gap-3 text-xs font-mono text-ink-3 shrink-0">
              <span className="font-bold text-sm text-ink-1">{s.value}</span>
              {s.label}
              <span className="text-ink-4 mx-2">·</span>
            </span>
          )))}
        </div>
        <style>{`@keyframes marquee-scroll { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
      </div>

      {/* ─── 01 — Course discovery ────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24" style={{ background: "var(--bg)" }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10">
            <div>
              <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-ink-4 mb-3">— 01</div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-ink-1 leading-tight">
                Find your next<br className="hidden sm:block" />
                <em style={{ color: "#6366f1" }}> area of mastery.</em>
              </h2>
            </div>
            <Link
              to="/courses"
              className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-4 shrink-0"
            >
              All courses →
            </Link>
          </div>

          <div className="flex gap-0 border-b overflow-x-auto mb-6 scrollbar-none" style={{ borderColor: "var(--edge)" }}>
            {["All", ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors ${
                  activeCategory === cat
                    ? "border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-ink-4 hover:text-ink-2 hover:border-ink-4"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="max-w-md mb-8">
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-4" width="15" height="15" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by topic or skill…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-ink-1 placeholder-ink-4 border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                style={{ background: "var(--surface)", borderColor: "var(--edge)" }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-4 hover:text-ink-2 text-base leading-none">×</button>
              )}
            </div>
          </div>

          {coursesList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {coursesList.slice(0, 6).map((course, i) => (
                <PublicCourseCard
                  key={course.id}
                  course={course}
                  tall={i === 0 && activeCategory === "All" && !searchQuery}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border rounded-2xl" style={{ background: "var(--surface)", borderColor: "var(--edge)" }}>
              <div className="font-display text-5xl font-semibold text-ink-4 mb-3">∅</div>
              <p className="text-sm text-ink-3 mb-4">No courses match your filters.</p>
              <button
                onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
                className="text-sm text-indigo-600 hover:underline underline-offset-4"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ─── 02 — Features ─────────────────────────────────────────────────── */}
      <section
        className="py-16 sm:py-24 border-t"
        style={{ background: "var(--surface)", borderColor: "var(--edge)" }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid lg:grid-cols-[300px_1fr] gap-12 lg:gap-24">
            <div className="lg:pt-0.5">
              <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-ink-4 mb-3">— 02</div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-ink-1 leading-tight mb-5">
                Built for<br />serious<br />learners.
              </h2>
              <p className="text-sm text-ink-3 leading-relaxed">
                Every feature is designed to support real skill development — not superficial course completion.
              </p>
            </div>

            <div className="divide-y" style={{ borderColor: "var(--edge)" }}>
              {features.map((f) => (
                <div key={f.n} className="group flex items-start gap-6 py-5 cursor-default">
                  <div
                    className="font-mono text-xs font-bold pt-0.5 shrink-0 transition-colors group-hover:text-indigo-500"
                    style={{ color: "var(--ink-4)", width: 24 }}
                  >
                    {f.n}
                  </div>
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1.5">
                    <h3 className="text-sm font-semibold text-ink-1 transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shrink-0">
                      {f.title}
                    </h3>
                    <div className="hidden sm:block flex-1 mx-5 h-px self-center opacity-30" style={{ background: "var(--ink-4)" }} />
                    <p className="text-xs text-ink-3 leading-relaxed sm:max-w-[280px]">{f.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 03 — Featured course spotlight ─────────────────────────────────── */}
      {featuredCourse && (
        <section className="py-16 sm:py-24" style={{ background: "var(--bg)" }}>
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-ink-4 mb-8">— 03 Spotlight</div>

            <div className="grid lg:grid-cols-2 rounded-2xl overflow-hidden border" style={{ borderColor: "var(--edge)" }}>
              <div className="relative overflow-hidden" style={{ minHeight: 280 }}>
                <img
                  src={featuredCourse.thumbnailUrl || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80"}
                  alt={featuredCourse.title}
                  className="w-full h-full object-cover"
                  style={{ minHeight: 280, objectPosition: "center" }}
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(79,70,229,0.65) 0%, rgba(0,0,0,0.3) 100%)" }} />
                <div className="absolute top-5 left-5">
                  <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider text-white"
                    style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)" }}>
                    ⭐ Most popular
                  </span>
                </div>
              </div>

              <div className="flex flex-col justify-center p-7 sm:p-10" style={{ background: "var(--surface)" }}>
                <div className="flex items-center gap-2 mb-5 font-mono text-xs text-ink-4">
                  <span>{featuredCourse.level}</span>
                  <span>·</span>
                  <span>{featuredCourse.category}</span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-semibold text-ink-1 leading-tight mb-4">
                  {featuredCourse.title}
                </h3>
                <p className="text-sm text-ink-3 leading-relaxed mb-6">
                  {featuredCourse.shortDescription || featuredCourse.description}
                </p>
                <div className="flex flex-wrap gap-4 text-xs font-mono text-ink-4 mb-8 pb-8 border-b" style={{ borderColor: "var(--edge)" }}>
                  <span>{featuredCourse.modulesCount || 4} modules</span>
                  <span>⏱️ {featuredCourse.estimatedHours} hours total</span>
                </div>
                <div className="flex items-center gap-5">
                  <Button asChild className="px-5 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 transition-all border-none">
                    <Link to="/courses/$slug" params={{ slug: featuredCourse.slug }}>
                      View course
                    </Link>
                  </Button>
                  <span className="font-display text-2xl font-semibold text-ink-1">
                    {formatPrice(featuredCourse.priceCents, featuredCourse.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── 04 — Testimonials ───────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 border-t" style={{ background: "var(--surface-2)", borderColor: "var(--edge)" }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-ink-4 mb-10">— 04 Voices</div>

          <blockquote className="max-w-4xl mb-14">
            <p
              className="font-display italic text-ink-1 leading-tight mb-6"
              style={{ fontSize: "clamp(1.6rem, 3.8vw, 2.8rem)", fontWeight: 400, letterSpacing: "-0.01em" }}
            >
              "{testimonials[0].body}"
            </p>
            <footer className="flex flex-wrap items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${testimonials[0].color}`}>
                {testimonials[0].initials}
              </div>
              <div>
                <div className="text-sm font-semibold text-ink-1">{testimonials[0].name}</div>
                <div className="text-xs font-mono text-ink-4">{testimonials[0].org}</div>
              </div>
              <div
                className="hidden sm:block h-8 w-px ml-2"
                style={{ background: "var(--edge)" }}
              />
              <div className="hidden sm:block text-xs font-mono text-indigo-500 dark:text-indigo-400">
                {testimonials[0].course}
              </div>
            </footer>
          </blockquote>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
            {testimonials.slice(1).map((t) => (
              <div
                key={t.name}
                className="rounded-2xl p-6 border"
                style={{ background: "var(--surface)", borderColor: "var(--edge)" }}
              >
                <div className="text-[10px] font-mono uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-4">{t.course}</div>
                <p className="text-sm italic text-ink-2 leading-relaxed mb-5">"{t.body}"</p>
                <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: "var(--edge)" }}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${t.color}`}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-ink-1">{t.name}</div>
                    <div className="text-[10px] font-mono text-ink-4">{t.org}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 05 — How it works ─────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24" style={{ background: "var(--bg)" }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-ink-4 mb-10">— 05 Process</div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0">
            {[
              { step: "01", title: "Discover", body: "Search our expert-curated catalogue by topic, level, or duration." },
              { step: "02", title: "Enroll", body: "Purchase once, access forever. Start immediately with no restrictions." },
              { step: "03", title: "Learn", body: "Progress through structured modules at your own pace and schedule." },
              { step: "04", title: "Certify", body: "Complete the course, pass assessments, earn a verified certificate." },
            ].map((item, i, arr) => (
              <div key={item.step} className="relative">
                {i < arr.length - 1 && (
                  <div
                    className="absolute top-5 left-1/2 right-0 h-px hidden lg:block"
                    style={{ background: "var(--edge)", zIndex: 0 }}
                  />
                )}
                <div className="relative p-5 sm:p-6">
                  <div
                    className="w-10 h-10 rounded-xl border flex items-center justify-center font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-5 relative z-10"
                    style={{ background: "var(--surface)", borderColor: "var(--edge)" }}
                  >
                    {item.step}
                  </div>
                  <h3 className="font-display text-lg font-semibold text-ink-1 mb-2">{item.title}</h3>
                  <p className="text-xs text-ink-3 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA — full dark poster format ───────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #08081a 0%, #0d1025 60%, #0a0f1e 100%)" }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.18) 0%, transparent 55%)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 80% 50%, rgba(139,92,246,0.1) 0%, transparent 55%)" }} />

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 py-20 sm:py-32">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="text-[10px] font-mono tracking-[0.2em] uppercase mb-6" style={{ color: "#4338ca" }}>— 06 Begin</div>
              <h2
                className="font-display text-white leading-[0.9] mb-6"
                style={{ fontSize: "clamp(2.8rem, 7vw, 5rem)", fontWeight: 600, letterSpacing: "-0.025em" }}
              >
                Your next<br />
                skill<br />
                <em style={{ color: "#818cf8", fontStyle: "italic" }}>awaits.</em>
              </h2>
            </div>

            <div>
              <p className="text-base sm:text-lg leading-relaxed mb-8" style={{ color: "#94a3b8" }}>
                Join {stats[0].value} professionals who've chosen Academy Hub for structured, certificate-backed learning that transfers to their work.
              </p>
              <div className="flex flex-wrap gap-3 mb-10">
                <Button asChild size="lg" className="rounded-xl transition-all hover:opacity-90 active:scale-95 text-white" style={{ background: "#6366f1", boxShadow: "0 0 40px rgba(99,102,241,0.35)" }}>
                  <Link to="/auth">Get started free</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-xl border transition-all hover:bg-white/5" style={{ borderColor: "rgba(255,255,255,0.18)", color: "#cbd5e1" }}>
                  <Link to="/courses">Browse catalogue →</Link>
                </Button>
              </div>

              <div className="flex flex-wrap gap-5 text-xs font-mono" style={{ color: "#475569" }}>
                <span>✓ Free to join</span>
                <span>✓ Verified certificates</span>
                <span>✓ Lifetime course access</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

function PublicCourseCard({
  course,
  tall = false,
}: {
  course: Course;
  tall?: boolean;
}) {
  const levelColors: Record<string, string> = {
    Beginner: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950",
    Intermediate: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950",
    Advanced: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950",
  };

  return (
    <Link
      to="/courses/$slug"
      params={{ slug: course.slug }}
      className="text-left rounded-2xl overflow-hidden border transition-all duration-300 group hover:shadow-xl hover:-translate-y-1 block"
      style={{ background: "var(--surface)", borderColor: "var(--edge)" }}
    >
      <div className="relative overflow-hidden">
        <img
          src={
            course.thumbnailUrl ||
            "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80"
          }
          alt={course.title}
          className={`w-full object-cover transition-transform duration-500 group-hover:scale-105 ${tall ? "h-52" : "h-40"}`}
          style={{ background: "var(--surface-3)" }}
        />
        <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 left-3">
          <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full capitalize ${levelColors[course.level] ?? ""}`}>
            {course.level}
          </span>
        </div>
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="px-2.5 py-1 rounded-lg text-sm font-bold text-white" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
            {formatPrice(course.priceCents, course.currency)}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-1.5">
          {course.category}
        </div>
        <h3 className={`font-semibold text-ink-1 leading-snug mb-2 line-clamp-2 transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400 ${tall ? "text-base" : "text-sm"}`}>
          {course.title}
        </h3>
        <p className="text-xs text-ink-4 line-clamp-2 mb-3">
          {course.shortDescription || course.description}
        </p>
        <div className="flex items-center justify-between text-xs border-t pt-3" style={{ borderColor: "var(--edge)" }}>
          <div className="flex items-center gap-2 font-mono text-ink-4">
            <span>⏱️ {course.estimatedHours}h</span>
            <span>·</span>
            <span>📚 {course.modulesCount || 4} modules</span>
          </div>
          <span className="font-bold text-ink-1 opacity-100 group-hover:opacity-0 transition-opacity">
            {formatPrice(course.priceCents, course.currency)}
          </span>
        </div>
      </div>
    </Link>
  );
}