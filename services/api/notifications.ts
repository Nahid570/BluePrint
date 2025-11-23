import { endpoints } from "./endpoints";
import { httpClient } from "./httpClient";
import {
  NotificationsListResponse,
  UnreadCountResponse,
  MarkAsReadResponse,
  MarkAllAsReadResponse,
  ApiResponse,
} from "./types";

export interface NotificationsListParams {
  page?: number;
  per_page?: number;
  read?: "all" | "read" | "unread";
}

/**
 * Get notifications list
 */
export const getNotifications = async (
  params?: NotificationsListParams
): Promise<NotificationsListResponse> => {
  try {
    const response = await httpClient.get<NotificationsListResponse>(
      endpoints.notifications.list,
      { params }
    );
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
          message: errorData.message || "Failed to fetch notifications",
          errors: errorData.errors,
        };
      }

      throw {
        success: false,
        code: error.response.status || 500,
        message: "Failed to fetch notifications",
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
 * Get unread notifications count
 */
export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  try {
    const response = await httpClient.get<UnreadCountResponse>(
      endpoints.notifications.unreadCount
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const errorData = error.response.data;
      throw {
        success: false,
        code: errorData.code || error.response.status,
        message: errorData.message || "Failed to fetch unread count",
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
 * Mark notification as read
 */
export const markNotificationAsRead = async (
  id: string
): Promise<MarkAsReadResponse> => {
  try {
    const response = await httpClient.post<MarkAsReadResponse>(
      endpoints.notifications.markAsRead(id)
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const errorData = error.response.data;
      throw {
        success: false,
        code: errorData.code || error.response.status,
        message: errorData.message || "Failed to mark notification as read",
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
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead =
  async (): Promise<MarkAllAsReadResponse> => {
    try {
      const response = await httpClient.post<MarkAllAsReadResponse>(
        endpoints.notifications.markAllAsRead
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        const errorData = error.response.data;
        throw {
          success: false,
          code: errorData.code || error.response.status,
          message:
            errorData.message || "Failed to mark all notifications as read",
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
 * Delete notification
 */
export const deleteNotification = async (
  id: string
): Promise<ApiResponse<null>> => {
  try {
    const response = await httpClient.delete<ApiResponse<null>>(
      endpoints.notifications.delete(id)
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const errorData = error.response.data;
      throw {
        success: false,
        code: errorData.code || error.response.status,
        message: errorData.message || "Failed to delete notification",
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

