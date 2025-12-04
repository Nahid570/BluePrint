import { clearAuthToken } from "./httpClient";

// Global handler for session expiration
// This will be set from the app level to handle navigation
let sessionExpirationHandler: (() => void) | null = null;

/**
 * Set the session expiration handler
 * This should be called from the app level with a function that handles logout and navigation
 */
export const setSessionExpirationHandler = (handler: () => void) => {
  sessionExpirationHandler = handler;
};

/**
 * Handle session expiration
 * Automatically signs out the user without showing any alert
 */
export const handleSessionExpiration = async () => {
  // Clear the token from storage
  await clearAuthToken();

  // Call the handler to logout and navigate to login
  if (sessionExpirationHandler) {
    sessionExpirationHandler();
  }
};

