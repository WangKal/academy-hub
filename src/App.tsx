import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/useAuth";
import {
  createRouterContextValue,
  OutletContextProvider,
  RouterContextProvider,
  RedirectError,
  Link,
  resolvePath,
  type RouteObject,
  type NavigateOptions,
} from "@/lib/router";
import { Toaster } from "@/components/ui/sonner";

import { Route as Route_ } from "@/routes/index";
import { Route as Route_about } from "@/routes/about";
import { Route as Route_auth } from "@/routes/auth";
import { Route as Route_login } from "@/routes/login";
import { Route as Route_register } from "@/routes/register";
import { Route as Route_reset_password } from "@/routes/reset-password";
import { Route as Route_verify } from "@/routes/verify";
import { Route as Route_dashboard } from "@/routes/_authenticated/dashboard";
import { Route as Route_my_certificates } from "@/routes/_authenticated/my-certificates";
import { Route as Route_my_courses } from "@/routes/_authenticated/my-courses";
import { Route as Route_notifications } from "@/routes/_authenticated/notifications";
import { Route as Route_profile } from "@/routes/_authenticated/profile";
import { Route as Route_certificate_code } from "@/routes/certificate.$code";
import { Route as Route_courses } from "@/routes/courses.index";
import { Route as Route_courses_slug } from "@/routes/courses.$slug";
import { Route as Route_admin } from "@/routes/_authenticated/admin/index";
import { Route as Route_admin_audit } from "@/routes/_authenticated/admin/audit";
import { Route as Route_admin_audit_logs } from "@/routes/_authenticated/admin/audit-logs";
import { Route as Route_admin_certificates } from "@/routes/_authenticated/admin/certificates";
import { Route as Route_admin_courses } from "@/routes/_authenticated/admin/courses";
import { Route as Route_admin_dashboard } from "@/routes/_authenticated/admin/dashboard";
import { Route as Route_admin_enrollments } from "@/routes/_authenticated/admin/enrollments";
import { Route as Route_admin_organizations } from "@/routes/_authenticated/admin/organizations";
import { Route as Route_admin_payments } from "@/routes/_authenticated/admin/payments";
import { Route as Route_admin_settings } from "@/routes/_authenticated/admin/settings";
import { Route as Route_admin_team } from "@/routes/_authenticated/admin/team";
import { Route as Route_admin_users } from "@/routes/_authenticated/admin/users";
import { Route as Route_admin_users_userId } from "@/routes/_authenticated/admin/users_.$userId";
import { Route as Route_instructor_courses } from "@/routes/_authenticated/instructor/courses";
import { Route as Route_instructor_students } from "@/routes/_authenticated/instructor/students";
import { Route as Route_instructor_submissions } from "@/routes/_authenticated/instructor/submissions";
import { Route as Route_instructor_courses_new } from "@/routes/_authenticated/instructor/courses_.new";
import { Route as Route_instructor_courses_courseId } from "@/routes/_authenticated/instructor/courses_.$courseId";
import { Route as Route_instructor_courses_courseId_analytics } from "@/routes/_authenticated/instructor/courses_.$courseId.analytics";
import { Route as Route_instructor_courses_courseId_builder } from "@/routes/_authenticated/instructor/courses_.$courseId.builder";
import { Route as Route_instructor_courses_courseId_students } from "@/routes/_authenticated/instructor/courses_.$courseId.students";
import { Route as Route_instructor_students_userId } from "@/routes/_authenticated/instructor/students_.$userId";
import { Route as Route_learn_courseId } from "@/routes/_authenticated/learn.$courseId";
import { Route as Route_student_certificates } from "@/routes/_authenticated/student/certificates";
import { Route as Route_student_courses } from "@/routes/_authenticated/student/courses";
import { Route as Route_student_profile } from "@/routes/_authenticated/student/profile";
import { Route as Route_student_courses_courseId } from "@/routes/_authenticated/student/courses_.$courseId";
import { Route as Route_student_courses_courseId_lessons_lessonId } from "@/routes/_authenticated/student/courses_.$courseId.lessons.$lessonId";
import { Route as Route_student_quizzes_quizId } from "@/routes/_authenticated/student/quizzes.$quizId";
import { Route as AuthenticatedRoute } from "@/routes/_authenticated/route";
import { Route as AdminRoute } from "@/routes/_authenticated/admin/route";

