import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { useCurrency } from "../../../hooks/useCurrency";
import { getTransactionDetail } from "../../../services/api/transactions";

const getTypeColor = (type: string) => {
  const colors: any = {
    deposit: { bg: "#ECFDF5", icon: "#10B981" },
    withdrawal: { bg: "#FEF2F2", icon: "#EF4444" },
    share_deposit: { bg: "#EFF6FF", icon: "#3B82F6" },
    share_withdrawal: { bg: "#FEF2F2", icon: "#F97316" },
    investment: { bg: "#F5F3FF", icon: "#8B5CF6" },
    profit: { bg: "#ECFDF5", icon: "#059669" },
  };
  return colors[type] || { bg: "#F8FAFC", icon: "#64748B" };
};

const getTypeIcon = (type: string) => {
  const icons: any = {
    deposit: "arrow-down-circle",
    withdrawal: "arrow-up-circle",
    share_deposit: "cube",
    share_withdrawal: "cube-outline",
    investment: "trending-up",
    profit: "cash",
  };
  return icons[type] || "swap-horizontal";
};

export default function TransactionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { formatCurrency } = useCurrency();

  const {
    data: transactionResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["transaction-detail", id],
    queryFn: () => getTransactionDetail(id!),
    enabled: !!id,
  });

  const transaction = transactionResponse?.data;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <Stack.Screen
          options={{
            presentation: "modal",
            headerShown: true,
            title: "Transaction Details",
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
          <Text style={styles.loadingText}>Loading transaction details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !transaction) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <Stack.Screen
          options={{
            presentation: "modal",
            headerShown: true,
            title: "Transaction Details",
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
              return "Failed to load transaction details. Please try again.";
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

  const colors = getTypeColor(transaction.transaction_type);
  const isNegative =
    transaction.transaction_type.includes("withdrawal") ||
    transaction.transaction_type === "investment";

  const InfoRow = ({
    label,
    value,
    icon,
  }: {
    label: string;
    value: string | null;
    icon?: any;
  }) => {
    if (value === null || value === undefined) return null;
    return (
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
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          presentation: "modal",
          headerShown: true,
          title: "Transaction Details",
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
        {/* Transaction Header Card */}
        <View style={[styles.headerCard, { backgroundColor: colors.bg }]}>
          <View style={[styles.headerIcon, { backgroundColor: colors.icon }]}>
            <Ionicons
              name={getTypeIcon(transaction.transaction_type)}
              size={scale(32)}
              color="#FFFFFF"
            />
          </View>
          <Text style={styles.headerType}>
            {transaction.transaction_type_label}
          </Text>
          <Text
            style={[
              styles.headerAmount,
              { color: isNegative ? "#EF4444" : "#10B981" },
            ]}
          >
            {isNegative ? "-" : "+"}
            {formatCurrency(transaction.amount)}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  transaction.status === "completed" ? "#ECFDF5" : "#FEF3C7",
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    transaction.status === "completed" ? "#10B981" : "#F59E0B",
                },
              ]}
            >
              {transaction.status_label}
            </Text>
          </View>
        </View>

        {/* Transaction Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Information</Text>
          <View style={styles.card}>
            <InfoRow
              label="Transaction Number"
              value={transaction.transaction_number}
              icon="receipt-outline"
            />
            {transaction.reference_number && (
              <>
                <View style={styles.divider} />
                <InfoRow
                  label="Reference Number"
                  value={transaction.reference_number}
                  icon="document-text-outline"
                />
              </>
            )}
            <View style={styles.divider} />
            <InfoRow
              label="Transaction Date"
              value={formatDate(transaction.transaction_date)}
              icon="calendar-outline"
            />
            <View style={styles.divider} />
            <InfoRow
              label="Created At"
              value={formatDate(transaction.created_at)}
              icon="time-outline"
            />
          </View>
        </View>

        {/* Balance Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Balance Information</Text>
          <View style={styles.card}>
            <InfoRow
              label="Balance Before"
              value={formatCurrency(transaction.balance_before)}
              icon="wallet-outline"
            />
            <View style={styles.divider} />
            <InfoRow
              label="Balance After"
              value={formatCurrency(transaction.balance_after)}
              icon="wallet"
            />
            <View style={styles.divider} />
            <InfoRow
              label="Currency"
              value={transaction.currency}
              icon="cash-outline"
            />
          </View>
        </View>

        {/* Payment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <View style={styles.card}>
            <InfoRow
              label="Payment Method"
              value={transaction.payment_method_label}
              icon="card-outline"
            />
            {transaction.payment_reference && (
              <>
                <View style={styles.divider} />
                <InfoRow
                  label="Payment Reference"
                  value={transaction.payment_reference}
                  icon="barcode-outline"
                />
              </>
            )}
            <View style={styles.divider} />
            <InfoRow
              label="Approval Status"
              value={transaction.approval_status_label}
              icon="checkmark-circle-outline"
            />
            {transaction.approved_at && (
              <>
                <View style={styles.divider} />
                <InfoRow
                  label="Approved At"
                  value={formatDate(transaction.approved_at)}
                  icon="checkmark-done-outline"
                />
              </>
            )}
            {transaction.approved_by && (
              <>
                <View style={styles.divider} />
                <InfoRow
                  label="Approved By"
                  value={transaction.approved_by.name}
                  icon="person-check-outline"
                />
              </>
            )}
          </View>
        </View>

        {/* Additional Information */}
        {transaction.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.card}>
              <Text style={styles.notesText}>{transaction.notes}</Text>
            </View>
          </View>
        )}

        {/* Created By */}
        {transaction.created_by && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Created By</Text>
            <View style={styles.card}>
              <InfoRow
                label="Name"
                value={transaction.created_by.name}
                icon="person-outline"
              />
              <View style={styles.divider} />
              <InfoRow
                label="Email"
                value={transaction.created_by.email}
                icon="mail-outline"
              />
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
    padding: moderateScale(24),
    borderRadius: moderateScale(20),
    marginBottom: verticalScale(24),
  },
  headerIcon: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(16),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(16),
  },
  headerType: {
    fontSize: moderateScale(18),
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: verticalScale(8),
    fontFamily: "Outfit_500Medium",
  },
  headerAmount: {
    fontSize: moderateScale(32),
    fontWeight: "700",
    marginBottom: verticalScale(12),
    fontFamily: "Outfit_700Bold",
  },
  statusBadge: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(6),
    borderRadius: scale(12),
  },
  statusText: {
    fontSize: moderateScale(12),
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
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: verticalScale(8),
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 0.4,
  },
  infoLabel: {
    fontSize: moderateScale(12),
    color: "#64748B",
    fontFamily: "Outfit_400Regular",
  },
  infoValue: {
    fontSize: moderateScale(11),
    fontWeight: "600",
    color: "#1E293B",
    textAlign: "right",
    flex: 0.6,
    fontFamily: "Outfit_500Medium",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },
  notesText: {
    fontSize: moderateScale(14),
    color: "#475569",
    lineHeight: moderateScale(20),
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
