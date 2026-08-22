import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@/lib/router";
import { Award, Download, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Pill } from "@/components/ds";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, LoadingBlock, formatDate } from "@/components/layout/States";
import { Button } from "@/components/ui/button";
import * as api from "@/services/api";

export const Route = createFileRoute("/_authenticated/my-certificates")({
  head: () => ({
    meta: [
      { title: "My certificates — Academy Hub" },
      { name: "description", content: "Certificates you have earned at Academy Hub." },
      { property: "og:title", content: "My certificates — Academy Hub" },
      { property: "og:description", content: "Certificates you have earned at Academy Hub." },
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
    <AppShell
      title="My Certificates"
      description="Certificates earned by completing courses on Academy Hub."
    >
      {isLoading ? (
        <LoadingBlock />
      ) : error ? (
        <EmptyState title="Could not load certificates" description={api.errorMessage(error)} />
      ) : !data?.length ? (
        <EmptyState
          title="No certificates yet"
          description="Complete 100% of a course to earn your first verifiable certificate."
          icon={<Award className="size-6 text-indigo-600" />}
          action={
            <Button asChild size="sm" className="rounded-xl">
              <Link to="/courses">Browse courses</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {data.map((cert) => (
            <div
              key={cert.id}
              className="bg-surface border border-edge rounded-2xl overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Certificate visual Header */}
              <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-6 relative overflow-hidden text-white">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
                <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-6 -translate-x-6" />
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                    <span className="text-white text-xl">🎓</span>
                  </div>
                  <div className="text-white/60 text-xs font-mono uppercase tracking-widest mb-1">
                    Certificate of Completion
                  </div>
                  <h3 className="text-white font-display text-lg font-semibold leading-snug">
                    {cert.courseTitle}
                  </h3>
                </div>
              </div>

              {/* Certificate content details */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-xs text-ink-4">Certificate ID</div>
                      <div className="text-xs font-mono font-semibold text-ink-1 mt-0.5">
                        {cert.certificateCode}
                      </div>
                    </div>
                    <Pill variant={cert.status === "issued" ? "success" : "danger"}>
                      {cert.status === "issued" ? "✓ Active" : cert.status}
                    </Pill>
                  </div>
                  <div className="text-xs text-ink-3 mb-4">
                    Issued on{" "}
                    <span className="font-medium text-ink-1">{formatDate(cert.issuedAt)}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-edge">
                  <Button variant="outline" size="sm" className="flex-1 rounded-xl text-xs" asChild>
                    <Link to="/certificate/$code" params={{ code: cert.certificateCode }}>
                      <Download className="w-3.5 h-3.5 mr-1.5" /> Download PDF
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl text-xs"
                    onClick={() => {
                      navigator.clipboard?.writeText?.(
                        `${window.location.origin}/verify/${cert.certificateCode}`,
                      );
                      toast.success("Verification link copied to clipboard");
                    }}
                  >
                    <Share2 className="w-3.5 h-3.5 mr-1.5" /> Share
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
