/**
 * Normalize image URL - ensures absolute URLs for production
 * Handles both relative and absolute URLs from API
 */
export const normalizeImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;

  // Trim whitespace
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return null;

  // If already absolute URL (starts with http:// or https://), return as is
  if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
    return trimmedUrl;
  }

  // If relative URL, prepend API base URL
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
  if (!API_BASE_URL) {
    if (__DEV__) {
      console.warn("[ImageUtils] EXPO_PUBLIC_API_URL not set, cannot normalize relative URL:", trimmedUrl);
    }
    return trimmedUrl;
  }

  // Remove trailing slash from base URL if present
  const baseUrl = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  
  // Handle different relative URL formats
  let relativePath = trimmedUrl;
  
  // If URL doesn't start with /, add it
  if (!relativePath.startsWith("/")) {
    relativePath = `/${relativePath}`;
  }
  
  const normalizedUrl = `${baseUrl}${relativePath}`;
  
  if (__DEV__) {
    console.log("[ImageUtils] Normalized URL:", { original: url, normalized: normalizedUrl });
  }
  
  return normalizedUrl;
};

/**
 * Add cache busting query parameter to force image refresh
 */
export const addCacheBuster = (url: string | null, timestamp?: number): string | null => {
  if (!url) return null;
  
  const separator = url.includes("?") ? "&" : "?";
  const cacheBuster = timestamp || Date.now();
  return `${url}${separator}_t=${cacheBuster}`;
};

