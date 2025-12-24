import { storeCurrency } from "../../utils/currency";
import { endpoints } from "./endpoints";
import { httpClient, setAuthToken } from "./httpClient";
import {
  ApiResponse,
  BiometricDisableRequest,
  BiometricEnableRequest,
  BiometricEnableResponseType,
  BiometricLoginRequest,
  BiometricStatusResponseType,
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
} from "./types";

/**
 * Login investor
 */
export const loginInvestor = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  try {
    const response = await httpClient.post<LoginResponse>(
      endpoints.auth.login,
      credentials
    );

    // If login is successful, store the token and currency
    if (response.data.success && response.data.data?.token) {
      await setAuthToken(response.data.data.token);

      // Store currency from company data
      if (response.data.data.company?.currency) {
        await storeCurrency(response.data.data.company.currency);
      }
    }

    return response.data;
  } catch (error: any) {
    // Handle axios errors and transform them to match our API response format
    if (error.response) {
      const errorData = error.response.data;
      const contentType = error.response.headers?.["content-type"] || "";

      // Check if response is HTML instead of JSON (e.g., Cloudflare protection page)
      if (
        typeof errorData === "string" &&
        (errorData.includes("<html") ||
          errorData.includes("<!DOCTYPE") ||
          contentType.includes("text/html"))
      ) {
        // Log the actual URL being called for debugging
        if (__DEV__) {
          const requestUrl = error.config?.url
            ? `${error.config.baseURL}${error.config.url}`
            : "unknown";
          console.error(
            `[API Error] Server returned HTML instead of JSON. Request URL: ${requestUrl}`
          );
        }

        throw {
          success: false,
          code: error.response.status || 500,
          message:
            "Server returned an unexpected response. Please verify your API base URL is correct.",
        };
      }

      // Server responded with error status - try to parse as JSON
      if (typeof errorData === "object" && errorData !== null) {
        throw {
          success: false,
          code: errorData.code || error.response.status,
          message: errorData.message || "An error occurred",
          errors: errorData.errors,
        };
      }

      // If we can't parse the error data, return a generic message
      throw {
        success: false,
        code: error.response.status || 500,
        message: "An error occurred. Please try again.",
      };
    } else if (error.request) {
      // Request was made but no response received
      throw {
        success: false,
        code: 0,
        message: "Network error. Please check your connection.",
      };
    } else {
      // Something else happened
      throw {
        success: false,
        code: 500,
        message: error.message || "An unexpected error occurred",
      };
    }
  }
};

/**
 * Logout investor
 */
export const logoutInvestor = async (): Promise<ApiResponse<null>> => {
  try {
    const response = await httpClient.post<ApiResponse<null>>(
      endpoints.auth.logout
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const errorData = error.response.data;
      throw {
        success: false,
        code: errorData.code || error.response.status,
        message: errorData.message || "Logout failed",
        errors: errorData.errors,
      };
    }
    throw {
      success: false,
      code: 500,
      message: error.message || "An unexpected error occurred",
    };
  }
};

/**
 * Change password
 */
export const changePassword = async (
  passwords: ChangePasswordRequest
): Promise<ApiResponse<null>> => {
  try {
    const response = await httpClient.post<ApiResponse<null>>(
      endpoints.auth.changePassword,
      passwords
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const errorData = error.response.data;
      const contentType = error.response.headers?.["content-type"] || "";

      // Check if response is HTML instead of JSON
      if (
        typeof errorData === "string" &&
        (errorData.includes("<html") ||
          errorData.includes("<!DOCTYPE") ||
          contentType.includes("text/html"))
      ) {
        if (__DEV__) {
          const requestUrl = error.config?.url
            ? `${error.config.baseURL}${error.config.url}`
            : "unknown";
          console.error(
            `[API Error] Server returned HTML instead of JSON. Request URL: ${requestUrl}`
          );
        }

        throw {
          success: false,
          code: error.response.status || 500,
          message:
            "Server returned an unexpected response. Please verify your API base URL is correct.",
        };
      }

      if (typeof errorData === "object" && errorData !== null) {
        throw {
          success: false,
          code: errorData.code || error.response.status,
          message: errorData.message || "Password change failed",
          errors: errorData.errors,
        };
      }

      throw {
        success: false,
        code: error.response.status || 500,
        message: "Failed to change password",
      };
    } else if (error.request) {
      throw {
        success: false,
        code: 0,
        message: "Network error. Please check your connection.",
      };
    } else {
      throw {
        success: false,
        code: 500,
        message: error.message || "An unexpected error occurred",
      };
    }
  }
};

