import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Award, Download } from "lucide-react";

import { Panel, Pill } from "@/components/ds";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, LoadingBlock, formatDate } from "@/components/layout/States";
import { Button } from "@/components/ui/button";
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
          icon={<Award className="size-6" />}
          action={
            <Button asChild>
              <Link to="/my-courses">Continue learning</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((c) => (
            <Panel key={c.id} className="p-5">
              <div className="flex items-center justify-between">
                <Award className="size-5 text-brand-600" />
                <Pill variant={c.status === "issued" ? "success" : "danger"}>{c.status}</Pill>
              </div>
              <h2 className="mt-4 font-display text-lg font-semibold leading-snug text-ink-1">
                {c.courseTitle}
              </h2>
              <p className="mt-2 font-mono text-sm text-ink-3">{c.certificateCode}</p>
              <p className="mt-1 text-sm text-ink-3">Issued {formatDate(c.issuedAt)}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <Link to="/certificate/$code" params={{ code: c.certificateCode }}>
                    <Download className="size-4" /> Download PDF
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to="/verify">Verify publicly</Link>
                </Button>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </AppShell>
  );
}
