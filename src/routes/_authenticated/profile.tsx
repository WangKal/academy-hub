import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Camera, Mail, Shield, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Avatar } from "@/components/ds";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingBlock } from "@/components/layout/States";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import * as api from "@/services/api";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — EA Academy" },
      { name: "description", content: "View and update your EA Academy account profile." },
      { property: "og:title", content: "My Profile — EA Academy" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, refresh } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setFullName(user.fullName);
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await api.updateUser(user.id, { fullName });
      await refresh();
      toast.success("Profile updated.");
    } catch (e) {
      toast.error(api.errorMessage(e, "Could not update profile."));
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <LoadingBlock rows={3} />;

  return (
    <AppShell title="My Profile" description="Manage your account details">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Avatar card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <Avatar name={user.fullName} size="lg" />
                <button
                  aria-label="Change avatar"
                  className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-110"
                >
                  <Camera className="size-3.5" />
                </button>
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-ink-1">{user.fullName}</h2>
                <div className="mt-1 flex items-center gap-2">
                  <Mail className="size-3.5 text-ink-4" />
                  <span className="font-mono text-sm text-ink-3">{user.email}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Shield className="size-3.5 text-ink-4" />
                  <Badge variant="secondary" className="capitalize text-xs">{user.role}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit form */}
        <Card>
          <CardContent className="space-y-5 p-6">
            <h3 className="font-display text-base font-semibold text-ink-1 flex items-center gap-2">
              <User className="size-4" /> Personal details
            </h3>
            <div className="space-y-2">
              <Label htmlFor="profile-name">Full name</Label>
              <Input
                id="profile-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Email address</Label>
              <Input value={user.email} disabled className="cursor-not-allowed opacity-60" />
              <p className="text-xs text-ink-4">
                Email cannot be changed here. Contact an administrator.
              </p>
            </div>
            <Button onClick={handleSave} disabled={saving || !fullName.trim()}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
