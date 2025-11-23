import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { getClubDetail } from "../../../services/api/clubs";

const getCategoryColor = (color: string) => {
  const colors: any = {
    violet: "#8B5CF6",
    rose: "#F43F5E",
    red: "#EF4444",
    cyan: "#06B6D4",
    amber: "#F59E0B",
    gray: "#6B7280",
  };
  return colors[color] || "#64748B";
};

const getRiskColor = (risk: string) => {
  const colors: any = {
    conservative: "#10B981",
    moderate: "#3B82F6",
    aggressive: "#F97316",
    speculative: "#EF4444",
  };
  return colors[risk] || "#64748B";
};

export default function ClubDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    data: clubResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["club-detail", id],
    queryFn: () => getClubDetail(id!),
    enabled: !!id,
  });

  const club = clubResponse?.data;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const InfoRow = ({
    label,
    value,
    icon,
  }: {
    label: string;
    value: string;
    icon?: any;
  }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        {icon && (
          <Ionicons
            name={icon}
            size={scale(16)}
            color="#94A3B8"
            style={{ marginRight: scale(8) }}
          />
        )}
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <Stack.Screen
          options={{
            presentation: "modal",
            headerShown: true,
            title: "Club Details",
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
          <Text style={styles.loadingText}>Loading club details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !club) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <Stack.Screen
          options={{
            presentation: "modal",
            headerShown: true,
            title: "Club Details",
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
            {(() => {
              const errorObj = error as any;
              if (errorObj?.message) {
                return errorObj.message;
              }
              if (errorObj?.response?.data?.message) {
                return errorObj.response.data.message;
              }
              return "Failed to load club details. Please try again.";
            })()}
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

  const categoryColor = getCategoryColor(club.category.color);
  const riskColor = getRiskColor(club.risk_level);
  const sharesProgress = (club.shares_sold / club.total_shares_available) * 100;

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          presentation: "modal",
          headerShown: true,
          title: "Club Details",
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: categoryColor + "20" },
            ]}
          >
            <Ionicons name="business" size={scale(18)} color={categoryColor} />
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {club.category.name}
            </Text>
          </View>
          <Text style={styles.clubName}>{club.name}</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  club.status === "active" ? "#ECFDF5" : "#FEF2F2",
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color: club.status === "active" ? "#10B981" : "#EF4444",
                },
              ]}
            >
              {club.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <Text style={styles.description}>{club.description}</Text>
          </View>
        </View>

        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.card}>
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Share Price</Text>
                <Text style={styles.metricValue}>
                  {formatCurrency(club.share_price)}
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Expected Return</Text>
                <Text style={[styles.metricValue, { color: "#10B981" }]}>
                  {club.expected_return}%
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Total Pool</Text>
                <Text style={styles.metricValue}>
                  {formatCurrency(club.total_investment_pool)}
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Members</Text>
                <Text style={styles.metricValue}>
                  {club.current_members}/{club.max_members}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Shares Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shares Availability</Text>
          <View style={styles.card}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>
                {club.shares_sold.toLocaleString()} /{" "}
                {club.total_shares_available.toLocaleString()} shares sold
              </Text>
              <Text style={styles.progressPercent}>
                {sharesProgress.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${sharesProgress}%`,
                    backgroundColor: categoryColor,
                  },
                ]}
              />
            </View>
            <View style={styles.progressFooter}>
              <Text style={styles.progressText}>
                {club.shares_remaining.toLocaleString()} shares remaining
              </Text>
            </View>
          </View>
        </View>

        {/* Investment Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Investment Details</Text>
          <View style={styles.card}>
            <InfoRow
              label="Investment Type"
              value={club.investment_type}
              icon="briefcase-outline"
            />
            <View style={styles.divider} />
            <InfoRow
              label="Geographic Focus"
              value={club.geographic_focus}
              icon="globe-outline"
            />
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <Ionicons
                  name="warning-outline"
                  size={scale(16)}
                  color="#94A3B8"
                  style={{ marginRight: scale(8) }}
                />
                <Text style={styles.infoLabel}>Risk Level</Text>
              </View>
              <View
                style={[
                  styles.riskBadge,
                  { backgroundColor: riskColor + "20" },
                ]}
              >
                <Text style={[styles.riskText, { color: riskColor }]}>
                  {club.risk_level}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <InfoRow
              label="Investment Horizon"
              value={club.investment_horizon_label}
              icon="time-outline"
            />
            <View style={styles.divider} />
            <InfoRow
              label="Liquidity Terms"
              value={club.liquidity_terms_label}
              icon="swap-horizontal-outline"
            />
            <View style={styles.divider} />
            <InfoRow
              label="Investment Strategy"
              value={club.investment_strategy}
              icon="trending-up-outline"
            />
            <View style={styles.divider} />
            <InfoRow
              label="Management Fee"
              value={`${club.management_fee}%`}
              icon="card-outline"
            />
            <View style={styles.divider} />
            <InfoRow
              label="Performance Fee"
              value={`${club.performance_fee}%`}
              icon="stats-chart-outline"
            />
          </View>
        </View>

        {/* Investment Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Investment Range</Text>
          <View style={styles.card}>
            <InfoRow
              label="Minimum Investment"
              value={formatCurrency(club.minimum_investment)}
              icon="arrow-down-circle-outline"
            />
            <View style={styles.divider} />
            <InfoRow
              label="Maximum Investment"
              value={formatCurrency(club.maximum_investment)}
              icon="arrow-up-circle-outline"
            />
          </View>
        </View>

        {/* Documents */}
        {club.public_documents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Documents</Text>
            <View style={styles.card}>
              {club.public_documents.map((doc, index) => (
                <View key={doc.id}>
                  {index > 0 && <View style={styles.divider} />}
                  <TouchableOpacity
                    style={styles.documentItem}
                    onPress={() => Linking.openURL(doc.file_url)}
                  >
                    <View style={styles.documentLeft}>
                      <Ionicons
                        name="document-text"
                        size={scale(20)}
                        color="#3B82F6"
                      />
                      <View style={styles.documentInfo}>
                        <Text style={styles.documentTitle}>{doc.title}</Text>
                        <Text style={styles.documentType}>
                          {doc.document_type.replace("_", " ")}
                        </Text>
                      </View>
                    </View>
                    <Ionicons
                      name="download-outline"
                      size={scale(20)}
                      color="#94A3B8"
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Activity Log */}
        {club.activities && club.activities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.card}>
              {club.activities.map((activity, index) => (
                <View key={index}>
                  {index > 0 && <View style={styles.divider} />}
                  <View style={styles.activityItem}>
                    <Ionicons
                      name="time-outline"
                      size={scale(16)}
                      color="#94A3B8"
                    />
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityDescription}>
                        {activity.description}
                      </Text>
                      <Text style={styles.activityMeta}>
                        {activity.causer_name} • {activity.created_at_human}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
  headerCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: moderateScale(24),
    borderRadius: moderateScale(20),
    marginBottom: verticalScale(20),
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: scale(8),
    gap: scale(6),
    marginBottom: verticalScale(12),
  },
  categoryText: {
    fontSize: moderateScale(12),
    fontWeight: "600",
    fontFamily: "Outfit_500Medium",
  },
  clubName: {
    fontSize: moderateScale(20),
    fontWeight: "700",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: verticalScale(12),
    fontFamily: "Outfit_700Bold",
  },
  statusBadge: {
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: scale(8),
  },
  statusText: {
    fontSize: moderateScale(11),
    fontWeight: "600",
    fontFamily: "Outfit_500Medium",
  },
  section: {
    marginBottom: verticalScale(20),
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: verticalScale(12),
    fontFamily: "Outfit_700Bold",
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
  description: {
    fontSize: moderateScale(14),
    color: "#475569",
    lineHeight: moderateScale(22),
    fontFamily: "Outfit_400Regular",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(16),
  },
  metricItem: {
    width: "47%",
  },
  metricLabel: {
    fontSize: moderateScale(12),
    color: "#94A3B8",
    marginBottom: verticalScale(4),
    fontFamily: "Outfit_400Regular",
  },
  metricValue: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: "#1E293B",
    fontFamily: "Outfit_700Bold",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(8),
  },
  progressLabel: {
    fontSize: moderateScale(13),
    color: "#64748B",
    fontFamily: "Outfit_400Regular",
  },
  progressPercent: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#1E293B",
    fontFamily: "Outfit_500Medium",
  },
  progressBar: {
    height: verticalScale(8),
    backgroundColor: "#F1F5F9",
    borderRadius: scale(4),
    overflow: "hidden",
    marginBottom: verticalScale(8),
  },
  progressFill: {
    height: "100%",
    borderRadius: scale(4),
  },
  progressFooter: {
    alignItems: "flex-end",
  },
  progressText: {
    fontSize: moderateScale(12),
    color: "#94A3B8",
    fontFamily: "Outfit_400Regular",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: verticalScale(8),
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 0.5,
  },
  infoLabel: {
    fontSize: moderateScale(12),
    color: "#64748B",
    fontFamily: "Outfit_400Regular",
  },
  infoValue: {
    fontSize: moderateScale(12),
    fontWeight: "600",
    color: "#1E293B",
    textAlign: "right",
    flex: 0.5,
    fontFamily: "Outfit_500Medium",
  },
  riskBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: scale(6),
  },
  riskText: {
    fontSize: moderateScale(11),
    fontWeight: "600",
    textTransform: "capitalize",
    fontFamily: "Outfit_500Medium",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },
  documentItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: verticalScale(8),
  },
  documentLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: scale(12),
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: verticalScale(2),
    fontFamily: "Outfit_500Medium",
  },
  documentType: {
    fontSize: moderateScale(11),
    color: "#94A3B8",
    textTransform: "capitalize",
    fontFamily: "Outfit_400Regular",
  },
  activityItem: {
    flexDirection: "row",
    paddingVertical: verticalScale(8),
    gap: scale(12),
  },
  activityInfo: {
    flex: 1,
  },
  activityDescription: {
    fontSize: moderateScale(13),
    color: "#1E293B",
    marginBottom: verticalScale(4),
    fontFamily: "Outfit_400Regular",
  },
  activityMeta: {
    fontSize: moderateScale(11),
    color: "#94A3B8",
    fontFamily: "Outfit_400Regular",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: verticalScale(60),
  },
  loadingText: {
    marginTop: verticalScale(16),
    fontSize: moderateScale(14),
    color: "#64748B",
    fontFamily: "Outfit_400Regular",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: verticalScale(60),
    paddingHorizontal: moderateScale(20),
  },
  errorText: {
    marginTop: verticalScale(16),
    fontSize: moderateScale(16),
    color: "#EF4444",
    textAlign: "center",
    fontFamily: "Outfit_500Medium",
    marginBottom: verticalScale(24),
  },
  retryButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: moderateScale(24),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(12),
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: moderateScale(14),
    fontWeight: "600",
    fontFamily: "Outfit_500Medium",
  },
});
