import { useMutation } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@/lib/router";
import { GraduationCap } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import * as api from "@/services/api";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in or enrol — EA Academy" },
      {
        name: "description",
        content: "Access your Executive & Personal Assistant Academy learning account.",
      },
      { property: "og:title", content: "Sign in or enrol — EA Academy" },
      { property: "og:description", content: "Access your EA Academy learning account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, refresh } = useAuth();

  useEffect(() => {
    if (user) navigate({ to: "/dashboard", replace: true });
  }, [user, navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"student" | "instructor">("student");

  const signIn = useMutation({
    mutationFn: () => api.login({ email, password }),
    onSuccess: async () => {
      await refresh();
      toast.success("Welcome back");
      navigate({ to: "/dashboard", replace: true });
    },
    onError: (e) => toast.error(api.errorMessage(e, "Could not sign in.")),
  });

  const signUp = useMutation({
    mutationFn: () => api.register({ email, password, fullName, role }),
    onSuccess: async (res) => {
      if (res.requiresEmailConfirmation) {
        toast.success("Check your inbox to confirm your email address.");
      } else {
        await refresh();
        navigate({ to: "/dashboard", replace: true });
      }
    },
    onError: (e) => toast.error(api.errorMessage(e, "Could not create your account.")),
  });

  const forgot = useMutation({
    mutationFn: () => api.resetPassword(email),
    onSuccess: () => toast.success("Password reset link sent."),
    onError: (e) => toast.error(api.errorMessage(e, "Could not send reset link.")),
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-5 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-sm bg-primary text-primary-foreground">
            <GraduationCap className="size-4" />
          </span>
          <span className="font-display text-xl">EA Academy</span>
        </Link>

        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="register">Create account</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
                <Button
                  className="w-full"
                  disabled={signIn.isPending}
                  onClick={() => signIn.mutate()}
                >
                  {signIn.isPending ? "Signing in…" : "Sign in"}
                </Button>
                <button
                  type="button"
                  className="w-full text-center text-xs text-ink-3 hover:text-foreground"
                  onClick={() => (email ? forgot.mutate() : toast.error("Enter your email first."))}
                >
                  Forgot your password?
                </button>
              </TabsContent>

              <TabsContent value="register" className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="remail">Email</Label>
                  <Input
                    id="remail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rpassword">Password</Label>
                  <Input
                    id="rpassword"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label>I am joining as</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">A learner</SelectItem>
                      <SelectItem value="instructor">An instructor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full"
                  disabled={signUp.isPending}
                  onClick={() => signUp.mutate()}
                >
                  {signUp.isPending ? "Creating account…" : "Create account"}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
