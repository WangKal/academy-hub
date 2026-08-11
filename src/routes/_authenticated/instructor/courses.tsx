import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Panel, Pill } from "@/components/ds";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, LoadingBlock, formatDate, formatPrice } from "@/components/layout/States";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import * as api from "@/services/api";
import type { CourseLevel } from "@/types";

export const Route = createFileRoute("/_authenticated/instructor/courses")({
  head: () => ({
    meta: [
      { title: "Course builder — EA Academy" },
      { name: "description", content: "Create, publish and manage the courses you teach." },
      { property: "og:title", content: "Course builder — EA Academy" },
      { property: "og:description", content: "Manage the courses you teach at EA Academy." },
    ],
  }),
  component: InstructorCourses,
});

function NewCourseDialog() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [v, setV] = useState({
    title: "",
    shortDescription: "",
    category: "Executive support",
    level: "beginner" as CourseLevel,
    priceCents: "0",
  });

  const create = useMutation({
    mutationFn: () =>
      api.createCourse({
        title: v.title,
        shortDescription: v.shortDescription,
        descriptionHtml: `<p>${v.shortDescription}</p>`,
        priceCents: Number(v.priceCents) || 0,
        currency: "KES",
        category: v.category,
        level: v.level,
        status: "draft",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["instructor-courses"] });
      setOpen(false);
      setV({ ...v, title: "", shortDescription: "" });
      toast.success("Draft course created.");
    },
    onError: (e) => toast.error(api.errorMessage(e)),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-4" /> New course
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a course</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nc-title">Title</Label>
            <Input
              id="nc-title"
              value={v.title}
              onChange={(e) => setV({ ...v, title: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nc-short">Short description</Label>
            <Textarea
              id="nc-short"
              rows={3}
              value={v.shortDescription}
              onChange={(e) => setV({ ...v, shortDescription: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="nc-cat">Category</Label>
              <Input
                id="nc-cat"
                value={v.category}
                onChange={(e) => setV({ ...v, category: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nc-level">Level</Label>
              <Select
                value={v.level}
                onValueChange={(val) => setV({ ...v, level: val as CourseLevel })}
              >
                <SelectTrigger id="nc-level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nc-price">Price (cents)</Label>
            <Input
              id="nc-price"
              inputMode="numeric"
              value={v.priceCents}
              onChange={(e) => setV({ ...v, priceCents: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={!v.title.trim() || create.isPending}
            onClick={() => create.mutate()}
          >
            {create.isPending ? "Creating…" : "Create draft"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InstructorCourses() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["instructor-courses"],
    queryFn: () => api.getInstructorCourses(),
  });

  const toggle = useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) =>
      publish ? api.publishCourse(id) : api.unpublishCourse(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["instructor-courses"] });
      toast.success("Course updated.");
    },
    onError: (e) => toast.error(api.errorMessage(e)),
  });

  return (
    <AppShell
      title="Course builder"
      description="Courses you own"
      actions={<NewCourseDialog />}
    >
      {isLoading ? (
        <LoadingBlock />
      ) : error ? (
        <EmptyState title="Could not load courses" description={api.errorMessage(error)} />
      ) : !data?.length ? (
        <EmptyState
          title="No courses yet"
          description="Create your first draft course to get started."
        />
      ) : (
        <Panel>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Lessons</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell>
                    <Pill variant={c.status === "published" ? "success" : "neutral"}>
                      {c.status}
                    </Pill>
                  </TableCell>
                  <TableCell>{c.lessonCount ?? 0}</TableCell>
                  <TableCell>{c.enrollmentCount ?? 0}</TableCell>
                  <TableCell>{formatPrice(c.priceCents, c.currency)}</TableCell>
                  <TableCell>{formatDate(c.updatedAt)}</TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button asChild size="sm" variant="ghost">
                      <Link
                        to="/instructor/courses/$courseId"
                        params={{ courseId: c.id }}
                      >
                        Edit
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        toggle.mutate({ id: c.id, publish: c.status !== "published" })
                      }
                    >
                      {c.status === "published" ? "Unpublish" : "Publish"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Panel>
      )}
    </AppShell>
  );
}