/**
 * Enable biometric authentication for device
 */
export const enableBiometric = async (
  request: BiometricEnableRequest
): Promise<BiometricEnableResponseType> => {
  try {
    const response = await httpClient.post<BiometricEnableResponseType>(
      endpoints.auth.biometric.enable,
      request
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const errorData = error.response.data;
      throw {
        success: false,
        code: errorData.code || error.response.status,
        message: errorData.message || "Failed to enable biometric",
        errors: errorData.errors,
      };
    }
    throw {
      success: false,
      code: 500,
      message: error.message || "An unexpected error occurred",
    };
  }
};

/**
 * Disable biometric authentication for device
 */
export const disableBiometric = async (
  request: BiometricDisableRequest
): Promise<ApiResponse<null>> => {
  try {
    const response = await httpClient.post<ApiResponse<null>>(
      endpoints.auth.biometric.disable,
      request
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const errorData = error.response.data;
      throw {
        success: false,
        code: errorData.code || error.response.status,
        message: errorData.message || "Failed to disable biometric",
        errors: errorData.errors,
      };
    }
    throw {
      success: false,
      code: 500,
      message: error.message || "An unexpected error occurred",
    };
  }
};

/**
 * Login with biometric token
 */
export const loginWithBiometric = async (
  request: BiometricLoginRequest
): Promise<LoginResponse> => {
  try {
    const response = await httpClient.post<LoginResponse>(
      endpoints.auth.biometric.login,
      request
    );

    // If login is successful, store the token and currency
    if (response.data.success && response.data.data?.token) {
      await setAuthToken(response.data.data.token);

      // Store currency from company data
      if (response.data.data.company?.currency) {
        await storeCurrency(response.data.data.company.currency);
      }
    }

    return response.data;
  } catch (error: any) {
    if (error.response) {
      const errorData = error.response.data;
      const contentType = error.response.headers?.["content-type"] || "";

      if (
        typeof errorData === "string" &&
        (errorData.includes("<html") ||
          errorData.includes("<!DOCTYPE") ||
          contentType.includes("text/html"))
      ) {
        if (__DEV__) {
          const requestUrl = error.config?.url
            ? `${error.config.baseURL}${error.config.url}`
            : "unknown";
          console.error(
            `[API Error] Server returned HTML instead of JSON. Request URL: ${requestUrl}`
          );
        }

        throw {
          success: false,
          code: error.response.status || 500,
          message:
            "Server returned an unexpected response. Please verify your API base URL is correct.",
        };
      }

      if (typeof errorData === "object" && errorData !== null) {
        throw {
          success: false,
          code: errorData.code || error.response.status,
          message: errorData.message || "Biometric login failed",
          errors: errorData.errors,
        };
      }

      throw {
        success: false,
        code: error.response.status || 500,
        message: "Biometric login failed",
      };
    } else if (error.request) {
      throw {
        success: false,
        code: 0,
        message: "Network error. Please check your connection.",
      };
    } else {
      throw {
        success: false,
        code: 500,
        message: error.message || "An unexpected error occurred",
      };
    }
  }
};

/**
 * Get biometric status
 */
export const getBiometricStatus = async (): Promise<BiometricStatusResponseType> => {
  try {
    const response = await httpClient.get<BiometricStatusResponseType>(
      endpoints.auth.biometric.status
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const errorData = error.response.data;
      throw {
        success: false,
        code: errorData.code || error.response.status,
        message: errorData.message || "Failed to get biometric status",
        errors: errorData.errors,
      };
    }
    throw {
      success: false,
      code: 500,
      message: error.message || "An unexpected error occurred",
    };
  }
};
