import { useEffect, useState } from 'react';
import { resolveMediaUrl } from '@/services/media';

export function useMediaUrl(
  path: string | null | undefined,
): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!path) {
      setUrl(null);
      return;
    }

    resolveMediaUrl(path).then((resolvedUrl) => {
      if (!cancelled) {
        setUrl(resolvedUrl);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [path]);

  return url;
}