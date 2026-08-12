import { useState } from 'react'

interface Props {
  onNavigate: (page: string) => void
  onSignIn: () => void
  status?: 'pending' | 'success' | 'expired' | 'invalid'
}

export default function VerificationPage({ onNavigate, onSignIn, status = 'pending' }: Props) {
  const [currentStatus, setCurrentStatus] = useState(status)

  return (
    <div className="min-h-screen flex items-center justify-center p-6 transition-theme" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm text-center">
        {/* Brand */}
        <button onClick={() => onNavigate('home')} className="flex items-center gap-2 mb-10 mx-auto w-fit">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-xs">A</span>
          </div>
          <span className="font-display font-semibold text-ink-1 text-sm">Academy Hub</span>
        </button>

        {currentStatus === 'pending' && <PendingState onResend={() => setCurrentStatus('success')} />}
        {currentStatus === 'success' && <SuccessState onSignIn={onSignIn} />}
        {currentStatus === 'expired' && <ExpiredState onResend={() => setCurrentStatus('pending')} onNavigate={onNavigate} />}
        {currentStatus === 'invalid' && <InvalidState onNavigate={onNavigate} />}

        {/* Demo: switch states */}
        <div className="mt-10 pt-6 border-t" style={{ borderColor: 'var(--edge)' }}>
          <div className="text-[10px] text-ink-4 font-mono mb-2">Demo: switch state</div>
          <div className="flex flex-wrap justify-center gap-1.5">
            {(['pending', 'success', 'expired', 'invalid'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setCurrentStatus(s)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-mono transition-all ${currentStatus === s ? 'bg-indigo-600 text-white' : 'text-ink-4 hover:text-ink-2'}`}
                style={currentStatus !== s ? { background: 'var(--surface-2)' } : {}}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function PendingState({ onResend }: { onResend: () => void }) {
  const [sent, setSent] = useState(false)

  async function handleResend() {
    setSent(true)
    await new Promise((r) => setTimeout(r, 600))
    onResend()
  }

  return (
    <>
      <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950 border border-amber-100 dark:border-amber-900 flex items-center justify-center text-2xl mx-auto mb-5">📧</div>
      <h2 className="font-display text-xl font-semibold text-ink-1 mb-2">Verify your email</h2>
      <p className="text-sm text-ink-3 mb-6">
        Your Academy Hub account is ready — you just need to verify your email address. Check your inbox for the verification link.
      </p>
      <div className="rounded-xl border p-4 mb-5 text-left space-y-2" style={{ background: 'var(--surface-2)', borderColor: 'var(--edge)' }}>
        {['Check your inbox (including spam)', 'Click the verification link', 'Return here to sign in'].map((step, i) => (
          <div key={i} className="flex items-center gap-2.5 text-xs text-ink-2">
            <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</span>
            {step}
          </div>
        ))}
      </div>
      <button
        onClick={handleResend}
        disabled={sent}
        className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-lg text-sm hover:bg-indigo-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {sent ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending…</> : 'Resend verification email'}
      </button>
    </>
  )
}

function SuccessState({ onSignIn }: { onSignIn: () => void }) {
  return (
    <>
      <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center text-2xl mx-auto mb-5">✓</div>
      <h2 className="font-display text-xl font-semibold text-ink-1 mb-2">Email verified!</h2>
      <p className="text-sm text-ink-3 mb-6">Your account is now active. Welcome to Academy Hub — your learning journey begins now.</p>
      <button
        onClick={onSignIn}
        className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-lg text-sm hover:bg-indigo-700 transition-all"
      >
        Enter Academy Hub →
      </button>
    </>
  )
}

function ExpiredState({ onResend, onNavigate }: { onResend: () => void; onNavigate: (p: string) => void }) {
  return (
    <>
      <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950 border border-rose-100 dark:border-rose-900 flex items-center justify-center text-2xl mx-auto mb-5">⏱</div>
      <h2 className="font-display text-xl font-semibold text-ink-1 mb-2">Link expired</h2>
      <p className="text-sm text-ink-3 mb-6">This verification link has expired. Verification links are valid for 24 hours. Request a new one below.</p>
      <button onClick={onResend} className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-lg text-sm hover:bg-indigo-700 transition-all mb-2">
        Send new verification link
      </button>
      <button onClick={() => onNavigate('login')} className="text-xs text-ink-3 hover:text-ink-1 transition-colors">
        ← Back to sign in
      </button>
    </>
  )
}

function InvalidState({ onNavigate }: { onNavigate: (p: string) => void }) {
  return (
    <>
      <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950 border border-rose-100 dark:border-rose-900 flex items-center justify-center text-2xl mx-auto mb-5">✕</div>
      <h2 className="font-display text-xl font-semibold text-ink-1 mb-2">Invalid link</h2>
      <p className="text-sm text-ink-3 mb-6">This verification link is invalid or has already been used. If you believe this is an error, please contact support.</p>
      <div className="flex flex-col gap-2">
        <button onClick={() => onNavigate('register')} className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-lg text-sm hover:bg-indigo-700 transition-all">
          Create a new account
        </button>
        <button onClick={() => onNavigate('login')} className="text-xs text-ink-3 hover:text-ink-1 transition-colors">
          ← Sign in
        </button>
      </div>
    </>
  )
}
