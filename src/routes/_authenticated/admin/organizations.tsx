import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Building2, Download, Plus, Upload, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, LoadingBlock, formatDate } from "@/components/layout/States";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import * as api from "@/services/api";

export const Route = createFileRoute("/_authenticated/admin/organizations")({
  beforeLoad: ({ context }) => {
    const user = (context as any).user;
    if (!user || user.role !== "admin") {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({
    meta: [
      { title: "Organizations & Cohorts — EA Academy" },
      {
        name: "description",
        content: "Manage B2B corporate clients, cohorts and bulk student onboardings.",
      },
    ],
  }),
  component: AdminOrganizationsPage,
});

function AdminOrganizationsPage() {
  const qc = useQueryClient();
  const [isAddOrgOpen, setIsAddOrgOpen] = useState(false);
  const [isAddCohortOpen, setIsAddCohortOpen] = useState(false);
  const [isBulkEnrollOpen, setIsBulkEnrollOpen] = useState(false);

  // Form states
  const [orgName, setOrgName] = useState("");
  const [orgCode, setOrgCode] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [orgDomain, setOrgDomain] = useState("");
  const [orgMaxSeats, setOrgMaxSeats] = useState("50");

  const [cohortOrgId, setCohortOrgId] = useState("");
  const [cohortName, setCohortName] = useState("");
  const [cohortDesc, setCohortDesc] = useState("");

  const [bulkCourseId, setBulkCourseId] = useState("");
  const [bulkOrgId, setBulkOrgId] = useState("");
  const [bulkEmailsText, setBulkEmailsText] = useState("");

  const { data: orgs = [], isLoading: isOrgsLoading } = useQuery({
    queryKey: ["organizations"],
    queryFn: () => api.getOrganizations(),
  });

  const { data: cohorts = [], isLoading: isCohortsLoading } = useQuery({
    queryKey: ["cohorts"],
    queryFn: () => api.getCohorts(),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: () => api.getCourses(),
  });

  const createOrgMutation = useMutation({
    mutationFn: () =>
      api.createOrganization({
        name: orgName,
        code: orgCode,
        contactEmail: orgEmail,
        domain: orgDomain,
        maxSeats: parseInt(orgMaxSeats, 10) || 50,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organizations"] });
      toast.success("Organization created.");
      setIsAddOrgOpen(false);
      setOrgName("");
      setOrgCode("");
      setOrgEmail("");
    },
    onError: (e) => toast.error(api.errorMessage(e)),
  });

  const createCohortMutation = useMutation({
    mutationFn: () =>
      api.createCohort({
        organizationId: cohortOrgId,
        name: cohortName,
        description: cohortDesc,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cohorts"] });
      toast.success("Cohort created.");
      setIsAddCohortOpen(false);
      setCohortName("");
      setCohortDesc("");
    },
    onError: (e) => toast.error(api.errorMessage(e)),
  });

  const bulkEnrollMutation = useMutation({
    mutationFn: () => {
      const emails = bulkEmailsText
        .split(/[\n,]/)
        .map((e) => e.trim())
        .filter(Boolean);
      return api.bulkEnrollStudents({
        emails,
        courseId: bulkCourseId,
        organizationId: bulkOrgId || undefined,
      });
    },
    onSuccess: (res) => {
      toast.success(
        `Successfully enrolled ${res.successfulEmails.length} student(s). ${
          res.failedEmails.length ? `${res.failedEmails.length} failed.` : ""
        }`,
      );
      setIsBulkEnrollOpen(false);
      setBulkEmailsText("");
    },
    onError: (e) => toast.error(api.errorMessage(e)),
  });

  return (
    <AppShell
      title="B2B Organizations & Corporate Cohorts"
      description="Manage enterprise client accounts, multi-tenant cohorts, and bulk CSV enrollee onboarding"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsBulkEnrollOpen(true)}>
            <Upload className="mr-1.5 size-4" /> Bulk Enroll Students
          </Button>
          <Button size="sm" onClick={() => setIsAddOrgOpen(true)}>
            <Plus className="mr-1.5 size-4" /> Add Organization
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Organizations Section */}
        <div>
          <h2 className="mb-3 text-lg font-semibold flex items-center gap-2">
            <Building2 className="size-5 text-primary" /> Corporate Client Organizations
          </h2>
          {isOrgsLoading ? (
            <LoadingBlock />
          ) : !orgs.length ? (
            <EmptyState
              title="No organizations added yet"
              description="Add enterprise clients to manage corporate cohorts."
            />
          ) : (
            <div className="rounded-xl border border-edge bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Contact Email</TableHead>
                    <TableHead>Seats Used</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orgs.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">{o.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{o.code}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-ink-3">{o.contactEmail}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {o.activeSeats} / {o.maxSeats} seats
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-ink-3">
                        {formatDate(o.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Cohorts Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="size-5 text-primary" /> Training Cohorts & Batches
            </h2>
            <Button variant="outline" size="sm" onClick={() => setIsAddCohortOpen(true)}>
              <Plus className="mr-1.5 size-4" /> Create Cohort
            </Button>
          </div>
          {isCohortsLoading ? (
            <LoadingBlock />
          ) : !cohorts.length ? (
            <EmptyState title="No cohorts created yet" />
          ) : (
            <div className="rounded-xl border border-edge bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cohort Name</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cohorts.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{c.organizationName ?? "B2B Group"}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-ink-3">{c.description || "N/A"}</TableCell>
                      <TableCell className="text-xs text-ink-3">
                        {formatDate(c.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Add Organization Dialog */}
      <Dialog open={isAddOrgOpen} onOpenChange={setIsAddOrgOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Enterprise Client Organization</DialogTitle>
            <DialogDescription>
              Register a new B2B company or institutional client.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-medium">Organization Name</label>
              <Input
                placeholder="e.g. KCB Group Executive Office"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">Unique Code</label>
                <Input
                  placeholder="KCB-EXEC"
                  value={orgCode}
                  onChange={(e) => setOrgCode(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium">Max License Seats</label>
                <Input
                  type="number"
                  value={orgMaxSeats}
                  onChange={(e) => setOrgMaxSeats(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium">Contact Email</label>
              <Input
                type="email"
                placeholder="corporate@kcbgroup.com"
                value={orgEmail}
                onChange={(e) => setOrgEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium">Corporate Domain (Optional)</label>
              <Input
                placeholder="kcbgroup.com"
                value={orgDomain}
                onChange={(e) => setOrgDomain(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddOrgOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createOrgMutation.mutate()}
              disabled={!orgName || !orgCode || !orgEmail}
            >
              Save Organization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Cohort Dialog */}
      <Dialog open={isAddCohortOpen} onOpenChange={setIsAddCohortOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Corporate Cohort</DialogTitle>
            <DialogDescription>Assign a training batch to an enterprise client.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-medium">Select Organization</label>
              <Select value={cohortOrgId} onValueChange={setCohortOrgId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose organization..." />
                </SelectTrigger>
                <SelectContent>
                  {orgs.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium">Cohort Title</label>
              <Input
                placeholder="e.g. Senior EA Cohort 2026"
                value={cohortName}
                onChange={(e) => setCohortName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium">Description</label>
              <Textarea
                placeholder="Program details..."
                value={cohortDesc}
                onChange={(e) => setCohortDesc(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddCohortOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createCohortMutation.mutate()}
              disabled={!cohortOrgId || !cohortName}
            >
              Create Cohort
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Enroll Dialog */}
      <Dialog open={isBulkEnrollOpen} onOpenChange={setIsBulkEnrollOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Bulk Student Onboarding & Enrollment</DialogTitle>
            <DialogDescription>
              Enroll multiple corporate students at once into a target course.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-medium">Select Course</label>
              <Select value={bulkCourseId} onValueChange={setBulkCourseId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select target course..." />
                </SelectTrigger>
                <SelectContent>
                  {(Array.isArray(courses) ? courses : courses.items).map(
                    (c: { id: string; title: string }) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium">Associate Organization (Optional)</label>
              <Select value={bulkOrgId} onValueChange={setBulkOrgId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="None (Individual)" />
                </SelectTrigger>
                <SelectContent>
                  {orgs.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium">
                Student Email Addresses (One per line or comma-separated)
              </label>
              <Textarea
                rows={6}
                placeholder="grace.wanjiru@example.com&#10;peter.otieno@example.com"
                value={bulkEmailsText}
                onChange={(e) => setBulkEmailsText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsBulkEnrollOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => bulkEnrollMutation.mutate()}
              disabled={!bulkCourseId || !bulkEmailsText.trim()}
            >
              Process Bulk Enrollment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
