// API Endpoints - Organized by feature
export const endpoints = {
  // Auth endpoints
  auth: {
    login: "/api/investor/login",
    logout: "/api/investor/logout",
    changePassword: "/api/investor/change-password",
    biometric: {
      enable: "/api/investor/biometric/enable",
      disable: "/api/investor/biometric/disable",
      login: "/api/investor/biometric/login",
      status: "/api/investor/biometric/status",
    },
  },

  // Profile endpoints
  profile: {
    get: "/api/investor/profile",
    update: "/api/investor/profile",
    avatar: "/api/investor/profile/avatar",
  },

  // Clubs endpoints
  clubs: {
    list: "/api/investor/clubs",
    detail: (id: string | number) => `/api/investor/clubs/${id}`,
    joinRequest: (id: string | number) => `/api/investor/clubs/${id}/join-request`,
    invest: (id: string | number) => `/api/investor/clubs/${id}/invest`,
  },
  transactions: {
    list: "/api/investor/transactions",
    detail: (id: string | number) => `/api/investor/transactions/${id}`,
  },

  // Notifications endpoints
  notifications: {
    list: "/api/investor/notifications",
    unreadCount: "/api/investor/notifications/unread-count",
    markAsRead: (id: string) => `/api/investor/notifications/${id}/read`,
    markAllAsRead: "/api/investor/notifications/mark-all-read",
    delete: (id: string) => `/api/investor/notifications/${id}`,
  },

  // Dashboard endpoints
  dashboard: {
    get: "/api/investor/dashboard",
  },

  // Report endpoints
  report: {
    get: "/api/investor/report",
  },
} as const;

