import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useParams } from "@/lib/router";
import { Award, Printer } from "lucide-react";

import { EmptyState, LoadingBlock, formatDate } from "@/components/layout/States";
import { Button } from "@/components/ui/button";
import * as api from "@/services/api";

export const Route = createFileRoute("/certificate/$code")({
  head: () => ({
    meta: [
      { title: "Certificate of completion — EA Academy" },
      {
        name: "description",
        content:
          "A printable, verifiable Executive & Personal Assistant Academy certificate of completion.",
      },
      { property: "og:title", content: "Certificate of completion — EA Academy" },
      {
        property: "og:description",
        content: "Printable EA Academy certificate with a verifiable credential code.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CertificatePage,
});

function CertificatePage() {
  const { code } = useParams({ from: "/certificate/$code" });
  const { data, isLoading, error } = useQuery({
    queryKey: ["certificate-print", code],
    queryFn: () => api.verifyCertificate(code),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20">
        <LoadingBlock rows={3} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20">
        <EmptyState
          title="Certificate not found"
          description={
            error ? api.errorMessage(error) : "No credential matches this certificate code."
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-2 px-5 py-10 print:bg-white print:p-0">
      <div className="mx-auto flex max-w-4xl justify-end print:hidden">
        <Button size="sm" onClick={() => window.print()}>
          <Printer className="size-4" /> Download / print PDF
        </Button>
      </div>

      <article className="mx-auto mt-5 max-w-4xl rounded-2xl border-4 border-brand-600/25 bg-card p-10 text-center shadow-sm print:mt-0 print:rounded-none print:border-2 print:shadow-none">
        <div className="flex justify-center">
          <Award className="size-10 text-brand-600" />
        </div>
        <p className="mt-6 font-mono text-xs uppercase tracking-[0.4em] text-ink-4">
          Executive &amp; Personal Assistant Academy
        </p>
        <h1 className="mt-6 font-display text-4xl font-semibold text-ink-1">
          Certificate of Completion
        </h1>
        <p className="mt-8 text-sm uppercase tracking-widest text-ink-4">Awarded to</p>
        <p className="mt-2 font-display text-3xl font-semibold text-ink-1">
          {data.userName ?? "Academy learner"}
        </p>
        <p className="mt-8 text-sm uppercase tracking-widest text-ink-4">
          For successful completion of
        </p>
        <p className="mt-2 font-display text-2xl text-ink-1">{data.courseTitle}</p>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-edge pt-6 text-sm text-ink-3 sm:flex-row">
          <span>Issued {formatDate(data.issuedAt)}</span>
          <span className="font-mono text-xs">{data.certificateCode}</span>
          <span className="capitalize">{data.status}</span>
        </div>
        <p className="mt-4 text-xs text-ink-4">
          Verify this credential at /verify using the certificate code above.
        </p>
      </article>
    </div>
  );
}
