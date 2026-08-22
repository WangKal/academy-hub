import { createFileRoute } from "@/lib/router";
import { Bell, Camera, Mail, Shield, User } from "lucide-react";
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
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [email, setEmail] = useState(user?.email ?? "");
  const [savingEmail, setSavingEmail] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [preferences, setPreferences] = useState<api.NotificationPreferences | null>(null);
  const [savingPreferences, setSavingPreferences] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName); setEmail(user.email);
      void api.getNotificationPreferences().then(setPreferences).catch(() => setPreferences(null));
    }
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

  const handlePasswordChange = async () => {
    if (newPassword.length < 8) {
      toast.error("Use a password with at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("The passwords do not match.");
      return;
    }
    setChangingPassword(true);
    try {
      await api.updatePassword(newPassword);
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed successfully.");
    } catch (e) {
      toast.error(api.errorMessage(e, "Could not change password. Please sign in again if your session is old."));
    } finally {
      setChangingPassword(false);
    }
  };

  const handleAvatarChange = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Profile images must be 5 MB or smaller."); return; }
    setUploadingAvatar(true);
    try {
      await api.uploadProfileAvatar(file);
      await refresh();
      toast.success("Profile photo updated.");
    } catch (e) { toast.error(api.errorMessage(e, "Could not update profile photo.")); }
    finally { setUploadingAvatar(false); }
  };

  const handleEmailChange = async () => {
    if (!email.trim() || email.trim().toLowerCase() === user.email.toLowerCase()) return;
    setSavingEmail(true);
    try {
      await api.updateEmail(email);
      toast.success("Confirmation instructions have been sent to your new email address.");
    } catch (e) { toast.error(api.errorMessage(e, "Could not update email address.")); }
    finally { setSavingEmail(false); }
  };

  const updatePreference = async (key: keyof api.NotificationPreferences, value: boolean) => {
    setSavingPreferences(true);
    try { await api.updateNotificationPreferences({ [key]: value }); setPreferences((current) => current ? { ...current, [key]: value } : current); toast.success("Notification preference saved."); }
    catch (e) { toast.error(api.errorMessage(e, "Could not save notification preference.")); }
    finally { setSavingPreferences(false); }
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
                <Avatar name={user.fullName} src={user.avatarUrl} size="lg" />
                <label className="absolute -bottom-1 -right-1 flex size-7 cursor-pointer items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-110">
                  <Camera className="size-3.5" />
                  <input type="file" accept="image/*" className="hidden" disabled={uploadingAvatar} onChange={(e) => void handleAvatarChange(e.target.files?.[0])} />
                </label>
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-ink-1">{user.fullName}</h2>
                <div className="mt-1 flex items-center gap-2">
                  <Mail className="size-3.5 text-ink-4" />
                  <span className="font-mono text-sm text-ink-3">{user.email}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Shield className="size-3.5 text-ink-4" />
                  <Badge variant="secondary" className="capitalize text-xs">
                    {user.role}
                  </Badge>
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
              <Label htmlFor="profile-email">Email address</Label>
              <Input id="profile-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              <p className="text-xs text-ink-4">Changing email requires confirmation from the new address.</p>
              {email.trim().toLowerCase() !== user.email.toLowerCase() && (
                <Button variant="outline" size="sm" onClick={handleEmailChange} disabled={savingEmail}>
                  {savingEmail ? "Sending confirmation…" : "Change email"}
                </Button>
              )}
            </div>
            <Button onClick={handleSave} disabled={saving || !fullName.trim()}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-5 p-6">
            <h3 className="font-display text-base font-semibold flex items-center gap-2"><Bell className="size-4" /> Notifications & email</h3>
            <p className="text-sm text-ink-4">Choose which academy events may generate in-app notifications and queued email communications.</p>
            {!preferences ? <p className="text-xs text-ink-4">Notification preferences will become available when the communication schema is enabled.</p> : <div className="grid gap-3 sm:grid-cols-2">{([["emailEnabled", "Email communications"], ["inAppEnabled", "In-app notifications"], ["enrollmentEnabled", "Enrollments"], ["assignmentEnabled", "Assignments & grading"], ["certificateEnabled", "Certificates"], ["paymentEnabled", "Payments"], ["courseEnabled", "Course updates"]] as const).map(([key, label]) => <label key={key} className="flex items-center justify-between rounded-lg border border-edge p-3 text-sm"><span>{label}</span><input type="checkbox" checked={preferences[key]} disabled={savingPreferences} onChange={(e) => void updatePreference(key, e.target.checked)} /></label>)}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-5 p-6">
            <h3 className="font-display text-base font-semibold flex items-center gap-2"><Shield className="size-4" /> Security</h3>
            <p className="text-sm text-ink-4">Change your password. For sensitive sessions, the identity provider may require recent authentication.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="new-password">New password</Label><Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" /></div>
              <div className="space-y-2"><Label htmlFor="confirm-password">Confirm password</Label><Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" /></div>
            </div>
            <Button variant="outline" onClick={handlePasswordChange} disabled={changingPassword || !newPassword || !confirmPassword}>{changingPassword ? "Changing…" : "Change password"}</Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
