import { useEffect, useState } from "react";
import { resolveMediaUrl } from "@/services/media";

interface MediaVideoProps
  extends Omit<React.VideoHTMLAttributes<HTMLVideoElement>, "src"> {
  src: string | null | undefined;
  poster?: string | null;
  fallback?: string;
}

function isDirectVideoUrl(url: string) {
  return /\.(mp4|webm|ogg|mov|m3u8)(\?|$)/i.test(url);
}

export function MediaVideo({
  src,
  poster,
  fallback,
  ...props
}: MediaVideoProps) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [resolvedPoster, setResolvedPoster] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;

    setResolvedUrl(null);
    setResolvedPoster(undefined);

    if (!src) {
      return;
    }

    resolveMediaUrl(src).then((url) => {
      if (!cancelled) {
        setResolvedUrl(url);
      }
    });

    if (poster) {
      resolveMediaUrl(poster).then((url) => {
        if (!cancelled) {
          setResolvedPoster(url ?? undefined);
        }
      });
    }

    return () => {
      cancelled = true;
    };
  }, [src, poster]);

  const url = resolvedUrl ?? fallback;

  if (!url) {
    return null;
  }

  if (!isDirectVideoUrl(url)) {
    return (
      <iframe
        src={url}
        title={props["aria-label"] ?? "Lesson video"}
        className="size-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <video
      {...props}
      src={url}
      poster={resolvedPoster}
    />
  );
}