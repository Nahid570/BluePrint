import { endpoints } from "./endpoints";
import { httpClient } from "./httpClient";
import { ReportResponse } from "./types";

/**
 * Get investment report
 */
export const getReport = async (): Promise<ReportResponse> => {
  try {
    const response = await httpClient.get<ReportResponse>(
      endpoints.report.get
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
          message: errorData.message || "Failed to fetch report data",
          errors: errorData.errors,
        };
      }

      throw {
        success: false,
        code: error.response.status || 500,
        message: "Failed to fetch report data",
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


