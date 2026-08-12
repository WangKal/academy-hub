import { useState } from 'react'

interface Props {
  onNavigate: (page: string) => void
  onSignIn: (role?: 'student' | 'instructor' | 'admin') => void
}

export default function RegisterPage({ onNavigate, onSignIn }: Props) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' as 'student' | 'instructor' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'form' | 'verify'>('form')

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) { setError('Please enter your full name.'); return }
    if (!form.email.includes('@')) { setError('Please enter a valid email address.'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }

    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    setStep('verify')
  }

  if (step === 'verify') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 transition-theme" style={{ background: 'var(--bg)' }}>
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-2xl mx-auto mb-5">
            📧
          </div>
          <h2 className="font-display text-xl font-semibold text-ink-1 mb-2">Verify your email</h2>
          <p className="text-sm text-ink-3 mb-6">
            We sent a verification link to <strong className="text-ink-1">{form.email}</strong>. Check your inbox and click the link to activate your account.
          </p>
          <button
            onClick={() => onSignIn(form.role)}
            className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-lg text-sm hover:bg-indigo-700 transition-all mb-3"
          >
            Continue to Academy Hub →
          </button>
          <button
            onClick={() => setStep('form')}
            className="text-xs text-ink-3 hover:text-ink-1 transition-colors"
          >
            ← Back to registration
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex transition-theme" style={{ background: 'var(--bg)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-gray-900 p-10">
        <div>
          <div className="flex items-center gap-2.5 mb-12">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-display font-semibold text-white text-base">Academy Hub</span>
          </div>
          <h2 className="font-display text-2xl font-semibold text-white mb-4 leading-snug">
            Join 8,400+ professionals advancing their skills.
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Create your account and get instant access to expert-led courses across engineering, data science, design, and more.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { number: '94', label: 'Courses' },
            { number: '4.7★', label: 'Avg rating' },
            { number: '31K+', label: 'Enrollments' },
            { number: '100%', label: 'Certificate issued' },
          ].map((s) => (
            <div key={s.label} className="bg-gray-800 rounded-xl p-3 text-center">
              <div className="font-display text-lg font-semibold text-white">{s.number}</div>
              <div className="text-xs text-gray-500 font-mono">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">A</span>
            </div>
            <span className="font-display font-semibold text-ink-1 text-sm">Academy Hub</span>
          </div>

          <h1 className="font-display text-2xl font-semibold text-ink-1 mb-1">Create your account</h1>
          <p className="text-sm text-ink-3 mb-6">Free to join. Start learning immediately.</p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && (
              <div className="bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-900 rounded-lg px-4 py-3 text-sm text-rose-700 dark:text-rose-400">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-ink-2 mb-1.5">Full name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Sarah Chen"
                autoComplete="name"
                className="w-full px-3.5 py-2.5 rounded-lg border text-sm text-ink-1 placeholder-ink-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                style={{ background: 'var(--surface)', borderColor: 'var(--edge)' }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-2 mb-1.5">Work email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                className="w-full px-3.5 py-2.5 rounded-lg border text-sm text-ink-1 placeholder-ink-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                style={{ background: 'var(--surface)', borderColor: 'var(--edge)' }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-2 mb-1.5">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                className="w-full px-3.5 py-2.5 rounded-lg border text-sm text-ink-1 placeholder-ink-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                style={{ background: 'var(--surface)', borderColor: 'var(--edge)' }}
              />
              {form.password && (
                <div className="flex gap-1 mt-1.5">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-1 rounded-full transition-all ${
                        form.password.length > i * 3
                          ? form.password.length >= 12 ? 'bg-emerald-500' : form.password.length >= 8 ? 'bg-amber-500' : 'bg-rose-400'
                          : 'bg-surface-3'
                      }`}
                      style={form.password.length <= i * 3 ? { background: 'var(--surface-3)' } : {}}
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-2 mb-1.5">I want to</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'student', label: 'Learn', icon: '📚', desc: 'Access courses' },
                  { value: 'instructor', label: 'Teach', icon: '🎓', desc: 'Create courses' },
                ].map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => update('role', r.value)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      form.role === r.value
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
                        : 'hover:border-stone-300 dark:hover:border-stone-600'
                    }`}
                    style={form.role !== r.value ? { borderColor: 'var(--edge)', background: 'var(--surface)' } : {}}
                  >
                    <div className="text-base mb-0.5">{r.icon}</div>
                    <div className={`text-xs font-semibold ${form.role === r.value ? 'text-indigo-700 dark:text-indigo-300' : 'text-ink-1'}`}>{r.label}</div>
                    <div className="text-[10px] text-ink-4">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-lg text-sm hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </>
              ) : 'Create account'}
            </button>

            <p className="text-center text-[10px] text-ink-4 leading-relaxed">
              By creating an account you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>

          <p className="text-center text-xs text-ink-3 mt-5">
            Already have an account?{' '}
            <button onClick={() => onNavigate('login')} className="text-indigo-600 font-semibold hover:text-indigo-700">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