const routeEntries: Array<{ path: string; route: RouteObject }> = [
  { path: "/", route: Route_ },
  { path: "/about", route: Route_about },
  { path: "/auth", route: Route_auth },
  { path: "/login", route: Route_login },
  { path: "/register", route: Route_register },
  { path: "/reset-password", route: Route_reset_password },
  { path: "/verify", route: Route_verify },
  { path: "/dashboard", route: Route_dashboard },
  { path: "/my-certificates", route: Route_my_certificates },
  { path: "/my-courses", route: Route_my_courses },
  { path: "/notifications", route: Route_notifications },
  { path: "/profile", route: Route_profile },
  { path: "/certificate/$code", route: Route_certificate_code },
  { path: "/courses", route: Route_courses },
  { path: "/courses/$slug", route: Route_courses_slug },
  { path: "/admin", route: Route_admin },
  { path: "/admin/audit", route: Route_admin_audit },
  { path: "/admin/audit-logs", route: Route_admin_audit_logs },
  { path: "/admin/certificates", route: Route_admin_certificates },
  { path: "/admin/courses", route: Route_admin_courses },
  { path: "/admin/dashboard", route: Route_admin_dashboard },
  { path: "/admin/enrollments", route: Route_admin_enrollments },
  { path: "/admin/organizations", route: Route_admin_organizations },
  { path: "/admin/payments", route: Route_admin_payments },
  { path: "/admin/settings", route: Route_admin_settings },
  { path: "/admin/team", route: Route_admin_team },
  { path: "/admin/users", route: Route_admin_users },
  { path: "/admin/users/$userId", route: Route_admin_users_userId },
  { path: "/instructor/courses", route: Route_instructor_courses },
  { path: "/instructor/students", route: Route_instructor_students },
  { path: "/instructor/submissions", route: Route_instructor_submissions },
  { path: "/instructor/courses/new", route: Route_instructor_courses_new },
  { path: "/instructor/courses/$courseId", route: Route_instructor_courses_courseId },
  { path: "/instructor/courses/$courseId/analytics", route: Route_instructor_courses_courseId_analytics },
  { path: "/instructor/courses/$courseId/builder", route: Route_instructor_courses_courseId_builder },
  { path: "/instructor/courses/$courseId/students", route: Route_instructor_courses_courseId_students },
  { path: "/instructor/students/$userId", route: Route_instructor_students_userId },
  { path: "/learn/$courseId", route: Route_learn_courseId },
  { path: "/student/certificates", route: Route_student_certificates },
  { path: "/student/courses", route: Route_student_courses },
  { path: "/student/profile", route: Route_student_profile },
  { path: "/student/courses/$courseId", route: Route_student_courses_courseId },
  { path: "/student/courses/$courseId/lessons/$lessonId", route: Route_student_courses_courseId_lessons_lessonId },
  { path: "/student/quizzes/$quizId", route: Route_student_quizzes_quizId },
];


const routeOrder = [...routeEntries].sort((a, b) => {
  const aDynamic = (a.path.match(/\$/g) ?? []).length;
  const bDynamic = (b.path.match(/\$/g) ?? []).length;
  if (aDynamic !== bDynamic) return aDynamic - bDynamic;
  return b.path.length - a.path.length;
});

function patternFor(path: string) {
  const names: string[] = [];
  const pattern = path.split("/").map((segment) => {
    if (segment.startsWith("$")) {
      names.push(segment.slice(1));
      return "([^/]+)";
    }
    return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }).join("/");
  return { regex: new RegExp(`^${pattern || "/"}/?$`), names };
}

function matchRoute(pathname: string, path: string) {
  const { regex, names } = patternFor(path);
  const match = pathname.match(regex);
  if (!match) return null;
  return Object.fromEntries(names.map((name, index) => [name, decodeURIComponent(match[index + 1] ?? "")]));
}

