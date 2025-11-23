import { Alert } from "react-native";
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
 * Shows an alert and triggers the handler to logout and navigate
 */
export const handleSessionExpiration = async () => {
  // Clear the token from storage
  await clearAuthToken();

  // Show alert to user
  Alert.alert(
    "Session Expired",
    "Your session has expired. Please login again to continue.",
    [
      {
        text: "OK",
        onPress: () => {
          // Call the handler to logout and navigate to login
          if (sessionExpirationHandler) {
            sessionExpirationHandler();
          }
        },
      },
    ],
    { cancelable: false }
  );
};

