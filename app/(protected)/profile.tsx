import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as DocumentPicker from "expo-document-picker";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { useSession } from "../../context/AuthContext";
import { useCurrency } from "../../hooks/useCurrency";
import { getProfile, updateAvatar } from "../../services/api/profile";

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useSession();
  const queryClient = useQueryClient();
  const { formatCurrency } = useCurrency();
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  }>({ type: "success", title: "", message: "" });

  // Fetch profile data
  const {
    data: profileResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  // Avatar update mutation
  const updateAvatarMutation = useMutation({
    mutationFn: updateAvatar,
    onSuccess: (data) => {
      queryClient.setQueryData(["profile"], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            avatar: data?.data?.avatar,
          },
        };
      });
      setFeedbackModal({
        type: "success",
        title: "Success",
        message: "Avatar updated successfully",
      });
      setShowFeedbackModal(true);
    },
    onError: (error: any) => {
      setFeedbackModal({
        type: "error",
        title: "Error",
        message: error.message || "Failed to update avatar",
      });
      setShowFeedbackModal(true);
    },
  });

  const handleAvatarUpdate = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/jpeg", "image/png", "image/webp"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];

      // Check file size (10MB limit)
      if (file.size && file.size > 10 * 1024 * 1024) {
        setFeedbackModal({
          type: "error",
          title: "Error",
          message: "Image size must be less than 10MB",
        });
        setShowFeedbackModal(true);
        return;
      }

      updateAvatarMutation.mutate(file);
    } catch (err) {
      setFeedbackModal({
        type: "error",
        title: "Error",
        message: "Failed to pick image",
      });
      setShowFeedbackModal(true);
    }
  };

  const handleSignOut = () => {
    setShowSignOutModal(true);
  };

  const confirmSignOut = () => {
    setShowSignOutModal(false);
    signOut();
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !profileResponse?.data) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={scale(48)} color="#EF4444" />
          <Text style={styles.errorText}>
            {(error as any)?.message || "Failed to load profile"}
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

  const profileData = profileResponse.data;

  const InfoRow = ({
    icon,
    label,
    value,
  }: {
    icon: any;
    label: string;
    value: string | null;
  }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoIconContainer}>
        <Ionicons name={icon} size={scale(18)} color="#64748B" />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || "Not set"}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handleAvatarUpdate}
            disabled={updateAvatarMutation.isPending}
          >
            {profileData.avatar ? (
              <Image
                source={{ uri: profileData.avatar }}
                style={[styles.avatar, updateAvatarMutation.isPending && { opacity: 0.5 }]}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>
                  {profileData.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            {updateAvatarMutation.isPending && (
              <View style={styles.avatarLoadingOverlay}>
                <ActivityIndicator size="small" color="#2563EB" />
              </View>
            )}

            {!updateAvatarMutation.isPending && (
              <View style={styles.editAvatarBadge}>
                <Ionicons name="camera" size={scale(14)} color="#FFFFFF" />
              </View>
            )}

            <View style={styles.statusBadge}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      profileData.status === "active" ? "#10B981" : "#EF4444",
                  },
                ]}
              />
            </View>
          </TouchableOpacity>
          <Text style={styles.name}>{profileData.name}</Text>
          <View style={styles.idBadge}>
            <Text style={styles.idText}>ID: {profileData.investor_id}</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statGridCard}>
            <Text style={styles.statGridLabel}>Total Shares</Text>
            <Text style={styles.statGridValue}>{profileData.share_quantity}</Text>
          </View>
          <View style={styles.statGridCard}>
            <Text style={styles.statGridLabel}>Wallet Balance</Text>
            <Text style={styles.statGridValue}>
              {formatCurrency(profileData.balance)}
            </Text>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <TouchableOpacity
              onPress={() => router.push("/(protected)/edit-profile")}
            >
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            <InfoRow
              icon="mail-outline"
              label="Email"
              value={profileData.email}
            />
            <View style={styles.divider} />
            <InfoRow
              icon="call-outline"
              label="Phone"
              value={profileData.phone || null}
            />
            <View style={styles.divider} />
            <InfoRow
              icon="location-outline"
              label="Address"
              value={
                profileData.address && profileData.city && profileData.country
                  ? `${profileData.address}, ${profileData.city}, ${profileData.country}`
                  : profileData.address ||
                  profileData.city ||
                  profileData.country ||
                  null
              }
            />
          </View>
        </View>

        {/* Personal Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Details</Text>
          </View>
          <View style={styles.card}>
            <InfoRow
              icon="calendar-outline"
              label="Date of Birth"
              value={profileData.date_of_birth || null}
            />
            <View style={styles.divider} />
            <InfoRow
              icon="person-outline"
              label="Gender"
              value={
                profileData.gender
                  ? profileData.gender.charAt(0).toUpperCase() +
                  profileData.gender.slice(1)
                  : null
              }
            />
            <View style={styles.divider} />
            <InfoRow
              icon="heart-outline"
              label="Marital Status"
              value={
                profileData.marital_status
                  ? profileData.marital_status.charAt(0).toUpperCase() +
                  profileData.marital_status.slice(1)
                  : null
              }
            />
          </View>
        </View>

        {/* Settings & Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => router.push("/(protected)/change-password")}
            >
              <View style={styles.actionLeft}>
                <View
                  style={[styles.actionIcon, { backgroundColor: "#EFF6FF" }]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={scale(20)}
                    color="#3B82F6"
                  />
                </View>
                <Text style={styles.actionLabel}>Change Password</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={scale(20)}
                color="#94A3B8"
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.actionRow} onPress={handleSignOut}>
              <View style={styles.actionLeft}>
                <View
                  style={[styles.actionIcon, { backgroundColor: "#FEF2F2" }]}
                >
                  <Ionicons
                    name="log-out-outline"
                    size={scale(20)}
                    color="#EF4444"
                  />
                </View>
                <Text style={[styles.actionLabel, { color: "#EF4444" }]}>
                  Sign Out
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Sign Out Confirmation Modal */}
      <Modal
        visible={showSignOutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSignOutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <View style={styles.modalIcon}>
                <Ionicons name="log-out-outline" size={scale(32)} color="#EF4444" />
              </View>
            </View>

            <Text style={styles.modalTitle}>Sign Out</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to sign out? You'll need to log in again to access your account.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowSignOutModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={confirmSignOut}
              >
                <Text style={styles.modalConfirmText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Feedback Modal */}
      <Modal
        visible={showFeedbackModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFeedbackModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <View style={[
                styles.modalIcon,
                { backgroundColor: feedbackModal.type === "success" ? "#ECFDF5" : "#FEF2F2" }
              ]}>
                <Ionicons
                  name={feedbackModal.type === "success" ? "checkmark-circle" : "alert-circle"}
                  size={scale(32)}
                  color={feedbackModal.type === "success" ? "#10B981" : "#EF4444"}
                />
              </View>
            </View>

            <Text style={styles.modalTitle}>{feedbackModal.title}</Text>
            <Text style={styles.modalMessage}>{feedbackModal.message}</Text>

            <TouchableOpacity
              style={[
                styles.feedbackModalButton,
                { backgroundColor: feedbackModal.type === "success" ? "#10B981" : "#EF4444" }
              ]}
              onPress={() => setShowFeedbackModal(false)}
            >
              <Text style={styles.feedbackModalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    padding: moderateScale(20),
  },
  header: {
    alignItems: "center",
    marginBottom: verticalScale(24),
  },
  avatarContainer: {
    position: "relative",
    marginBottom: verticalScale(12),
  },
  avatar: {
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  statusBadge: {
    position: "absolute",
    bottom: scale(4),
    right: scale(4),
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  statusDot: {
    width: scale(16),
    height: scale(16),
    borderRadius: scale(8),
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  name: {
    fontSize: moderateScale(24),
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: verticalScale(4),
    fontFamily: "Outfit_700Bold",
  },
  idBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(4),
    borderRadius: scale(12),
  },
  idText: {
    fontSize: moderateScale(12),
    color: "#3B82F6",
    fontWeight: "600",
    fontFamily: "Outfit_500Medium",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(12),
    marginBottom: verticalScale(24),
  },
  statGridCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconWrapper: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(10),
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(8),
  },
  statGridLabel: {
    fontSize: moderateScale(11),
    color: "#64748B",
    marginBottom: verticalScale(4),
    fontFamily: "Outfit_400Regular",
  },
  statGridValue: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "#1E293B",
    fontFamily: "Outfit_700Bold",
  },
  section: {
    marginBottom: verticalScale(24),
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(12),
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "#1E293B",
    fontFamily: "Outfit_700Bold",
    marginBottom: verticalScale(12),
  },
  editLink: {
    fontSize: moderateScale(14),
    color: "#3B82F6",
    fontWeight: "600",
    fontFamily: "Outfit_500Medium",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(8),
  },
  infoIconContainer: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(8),
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(12),
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: moderateScale(12),
    color: "#94A3B8",
    marginBottom: verticalScale(2),
    fontFamily: "Outfit_400Regular",
  },
  infoValue: {
    fontSize: moderateScale(14),
    color: "#1E293B",
    fontWeight: "500",
    fontFamily: "Outfit_500Medium",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: verticalScale(8),
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: verticalScale(8),
  },
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionIcon: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(10),
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(12),
  },
  actionLabel: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#1E293B",
    fontFamily: "Outfit_500Medium",
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
  avatarPlaceholder: {
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: moderateScale(32),
    fontWeight: "700",
    color: "#3B82F6",
    fontFamily: "Outfit_700Bold",
  },
  avatarLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: scale(50),
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  editAvatarBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: moderateScale(20),
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(20),
    padding: moderateScale(24),
    width: "100%",
    maxWidth: scale(340),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalIconContainer: {
    alignItems: "center",
    marginBottom: verticalScale(16),
  },
  modalIcon: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(32),
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: moderateScale(20),
    fontWeight: "700",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: verticalScale(8),
    fontFamily: "Outfit_700Bold",
  },
  modalMessage: {
    fontSize: moderateScale(14),
    color: "#64748B",
    textAlign: "center",
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(24),
    fontFamily: "Outfit_400Regular",
  },
  modalButtons: {
    flexDirection: "row",
    gap: scale(12),
  },
  modalButton: {
    flex: 1,
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(12),
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelButton: {
    backgroundColor: "#F1F5F9",
  },
  modalConfirmButton: {
    backgroundColor: "#EF4444",
  },
  modalCancelText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#64748B",
    fontFamily: "Outfit_600SemiBold",
  },
  modalConfirmText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "Outfit_600SemiBold",
  },
  feedbackModalButton: {
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    alignItems: "center",
    justifyContent: "center",
    marginTop: verticalScale(8),
  },
  feedbackModalButtonText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "Outfit_600SemiBold",
  },
});
