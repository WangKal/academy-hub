import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ComponentType,
  type MouseEvent,
  type ReactNode,
} from "react";
import type { QueryClient } from "@tanstack/react-query";

type RouteConfig = {
  [key: string]: unknown;
  path?: string;
  component?: ComponentType;
  beforeLoad?: (args: {
    context: Record<string, unknown>;
    location: { pathname: string; search: string };
    params: Record<string, string>;
  }) => unknown | Promise<unknown>;
  head?: () => { meta?: Array<Record<string, string>>; links?: Array<Record<string, string>> };
  notFoundComponent?: ComponentType;
  errorComponent?: ComponentType<{ error: Error; reset: () => void }>;
};

export type RouteObject = RouteConfig & { routePath: string };

type RouterContextValue = {
  pathname: string;
  search: string;
  params: Record<string, string>;
  queryClient: QueryClient;
  navigate: (options: NavigateOptions) => void;
  invalidate: () => void;
};

const RouterContext = createContext<RouterContextValue | null>(null);
const OutletContext = createContext<ReactNode>(null);

export class RedirectError extends Error {
  constructor(public readonly to: string, public readonly replace = true) {
    super(`Redirecting to ${to}`);
    this.name = "RedirectError";
  }
}

export function redirect({
  to,
  replace = true,
  params,
}: {
  to: string;
  replace?: boolean;
  params?: Record<string, string | number>;
}) {
  throw new RedirectError(resolvePath(to, params), replace);
}

export function createFileRoute(path: string) {
  return (config: RouteConfig): RouteObject => ({
    ...config,
    routePath: path,
  });
}

export function Outlet() {
  return <>{useContext(OutletContext)}</>;
}

export function Link({
  to,
  params,
  replace = false,
  children,
  onClick,
  ...props
}: {
  to: string;
  params?: Record<string, string | number>;
  replace?: boolean;
  children?: ReactNode;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  [key: string]: unknown;
}) {
  const router = useRouterContext();
  const href = resolvePath(to, params);
  return (
    <a
      {...props}
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) return;
        event.preventDefault();
        router.navigate({ to: href, replace });
      }}
    >
      {children}
    </a>
  );
}

export function useNavigate() {
  return useRouterContext().navigate;
}

export function useParams(_options?: unknown) {
  return useRouterContext().params;
}

export function useSearch(_options?: unknown) {
  return Object.fromEntries(new URLSearchParams(useRouterContext().search));
}

export function useRouterState<T = unknown>({
  select,
}: {
  select?: (state: { location: { pathname: string; search: string } }) => T;
} = {}) {
  const router = useRouterContext();
  const state = useMemo(
    () => ({ location: { pathname: router.pathname, search: router.search } }),
    [router.pathname, router.search],
  );
  return select ? select(state) : state;
}

export function useRouter() {
  const router = useRouterContext();
  return { navigate: router.navigate, invalidate: router.invalidate };
}

export type NavigateOptions = {
  to: string;
  replace?: boolean;
  params?: Record<string, string | number>;
};

export function resolvePath(to: string, params?: Record<string, string | number>) {
  let path = to;
  for (const [key, value] of Object.entries(params ?? {})) {
    path = path.replace(`$${key}`, encodeURIComponent(String(value)));
  }
  return path;
}

export function createRouterContextValue(
  pathname: string,
  search: string,
  params: Record<string, string>,
  queryClient: QueryClient,
  navigate: (options: NavigateOptions) => void,
  invalidate: () => void,
): RouterContextValue {
  return { pathname, search, params, queryClient, navigate, invalidate };
}

export function RouterContextProvider({
  value,
  children,
}: {
  value: RouterContextValue;
  children: ReactNode;
}) {
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function OutletContextProvider({
  value,
  children,
}: {
  value: ReactNode;
  children: ReactNode;
}) {
  return <OutletContext.Provider value={value}>{children}</OutletContext.Provider>;
}

function useRouterContext() {
  const context = useContext(RouterContext);
  if (!context) throw new Error("Router hook used outside the application router.");
  return context;
}
