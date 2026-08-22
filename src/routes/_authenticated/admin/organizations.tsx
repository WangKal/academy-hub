import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@/lib/router";
import { can } from "@/services/permissions";
import { Building2, Plus, Upload, Users, HandCoins, Edit, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";
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
import type { Organization, OrganizationType } from "@/types";

export const Route = createFileRoute("/_authenticated/admin/organizations")({
  beforeLoad: ({ context }) => {
    const user = (context as any).user;
    if (!user || !can(user, "organizations", "view")) {
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
  const { user } = useAuth();
  const canManageOrganizations = !!user && can(user, "organizations", "manage");
  const canManageEnrollments = !!user && can(user, "enrollments", "manage");
  const canManageSponsorships = !!user && can(user, "sponsorships", "manage");
  const [isAddOrgOpen, setIsAddOrgOpen] = useState(false);
  const [isAddCohortOpen, setIsAddCohortOpen] = useState(false);
  const [isBulkEnrollOpen, setIsBulkEnrollOpen] = useState(false);
  const [memberOrgId, setMemberOrgId] = useState<string | null>(null);
  const [memberUserIds, setMemberUserIds] = useState<string[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState<string | null>(null);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [editOrgName, setEditOrgName] = useState("");
  const [editOrgEmail, setEditOrgEmail] = useState("");
  const [editOrgDomain, setEditOrgDomain] = useState("");
  const [editOrgSeats, setEditOrgSeats] = useState("");
  const [cohortMemberIds, setCohortMemberIds] = useState<string[]>([]);
  const [cohortCourseIds, setCohortCourseIds] = useState<string[]>([]);
  const [participantOrgId, setParticipantOrgId] = useState("");
  const [participantUserId, setParticipantUserId] = useState("");

  // Form states
  const [orgName, setOrgName] = useState("");
  const [orgCode, setOrgCode] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [orgDomain, setOrgDomain] = useState("");
  const [orgMaxSeats, setOrgMaxSeats] = useState("50");
  const [orgType, setOrgType] = useState<OrganizationType>("sponsor");

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
  const { data: studentUsers } = useQuery({
    queryKey: ["sponsorship-students"],
    queryFn: () => api.getUsers({ role: "student", pageSize: 500 }),
  });
  const { data: organizationUsers } = useQuery({
    queryKey: ["organization-users"],
    queryFn: () => api.getUsers({ pageSize: 500 }),
  });
  const { data: memberRows = [] } = useQuery({
    queryKey: ["organization-members", memberOrgId],
    queryFn: () => api.getOrganizationMembers(memberOrgId!),
    enabled: !!memberOrgId,
  });
  useEffect(() => {
    if (memberOrgId) setMemberUserIds(memberRows.map((m) => m.userId));
  }, [memberOrgId, memberRows]);
  const { data: selectedCohortMembers = [] } = useQuery({
    queryKey: ["cohort-members", selectedCohortId],
    queryFn: () => api.getCohortMembers(selectedCohortId!),
    enabled: !!selectedCohortId,
  });
  const { data: selectedCohortCourses = [] } = useQuery({
    queryKey: ["cohort-courses", selectedCohortId],
    queryFn: () => api.getCohortCourses(selectedCohortId!),
    enabled: !!selectedCohortId,
  });
  useEffect(() => {
    if (selectedCohortId) {
      setCohortMemberIds(selectedCohortMembers.map((u) => u.id));
      setCohortCourseIds(selectedCohortCourses.map((c) => c.id));
    }
  }, [selectedCohortId, selectedCohortMembers, selectedCohortCourses]);

  const saveCohortRelations = useMutation({
    mutationFn: async () => {
      await api.setCohortMembers(selectedCohortId!, cohortMemberIds);
      await api.setCohortCourses(selectedCohortId!, cohortCourseIds);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cohort-members", selectedCohortId] });
      qc.invalidateQueries({ queryKey: ["cohort-courses", selectedCohortId] });
      toast.success("Cohort membership and course allocation updated.");
      setSelectedCohortId(null);
    },
    onError: (e) => toast.error(api.errorMessage(e)),
  });
  const { data: participants = [], isLoading: isParticipantsLoading } = useQuery({
    queryKey: ["organization-participants"],
    queryFn: () => api.getOrganizationParticipants(),
  });

  const createOrgMutation = useMutation({
    mutationFn: () =>
      api.createOrganization({
        name: orgName,
        code: orgCode,
        contactEmail: orgEmail,
        domain: orgDomain,
        maxSeats: parseInt(orgMaxSeats, 10) || 50,
        type: orgType,
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

  const updateOrgMutation = useMutation({
    mutationFn: () => api.updateOrganization(editingOrg!.id, { name: editOrgName, contactEmail: editOrgEmail, domain: editOrgDomain, maxSeats: Number(editOrgSeats) || 1 }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["organizations"] }); setEditingOrg(null); toast.success("Organization updated."); },
    onError: (e) => toast.error(api.errorMessage(e)),
  });
  const deleteOrgMutation = useMutation({
    mutationFn: (id: string) => api.deleteOrganization(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["organizations"] }); toast.success("Organization deleted."); },
    onError: (e) => toast.error(api.errorMessage(e)),
  });

  const saveMembersMutation = useMutation({
    mutationFn: () => api.setOrganizationMembers(memberOrgId!, memberUserIds.map((userId) => ({ userId, orgRole: "member" }))),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organization-members", memberOrgId] });
      qc.invalidateQueries({ queryKey: ["organizations"] });
      toast.success("Organization membership updated.");
      setMemberOrgId(null);
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

  const addParticipantMutation = useMutation({
    mutationFn: () => api.createOrganizationParticipant({
      organizationId: participantOrgId,
      userId: participantUserId,
      relationship: "sponsored",
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organization-participants"] });
      toast.success("Student added as a sponsored participant.");
      setParticipantOrgId("");
      setParticipantUserId("");
    },
    onError: (e) => toast.error(api.errorMessage(e)),
  });

  const endParticipantMutation = useMutation({
    mutationFn: api.endOrganizationParticipant,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organization-participants"] });
      toast.success("Sponsorship ended.");
    },
    onError: (e) => toast.error(api.errorMessage(e)),
  });

  return (
    <AppShell
      title="B2B Organizations & Corporate Cohorts"
      description="Manage enterprise client accounts, multi-tenant cohorts, and bulk CSV enrollee onboarding"
      actions={
        <div className="flex gap-2">
          {canManageEnrollments && <Button variant="outline" size="sm" onClick={() => setIsBulkEnrollOpen(true)}>
            <Upload className="mr-1.5 size-4" /> Bulk Enroll Students
          </Button>}
          {canManageOrganizations && <Button size="sm" onClick={() => setIsAddOrgOpen(true)}>
            <Plus className="mr-1.5 size-4" /> Add Organization
          </Button>}
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
                    <TableHead>Created</TableHead><TableHead />
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
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="outline" disabled={!canManageOrganizations} onClick={() => { setEditingOrg(o); setEditOrgName(o.name); setEditOrgEmail(o.contactEmail); setEditOrgDomain(o.domain ?? ""); setEditOrgSeats(String(o.maxSeats)); }}>
                            <Edit className="mr-1 size-3.5" /> Edit
                          </Button>
                          <Button size="sm" variant="ghost" disabled={!canManageOrganizations || deleteOrgMutation.isPending} onClick={() => { if (window.confirm(`Delete ${o.name}? This may be blocked if related records exist.`)) deleteOrgMutation.mutate(o.id); }}>
                            <Trash2 className="size-3.5 text-rose-600" />
                          </Button>
                          <Button size="sm" variant="outline" disabled={!canManageOrganizations} onClick={() => setMemberOrgId(o.id)}>
                            <Users className="mr-1 size-3.5" /> Members
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Sponsored Participants Section */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <HandCoins className="size-5 text-primary" /> Sponsored Participants
            </h2>
            <div className="flex gap-2">
              <Select value={participantOrgId} onValueChange={setParticipantOrgId}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Organization" /></SelectTrigger>
                <SelectContent>{orgs.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={participantUserId} onValueChange={setParticipantUserId}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Student" /></SelectTrigger>
                <SelectContent>{(studentUsers?.items ?? []).map((u) => <SelectItem key={u.id} value={u.id}>{u.fullName}</SelectItem>)}</SelectContent>
              </Select>
              <Button size="sm" disabled={!canManageSponsorships || !participantOrgId || !participantUserId || addParticipantMutation.isPending} onClick={() => addParticipantMutation.mutate()}>
                <Plus className="size-4" /> Sponsor
              </Button>
            </div>
          </div>
          {isParticipantsLoading ? <LoadingBlock /> : !participants.length ? (
            <EmptyState title="No sponsored participants yet" description="Link a student to an organization when the organization is funding their training." />
          ) : (
            <div className="rounded-xl border border-edge bg-card">
              <Table><TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Organization</TableHead><TableHead>Relationship</TableHead><TableHead>Started</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>{participants.map((p) => (
                <TableRow key={p.id}>
                  <TableCell><p className="font-medium">{p.userName ?? "Unknown"}</p><p className="text-xs text-ink-3">{p.userEmail}</p></TableCell>
                  <TableCell>{orgs.find((o) => o.id === p.organizationId)?.name ?? p.organizationId}</TableCell>
                  <TableCell><Badge variant="secondary">{p.relationship}</Badge></TableCell>
                  <TableCell>{formatDate(p.startedAt)}</TableCell>
                  <TableCell>{!p.endedAt && <Button size="sm" variant="ghost" onClick={() => endParticipantMutation.mutate(p.id)}>End</Button>}</TableCell>
                </TableRow>
              ))}</TableBody></Table>
            </div>
          )}
        </div>

        {/* Cohorts Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="size-5 text-primary" /> Training Cohorts & Batches
            </h2>
            <Button variant="outline" size="sm" disabled={!canManageOrganizations} onClick={() => setIsAddCohortOpen(true)}>
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
                    <TableHead>Created Date</TableHead><TableHead />
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
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" disabled={!canManageOrganizations} onClick={() => setSelectedCohortId(c.id)}>Manage
                        </Button>
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
            <div>
              <label className="text-xs font-medium">Organization Type</label>
              <Select value={orgType} onValueChange={(v) => setOrgType(v as OrganizationType)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="administrative">Administrative unit</SelectItem>
                  <SelectItem value="sponsor">Sponsor</SelectItem>
                  <SelectItem value="hybrid">Administrative + sponsor</SelectItem>
                </SelectContent>
              </Select>
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

      {/* Edit Organization Dialog */}
      <Dialog open={!!editingOrg} onOpenChange={(open) => !open && setEditingOrg(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit organization</DialogTitle><DialogDescription>Update the organization profile and seat allocation.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <Input value={editOrgName} onChange={(e) => setEditOrgName(e.target.value)} placeholder="Organization name" />
            <Input value={editOrgEmail} onChange={(e) => setEditOrgEmail(e.target.value)} placeholder="Contact email" />
            <Input value={editOrgDomain} onChange={(e) => setEditOrgDomain(e.target.value)} placeholder="Domain" />
            <Input value={editOrgSeats} onChange={(e) => setEditOrgSeats(e.target.value)} inputMode="numeric" placeholder="Max seats" />
          </div>
          <DialogFooter><Button variant="ghost" onClick={() => setEditingOrg(null)}>Cancel</Button><Button disabled={!editOrgName || !editOrgEmail || updateOrgMutation.isPending} onClick={() => updateOrgMutation.mutate()}>{updateOrgMutation.isPending ? "Saving…" : "Save organization"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Organization Members Dialog */}
      <Dialog open={!!memberOrgId} onOpenChange={(open) => !open && setMemberOrgId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Organization members</DialogTitle>
            <DialogDescription>Assign users to this organization. Membership is separate from sponsorship/participant relationships.</DialogDescription>
          </DialogHeader>
          <div className="max-h-80 space-y-2 overflow-y-auto rounded border border-edge p-2">
            {(organizationUsers?.items ?? []).map((u) => (
              <label key={u.id} className="flex items-center gap-2 rounded p-2 text-sm hover:bg-surface-2">
                <input type="checkbox" checked={memberUserIds.includes(u.id)} onChange={() => setMemberUserIds((prev) => prev.includes(u.id) ? prev.filter((id) => id !== u.id) : [...prev, u.id])} />
                <span><span className="block font-medium">{u.fullName}</span><span className="text-xs text-ink-4">{u.email}</span></span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setMemberOrgId(null)}>Cancel</Button>
            <Button disabled={saveMembersMutation.isPending} onClick={() => saveMembersMutation.mutate()}>{saveMembersMutation.isPending ? "Saving…" : "Save members"}</Button>
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

      {/* Cohort Relationships Dialog */}
      <Dialog open={!!selectedCohortId} onOpenChange={(open) => !open && setSelectedCohortId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage cohort delivery</DialogTitle>
            <DialogDescription>Assign learners and courses to this cohort. These are independent M:N relationships.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-medium">Learners</p>
              <div className="max-h-72 space-y-1 overflow-y-auto rounded border border-edge p-2">
                {(organizationUsers?.items ?? []).filter((u) => u.role === "student").map((u) => <label key={u.id} className="flex items-center gap-2 rounded p-2 text-xs hover:bg-surface-2">
                  <input type="checkbox" checked={cohortMemberIds.includes(u.id)} onChange={() => setCohortMemberIds((prev) => prev.includes(u.id) ? prev.filter((id) => id !== u.id) : [...prev, u.id])} />
                  <span>{u.fullName}<span className="ml-1 text-ink-4">{u.email}</span></span>
                </label>)}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Courses</p>
              <div className="max-h-72 space-y-1 overflow-y-auto rounded border border-edge p-2">
                {(courses.items ?? []).map((c) => <label key={c.id} className="flex items-center gap-2 rounded p-2 text-xs hover:bg-surface-2">
                  <input type="checkbox" checked={cohortCourseIds.includes(c.id)} onChange={() => setCohortCourseIds((prev) => prev.includes(c.id) ? prev.filter((id) => id !== c.id) : [...prev, c.id])} />
                  <span>{c.title}</span>
                </label>)}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSelectedCohortId(null)}>Cancel</Button>
            <Button disabled={saveCohortRelations.isPending} onClick={() => saveCohortRelations.mutate()}>{saveCohortRelations.isPending ? "Saving…" : "Save cohort"}</Button>
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
