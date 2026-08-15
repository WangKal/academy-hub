import { useState } from "react";

interface Props {
  currentPage: string;
  onNavigate: (page: string) => void;
  onSignIn: () => void;
  darkMode: boolean;
  onToggleDark: () => void;
}

export default function PublicNav({
  currentPage,
  onNavigate,
  onSignIn,
  darkMode,
  onToggleDark,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { id: "catalogue", label: "Courses" },
    { id: "home#features", label: "Features" },
    { id: "home#instructors", label: "Instructors" },
  ];

  function handleNav(id: string) {
    setMobileOpen(false);
    if (id.includes("#")) {
      onNavigate("home");
      setTimeout(() => {
        const el = document.getElementById(id.split("#")[1]);
        el?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      onNavigate(id);
    }
  }

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-theme"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--edge)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          {/* Logo */}
          <button onClick={() => onNavigate("home")} className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-display font-semibold text-ink-1 text-base tracking-wide hidden sm:block">
              Academy Hub
            </span>
          </button>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1 ml-6">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  currentPage === link.id
                    ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-950 dark:text-indigo-400"
                    : "text-ink-3 hover:text-ink-1 hover:bg-surface-2"
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Dark mode toggle */}
            <button
              onClick={onToggleDark}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              className="p-2 rounded-lg text-ink-3 hover:text-ink-1 hover:bg-surface-2 transition-all"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Sign in */}
            <button
              onClick={() => onNavigate("login")}
              className="hidden sm:block px-3 py-1.5 text-sm font-medium text-ink-2 hover:text-ink-1 rounded-lg hover:bg-surface-2 transition-all"
            >
              Sign in
            </button>

            {/* Get started */}
            <button
              onClick={() => onNavigate("register")}
              className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-all shadow-sm"
            >
              <span className="hidden sm:inline">Get started</span>
              <span className="sm:hidden">Join</span>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-ink-3 hover:text-ink-1 hover:bg-surface-2 transition-all"
              aria-label="Menu"
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <div
            className="md:hidden border-t transition-theme"
            style={{ borderColor: "var(--edge)", background: "var(--surface)" }}
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNav(link.id)}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-ink-2 hover:text-ink-1 hover:bg-surface-2 transition-all"
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-2 border-t" style={{ borderColor: "var(--edge)" }}>
                <button
                  onClick={() => {
                    onNavigate("login");
                    setMobileOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-ink-2 hover:text-ink-1 hover:bg-surface-2 transition-all"
                >
                  Sign in
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer for fixed nav */}
      <div className="h-16" />
    </>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M14 9.5A6.5 6.5 0 0 1 6.5 2 6.5 6.5 0 1 0 14 9.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M11.54 4.46l-1.41 1.41M4.95 11.54l-1.41 1.41"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <line
        x1="2"
        y1="4.5"
        x2="14"
        y2="4.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <line
        x1="2"
        y1="8"
        x2="14"
        y2="8"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <line
        x1="2"
        y1="11.5"
        x2="14"
        y2="11.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
