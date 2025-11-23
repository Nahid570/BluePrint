import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import {
  deleteNotification,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../services/api/notifications";

const getNotificationIcon = (type: string) => {
  const icons: any = {
    success: "checkmark-circle",
    info: "information-circle",
    warning: "warning",
    error: "close-circle",
  };
  return icons[type] || "notifications";
};

const getNotificationColor = (type: string) => {
  const colors: any = {
    success: "#10B981",
    info: "#3B82F6",
    warning: "#F59E0B",
    error: "#EF4444",
  };
  return colors[type] || "#64748B";
};

export default function NotificationsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  // Fetch notifications
  const {
    data: notificationsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["notifications", activeTab],
    queryFn: () =>
      getNotifications({
        page: 1,
        per_page: 15,
        read: activeTab === "unread" ? "unread" : "all",
      }),
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const notifications = notificationsResponse?.data?.notifications || [];
  const unreadCount = notificationsResponse?.data?.unread_count || 0;

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Notification",
      "Are you sure you want to delete this notification?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteMutation.mutate(id);
          },
        },
      ]
    );
  };

  const renderRightActions = (id: string) => (
    <TouchableOpacity
      style={styles.deleteAction}
      onPress={() => handleDelete(id)}
    >
      <Ionicons name="trash" size={scale(20)} color="#FFFFFF" />
      <Text style={styles.deleteText}>Delete</Text>
    </TouchableOpacity>
  );

  const NotificationItem = ({ item }: { item: any }) => {
    const color = getNotificationColor(item.notification_type);
    const icon = getNotificationIcon(item.notification_type);

    return (
      <Swipeable
        renderRightActions={() => renderRightActions(item.id)}
        overshootRight={false}
      >
        <TouchableOpacity
          style={[styles.notificationCard, !item.is_read && styles.unreadCard]}
          onPress={() => !item.is_read && handleMarkAsRead(item.id)}
          disabled={markAsReadMutation.isPending}
        >
          <View
            style={[styles.iconContainer, { backgroundColor: color + "20" }]}
          >
            <Ionicons name={icon} size={scale(24)} color={color} />
          </View>
          <View style={styles.contentContainer}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>{item.title}</Text>
              {!item.is_read && <View style={styles.unreadDot} />}
            </View>
            <Text style={styles.message} numberOfLines={2}>
              {item.message}
            </Text>
            <Text style={styles.time}>{item.created_at_human}</Text>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <Stack.Screen
          options={{
            presentation: "modal",
            headerShown: true,
            title: "Notifications",
            headerTitleStyle: {
              fontFamily: "Outfit_700Bold",
              fontSize: moderateScale(18),
              color: "#1E293B",
            },
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => router.back()}
                style={{ marginLeft: 10 }}
              >
                <Ionicons name="arrow-back" size={24} color="#1E293B" />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <Stack.Screen
          options={{
            presentation: "modal",
            headerShown: true,
            title: "Notifications",
            headerTitleStyle: {
              fontFamily: "Outfit_700Bold",
              fontSize: moderateScale(18),
              color: "#1E293B",
            },
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => router.back()}
                style={{ marginLeft: 10 }}
              >
                <Ionicons name="arrow-back" size={24} color="#1E293B" />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={scale(48)} color="#EF4444" />
          <Text style={styles.errorText}>
            {(error as any)?.message || "Failed to load notifications"}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetch()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          presentation: "modal",
          headerShown: true,
          title: "Notifications",
          headerTitleStyle: {
            fontFamily: "Outfit_700Bold",
            fontSize: moderateScale(18),
            color: "#1E293B",
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginLeft: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#1E293B" />
            </TouchableOpacity>
          ),
          headerRight: () =>
            unreadCount > 0 ? (
              <TouchableOpacity
                onPress={handleMarkAllAsRead}
                style={{ marginRight: 10 }}
                disabled={markAllAsReadMutation.isPending}
              >
                {markAllAsReadMutation.isPending ? (
                  <ActivityIndicator size="small" color="#2563EB" />
                ) : (
                  <Text style={styles.markAllText}>Mark All Read</Text>
                )}
              </TouchableOpacity>
            ) : null,
        }}
      />

      <View style={styles.content}>
        {/* Filter Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "all" && styles.tabActive]}
            onPress={() => setActiveTab("all")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "all" && styles.tabTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "unread" && styles.tabActive]}
            onPress={() => setActiveTab("unread")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "unread" && styles.tabTextActive,
              ]}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Notifications List */}
        <FlatList
          data={notifications}
          renderItem={({ item }) => <NotificationItem item={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={refetch}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name="notifications-off-outline"
                size={scale(64)}
                color="#CBD5E1"
              />
              <Text style={styles.emptyText}>No notifications</Text>
              <Text style={styles.emptySubtext}>
                {activeTab === "unread"
                  ? "You're all caught up!"
                  : "You don't have any notifications yet"}
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    flex: 1,
  },
  markAllText: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: "#2563EB",
    fontFamily: "Outfit_500Medium",
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(12),
    gap: scale(12),
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  tab: {
    flex: 1,
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(10),
    backgroundColor: "#F8FAFC",
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#2563EB",
  },
  tabText: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: "#64748B",
    fontFamily: "Outfit_500Medium",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  listContainer: {
    padding: moderateScale(20),
  },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: moderateScale(14),
    borderRadius: moderateScale(14),
    marginBottom: verticalScale(12),
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: "#EFF6FF",
    borderLeftWidth: 3,
    borderLeftColor: "#2563EB",
  },
  iconContainer: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(12),
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(12),
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(4),
  },
  title: {
    fontSize: moderateScale(14),
    fontWeight: "700",
    color: "#1E293B",
    flex: 1,
    fontFamily: "Outfit_700Bold",
  },
  unreadDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: "#2563EB",
    marginLeft: scale(8),
  },
  message: {
    fontSize: moderateScale(13),
    color: "#64748B",
    lineHeight: moderateScale(18),
    marginBottom: verticalScale(6),
    fontFamily: "Outfit_400Regular",
  },
  time: {
    fontSize: moderateScale(11),
    color: "#94A3B8",
    fontFamily: "Outfit_400Regular",
  },
  deleteAction: {
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    width: scale(80),
    borderRadius: moderateScale(14),
    marginBottom: verticalScale(12),
  },
  deleteText: {
    color: "#FFFFFF",
    fontSize: moderateScale(12),
    fontWeight: "600",
    marginTop: verticalScale(4),
    fontFamily: "Outfit_500Medium",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(60),
  },
  emptyText: {
    fontSize: moderateScale(18),
    fontWeight: "600",
    color: "#1E293B",
    marginTop: verticalScale(16),
    marginBottom: verticalScale(8),
    fontFamily: "Outfit_500Medium",
  },
  emptySubtext: {
    fontSize: moderateScale(14),
    color: "#94A3B8",
    textAlign: "center",
    fontFamily: "Outfit_400Regular",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: moderateScale(24),
  },
  loadingText: {
    marginTop: verticalScale(16),
    fontSize: moderateScale(16),
    color: "#64748B",
    fontFamily: "Outfit_400Regular",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: moderateScale(24),
  },
  errorText: {
    marginTop: verticalScale(16),
    fontSize: moderateScale(16),
    color: "#EF4444",
    textAlign: "center",
    fontFamily: "Outfit_400Regular",
    marginBottom: verticalScale(24),
  },
  retryButton: {
    backgroundColor: "#2563EB",
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(24),
    borderRadius: moderateScale(12),
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: moderateScale(16),
    fontWeight: "600",
    fontFamily: "Outfit_500Medium",
  },
});
