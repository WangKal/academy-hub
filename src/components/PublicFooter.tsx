interface Props {
  onNavigate: (page: string) => void;
}

export default function PublicFooter({ onNavigate }: Props) {
  const year = new Date().getFullYear();

  const sections = [
    {
      title: "Learn",
      links: [
        { label: "Browse courses", page: "catalogue" },
        { label: "Course catalogue", page: "catalogue" },
        { label: "All categories", page: "catalogue" },
      ],
    },
    {
      title: "Platform",
      links: [
        { label: "For students", page: "home" },
        { label: "For instructors", page: "home" },
        { label: "For organizations", page: "home" },
      ],
    },
    {
      title: "Account",
      links: [
        { label: "Sign in", page: "login" },
        { label: "Create account", page: "register" },
        { label: "Forgot password", page: "forgot-password" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Help center", page: "home" },
        { label: "Contact us", page: "home" },
        { label: "Privacy policy", page: "home" },
      ],
    },
  ];

  return (
    <footer
      className="border-t transition-theme"
      style={{ background: "var(--surface)", borderColor: "var(--edge)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <button onClick={() => onNavigate("home")} className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-display font-semibold text-ink-1 text-base">Academy Hub</span>
            </button>
            <p className="text-sm text-ink-3 leading-relaxed max-w-xs">
              Premium enterprise learning for modern teams and ambitious individuals.
            </p>
          </div>

          {/* Links */}
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-ink-4 mb-3">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => onNavigate(link.page)}
                      className="text-sm text-ink-3 hover:text-indigo-600 transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderColor: "var(--edge)" }}
        >
          <p className="text-xs text-ink-4 font-mono">© {year} Academy Hub. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-ink-4">
            <button className="hover:text-ink-2 transition-colors">Terms</button>
            <button className="hover:text-ink-2 transition-colors">Privacy</button>
            <button className="hover:text-ink-2 transition-colors">Cookies</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
