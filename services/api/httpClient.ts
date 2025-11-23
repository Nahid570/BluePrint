import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import * as SecureStore from "expo-secure-store";
import { Alert, Platform } from "react-native";
import { handleSessionExpiration } from "./sessionHandler";

// API Base URL - Update this with your actual API URL
// You can also use environment variables: process.env.EXPO_PUBLIC_API_URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Log API base URL in development to help with debugging
if (__DEV__) {
  console.log(`[API Config] Base URL: ${API_BASE_URL}`);
  if (API_BASE_URL === "https://api.yourdomain.com/api") {
    console.warn(
      "[API Config] ⚠️  API base URL is still set to placeholder! Please update it in services/api/httpClient.ts or set EXPO_PUBLIC_API_URL environment variable."
    );
  }
}

// Create axios instance
export const httpClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor - Add auth token to requests
httpClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Get token from secure storage
      const token = await SecureStore.getItemAsync("session");

      if (token && config.headers) {
        // Add Authorization header if token exists
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Log request URL in development
      if (__DEV__) {
        const fullUrl = `${config.baseURL}${config.url}`;
        console.log(`[API Request] ${config.method?.toUpperCase()} ${fullUrl}`);
      }
    } catch (error) {
      console.error("Error getting token from storage:", error);
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
httpClient.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized - Token expired or invalid
    // Skip session expiration handler for login endpoint (invalid credentials is not session expiration)
    const isLoginEndpoint = originalRequest?.url?.includes("/api/investor/login");
    
    if (error.response?.status === 401 && !originalRequest._retry && !isLoginEndpoint) {
      originalRequest._retry = true;

      // Handle session expiration - show alert and trigger logout
      await handleSessionExpiration();

      return Promise.reject(error);
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      // Handle forbidden access
      console.error("Access forbidden");
    }

    // Handle network errors
    if (!error.response) {
      console.error("Network error:", error.message);
      // You might want to show a network error message to the user
    }

    // Handle other errors (400, 404, 500, etc.)
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;
      const isLoginEndpoint = originalRequest?.url?.includes("/api/investor/login");

      // Log error details in development
      // Skip logging for login endpoint 401 errors (invalid credentials is expected, not an error)
      if (__DEV__ && !(isLoginEndpoint && status === 401)) {
        const fullUrl = `${originalRequest?.baseURL}${originalRequest?.url}`;
        console.error(
          `[API Error] ${status} ${originalRequest?.method?.toUpperCase()} ${fullUrl}`
        );
        console.error(
          "Response data:",
          typeof data === "string" ? data.substring(0, 200) : data
        );
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to get token (useful for manual token retrieval)
export const getAuthToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === "web") {
      return localStorage.getItem("session");
    } else {
      return await SecureStore.getItemAsync("session");
    }
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

// Helper function to set token (useful for login)
export const setAuthToken = async (token: string | null): Promise<void> => {
  try {
    if (Platform.OS === "web") {
      if (token) {
        localStorage.setItem("session", token);
      } else {
        localStorage.removeItem("session");
      }
    } else {
      if (token) {
        await SecureStore.setItemAsync("session", token);
      } else {
        await SecureStore.deleteItemAsync("session");
      }
    }
  } catch (error) {
    console.error("Error setting auth token:", error);
    throw error;
  }
};

// Helper function to clear token (useful for logout)
export const clearAuthToken = async (): Promise<void> => {
  await setAuthToken(null);
};
