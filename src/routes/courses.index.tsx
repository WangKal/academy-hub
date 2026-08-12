import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { LayoutGrid, List, Search } from "lucide-react";

import { Pill, ProgressBar } from "@/components/ds";
import { PublicFooter, PublicHeader } from "@/components/layout/PublicHeader";
import { EmptyState, LoadingBlock, formatPrice } from "@/components/layout/States";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as api from "@/services/api";
import type { Course, CourseLevel } from "@/types";

export const Route = createFileRoute("/courses/")({
  head: () => ({
    meta: [
      { title: "Course catalogue — Academy Hub" },
      {
        name: "description",
        content:
          "Browse software engineering, data science, design, AI, and cloud architecture courses.",
      },
      { property: "og:title", content: "Course catalogue — Academy Hub" },
      {
        property: "og:description",
        content: "Expert-led courses with assessments and verifiable certificates.",
      },
    ],
  }),
  component: Catalogue,
});

export default function Catalogue() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState<CourseLevel | "all">("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const { data: categories } = useQuery({
    queryKey: ["course-categories"],
    queryFn: () => api.getCourseCategories(),
  });

  const { data: myEnrollments } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: () => api.getMyEnrollments(),
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["courses", "public", search, category, level],
    queryFn: () => api.getPublishedCourses({ search, category, level, pageSize: 24 }),
  });

  const enrollmentMap = new Map((myEnrollments ?? []).map((e) => [e.courseId, e]));

  return (
    <div className="min-h-screen bg-bg transition-colors">
      <PublicHeader />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink-1">
              Course Catalogue
            </h1>
            <p className="mt-1 text-ink-3 text-sm sm:text-base">
              Explore expert-led courses across engineering, design, data science, and more.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-surface-2 border border-edge rounded-xl p-1 self-start sm:self-auto">
            <button
              onClick={() => setView("grid")}
              className={`p-2 rounded-lg transition-all ${
                view === "grid"
                  ? "bg-surface shadow-sm text-ink-1 font-semibold"
                  : "text-ink-3 hover:text-ink-1"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2 rounded-lg transition-all ${
                view === "list"
                  ? "bg-surface shadow-sm text-ink-1 font-semibold"
                  : "text-ink-3 hover:text-ink-1"
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters bar */}
        <div
          className="p-4 rounded-2xl border mb-8 flex flex-wrap items-center gap-3"
          style={{ background: "var(--surface)", borderColor: "var(--edge)" }}
        >
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-4 w-4 h-4" />
            <Input
              placeholder="Search courses…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 text-xs sm:text-sm rounded-xl"
            />
          </div>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-44 text-xs rounded-xl">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {(categories ?? []).map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={level} onValueChange={(v) => setLevel(v as CourseLevel | "all")}>
            <SelectTrigger className="w-36 text-xs rounded-xl">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>

          {(search || category !== "all" || level !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setCategory("all");
                setLevel("all");
              }}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium px-2 py-1"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <LoadingBlock rows={3} />
        ) : error ? (
          <EmptyState title="Catalogue unavailable" description={api.errorMessage(error)} />
        ) : !data?.items.length ? (
          <div className="py-20 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="font-display text-lg font-semibold text-ink-1 mb-1">No courses found</h3>
            <p className="text-sm text-ink-3">Try adjusting your filters or search terms.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 rounded-xl"
              onClick={() => {
                setSearch("");
                setCategory("all");
                setLevel("all");
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.items.map((course) => (
              <CatalogueCard key={course.id} course={course} enrollment={enrollmentMap.get(course.id)} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {data.items.map((course) => (
              <CatalogueListRow key={course.id} course={course} enrollment={enrollmentMap.get(course.id)} />
            ))}
          </div>
        )}
      </div>

      <PublicFooter />
    </div>
  );
}

function CatalogueCard({ course, enrollment }: { course: Course; enrollment?: any }) {
  return (
    <div
      className="rounded-2xl border overflow-hidden transition-all duration-200 hover:shadow-md flex flex-col group"
      style={{ background: "var(--surface)", borderColor: "var(--edge)" }}
    >
      <div className="relative overflow-hidden aspect-video">
        <img
          src={
            course.thumbnailUrl ||
            "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80"
          }
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-black/60 backdrop-blur-md text-white font-mono">
            {course.category}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <Pill variant="info" className="capitalize text-xs">
            {course.level}
          </Pill>
        </div>
        {enrollment && (
          <div className="absolute bottom-0 left-0 right-0">
            <ProgressBar value={enrollment.progressPercent || 0} />
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-ink-1 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
            {course.title}
          </h3>
          <p className="text-xs text-ink-3 line-clamp-2 leading-relaxed mb-4">
            {course.shortDescription}
          </p>
        </div>

        <div>
          <div
            className="flex items-center gap-4 text-xs text-ink-4 font-mono mb-4 pt-3 border-t"
            style={{ borderColor: "var(--edge)" }}
          >
            <span>⏱️ {Math.max(1, Math.round((course.totalDurationSeconds ?? 0) / 3600))}h</span>
            <span>📚 {course.lessonCount ?? 0} lessons</span>
          </div>

          <div className="flex items-center justify-between">
            {enrollment ? (
              <Pill variant={enrollment.status === "completed" ? "success" : "neutral"}>
                {enrollment.status === "completed" ? "✓ Completed" : `${enrollment.progressPercent}% complete`}
              </Pill>
            ) : (
              <div className="font-display font-semibold text-ink-1">
                {formatPrice(course.priceCents, course.currency)}
              </div>
            )}

            <Button asChild size="sm" variant="outline" className="rounded-xl text-xs font-semibold">
              <Link to="/courses/$slug" params={{ slug: course.slug }}>
                {enrollment ? "Continue" : "View course"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CatalogueListRow({ course, enrollment }: { course: Course; enrollment?: any }) {
  return (
    <div
      className="p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-sm transition-all group"
      style={{ background: "var(--surface)", borderColor: "var(--edge)" }}
    >
      <img
        src={
          course.thumbnailUrl ||
          "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80"
        }
        alt={course.title}
        className="w-full sm:w-32 aspect-video rounded-xl object-cover shrink-0"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono text-ink-4 uppercase">{course.category}</span>
          <span className="text-xs text-ink-4">·</span>
          <Pill variant="info" className="capitalize text-[10px]">
            {course.level}
          </Pill>
        </div>
        <h3 className="font-display text-base font-semibold text-ink-1 group-hover:text-indigo-600 transition-colors">
          {course.title}
        </h3>
        <p className="text-xs text-ink-3 line-clamp-1 mt-1">
          {course.shortDescription}
        </p>

        {enrollment && (
          <div className="mt-3 max-w-xs">
            <ProgressBar value={enrollment.progressPercent || 0} showLabel />
          </div>
        )}
      </div>

      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-edge">
        {enrollment ? (
          <Pill variant={enrollment.status === "completed" ? "success" : "neutral"}>
            {enrollment.status === "completed" ? "✓ Completed" : `${enrollment.progressPercent}%`}
          </Pill>
        ) : (
          <div className="font-display font-semibold text-lg text-ink-1">
            {formatPrice(course.priceCents, course.currency)}
          </div>
        )}

        <Button asChild size="sm" variant="outline" className="rounded-xl text-xs">
          <Link to="/courses/$slug" params={{ slug: course.slug }}>
            {enrollment ? "Continue" : "View course"}
          </Link>
        </Button>
      </div>
    </div>
  );
}

