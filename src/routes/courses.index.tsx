import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Panel, Pill } from "@/components/ds";
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
import type { CourseLevel } from "@/types";

export const Route = createFileRoute("/courses/")({
  head: () => ({
    meta: [
      { title: "Course catalogue — EA Academy" },
      {
        name: "description",
        content:
          "Browse executive and personal assistant courses: diary management, communication, travel logistics, board support and more.",
      },
      { property: "og:title", content: "Course catalogue — EA Academy" },
      {
        property: "og:description",
        content: "Executive assistant courses with assessments and verifiable certificates.",
      },
    ],
  }),
  component: Catalogue,
});

function Catalogue() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState<CourseLevel | "all">("all");

  const { data: categories } = useQuery({
    queryKey: ["course-categories"],
    queryFn: () => api.getCourseCategories(),
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["courses", "public", search, category, level],
    queryFn: () => api.getPublishedCourses({ search, category, level, pageSize: 24 }),
  });

  return (
    <div className="min-h-screen">
      <PublicHeader />
      <div className="mx-auto max-w-6xl px-5 py-14">
        <h1 className="font-display text-4xl font-semibold text-ink-1">Course catalogue</h1>
        <p className="mt-3 max-w-2xl text-ink-3">
          Structured programmes for executive and personal assistants at every stage of the career.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Input
            placeholder="Search courses…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-44">
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
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-10">
          {isLoading ? (
            <LoadingBlock rows={3} />
          ) : error ? (
            <EmptyState title="Catalogue unavailable" description={api.errorMessage(error)} />
          ) : !data?.items.length ? (
            <EmptyState
              title="No courses match your filters"
              description="Try clearing the search or choosing a different category."
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {data.items.map((c) => (
                <Panel key={c.id} className="flex flex-col overflow-hidden">
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
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-2">
                      <Pill variant="info" className="capitalize">
                        {c.level}
                      </Pill>
                      <span className="truncate text-xs font-medium uppercase tracking-widest text-ink-4">
                        {c.category}
                      </span>
                    </div>
                    <h2 className="mt-3 font-display text-lg font-semibold leading-snug text-ink-1">{c.title}</h2>
                    <p className="mt-2 line-clamp-3 flex-1 text-sm text-ink-3">
                      {c.shortDescription}
                    </p>
                    <div className="mt-5 flex items-center justify-between border-t border-edge pt-4">
                      <span className="font-display text-lg font-semibold text-ink-1">
                        {formatPrice(c.priceCents, c.currency)}
                      </span>
                      <Button asChild size="sm">
                        <Link to="/courses/$slug" params={{ slug: c.slug }}>
                          View course
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Panel>
              ))}
            </div>
          )}
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
