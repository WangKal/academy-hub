import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@/lib/router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as api from "@/services/api";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — EA Academy" },
      { name: "description", content: "Choose a new password for your EA Academy account." },
      { property: "og:title", content: "Set a new password — EA Academy" },
      { property: "og:description", content: "Choose a new password for your EA Academy account." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const update = useMutation({
    mutationFn: () => api.updatePassword(password),
    onSuccess: () => {
      toast.success("Password updated.");
      navigate({ to: "/dashboard", replace: true });
    },
    onError: (e) => toast.error(api.errorMessage(e, "Could not update password.")),
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-5">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-4 p-6">
          <h1 className="text-2xl">Set a new password</h1>
          <div className="space-y-2">
            <Label htmlFor="np">New password</Label>
            <Input
              id="np"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <Button
            className="w-full"
            disabled={update.isPending || password.length < 6}
            onClick={() => update.mutate()}
          >
            Update password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
