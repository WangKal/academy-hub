import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Award } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, LoadingBlock, formatDate } from "@/components/layout/States";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import * as api from "@/services/api";

export const Route = createFileRoute("/_authenticated/my-certificates")({
  head: () => ({
    meta: [
      { title: "My certificates — EA Academy" },
      { name: "description", content: "Certificates you have earned at EA Academy." },
      { property: "og:title", content: "My certificates — EA Academy" },
      { property: "og:description", content: "Certificates you have earned at EA Academy." },
    ],
  }),
  component: MyCertificates,
});

function MyCertificates() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["my-certificates"],
    queryFn: () => api.getMyCertificates(),
  });

  return (
    <AppShell title="Certificates" description="Your verifiable credentials">
      {isLoading ? (
        <LoadingBlock />
      ) : error ? (
        <EmptyState title="Could not load certificates" description={api.errorMessage(error)} />
      ) : !data?.length ? (
        <EmptyState
          title="No certificates yet"
          description="Complete every lesson in a course and your certificate is issued automatically."
          action={
            <Button asChild>
              <Link to="/my-courses">Continue learning</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((c) => (
            <Card key={c.id} className="border-accent/40">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <Award className="size-5 text-accent" />
                  <Badge variant={c.status === "issued" ? "secondary" : "destructive"}>
                    {c.status}
                  </Badge>
                </div>
                <h2 className="mt-4 text-xl leading-snug">{c.courseTitle}</h2>
                <p className="mt-2 font-mono text-sm text-muted-foreground">{c.certificateCode}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Issued {formatDate(c.issuedAt)}
                </p>
                <Button asChild size="sm" variant="outline" className="mt-4">
                  <Link to="/verify">Verify publicly</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
