import { QueryClient } from "@tanstack/react-query";

// Create a client with default options optimized for financial app
// Financial apps need fresh data all the time - like bKash, PayPal, etc.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Time before data is considered stale (30 seconds for financial app)
      // This ensures data is always fresh and refetched frequently
      staleTime: 30 * 1000, // 30 seconds instead of 5 minutes
      // Time before inactive queries are garbage collected (5 minutes)
      gcTime: 5 * 60 * 1000,
      // Retry failed requests 1 time
      retry: 1,
      // ALWAYS refetch when app comes to foreground (critical for financial apps)
      refetchOnWindowFocus: true,
      // Refetch when network reconnects
      refetchOnReconnect: true,
      // ALWAYS refetch on mount to ensure fresh data
      refetchOnMount: "always",
    },
    mutations: {
      // Retry failed mutations 1 time
      retry: 1,
    },
  },
});
