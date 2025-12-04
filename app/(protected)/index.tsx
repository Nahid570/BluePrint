import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Dimensions,
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
import { getReport } from "../../services/api/report";

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
  return "Good Evening,";
};

// Helper function to get initial from name
const getInitial = (name: string): string => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function DashboardScreen() {
  const router = useRouter();
  const { formatCurrency } = useCurrency();

  // Fetch dashboard data
  const {
    data: dashboardResponse,
    isLoading: isLoadingDashboard,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
  });

  // Fetch report data
  const {
    data: reportResponse,
    isLoading: isLoadingReport,
    error: reportError,
    refetch: refetchReport,
  } = useQuery({
    queryKey: ["report"],
    queryFn: getReport,
  });

  // Fetch profile data
  const {
    data: profileResponse,
    isLoading: isLoadingProfile,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  const dashboard = dashboardResponse?.data;
  const report = reportResponse?.data;
  const profile = profileResponse?.data;

  // Calculate balance percentage change
  const balanceData = useMemo(() => {
    if (!dashboard?.balance_trend_graph || dashboard.balance_trend_graph.length === 0) {
      return {
        balance_trend_graph: [],
        balance_percentage_change: 0,
      };
    }

    const balanceTrend = dashboard.balance_trend_graph;
    const firstBalance = balanceTrend[0].balance;
    const lastBalance = balanceTrend[balanceTrend.length - 1].balance;

    let balancePercentageChange = 0;
    if (firstBalance !== 0) {
      balancePercentageChange = ((lastBalance - firstBalance) / firstBalance) * 100;
    }

    return {
      balance_trend_graph: balanceTrend,
      balance_percentage_change: balancePercentageChange,
    };
  }, [dashboard]);

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
      dataPointText: '',
    }));

    const profitData = investmentVsProfitData.map((item) => ({
      value: item.profit,
      label: item.month,
      dataPointText: '',
    }));

    // Transform transaction frequency graph
    const transactionFrequencyGraph = dashboard.transaction_frequency_graph
      .filter((item) => item.count > 0)
      .map((item) => ({
        value: item.count,
        label: formatMonthLabel(item.month),
        frontColor: "#8B5CF6",
      }));

    // Get top 3 transactions for summary
    const transactions = dashboard.transaction_type_distribution
      .filter((t: any) => ["deposit", "withdrawal", "profit"].includes(t.type))
      .map((t: any) => ({
        type: t.type,
        label: t.label,
        amount: t.total_amount,
        count: t.count,
      }))
      .sort((a: any, b: any) => b.amount - a.amount)
      .slice(0, 3);

    // Calculate dynamic max values for charts
    const moneyFlowMaxValue =
      moneyFlowGraph.length > 0
        ? Math.max(...moneyFlowGraph.map((item) => item.value)) * 1.2 // Add 20% padding
        : 2000000;

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

    const transactionFrequencyMaxValue =
      transactionFrequencyGraph.length > 0
        ? Math.max(...transactionFrequencyGraph.map((item) => item.value)) * 1.2
        : 50;

    // Calculate balance percentage change from balance trend
    const balanceTrend = dashboard.balance_trend_graph
      .filter((item: any) => item.balance > 0)
      .sort((a: any, b: any) => a.month.localeCompare(b.month));

    let balancePercentageChange = 0;
    if (balanceTrend.length >= 2) {
      const currentBalance = balanceTrend[balanceTrend.length - 1].balance;
      const previousBalance = balanceTrend[balanceTrend.length - 2].balance;
      if (previousBalance > 0) {
        balancePercentageChange =
          ((currentBalance - previousBalance) / previousBalance) * 100;
      }
    }

    return {
      available_balance: dashboard.available_balance,
      available_share_quantity: dashboard.available_share_quantity,
      available_share_amount: dashboard.available_share_amount,
      ongoing_clubs_count: dashboard.ongoing_clubs_count,
      money_flow_graph: moneyFlowGraph,
      profit_trend_graph: profitTrendGraph,
      investment_data: investmentData,
      profit_data: profitData,
      transaction_frequency_graph: transactionFrequencyGraph,
      money_flow_max_value: moneyFlowMaxValue,
      profit_trend_max_value: profitTrendMaxValue,
      investment_vs_profit_max_value: investmentVsProfitMaxValue,
      transaction_frequency_max_value: transactionFrequencyMaxValue,
      transactions,
      balance_percentage_change: balancePercentageChange,
    };
  }, [dashboardResponse]);

  // Loading state
  const isLoading = isLoadingDashboard || isLoadingReport || isLoadingProfile;
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
  const error = dashboardError || reportError || profileError;
  if (
    error ||
    !dashboardData ||
    !reportResponse?.data ||
    !profileResponse?.data
  ) {
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
              refetchReport();
              refetchProfile();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Get report summary data
  const reportSummary = reportResponse.data.summary;
  const userProfile = profileResponse.data;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
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
              style={styles.avatar}
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
                  {getInitial(userProfile.name)}
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
          <View style={styles.heroStats}>
            <View style={styles.heroStatItem}>
              <View
                style={[
                  styles.statIcon,
                  {
                    backgroundColor:
                      dashboardData.balance_percentage_change >= 0
                        ? "rgba(255,255,255,0.2)"
                        : "rgba(239, 68, 68, 0.3)",
                  },
                ]}
              >
                <Ionicons
                  name={
                    dashboardData.balance_percentage_change >= 0
                      ? "trending-up"
                      : "trending-down"
                  }
                  size={scale(16)}
                  color="#FFF"
                />
              </View>
              <Text style={styles.statLabel}>
                {dashboardData.balance_percentage_change >= 0 ? "+" : ""}
                {dashboardData.balance_percentage_change.toFixed(1)}%
              </Text>
            </View>
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
                {formatCurrency(reportSummary.total_investment)}
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
                {formatCurrency(reportSummary.total_profit)}
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
                {reportSummary.roi_percentage}%
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

        {/* Transaction Frequency Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Activity</Text>
          <View style={styles.chartContainer}>
            <BarChart
              data={dashboardData.transaction_frequency_graph}
              barWidth={16}
              spacing={24}
              roundedTop
              roundedBottom
              hideRules
              xAxisThickness={0}
              yAxisThickness={0}
              yAxisTextStyle={{ color: "#94A3B8", fontSize: 10 }}
              yAxisLabelContainerStyle={{ paddingRight: 10 }}
              noOfSections={3}
              maxValue={dashboardData.transaction_frequency_max_value}
              height={180}
              width={width - moderateScale(110)}
            />
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
    borderRadius: scale(12),
    backgroundColor: "#E0E7FF",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
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
  heroStats: {
    alignItems: "flex-end",
  },
  heroStatItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: scale(8),
  },
  statIcon: {
    width: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(4),
  },
  statLabel: {
    fontSize: moderateScale(12),
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "Outfit_500Medium",
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
