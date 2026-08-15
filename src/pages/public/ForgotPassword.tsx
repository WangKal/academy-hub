import { useState } from "react";

interface Props {
  onNavigate: (page: string) => void;
}

type Step = "email" | "sent" | "reset" | "success" | "expired";

export default function ForgotPassword({ onNavigate }: Props) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSendLink(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setStep("sent");
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setStep("success");
  }

  const container = "min-h-screen flex items-center justify-center p-6 transition-theme";

  if (step === "sent") {
    return (
      <div className={container} style={{ background: "var(--bg)" }}>
        <div className="w-full max-w-sm text-center">
          <BackToHome onNavigate={onNavigate} />
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-2xl mx-auto mb-5">
            📬
          </div>
          <h2 className="font-display text-xl font-semibold text-ink-1 mb-2">Check your email</h2>
          <p className="text-sm text-ink-3 mb-6">
            We sent a password reset link to <strong className="text-ink-1">{email}</strong>. The
            link expires in 15 minutes.
          </p>
          <div className="space-y-2">
            <button
              onClick={() => setStep("reset")}
              className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-lg text-sm hover:bg-indigo-700 transition-all"
            >
              I clicked the link → reset password
            </button>
            <button
              onClick={() => setStep("expired")}
              className="w-full py-2.5 text-sm text-ink-3 hover:text-ink-1 transition-colors"
            >
              My link expired or is invalid
            </button>
          </div>
          <p className="text-xs text-ink-4 mt-4">
            Didn't receive it? Check your spam folder or{" "}
            <button
              onClick={() => setStep("email")}
              className="text-indigo-600 hover:text-indigo-700"
            >
              try again
            </button>
            .
          </p>
        </div>
      </div>
    );
  }

  if (step === "reset") {
    return (
      <div className={container} style={{ background: "var(--bg)" }}>
        <div className="w-full max-w-sm">
          <BackToHome onNavigate={onNavigate} />
          <h2 className="font-display text-xl font-semibold text-ink-1 mb-1">Set new password</h2>
          <p className="text-sm text-ink-3 mb-6">
            Choose a strong password for your Academy Hub account.
          </p>

          <form onSubmit={handleReset} className="space-y-4" noValidate>
            {error && (
              <div className="bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-900 rounded-lg px-4 py-3 text-sm text-rose-700 dark:text-rose-400">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-ink-2 mb-1.5">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                className="w-full px-3.5 py-2.5 rounded-lg border text-sm text-ink-1 placeholder-ink-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                style={{ background: "var(--surface)", borderColor: "var(--edge)" }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-2 mb-1.5">
                Confirm password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your new password"
                autoComplete="new-password"
                className="w-full px-3.5 py-2.5 rounded-lg border text-sm text-ink-1 placeholder-ink-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                style={{ background: "var(--surface)", borderColor: "var(--edge)" }}
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-rose-500 mt-1">Passwords do not match.</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-lg text-sm hover:bg-indigo-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating…
                </>
              ) : (
                "Update password"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className={container} style={{ background: "var(--bg)" }}>
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center text-2xl mx-auto mb-5">
            ✓
          </div>
          <h2 className="font-display text-xl font-semibold text-ink-1 mb-2">Password updated</h2>
          <p className="text-sm text-ink-3 mb-6">
            Your password has been successfully reset. You can now sign in with your new password.
          </p>
          <button
            onClick={() => onNavigate("login")}
            className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-lg text-sm hover:bg-indigo-700 transition-all"
          >
            Sign in →
          </button>
        </div>
      </div>
    );
  }

  if (step === "expired") {
    return (
      <div className={container} style={{ background: "var(--bg)" }}>
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950 border border-amber-100 dark:border-amber-900 flex items-center justify-center text-2xl mx-auto mb-5">
            ⏱
          </div>
          <h2 className="font-display text-xl font-semibold text-ink-1 mb-2">Link expired</h2>
          <p className="text-sm text-ink-3 mb-6">
            This reset link is no longer valid. Reset links expire after 15 minutes for security.
          </p>
          <button
            onClick={() => setStep("email")}
            className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-lg text-sm hover:bg-indigo-700 transition-all mb-2"
          >
            Request a new link
          </button>
          <button
            onClick={() => onNavigate("login")}
            className="text-xs text-ink-3 hover:text-ink-1"
          >
            ← Back to sign in
          </button>
        </div>
      </div>
    );
  }

  // step === 'email'
  return (
    <div className={container} style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm">
        <BackToHome onNavigate={onNavigate} />
        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-lg mb-5">
          🔑
        </div>
        <h1 className="font-display text-xl font-semibold text-ink-1 mb-1">
          Forgot your password?
        </h1>
        <p className="text-sm text-ink-3 mb-6">Enter your email and we'll send you a reset link.</p>

        <form onSubmit={handleSendLink} className="space-y-4" noValidate>
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
              style={{ background: "var(--surface)", borderColor: "var(--edge)" }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-lg text-sm hover:bg-indigo-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending…
              </>
            ) : (
              "Send reset link"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-ink-3 mt-5">
          Remember your password?{" "}
          <button
            onClick={() => onNavigate("login")}
            className="text-indigo-600 font-semibold hover:text-indigo-700"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

function BackToHome({ onNavigate }: { onNavigate: (p: string) => void }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
        <span className="text-white font-bold text-xs">A</span>
      </div>
      <span className="font-display font-semibold text-ink-1 text-sm">Academy Hub</span>
    </div>
  );
}
