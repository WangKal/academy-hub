import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { LoadingBlock } from "@/components/layout/States";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import * as api from "@/services/api";
import type { AcademySettings } from "@/types";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  beforeLoad: ({ context }) => {
    const user = (context as any).user;
    if (!user || user.role !== "admin") {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({
    meta: [
      { title: "Settings — EA Academy admin" },
      { name: "description", content: "Academy name, support contact and certificate settings." },
      { property: "og:title", content: "Settings — EA Academy admin" },
      { property: "og:description", content: "Configure academy-wide settings." },
    ],
  }),
  component: AdminSettings,
});

function AdminSettings() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["academy-settings"],
    queryFn: () => api.getAcademySettings(),
  });
  const [form, setForm] = useState<AcademySettings | null>(null);

  useEffect(() => {
    if (data && !form) setForm(data);
  }, [data, form]);

  const save = useMutation({
    mutationFn: () => api.updateAcademySettings(form ?? {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["academy-settings"] });
      toast.success("Settings saved.");
    },
    onError: (e) => toast.error(api.errorMessage(e)),
  });

  return (
    <AppShell title="Settings" description="Academy configuration">
      {isLoading || !form ? (
        <LoadingBlock rows={2} />
      ) : (
        <Card className="max-w-2xl">
          <CardContent className="space-y-5 p-6">
            <div className="space-y-2">
              <Label>Academy name</Label>
              <Input
                value={form.academyName}
                onChange={(e) => setForm({ ...form, academyName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Support email</Label>
              <Input
                value={form.supportEmail}
                onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Default currency</Label>
                <Input
                  value={form.defaultCurrency}
                  onChange={(e) => setForm({ ...form, defaultCurrency: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Certificate prefix</Label>
                <Input
                  value={form.certificatePrefix}
                  onChange={(e) => setForm({ ...form, certificatePrefix: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-sm border border-edge px-4 py-3">
              <div>
                <p className="text-sm font-medium">Allow self-enrolment</p>
                <p className="text-xs text-ink-3">Learners can enrol without admin approval.</p>
              </div>
              <Switch
                checked={form.allowSelfEnrollment}
                onCheckedChange={(v) => setForm({ ...form, allowSelfEnrollment: v })}
              />
            </div>
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              Save settings
            </Button>
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
}