function routeChain(pathname: string) {
  const matched = routeOrder.find((entry) => matchRoute(pathname, entry.path));
  if (!matched) return null;
  const params = matchRoute(pathname, matched.path) ?? {};
  const chain: RouteObject[] = [];

  const authenticated =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/my-") ||
    pathname.startsWith("/notifications") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/instructor") ||
    pathname.startsWith("/learn/") ||
    pathname.startsWith("/student/");

  if (authenticated) chain.push(AuthenticatedRoute as RouteObject);
  if (pathname.startsWith("/admin")) chain.push(AdminRoute as RouteObject);

  if (pathname.startsWith("/instructor/courses/") && !pathname.endsWith("/new") && !pathname.endsWith("/courses")) {
    const courseRoute = routeEntries.find((entry) => entry.path === "/instructor/courses/$courseId")?.route;
    if (courseRoute && matched.route !== courseRoute) chain.push(courseRoute);
  }

  if (pathname.startsWith("/student/courses/") && !pathname.endsWith("/courses")) {
    const courseRoute = routeEntries.find((entry) => entry.path === "/student/courses/$courseId")?.route;
    if (courseRoute && matched.route !== courseRoute) chain.push(courseRoute);
  }

  if (!chain.includes(matched.route)) chain.push(matched.route);
  return { chain, params, route: matched.route };
}

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <p className="mt-4 text-sm text-ink-3">Page not found.</p>
        <Link to="/" className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Go home
        </Link>
      </div>
    </div>
  );
}

function RouteRenderer({ chain }: { chain: RouteObject[] }) {
  let rendered: ReactNode = null;

  for (let index = chain.length - 1; index >= 0; index -= 1) {
    const route = chain[index];
    const Component = route.component;
    const child = rendered;

    // Guard/layout routes such as _authenticated and admin/route intentionally
    // have no component. Their job is to run beforeLoad guards and pass the
    // matched child through to the next route. Dropping the child here makes
    // every protected/nested page render as a blank screen.
    if (!Component) {
      rendered = child;
      continue;
    }

    rendered = (
      <OutletContextProvider value={child}>
        <Component />
      </OutletContextProvider>
    );
  }

  return <>{rendered}</>;
}

function ApplicationRouter({ queryClient }: { queryClient: QueryClient }) {
  const [location, setLocation] = useState(() => ({
    pathname: window.location.pathname || "/",
    search: window.location.search || "",
  }));
  const [navigationError, setNavigationError] = useState<Error | null>(null);
  const [version, setVersion] = useState(0);

  const navigate = useCallback(({ to, replace = false, params }: NavigateOptions) => {
    const href = resolvePath(to, params);
    const url = new URL(href, window.location.origin);
    const next = { pathname: url.pathname || "/", search: url.search };
    if (replace) window.history.replaceState({}, "", url);
    else window.history.pushState({}, "", url);
    setNavigationError(null);
    setLocation(next);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    const onPopState = () => setLocation({
      pathname: window.location.pathname || "/",
      search: window.location.search || "",
    });
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const invalidate = useCallback(() => setVersion((value) => value + 1), []);
  const matched = useMemo(() => routeChain(location.pathname), [location.pathname]);

  useEffect(() => {
    const meta = matched?.route.head?.().meta ?? [];
    const title = meta.find((entry) => "title" in entry)?.title;
    if (title) document.title = String(title);
  }, [matched?.route, location.pathname]);

  useEffect(() => {
    if (!matched) return;
    let cancelled = false;

    const runGuards = async () => {
      try {
        setNavigationError(null);
        const context: Record<string, unknown> = { user: null, queryClient };
        for (const route of matched.chain) {
          if (!route.beforeLoad) continue;
          const result = await route.beforeLoad({ context, location, params: matched.params });
          if (result && typeof result === "object") Object.assign(context, result);
        }
        if (!cancelled) setNavigationError(null);
      } catch (error) {
        if (cancelled) return;
        if (error instanceof RedirectError) navigate({ to: error.to, replace: error.replace });
        else setNavigationError(error instanceof Error ? error : new Error(String(error)));
      }
    };

    void runGuards();
    return () => { cancelled = true; };
  }, [location.pathname, location.search, queryClient, navigate, version, matched]);

  if (!matched) return <NotFound />;
  if (navigationError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">This page didn't load</h1>
          <p className="mt-2 text-sm text-ink-3">{navigationError.message}</p>
          <button onClick={invalidate} className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Try again
          </button>
        </div>
      </div>
    );
  }

  const context = createRouterContextValue(
    location.pathname,
    location.search,
    matched.params,
    queryClient,
    navigate,
    invalidate,
  );

  return (
    <RouterContextProvider value={context}>
      <RouteRenderer chain={matched.chain} />
    </RouterContextProvider>
  );
}

export default function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ApplicationRouter queryClient={queryClient} />
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
