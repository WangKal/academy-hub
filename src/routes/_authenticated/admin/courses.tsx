import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { BookOpen, Edit, Eye, EyeOff, GraduationCap, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, LoadingBlock, formatDate, formatPrice } from "@/components/layout/States";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as api from "@/services/api";
import type { Course, CourseStatus } from "@/types";

export const Route = createFileRoute("/_authenticated/admin/courses")({
  beforeLoad: ({ context }) => {
    const user = (context as any).user;
    if (!user || user.role !== "admin") {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({
    meta: [
      { title: "Course management — EA Academy admin" },
      { name: "description", content: "Manage all courses, publish, archive and delete from here." },
      { property: "og:title", content: "Course management — EA Academy admin" },
      { property: "og:description", content: "Manage all academy courses." },
    ],
  }),
  component: AdminCourses,
});

const STATUS_VARIANT: Record<CourseStatus, "default" | "secondary" | "destructive" | "outline"> = {
  published: "default",
  draft: "secondary",
  archived: "destructive",
};

function AdminCourses() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CourseStatus | "all">("all");
  const [confirmDelete, setConfirmDelete] = useState<Course | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-courses", search, statusFilter],
    queryFn: () =>
      api.getCourses({
        search: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        pageSize: 50,
      }),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-courses"] });

  const publish = useMutation({
    mutationFn: (id: string) => api.publishCourse(id),
    onSuccess: () => { invalidate(); toast.success("Course published."); },
    onError: (e) => toast.error(api.errorMessage(e)),
  });

  const unpublish = useMutation({
    mutationFn: (id: string) => api.unpublishCourse(id),
    onSuccess: () => { invalidate(); toast.success("Course unpublished."); },
    onError: (e) => toast.error(api.errorMessage(e)),
  });

  const archive = useMutation({
    mutationFn: (id: string) => api.archiveCourse(id),
    onSuccess: () => { invalidate(); toast.success("Course archived."); },
    onError: (e) => toast.error(api.errorMessage(e)),
  });

  const deleteCourse = useMutation({
    mutationFn: (id: string) => api.deleteCourse(id),
    onSuccess: () => { invalidate(); toast.success("Course deleted."); setConfirmDelete(null); },
    onError: (e) => { toast.error(api.errorMessage(e)); setConfirmDelete(null); },
  });

  const courses = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <AppShell
      title="Course management"
      description={`${total} course${total !== 1 ? "s" : ""} in the catalogue`}
    >
      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-4" />
          <Input
            id="admin-courses-search"
            placeholder="Search title or instructor…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as CourseStatus | "all")}
        >
          <SelectTrigger className="w-44" id="admin-courses-status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <LoadingBlock />
      ) : error ? (
        <EmptyState
          title="Could not load courses"
          description={api.errorMessage(error)}
          icon={<BookOpen className="size-8" />}
        />
      ) : !courses.length ? (
        <EmptyState
          title="No courses match your filters"
          description="Try adjusting your search or status filter."
          icon={<BookOpen className="size-8" />}
        />
      ) : (
        <div className="rounded-xl border border-edge bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead className="w-28">Status</TableHead>
                <TableHead className="w-20 text-right">Students</TableHead>
                <TableHead className="w-28 text-right">Price</TableHead>
                <TableHead className="w-28">Updated</TableHead>
                <TableHead className="w-40 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {c.thumbnailUrl ? (
                        <img
                          src={c.thumbnailUrl}
                          alt=""
                          className="size-10 shrink-0 rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-surface-2">
                          <GraduationCap className="size-5 text-ink-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink-1">{c.title}</p>
                        <p className="truncate text-xs text-ink-4">{c.category}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-ink-2">
                    {c.instructorName ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[c.status]} className="capitalize">
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {c.enrollmentCount ?? 0}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatPrice(c.priceCents, c.currency)}
                  </TableCell>
                  <TableCell className="text-sm text-ink-3">{formatDate(c.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Edit */}
                      <Button asChild size="sm" variant="ghost" aria-label={`Edit ${c.title}`}>
                        <Link to="/instructor/courses/$courseId" params={{ courseId: c.id }}>
                          <Edit className="size-4" />
                        </Link>
                      </Button>

                      {/* Publish / Unpublish */}
                      {c.status === "published" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={`Unpublish ${c.title}`}
                          disabled={unpublish.isPending}
                          onClick={() => unpublish.mutate(c.id)}
                        >
                          <EyeOff className="size-4 text-amber-600" />
                        </Button>
                      ) : c.status === "draft" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={`Publish ${c.title}`}
                          disabled={publish.isPending}
                          onClick={() => publish.mutate(c.id)}
                        >
                          <Eye className="size-4 text-emerald-600" />
                        </Button>
                      ) : null}

                      {/* Archive */}
                      {c.status !== "archived" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={`Archive ${c.title}`}
                          disabled={archive.isPending}
                          onClick={() => archive.mutate(c.id)}
                          title="Archive course"
                        >
                          <span className="text-xs text-ink-3">Archive</span>
                        </Button>
                      )}

                      {/* Delete */}
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={`Delete ${c.title}`}
                        onClick={() => setConfirmDelete(c)}
                      >
                        <Trash2 className="size-4 text-rose-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={(open) => { if (!open) setConfirmDelete(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete course?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{confirmDelete?.title}</strong> will be permanently deleted. All modules,
              lessons, and progress records for this course will be removed. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => confirmDelete && deleteCourse.mutate(confirmDelete.id)}
              disabled={deleteCourse.isPending}
            >
              {deleteCourse.isPending ? "Deleting…" : "Yes, delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
