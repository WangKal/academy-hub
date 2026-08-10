import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "academy-hub-theme";

export function useTheme() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const next = stored ? stored === "dark" : prefers;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  }, []);

  const toggle = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      window.localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
      return next;
    });
  }, []);

  return { dark, toggle };
}
