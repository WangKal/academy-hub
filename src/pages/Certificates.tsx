import { certificates } from '@/lib/data'
import { PageHeader, Badge, Btn, EmptyState } from '@/components/ui'

interface Props {
  onNavigate: (page: string) => void
}

export default function Certificates({ onNavigate }: Props) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <PageHeader
        title="My Certificates"
        description="Certificates earned by completing courses on Academy Hub."
        actions={<Badge variant="neutral">{certificates.length} earned</Badge>}
      />

      {certificates.length === 0 ? (
        <EmptyState
          icon={<AwardIcon />}
          title="No certificates yet"
          body="Complete a course to earn your first certificate."
          action={<Btn onClick={() => onNavigate('catalogue')}>Browse courses</Btn>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {certificates.map((cert) => (
            <div key={cert.id} className="bg-white border border-stone-200 rounded-2xl overflow-hidden hover:shadow-md transition-all">
              {/* Certificate visual */}
              <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 px-6 py-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
                <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-6 -translate-x-6" />
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                    <span className="text-white text-xl">🎓</span>
                  </div>
                  <div className="text-white/60 text-xs font-mono uppercase tracking-widest mb-1">Certificate of Completion</div>
                  <h3 className="text-white font-display text-lg font-semibold leading-snug">{cert.courseTitle}</h3>
                  <div className="text-white/60 text-xs mt-1">Instructor: {cert.instructorName}</div>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-xs text-stone-500">Certificate ID</div>
                    <div className="text-xs font-mono text-stone-700 mt-0.5">{cert.code}</div>
                  </div>
                  <Badge variant={cert.status === 'active' ? 'success' : 'danger'}>
                    {cert.status === 'active' ? '✓ Active' : 'Revoked'}
                  </Badge>
                </div>
                <div className="text-xs text-stone-500 mb-4">
                  Issued{' '}
                  <span className="text-stone-700">
                    {new Date(cert.issuedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Btn variant="secondary" size="sm" className="flex-1">⬇ Download PDF</Btn>
                  <Btn variant="ghost" size="sm">Share</Btn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AwardIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="9" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M8 15 6 21l6-3 6 3-2-6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
}
