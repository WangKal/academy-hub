import { useState } from 'react'

interface Props {
  onNavigate: (page: string) => void
  onSignIn: (role?: 'student' | 'instructor' | 'admin') => void
  redirectPage?: string
}

export default function LoginPage({ onNavigate, onSignIn, redirectPage }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Demo: pick role based on email
  function detectRole(e: string): 'student' | 'instructor' | 'admin' {
    if (e.includes('instructor') || e.includes('rodriguez')) return 'instructor'
    if (e.includes('admin') || e.includes('okonkwo')) return 'admin'
    return 'student'
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email) { setError('Please enter your email address.'); return }
    if (!password) { setError('Please enter your password.'); return }
    if (!email.includes('@')) { setError('Please enter a valid email address.'); return }

    setLoading(true)
    // Simulate auth
    await new Promise((r) => setTimeout(r, 900))
    setLoading(false)
    onSignIn(detectRole(email))
  }

  const demoAccounts = [
    { label: 'Student', email: 'sarah.chen@meridiantech.com', role: 'student' as const },
    { label: 'Instructor', email: 'm.rodriguez@academyhub.io', role: 'instructor' as const },
    { label: 'Admin', email: 'a.okonkwo@academyhub.io', role: 'admin' as const },
  ]

  return (
    <div className="min-h-screen flex transition-theme" style={{ background: 'var(--bg)' }}>
      {/* Left: branding panel (desktop only) */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-gray-900 p-10">
        <div>
          <div className="flex items-center gap-2.5 mb-12">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-display font-semibold text-white text-base">Academy Hub</span>
          </div>
          <blockquote className="text-gray-300 font-display text-xl font-medium leading-relaxed italic">
            "The Advanced React course completely changed how I think about component architecture. Worth every minute."
          </blockquote>
          <div className="mt-4 text-sm text-gray-500">— Yuki Tanaka, Senior Engineer at Stratos Tech</div>
        </div>

        <div className="space-y-3 text-sm text-gray-500">
          <div className="flex items-center gap-2"><span className="text-emerald-400">✓</span> 94 expert-led courses</div>
          <div className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Verified certificates</div>
          <div className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Progress tracking & assessments</div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">A</span>
            </div>
            <span className="font-display font-semibold text-ink-1 text-sm">Academy Hub</span>
          </div>

          <h1 className="font-display text-2xl font-semibold text-ink-1 mb-1">Welcome back</h1>
          <p className="text-sm text-ink-3 mb-6">
            Sign in to continue learning.{' '}
            {redirectPage && <span className="text-indigo-600">You'll be returned to your course.</span>}
          </p>

          {/* Demo shortcuts */}
          <div className="rounded-xl border p-3 mb-5" style={{ background: 'var(--surface-2)', borderColor: 'var(--edge)' }}>
            <div className="text-xs font-semibold text-ink-4 uppercase tracking-wider mb-2">Demo accounts</div>
            <div className="flex gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.role}
                  onClick={() => onSignIn(acc.role)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all"
                  style={{ background: 'var(--surface)', borderColor: 'var(--edge)', color: 'var(--ink-2)' }}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: 'var(--edge)' }} />
            <span className="text-xs text-ink-4">or sign in with email</span>
            <div className="flex-1 h-px" style={{ background: 'var(--edge)' }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && (
              <div className="bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-900 rounded-lg px-4 py-3 text-sm text-rose-700 dark:text-rose-400">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-ink-2 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                className="w-full px-3.5 py-2.5 rounded-lg border text-sm text-ink-1 placeholder-ink-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                style={{ background: 'var(--surface)', borderColor: 'var(--edge)' }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-ink-2">Password</label>
                <button
                  type="button"
                  onClick={() => onNavigate('forgot-password')}
                  className="text-xs text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border text-sm text-ink-1 placeholder-ink-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                  style={{ background: 'var(--surface)', borderColor: 'var(--edge)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4 hover:text-ink-2 transition-colors text-xs"
                  tabIndex={-1}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
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
                  Signing in…
                </>
              ) : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-xs text-ink-3 mt-5">
            No account?{' '}
            <button onClick={() => onNavigate('register')} className="text-indigo-600 font-semibold hover:text-indigo-700">
              Create one free
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
