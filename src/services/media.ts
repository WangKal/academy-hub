import { supabase } from "@/integrations/supabase/client";

const COURSE_MEDIA_BUCKET = 'course-media';
const SIGNED_URL_EXPIRY = 60 * 60; // 1 hour

/**
 * Resolve a Supabase Storage object path into a browser-accessible URL.
 *
 * Database fields should contain the object path only, e.g.
 * courses/<course-id>/thumbnail/<filename>.jpg
 */
export async function resolveMediaUrl(
  path: string | null | undefined,
): Promise<string | null> {
  if (!path) {
    return null;
  }

  const normalizedPath = path.trim();

  if (!normalizedPath) {
    return null;
  }

  // Already a complete URL.
  if (
    normalizedPath.startsWith('http://') ||
    normalizedPath.startsWith('https://') ||
    normalizedPath.startsWith('blob:')
  ) {
    return normalizedPath;
  }

  // Legacy local asset paths can continue to work during migration.
  if (normalizedPath.startsWith('/assets/')) {
    return normalizedPath;
  }

  const { data, error } = await supabase.storage
    .from(COURSE_MEDIA_BUCKET)
    .createSignedUrl(normalizedPath, SIGNED_URL_EXPIRY);

  if (error || !data?.signedUrl) {
    console.error('Failed to resolve media URL:', {
      path: normalizedPath,
      error,
    });

    return null;
  }

  return data.signedUrl;
}