import { REFRESH_EXCLUDE_API_URLS } from "@/lib/axios/auth-paths";

export function shouldRefreshToken(url?: string): boolean {
  if (!url) return false;
  return !REFRESH_EXCLUDE_API_URLS.some((excludeUrl) => url.startsWith(excludeUrl));
}