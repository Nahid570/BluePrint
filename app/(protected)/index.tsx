import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart, LineChart } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { useCurrency } from "../../hooks/useCurrency";
import { getDashboard } from "../../services/api/dashboard";
import { getProfile } from "../../services/api/profile";

const { width } = Dimensions.get("window");

// Helper function to format month label (e.g., "2025-08" -> "Aug")
const formatMonthLabel = (month: string): string => {
  const date = new Date(month + "-01");
  return date.toLocaleDateString("en-US", { month: "short" });
};

// Helper function to get time-based greeting
const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning,";
  if (hour < 17) return "Good Afternoon,";
  if (hour < 21) return "Good Evening,";
  return "Good Night,";
};


export default function DashboardScreen() {
  const router = useRouter();
  const { formatCurrency } = useCurrency();
  const [greeting, setGreeting] = useState(getGreeting());

  // Update greeting when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setGreeting(getGreeting());
    }, [])
  );

  // Fetch dashboard data - Auto-refresh every 30 seconds for fresh financial data
  const {
    data: dashboardResponse,
    isLoading: isLoadingDashboard,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
    // Refetch every 30 seconds to ensure fresh balance and investment data
    refetchInterval: 30 * 1000,
    // Always refetch when screen comes into focus
    refetchOnMount: "always",
  });

  // Fetch profile data - Auto-refresh every 60 seconds
  const {
    data: profileResponse,
    isLoading: isLoadingProfile,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    // Refetch every 60 seconds for profile data
    refetchInterval: 60 * 1000,
    refetchOnMount: "always",
  });

  const dashboard = dashboardResponse?.data;

  // Transform API data to match UI structure
  const dashboardData = useMemo(() => {
    if (!dashboard) {
      return null;
    }

    // Transform money flow graph
    const moneyFlowGraph = dashboard.money_flow_graph
      .filter((item) => item.inflow > 0 || item.outflow > 0) // Only show months with data
      .flatMap((item) => [
        {
          value: item.inflow,
          label: formatMonthLabel(item.month),
          frontColor: "#10B981",
        },
        { value: item.outflow, frontColor: "#EF4444" },
      ]);

    // Transform balance trend graph
    const balanceTrendGraph = dashboard.balance_trend_graph
      .filter((item) => item.balance > 0) // Only show months with balance
      .map((item) => ({
        value: item.balance,
        label: formatMonthLabel(item.month),
      }));

    // Transform profit trend graph
    const profitTrendGraph = dashboard.profit_trend_graph
      .filter((item) => item.profit > 0) // Only show months with profit
      .map((item) => ({
        value: item.profit,
        label: formatMonthLabel(item.month),
      }));

    // Transform investment vs profit graph
    const investmentVsProfitData = dashboard.investment_vs_profit_graph
      .filter((item) => item.investment > 0 || item.profit > 0)
      .map((item) => ({
        month: formatMonthLabel(item.month),
        investment: item.investment,
        profit: item.profit,
      }));

    const investmentData = investmentVsProfitData.map((item) => ({
      value: item.investment,
      label: item.month,
      dataPointText: "",
    }));

    const profitData = investmentVsProfitData.map((item) => ({
      value: item.profit,
      label: item.month,
      dataPointText: "",
    }));

    // Get top 3 transactions for summary from new API structure
    const transactionTypes = [
      { type: "deposit", label: "Deposit", data: dashboard.deposit },
      { type: "withdrawal", label: "Withdrawal", data: dashboard.withdrawal },
      { type: "profit", label: "Profit", data: dashboard.profit },
    ];

    const transactions = transactionTypes
      .map((t) => ({
        type: t.type,
        label: t.label,
        amount: t.data.amount,
        count: t.data.count,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    // Calculate dynamic max values for charts
    const moneyFlowMaxValue =
      moneyFlowGraph.length > 0
        ? Math.max(...moneyFlowGraph.map((item) => item.value)) * 1.2 // Add 20% padding
        : 2000000;

    const balanceTrendMaxValue =
      balanceTrendGraph.length > 0
        ? Math.max(...balanceTrendGraph.map((item) => item.value)) * 1.2 // Add 20% padding
        : 1500000;

    const profitTrendMaxValue =
      profitTrendGraph.length > 0
        ? Math.max(...profitTrendGraph.map((item) => item.value)) * 1.2 // Add 20% padding
        : 500000;

    const investmentVsProfitMaxValue =
      investmentData.length > 0 || profitData.length > 0
        ? Math.max(
            ...investmentData.map((item) => item.value),
            ...profitData.map((item) => item.value)
          ) * 1.2
        : 500000;

    return {
      available_balance: dashboard.available_balance,
      available_share_quantity: dashboard.available_share_quantity,
      available_share_amount: dashboard.available_share_amount,
      ongoing_clubs_count: dashboard.ongoing_clubs_count,
      pending_clubs_count: dashboard.pending_clubs_count,
      roi: dashboard.roi,
      balance_trend_graph: balanceTrendGraph,
      money_flow_graph: moneyFlowGraph,
      profit_trend_graph: profitTrendGraph,
      investment_data: investmentData,
      profit_data: profitData,
      balance_trend_max_value: balanceTrendMaxValue,
      money_flow_max_value: moneyFlowMaxValue,
      profit_trend_max_value: profitTrendMaxValue,
      investment_vs_profit_max_value: investmentVsProfitMaxValue,
      transactions,
    };
  }, [dashboard]);

  // Loading state
  const isLoading = isLoadingDashboard || isLoadingProfile;
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  const error = dashboardError || profileError;
  if (error || !dashboardData || !profileResponse?.data) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={scale(48)} color="#EF4444" />
          <Text style={styles.errorText}>
            {(error as any)?.message || "Failed to load dashboard data"}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              refetchDashboard();
              refetchProfile();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const userProfile = profileResponse.data;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingDashboard || isLoadingProfile}
            onRefresh={() => {
              refetchDashboard();
              refetchProfile();
            }}
            tintColor="#2563EB"
            colors={["#2563EB"]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.userName}>{userProfile.name}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.push("/(protected)/notifications")}
            >
              <Ionicons
                name="notifications-outline"
                size={scale(24)}
                color="#1E293B"
              />
              <View style={styles.badge} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.avatar,
                userProfile.avatar && { backgroundColor: "transparent" },
              ]}
              onPress={() => router.push("/(protected)/profile")}
            >
              {userProfile.avatar ? (
                <Image
                  source={{ uri: userProfile.avatar }}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
              ) : (
                <Text style={styles.avatarText}>
                  {userProfile.name.charAt(0).toUpperCase()}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Card */}
        <LinearGradient
          colors={["#2563EB", "#4F46E5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View>
            <Text style={styles.heroLabel}>Total Balance</Text>
            <Text style={styles.heroAmount}>
              {formatCurrency(dashboardData.available_balance)}
            </Text>
          </View>
        </LinearGradient>

        {/* Investment Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Investment Overview</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.investmentGrid}
          >
            <View style={styles.investmentCard}>
              <View
                style={[styles.investmentIcon, { backgroundColor: "#EFF6FF" }]}
              >
                <Ionicons name="briefcase" size={scale(18)} color="#3B82F6" />
              </View>
              <Text style={styles.investmentLabel}>Total Investment</Text>
              <Text style={styles.investmentValue}>
                {formatCurrency(dashboard?.investment?.amount ?? 0)}
              </Text>
            </View>
            <View style={styles.investmentCard}>
              <View
                style={[styles.investmentIcon, { backgroundColor: "#ECFDF5" }]}
              >
                <Ionicons name="cash" size={scale(18)} color="#10B981" />
              </View>
              <Text style={styles.investmentLabel}>Total Profit</Text>
              <Text style={[styles.investmentValue, { color: "#10B981" }]}>
                {formatCurrency(dashboard?.profit?.amount ?? 0)}
              </Text>
            </View>
            <View style={styles.investmentCard}>
              <View
                style={[styles.investmentIcon, { backgroundColor: "#FEF3C7" }]}
              >
                <Ionicons name="stats-chart" size={scale(18)} color="#F59E0B" />
              </View>
              <Text style={styles.investmentLabel}>ROI</Text>
              <Text style={[styles.investmentValue, { color: "#F59E0B" }]}>
                {dashboardData.roi.toFixed(2)}%
              </Text>
            </View>
          </ScrollView>
        </View>

        {/* Quick Stats Grid */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.gridContainer}
        >
          <View style={styles.gridItem}>
            <View style={[styles.gridIcon, { backgroundColor: "#EFF6FF" }]}>
              <Ionicons name="cube-outline" size={scale(20)} color="#3B82F6" />
            </View>
            <Text style={styles.gridValue}>
              {dashboardData.available_share_quantity}
            </Text>
            <Text style={styles.gridLabel}>Total Shares</Text>
          </View>
          <View style={styles.gridItem}>
            <View style={[styles.gridIcon, { backgroundColor: "#F5F3FF" }]}>
              <Ionicons
                name="business-outline"
                size={scale(20)}
                color="#8B5CF6"
              />
            </View>
            <Text style={styles.gridValue}>
              {dashboardData.ongoing_clubs_count}
            </Text>
            <Text style={styles.gridLabel}>Active Clubs</Text>
          </View>
          <View style={styles.gridItem}>
            <View style={[styles.gridIcon, { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="time-outline" size={scale(20)} color="#F59E0B" />
            </View>
            <Text style={styles.gridValue}>
              {dashboardData.pending_clubs_count}
            </Text>
            <Text style={styles.gridLabel}>Pending Clubs</Text>
          </View>
          <View style={styles.gridItem}>
            <View style={[styles.gridIcon, { backgroundColor: "#ECFDF5" }]}>
              <Ionicons
                name="wallet-outline"
                size={scale(20)}
                color="#10B981"
              />
            </View>
            <Text style={styles.gridValue}>
              {formatCurrency(dashboardData.available_share_amount)}
            </Text>
            <Text style={styles.gridLabel}>Share Value</Text>
          </View>
        </ScrollView>

        {/* Money Flow Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Money Flow (Last 4 Months)</Text>
          <View style={styles.chartContainer}>
            <BarChart
              data={dashboardData.money_flow_graph}
              barWidth={12}
              spacing={24}
              roundedTop
              roundedBottom
              hideRules
              xAxisThickness={0}
              yAxisThickness={0}
              yAxisTextStyle={{ color: "#94A3B8", fontSize: 10 }}
              yAxisLabelContainerStyle={{ paddingRight: 10 }}
              noOfSections={3}
              maxValue={dashboardData.money_flow_max_value}
              height={180}
              width={width - moderateScale(110)}
            />
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#10B981" }]}
                />
                <Text style={styles.legendText}>Inflow</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#EF4444" }]}
                />
                <Text style={styles.legendText}>Outflow</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Balance Trend Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Balance Trend</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={dashboardData.balance_trend_graph}
              color="#8B5CF6"
              thickness={3}
              startFillColor="rgba(139, 92, 246, 0.2)"
              endFillColor="rgba(139, 92, 246, 0.01)"
              startOpacity={0.9}
              endOpacity={0.2}
              initialSpacing={20}
              noOfSections={4}
              maxValue={dashboardData.balance_trend_max_value}
              yAxisTextStyle={{ color: "#94A3B8", fontSize: 10 }}
              yAxisLabelContainerStyle={{ paddingRight: 10 }}
              hideRules
              curved
              height={180}
              width={width - moderateScale(110)}
              hideDataPoints={false}
              dataPointsColor="#8B5CF6"
            />
          </View>
        </View>

        {/* Profit Trend Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profit Trend</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={dashboardData.profit_trend_graph}
              color="#2563EB"
              thickness={3}
              startFillColor="rgba(37, 99, 235, 0.2)"
              endFillColor="rgba(37, 99, 235, 0.01)"
              startOpacity={0.9}
              endOpacity={0.2}
              initialSpacing={20}
              noOfSections={4}
              maxValue={dashboardData.profit_trend_max_value}
              yAxisTextStyle={{ color: "#94A3B8", fontSize: 10 }}
              yAxisLabelContainerStyle={{ paddingRight: 10 }}
              hideRules
              curved
              height={180}
              width={width - moderateScale(110)}
              hideDataPoints={false}
              dataPointsColor="#2563EB"
            />
          </View>
        </View>

        {/* Investment vs Profit Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Investment vs Profit</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={dashboardData.investment_data}
              data2={dashboardData.profit_data}
              color1="#2563EB"
              color2="#10B981"
              thickness={3}
              startFillColor1="rgba(37, 99, 235, 0.2)"
              endFillColor1="rgba(37, 99, 235, 0.01)"
              startFillColor2="rgba(16, 185, 129, 0.2)"
              endFillColor2="rgba(16, 185, 129, 0.01)"
              startOpacity={0.9}
              endOpacity={0.2}
              initialSpacing={20}
              noOfSections={4}
              maxValue={dashboardData.investment_vs_profit_max_value}
              yAxisTextStyle={{ color: "#94A3B8", fontSize: 10 }}
              yAxisLabelContainerStyle={{ paddingRight: 10 }}
              hideRules
              curved
              height={180}
              width={width - moderateScale(110)}
              hideDataPoints={false}
              dataPointsColor1="#2563EB"
              dataPointsColor2="#10B981"
            />
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#2563EB" }]}
                />
                <Text style={styles.legendText}>Investment</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#10B981" }]}
                />
                <Text style={styles.legendText}>Profit</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Transaction Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Summary</Text>
          {dashboardData.transactions.map((item, index) => (
            <View key={index} style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <View
                  style={[
                    styles.transactionIcon,
                    {
                      backgroundColor:
                        item.type === "deposit"
                          ? "#ECFDF5"
                          : item.type === "withdrawal"
                          ? "#FEF2F2"
                          : "#EFF6FF",
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      item.type === "deposit"
                        ? "arrow-down"
                        : item.type === "withdrawal"
                        ? "arrow-up"
                        : "trending-up"
                    }
                    size={scale(18)}
                    color={
                      item.type === "deposit"
                        ? "#10B981"
                        : item.type === "withdrawal"
                        ? "#EF4444"
                        : "#3B82F6"
                    }
                  />
                </View>
                <View>
                  <Text style={styles.transactionLabel}>{item.label}</Text>
                  <Text style={styles.transactionCount}>
                    {item.count} Transactions
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  { color: item.type === "withdrawal" ? "#EF4444" : "#10B981" },
                ]}
              >
                {item.type === "withdrawal" ? "-" : "+"}
                {formatCurrency(item.amount)}
              </Text>
            </View>
          ))}
        </View>

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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(24),
  },
  greeting: {
    fontSize: moderateScale(14),
    color: "#64748B",
    marginBottom: verticalScale(4),
    fontFamily: "Outfit_400Regular",
  },
  userName: {
    fontSize: moderateScale(20),
    fontWeight: "700",
    color: "#1E293B",
    fontFamily: "Outfit_700Bold",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(12),
  },
  iconButton: {
    padding: scale(8),
    backgroundColor: "#FFFFFF",
    borderRadius: scale(12),
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  badge: {
    position: "absolute",
    top: scale(8),
    right: scale(8),
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: "#EF4444",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  avatar: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: "#E0E7FF",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: scale(20),
  },
  avatarText: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: "#4F46E5",
  },
  heroCard: {
    borderRadius: moderateScale(24),
    padding: moderateScale(24),
    marginBottom: verticalScale(24),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroLabel: {
    fontSize: moderateScale(14),
    color: "rgba(255,255,255,0.8)",
    marginBottom: verticalScale(8),
    fontFamily: "Outfit_400Regular",
  },
  heroAmount: {
    fontSize: moderateScale(28),
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "Outfit_700Bold",
  },
  gridContainer: {
    flexDirection: "row",
    paddingRight: moderateScale(20),
    marginBottom: verticalScale(24),
  },
  gridItem: {
    width: scale(130),
    marginRight: scale(12),
    backgroundColor: "#FFFFFF",
    padding: moderateScale(16),
    borderRadius: moderateScale(16),
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  gridIcon: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(10),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(12),
  },
  gridValue: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: verticalScale(4),
    fontFamily: "Outfit_700Bold",
  },
  gridLabel: {
    fontSize: moderateScale(12),
    color: "#64748B",
    fontFamily: "Outfit_400Regular",
  },
  section: {
    marginBottom: verticalScale(24),
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(16),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: verticalScale(16),
    fontFamily: "Outfit_700Bold",
  },
  seeAll: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: "#2563EB",
    fontFamily: "Outfit_500Medium",
  },
  investmentGrid: {
    flexDirection: "row",
    paddingRight: moderateScale(20),
  },
  investmentCard: {
    width: scale(150),
    marginRight: scale(12),
    backgroundColor: "#FFFFFF",
    padding: moderateScale(12),
    borderRadius: moderateScale(14),
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  investmentIcon: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(10),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(8),
  },
  investmentLabel: {
    fontSize: moderateScale(10),
    color: "#64748B",
    marginBottom: verticalScale(4),
    fontFamily: "Outfit_400Regular",
  },
  investmentValue: {
    fontSize: moderateScale(13),
    fontWeight: "700",
    color: "#1E293B",
    fontFamily: "Outfit_700Bold",
  },
  chartContainer: {
    backgroundColor: "#FFFFFF",
    padding: moderateScale(16),
    borderRadius: moderateScale(20),
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    alignItems: "center",
    overflow: "hidden",
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: verticalScale(16),
    gap: scale(24),
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
  },
  legendDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
  },
  legendText: {
    fontSize: moderateScale(12),
    color: "#64748B",
    fontWeight: "500",
    fontFamily: "Outfit_500Medium",
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: moderateScale(16),
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(12),
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(12),
  },
  transactionIcon: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(12),
    justifyContent: "center",
    alignItems: "center",
  },
  transactionLabel: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: verticalScale(2),
    fontFamily: "Outfit_500Medium",
  },
  transactionCount: {
    fontSize: moderateScale(12),
    color: "#94A3B8",
    fontFamily: "Outfit_400Regular",
  },
  transactionAmount: {
    fontSize: moderateScale(14),
    fontWeight: "700",
    fontFamily: "Outfit_700Bold",
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
