import { Link } from "@tanstack/react-router";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

const links = [
  { to: "/courses", label: "Courses" },
  { to: "/about", label: "The Academy" },
  { to: "/verify", label: "Verify certificate" },
] as const;

function Logo() {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2.5">
      <span className="flex size-8 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white shadow-sm">
        A
      </span>
      <span className="hidden font-display text-base font-semibold tracking-wide text-ink-1 sm:block">
        Academy Hub
      </span>
    </Link>
  );
}

export function PublicHeader() {
  const { user, loading } = useAuth();
  const { dark, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-edge bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Logo />

        <nav className="ml-6 hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-3 transition-all hover:bg-surface-2 hover:text-ink-1"
              activeProps={{
                className: "bg-brand-50 text-brand-700 dark:bg-brand-600/15 dark:text-brand-200",
              }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="rounded-lg p-2 text-ink-3 transition-all hover:bg-surface-2 hover:text-ink-1"
          >
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          {loading ? null : user ? (
            <Link
              to="/dashboard"
              className="rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/auth"
                className="hidden rounded-lg px-3 py-1.5 text-sm font-medium text-ink-2 transition-all hover:bg-surface-2 hover:text-ink-1 sm:block"
              >
                Sign in
              </Link>
              <Link
                to="/auth"
                className="rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700"
              >
                <span className="hidden sm:inline">Get started</span>
                <span className="sm:hidden">Join</span>
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className="rounded-lg p-2 text-ink-3 transition-all hover:bg-surface-2 hover:text-ink-1 md:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-edge bg-card px-4 py-3 md:hidden">
          <div className="space-y-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-2 transition-all hover:bg-surface-2 hover:text-ink-1"
              >
                {l.label}
              </Link>
            ))}
            <div className="border-t border-edge pt-2">
              <Link
                to={user ? "/dashboard" : "/auth"}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-2 transition-all hover:bg-surface-2 hover:text-ink-1"
              >
                {user ? "Go to dashboard" : "Sign in"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

const footerSections = [
  {
    title: "Learn",
    links: [
      { label: "Browse courses", to: "/courses" },
      { label: "Verify a certificate", to: "/verify" },
      { label: "The Academy", to: "/about" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "For students", to: "/courses" },
      { label: "For instructors", to: "/about" },
      { label: "For organizations", to: "/about" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", to: "/auth" },
      { label: "Create account", to: "/auth" },
      { label: "Reset password", to: "/reset-password" },
    ],
  },
] as const;

export function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-edge bg-card">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-3">
              Accredited training for executive and personal assistants — courses, assessments and
              verifiable certificates.
            </p>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className={cn("mb-3 text-xs font-semibold uppercase tracking-widest text-ink-4")}>
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-ink-3 transition-colors hover:text-brand-600"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-edge pt-6 sm:flex-row">
          <p className="font-mono text-xs text-ink-4">
            © {year} Executive &amp; Personal Assistant Academy
          </p>
          <div className="flex items-center gap-4 text-xs text-ink-4">
            <span>Terms</span>
            <span>Privacy</span>
            <span>Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
