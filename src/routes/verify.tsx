import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@/lib/router";
import { Award, Search } from "lucide-react";
import { useState } from "react";

import { PublicFooter, PublicHeader } from "@/components/layout/PublicHeader";
import { formatDate } from "@/components/layout/States";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import * as api from "@/services/api";
import type { Certificate } from "@/types";

export const Route = createFileRoute("/verify")({
  head: () => ({
    meta: [
      { title: "Verify a certificate — EA Academy" },
      {
        name: "description",
        content:
          "Check the authenticity of an Executive & Personal Assistant Academy certificate using its unique code.",
      },
      { property: "og:title", content: "Verify a certificate — EA Academy" },
      {
        property: "og:description",
        content: "Confirm an EA Academy credential in seconds with its certificate code.",
      },
    ],
  }),
  component: Verify,
});

function Verify() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<Certificate | null | undefined>(undefined);

  const verify = useMutation({
    mutationFn: () => api.verifyCertificate(code),
    onSuccess: (cert) => setResult(cert),
  });

  return (
    <div className="min-h-screen">
      <PublicHeader />
      <div className="mx-auto max-w-2xl px-5 py-20">
        <Award className="size-6 text-accent" />
        <h1 className="mt-4 text-4xl">Verify a certificate</h1>
        <p className="mt-3 text-ink-3">Enter the certificate code printed on the credential.</p>

        <form
          className="mt-8 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (code.trim()) verify.mutate();
          }}
        >
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="EAPA-2026-XXXXXX"
            className="font-mono uppercase"
          />
          <Button type="submit" disabled={verify.isPending || !code.trim()}>
            <Search className="mr-1.5 size-4" /> Verify
          </Button>
        </form>

        {verify.isError && (
          <p className="mt-4 text-sm text-destructive">
            {api.errorMessage(verify.error, "Could not verify that code.")}
          </p>
        )}

        {result === null && (
          <Card className="mt-6 border-destructive/40">
            <CardContent className="p-6 text-sm">
              No certificate matches that code. Check for typos and try again.
            </CardContent>
          </Card>
        )}

        {result && (
          <Card className="mt-6">
            <CardContent className="space-y-3 p-6">
              <div className="flex items-center justify-between">
                <p className="font-mono text-sm">{result.certificateCode}</p>
                <Badge variant={result.status === "issued" ? "default" : "destructive"}>
                  {result.status}
                </Badge>
              </div>
              <h2 className="text-2xl">{result.courseTitle ?? "Course"}</h2>
              <p className="text-sm text-ink-3">
                Awarded to <span className="text-foreground">{result.userName ?? "—"}</span> on{" "}
                {formatDate(result.issuedAt)}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      <PublicFooter />
    </div>
  );
}
