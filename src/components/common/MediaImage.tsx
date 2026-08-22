import { useEffect, useState } from "react";
import { resolveMediaUrl } from "@/services/media";

interface MediaImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string | null | undefined;
  fallback?: string;
}

export function MediaImage({
  src,
  fallback,
  ...props
}: MediaImageProps) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setResolvedUrl(null);

    resolveMediaUrl(src).then((url) => {
      if (!cancelled) {
        setResolvedUrl(url);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [src]);

  return (
    <img
      {...props}
      src={resolvedUrl ?? fallback}
    />
  );
}