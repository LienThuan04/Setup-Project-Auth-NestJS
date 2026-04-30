import { REFRESH_EXCLUDE_API_URLS } from "@/lib/axios/auth-paths";

export function shouldRefreshToken(url?: string): boolean {
  if (!url) return false;

  // Axios may provide either relative paths (/auth/refresh) or absolute URLs.
  // Normalize to pathname so exclusion works consistently.
  let normalizedPath = url;
  if (/^https?:\/\//i.test(url)) {
    try {
      normalizedPath = new URL(url).pathname;
    } catch {
      normalizedPath = url;
    }
  }

  return !REFRESH_EXCLUDE_API_URLS.some((excludeUrl) =>
    normalizedPath.startsWith(excludeUrl)
  );
}