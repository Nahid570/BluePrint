import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  SectionList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { useCurrency } from "../../../hooks/useCurrency";
import { getClubs } from "../../../services/api/clubs";
import { Club } from "../../../services/api/types";

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

export default function ClubsScreen() {
  const router = useRouter();
  const { formatCurrency } = useCurrency();
  const [activeFilter, setActiveFilter] = useState<
    "live" | "ongoing" | "settled"
  >("live");

  const {
    data: clubsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["clubs", activeFilter],
    queryFn: () => getClubs({ type: activeFilter }),
  });

  const clubs = clubsResponse?.data || [];

  const StatCard = ({ icon, label, value, color }: any) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={scale(20)} color={color} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );

  const ClubCard = React.memo(({ item }: { item: Club }) => {
    const categoryColor = useMemo(
      () => getCategoryColor(item.category.color),
      [item.category.color]
    );
    const riskColor = useMemo(
      () => getRiskColor(item.risk_level),
      [item.risk_level]
    );
    const sharePriceFormatted = useMemo(
      () => formatCurrency(item.share_price),
      [item.share_price]
    );

    const handlePress = () => {
      router.push(`/(protected)/clubs/${item.id}`);
    };

    return (
      <TouchableOpacity
        style={styles.clubCard}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.clubHeader}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: categoryColor + "20" },
            ]}
          >
            <Ionicons name="business" size={scale(16)} color={categoryColor} />
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {item.category.name}
            </Text>
          </View>
        </View>

        <Text style={styles.clubName}>{item.name}</Text>
        <Text style={styles.clubType}>{item.investment_type}</Text>

        <View style={styles.clubStats}>
          <View style={styles.statItem}>
            <Text style={styles.statItemLabel}>Share Price</Text>
            <Text style={styles.statItemValue}>{sharePriceFormatted}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statItemLabel}>Expected Return</Text>
            <Text style={[styles.statItemValue, { color: "#10B981" }]}>
              {item.expected_return}%
            </Text>
          </View>
        </View>

        <View style={styles.clubFooter}>
          <View style={styles.footerItem}>
            <Ionicons name="people-outline" size={scale(14)} color="#94A3B8" />
            <Text style={styles.footerText}>
              {item.current_members}/{item.max_members} members
            </Text>
          </View>
          <View style={styles.footerItem}>
            <Ionicons name="time-outline" size={scale(14)} color="#94A3B8" />
            <Text style={styles.footerText}>
              {item.investment_horizon_label}
            </Text>
          </View>
          <View
            style={[styles.riskBadge, { backgroundColor: riskColor + "20" }]}
          >
            <Text style={[styles.riskText, { color: riskColor }]}>
              {item.risk_level}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  });

  ClubCard.displayName = "ClubCard";

  const renderSectionHeader = () => (
    <View style={styles.stickyHeaderContainer}>
      <View style={styles.filterWrapper}>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === "live" && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter("live")}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === "live" && styles.filterTabTextActive,
              ]}
            >
              Live
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === "ongoing" && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter("ongoing")}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === "ongoing" && styles.filterTabTextActive,
              ]}
            >
              Ongoing
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === "settled" && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter("settled")}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === "settled" && styles.filterTabTextActive,
              ]}
            >
              Settled
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Loading clubs...</Text>
          </View>
        ) : error ? (
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
                return "Failed to load clubs. Please try again.";
              })()}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => refetch()}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <SectionList
            sections={[{ data: clubs }]}
            renderItem={({ item }) => <ClubCard item={item} />}
            keyExtractor={(item) => item.id.toString()}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={10}
            windowSize={10}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={true}
            renderSectionHeader={renderSectionHeader}
            ListHeaderComponent={
              <View style={styles.summaryContainer}>
                <StatCard
                  icon="briefcase"
                  label="Active Clubs"
                  value={clubs.length}
                  color="#3B82F6"
                />
                <StatCard
                  icon="trending-up"
                  label="Total Investment"
                  value={formatCurrency(
                    clubs.reduce((sum, club) => sum + club.total_investment, 0)
                  )}
                  color="#8B5CF6"
                />
                <StatCard
                  icon="cash"
                  label="Total Profit"
                  value={formatCurrency(
                    clubs.reduce(
                      (sum, club) =>
                        sum +
                        (club.total_investment * club.expected_return) / 100,
                      0
                    )
                  )}
                  color="#10B981"
                />
                <StatCard
                  icon="stats-chart"
                  label="Avg Return"
                  value={`${clubs.length > 0
                      ? (
                        clubs.reduce(
                          (sum, club) => sum + club.expected_return,
                          0
                        ) / clubs.length
                      ).toFixed(2)
                      : 0
                    }%`}
                  color="#F59E0B"
                />
              </View>
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons
                  name="business-outline"
                  size={scale(64)}
                  color="#CBD5E1"
                />
                <Text style={styles.emptyText}>No clubs found</Text>
                <Text style={styles.emptySubtext}>
                  No {activeFilter} clubs available at the moment
                </Text>
              </View>
            }
            refreshing={isLoading}
            onRefresh={refetch}
          />
        )}
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
  summaryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingTop: verticalScale(16),
    gap: scale(12),
    marginBottom: verticalScale(20),
  },
  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    padding: moderateScale(16),
    borderRadius: moderateScale(16),
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(10),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(8),
  },
  statLabel: {
    fontSize: moderateScale(11),
    color: "#64748B",
    marginBottom: verticalScale(4),
    fontFamily: "Outfit_400Regular",
  },
  statValue: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "#1E293B",
    fontFamily: "Outfit_700Bold",
  },
  stickyHeaderContainer: {
    backgroundColor: "#F8FAFC",
    paddingBottom: verticalScale(16),
  },
  filterWrapper: {
    paddingHorizontal: moderateScale(20),
    alignItems: "center",
  },
  filterContainer: {
    flexDirection: "row",
    gap: scale(12),
    justifyContent: "center",
  },
  filterTab: {
    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(12),
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  filterTabActive: {
    backgroundColor: "#2563EB",
  },
  filterTabText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#64748B",
    fontFamily: "Outfit_500Medium",
  },
  filterTabTextActive: {
    color: "#FFFFFF",
  },
  listContainer: {
    paddingHorizontal: moderateScale(20),
    paddingBottom: verticalScale(20),
  },
  clubCard: {
    backgroundColor: "#FFFFFF",
    padding: moderateScale(16),
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(12),
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  clubHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(12),
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
    borderRadius: scale(8),
    gap: scale(6),
  },
  categoryText: {
    fontSize: moderateScale(11),
    fontWeight: "600",
    fontFamily: "Outfit_500Medium",
  },
  memberBadge: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: scale(6),
  },
  memberText: {
    fontSize: moderateScale(10),
    fontWeight: "600",
    color: "#10B981",
    fontFamily: "Outfit_500Medium",
  },
  clubName: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: verticalScale(4),
    fontFamily: "Outfit_700Bold",
  },
  clubType: {
    fontSize: moderateScale(12),
    color: "#64748B",
    marginBottom: verticalScale(12),
    fontFamily: "Outfit_400Regular",
  },
  clubStats: {
    flexDirection: "row",
    gap: scale(16),
    marginBottom: verticalScale(12),
    paddingBottom: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  statItem: {
    flex: 1,
  },
  statItemLabel: {
    fontSize: moderateScale(11),
    color: "#94A3B8",
    marginBottom: verticalScale(4),
    fontFamily: "Outfit_400Regular",
  },
  statItemValue: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#1E293B",
    fontFamily: "Outfit_500Medium",
  },
  clubFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(12),
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
  },
  footerText: {
    fontSize: moderateScale(11),
    color: "#94A3B8",
    fontFamily: "Outfit_400Regular",
  },
  riskBadge: {
    marginLeft: "auto",
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: scale(6),
  },
  riskText: {
    fontSize: moderateScale(10),
    fontWeight: "600",
    textTransform: "capitalize",
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
