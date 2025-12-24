import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { WebView } from "react-native-webview";
import { useCurrency } from "../../../hooks/useCurrency";
import {
  getClubDetail,
  investInClub,
  joinClubRequest,
} from "../../../services/api/clubs";
import { normalizeImageUrl } from "../../../utils/imageUtils";

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

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function ClubDetailScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const scaleAnim = useSharedValue(1);
  const { formatCurrency } = useCurrency();

  // Modal State
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{
    url: string;
    title: string;
  } | null>(null);
  const [documentLoading, setDocumentLoading] = useState(true);
  const [quantity, setQuantity] = useState(0);
  const [notes, setNotes] = useState("");
  const [minQuantity, setMinQuantity] = useState(0);
  const [maxQuantity, setMaxQuantity] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [activeDocTab, setActiveDocTab] = useState<
    "public" | "member" | "personal"
  >("public");
  const [activeInfoTab, setActiveInfoTab] = useState<
    "members" | "expenses" | "activities"
  >("members");

  useEffect(() => {
    scaleAnim.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  // Hide tab bar when modal is visible
  useLayoutEffect(() => {
    const parent = navigation.getParent();
    if (parent) {
      parent.setOptions({
        tabBarStyle: showJoinModal ? { display: "none" } : undefined,
      });
    }
  }, [showJoinModal, navigation]);

  const animatedFabStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleAnim.value }],
    };
  });

  const {
    data: clubResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["club-detail", id],
    queryFn: () => getClubDetail(id!),
    enabled: !!id,
    // Refetch every 30 seconds to ensure fresh share availability and investment data
    refetchInterval: 30 * 1000,
    refetchOnMount: "always",
  });

  const club = clubResponse?.data;

  // Initialize quantity when club data loads
  useEffect(() => {
    if (club) {
      const minQty = Math.ceil(club.minimum_investment / club.share_price);
      const maxQty = Math.floor(club.maximum_investment / club.share_price);
      setMinQuantity(minQty);
      setMaxQuantity(maxQty);
      setQuantity(minQty);
    }
  }, [club]);

  // Join Request Mutation
  const joinMutation = useMutation({
    mutationFn: (data: {
      invest_quantity: number;
      investment_amount: number;
      notes: string;
    }) => joinClubRequest(id!, data),
    onSuccess: () => {
      setSubmitError(null);
      setShowJoinModal(false);
      setShowSuccessModal(true);
      setNotes("");
      setQuantity(minQuantity);

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
      queryClient.invalidateQueries({ queryKey: ["club-detail", id] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactions-categories"] });
    },
    onError: (error: any) => {
      setSubmitError(error.message || "Failed to submit request");
    },
  });

  // Invest Mutation
  const investMutation = useMutation({
    mutationFn: (data: {
      invest_quantity: number;
      investment_amount: number;
    }) => investInClub(id!, data),
    onSuccess: (response) => {
      setSubmitError(null);
      setSubmitSuccess(
        response.message || "Investment processed successfully."
      );
      setQuantity(minQuantity);
      refetch(); // Refresh club data to show updated stats

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
      queryClient.invalidateQueries({ queryKey: ["club-detail", id] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactions-categories"] });
    },
    onError: (error: any) => {
      setSubmitSuccess(null);
      setSubmitError(error.message || "Failed to process investment");
    },
  });

  const openDocument = (url: string, title: string) => {
    setSelectedDocument({ url, title });
    setDocumentLoading(true);
    setShowDocumentModal(true);
  };

  // Get viewable URL - use Google Docs viewer for PDFs
  const getDocumentViewUrl = (url: string) => {
    const isPdf = url.toLowerCase().endsWith('.pdf');
    if (isPdf) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    }
    return url;
  };

  const handleSubmit = () => {
    setSubmitError(null);
    setSubmitSuccess(null);

    if (club?.club_type === "live") {
      if (!notes.trim()) {
        setSubmitError("Please add a note to your request");
        return;
      }

      const investmentAmount =
        Math.round(quantity * (club?.share_price || 0) * 100) / 100;
      joinMutation.mutate({
        invest_quantity: quantity,
        investment_amount: investmentAmount,
        notes: notes,
      });
    } else if (club?.club_type === "ongoing") {
      const investmentAmount =
        Math.round(quantity * (club?.share_price || 0) * 100) / 100;
      investMutation.mutate({
        invest_quantity: quantity,
        investment_amount: investmentAmount,
      });
    }
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

  const renderDocumentItem = (doc: any) => (
    <View key={doc.id}>
      <TouchableOpacity
        style={styles.documentItem}
        onPress={() => openDocument(doc.file_url, doc.title)}
      >
        <View style={styles.documentLeft}>
          <Ionicons name="document-text" size={scale(20)} color="#3B82F6" />
          <View style={styles.documentInfo}>
            <Text style={styles.documentTitle}>{doc.title}</Text>
            <Text style={styles.documentType}>
              {doc.document_type.replace("_", " ")}
            </Text>
          </View>
        </View>
        <Ionicons name="download-outline" size={scale(20)} color="#94A3B8" />
      </TouchableOpacity>
      <View style={styles.divider} />
    </View>
  );

  const renderMemberItem = (member: any) => (
    <View key={member.investor_id}>
      <View style={styles.memberItem}>
        <View style={styles.memberAvatar}>
          {member.avatar ? (
            <Animated.Image
              source={{ uri: normalizeImageUrl(member.avatar) || undefined }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {member.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{member.name}</Text>
          <Text style={styles.memberEmail}>{member.email}</Text>
        </View>
      </View>
      <View style={styles.divider} />
    </View>
  );

  const renderExpenseItem = (expense: any, index: number) => (
    <View key={index}>
      <View style={styles.expenseItem}>
        <View style={styles.expenseLeft}>
          <View style={styles.expenseIcon}>
            <Ionicons name="receipt-outline" size={scale(20)} color="#64748B" />
          </View>
          <View style={styles.expenseInfo}>
            <Text style={styles.expenseDescription}>{expense.description}</Text>
            <Text style={styles.expenseDate}>{expense.expense_date}</Text>
          </View>
        </View>
        <Text style={styles.expenseAmount}>
          {formatCurrency(expense.amount)}
        </Text>
      </View>
      <View style={styles.divider} />
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
  
  // Use share_statistics from API
  const shareStats = club.share_statistics;
  const soldPercentage = shareStats 
    ? (100 - shareStats.remaining_percentage) 
    : (club.shares_sold / club.total_shares_available) * 100;
  // Cap progress bar at 100% for oversold scenarios
  const sharesProgress = Math.min(soldPercentage, 100);
  const isOversold = shareStats ? shareStats.total_available_share < 0 : false;

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

        {/* User Investment Info */}
        {club.user_investment_info && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Investment</Text>
            <View style={styles.card}>
              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Shares Owned</Text>
                  <Text style={styles.metricValue}>
                    {club.user_investment_info.share_qty}
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Total Investment</Text>
                  <Text style={[styles.metricValue, { color: "#2563EB" }]}>
                    {formatCurrency(
                      club.user_investment_info.investment_amount
                    )}
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Purchase Price</Text>
                  <Text style={styles.metricValue}>
                    {formatCurrency(club.user_investment_info.share_price)}
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Joined Date</Text>
                  <Text style={styles.metricValue} numberOfLines={1}>
                    {new Date(
                      club.user_investment_info.joined_at
                    ).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

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
                {(shareStats?.total_sold_ongoing_share ?? club.shares_sold).toLocaleString()} /{" "}
                {(shareStats?.total_share_qty ?? club.total_shares_available).toLocaleString()} shares sold
              </Text>
              <Text style={[
                styles.progressPercent,
                isOversold && styles.oversoldText
              ]}>
                {soldPercentage.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${sharesProgress}%`,
                    backgroundColor: isOversold ? "#EF4444" : categoryColor,
                  },
                ]}
              />
            </View>
            <View style={styles.shareStatsContainer}>
              <View style={styles.shareStatItem}>
                <Text style={styles.shareStatValue}>
                  {(shareStats?.total_share_qty ?? club.total_shares_available).toLocaleString()}
                </Text>
                <Text style={styles.shareStatLabel}>Total</Text>
              </View>
              <View style={styles.shareStatItem}>
                <Text style={styles.shareStatValue}>
                  {(shareStats?.total_sold_ongoing_share ?? club.shares_sold).toLocaleString()}
                </Text>
                <Text style={styles.shareStatLabel}>Sold</Text>
              </View>
              {(shareStats?.total_pending_share ?? 0) > 0 && (
                <View style={styles.shareStatItem}>
                  <Text style={[styles.shareStatValue, { color: "#F59E0B" }]}>
                    {shareStats?.total_pending_share.toLocaleString()}
                  </Text>
                  <Text style={styles.shareStatLabel}>Pending</Text>
                </View>
              )}
              <View style={styles.shareStatItem}>
                <Text style={[
                  styles.shareStatValue,
                  isOversold && styles.oversoldText
                ]}>
                  {(shareStats?.total_available_share ?? club.shares_remaining).toLocaleString()}
                </Text>
                <Text style={styles.shareStatLabel}>Available</Text>
              </View>
            </View>
            {isOversold && (
              <View style={styles.oversoldBadge}>
                <Ionicons name="warning" size={scale(14)} color="#EF4444" />
                <Text style={styles.oversoldBadgeText}>Oversold by {Math.abs(shareStats?.total_available_share ?? 0)} shares</Text>
              </View>
            )}
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

        {club.club_type === "ongoing" ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Documents</Text>
            <View style={styles.card}>
              {/* Tabs */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    activeDocTab === "public" && styles.activeTabButton,
                  ]}
                  onPress={() => setActiveDocTab("public")}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeDocTab === "public" && styles.activeTabText,
                    ]}
                  >
                    Public
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    activeDocTab === "member" && styles.activeTabButton,
                  ]}
                  onPress={() => setActiveDocTab("member")}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeDocTab === "member" && styles.activeTabText,
                    ]}
                  >
                    Member
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    activeDocTab === "personal" && styles.activeTabButton,
                  ]}
                  onPress={() => setActiveDocTab("personal")}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeDocTab === "personal" && styles.activeTabText,
                    ]}
                  >
                    Personal
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Document List */}
              <View style={{ marginTop: verticalScale(16) }}>
                {activeDocTab === "public" &&
                  (club.public_documents?.length > 0 ? (
                    club.public_documents.map((doc) => renderDocumentItem(doc))
                  ) : (
                    <Text style={styles.emptyText}>
                      No public documents available
                    </Text>
                  ))}

                {activeDocTab === "member" &&
                  (club.member_documents?.length > 0 ? (
                    club.member_documents.map((doc) => renderDocumentItem(doc))
                  ) : (
                    <Text style={styles.emptyText}>
                      No member documents available
                    </Text>
                  ))}

                {activeDocTab === "personal" &&
                  (club.user_personal_documents?.length > 0 ? (
                    club.user_personal_documents.map((doc) =>
                      renderDocumentItem(doc)
                    )
                  ) : (
                    <Text style={styles.emptyText}>
                      No personal documents available
                    </Text>
                  ))}
              </View>
            </View>
          </View>
        ) : (
          club.public_documents.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Documents</Text>
              <View style={styles.card}>
                {club.public_documents.map((doc, index) => (
                  <View key={doc.id}>
                    {index > 0 && <View style={styles.divider} />}
                    <TouchableOpacity
                      style={styles.documentItem}
                      onPress={() => openDocument(doc.file_url, doc.title)}
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
          )
        )}

        {/* Activity Log / Info Tabs */}
        {club.club_type === "ongoing" ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Club Information</Text>
            <View style={styles.card}>
              {/* Tabs */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    activeInfoTab === "members" && styles.activeTabButton,
                  ]}
                  onPress={() => setActiveInfoTab("members")}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeInfoTab === "members" && styles.activeTabText,
                    ]}
                  >
                    Members
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    activeInfoTab === "expenses" && styles.activeTabButton,
                  ]}
                  onPress={() => setActiveInfoTab("expenses")}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeInfoTab === "expenses" && styles.activeTabText,
                    ]}
                  >
                    Expenses
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    activeInfoTab === "activities" && styles.activeTabButton,
                  ]}
                  onPress={() => setActiveInfoTab("activities")}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeInfoTab === "activities" && styles.activeTabText,
                    ]}
                  >
                    Activities
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Content List */}
              <View style={{ marginTop: verticalScale(16) }}>
                {activeInfoTab === "members" &&
                  (club.members?.length > 0 ? (
                    club.members.map((member) => renderMemberItem(member))
                  ) : (
                    <Text style={styles.emptyText}>No members found</Text>
                  ))}

                {activeInfoTab === "expenses" &&
                  (club.expenses?.length > 0 ? (
                    club.expenses.map((expense, index) =>
                      renderExpenseItem(expense, index)
                    )
                  ) : (
                    <Text style={styles.emptyText}>No expenses recorded</Text>
                  ))}

                {activeInfoTab === "activities" &&
                  (club.activities?.length > 0 ? (
                    club.activities.map((activity, index) => (
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
                              {activity.causer_name} •{" "}
                              {activity.created_at_human}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>No recent activity</Text>
                  ))}
              </View>
            </View>
          </View>
        ) : (
          club.activities &&
          club.activities.length > 0 && (
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
          )
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB Join/Invest Button */}
      {!showJoinModal &&
        ((!club.is_member && club.club_type === "live") ||
          club.club_type === "ongoing") && (
          <Animated.View style={[styles.fabContainer, animatedFabStyle]}>
            <TouchableOpacity
              style={styles.fab}
              onPress={() => setShowJoinModal(true)}
            >
              <Ionicons name="add" size={scale(24)} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        )}

      {/* Join/Invest Modal */}
      <Modal
        visible={showJoinModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          Keyboard.dismiss();
          setShowJoinModal(false);
        }}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.modalBackdrop}
              onPress={() => {
                Keyboard.dismiss();
                setShowJoinModal(false);
              }}
            />
            <View style={styles.modalSheet}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {club.club_type === "live"
                      ? "Join Club Request"
                      : "Invest in Club"}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      Keyboard.dismiss();
                      setShowJoinModal(false);
                    }}
                  >
                    <Ionicons name="close" size={scale(24)} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ paddingBottom: verticalScale(24) }}
                >
                  <View style={styles.modalBody}>
                    <Text style={styles.modalSubtitle}>Investment Amount</Text>

                    <View style={styles.quantityContainer}>
                      <TouchableOpacity
                        style={[
                          styles.quantityButton,
                          quantity <= minQuantity &&
                            styles.quantityButtonDisabled,
                        ]}
                        onPress={() =>
                          quantity > minQuantity && setQuantity((q) => q - 1)
                        }
                        disabled={quantity <= minQuantity}
                      >
                        <Ionicons
                          name="remove"
                          size={scale(20)}
                          color={
                            quantity <= minQuantity ? "#CBD5E1" : "#1E293B"
                          }
                        />
                      </TouchableOpacity>

                      <View style={styles.quantityValueContainer}>
                        <Text style={styles.quantityValue}>{quantity}</Text>
                        <Text style={styles.quantityLabel}>Shares</Text>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.quantityButton,
                          quantity >= maxQuantity &&
                            styles.quantityButtonDisabled,
                        ]}
                        onPress={() =>
                          quantity < maxQuantity && setQuantity((q) => q + 1)
                        }
                        disabled={quantity >= maxQuantity}
                      >
                        <Ionicons
                          name="add"
                          size={scale(20)}
                          color={
                            quantity >= maxQuantity ? "#CBD5E1" : "#1E293B"
                          }
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.amountSummary}>
                      <Text style={styles.amountLabel}>Total Investment</Text>
                      <Text style={styles.amountValue}>
                        {formatCurrency(quantity * club.share_price)}
                      </Text>
                    </View>

                    <View style={styles.maxInvestmentContainer}>
                      <Text style={styles.maxInvestmentText}>
                        Maximum Investment:{" "}
                        {formatCurrency(club.maximum_investment)}
                      </Text>
                    </View>

                    {club.club_type === "live" && (
                      <>
                        <Text style={styles.modalSubtitle}>Notes</Text>
                        <TextInput
                          style={styles.notesInput}
                          placeholder="Why do you want to join this club?"
                          placeholderTextColor="#94A3B8"
                          multiline
                          numberOfLines={4}
                          value={notes}
                          onChangeText={(text) => {
                            setNotes(text);
                            setSubmitError(null);
                          }}
                          textAlignVertical="top"
                        />
                      </>
                    )}

                    {submitSuccess && (
                      <View style={styles.successBanner}>
                        <Ionicons
                          name="checkmark-circle"
                          size={scale(20)}
                          color="#10B981"
                        />
                        <Text style={styles.successBannerText}>
                          {submitSuccess}
                        </Text>
                      </View>
                    )}

                    {submitError && (
                      <View style={styles.errorBanner}>
                        <Ionicons
                          name="alert-circle"
                          size={scale(20)}
                          color="#EF4444"
                        />
                        <Text style={styles.errorBannerText}>
                          {submitError}
                        </Text>
                      </View>
                    )}

                    <TouchableOpacity
                      style={[
                        styles.submitButton,
                        (joinMutation.isPending || investMutation.isPending) &&
                          styles.submitButtonDisabled,
                      ]}
                      onPress={handleSubmit}
                      disabled={
                        joinMutation.isPending || investMutation.isPending
                      }
                    >
                      {joinMutation.isPending || investMutation.isPending ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.submitButtonText}>
                          {club.club_type === "live"
                            ? "Submit Request"
                            : "Invest Now"}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Join Request Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successModalIconContainer}>
              <View style={styles.successModalIcon}>
                <Ionicons name="checkmark-circle" size={scale(32)} color="#10B981" />
              </View>
            </View>

            <Text style={styles.successModalTitle}>Request Submitted!</Text>
            <Text style={styles.successModalMessage}>
              Your request to join the club has been submitted successfully. You&apos;ll be notified once it&apos;s approved.
            </Text>

            <TouchableOpacity
              style={styles.successModalButton}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.successModalButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Document Viewer Modal */}
      <Modal
        visible={showDocumentModal}
        animationType="slide"
        onRequestClose={() => setShowDocumentModal(false)}
      >
        <SafeAreaView style={styles.documentModalContainer}>
          <View style={styles.documentModalHeader}>
            <TouchableOpacity
              style={styles.documentModalCloseButton}
              onPress={() => setShowDocumentModal(false)}
            >
              <Ionicons name="close" size={scale(24)} color="#1E293B" />
            </TouchableOpacity>
            <Text style={styles.documentModalTitle} numberOfLines={1}>
              {selectedDocument?.title || "Document"}
            </Text>
            <View style={{ width: scale(40) }} />
          </View>
          {documentLoading && (
            <View style={styles.documentLoadingContainer}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={styles.documentLoadingText}>Loading document...</Text>
            </View>
          )}
          {selectedDocument && (
            <WebView
              source={{ uri: getDocumentViewUrl(selectedDocument.url) }}
              style={[styles.documentWebView, documentLoading && { opacity: 0 }]}
              onLoadStart={() => setDocumentLoading(true)}
              onLoadEnd={() => setDocumentLoading(false)}
              onError={() => setDocumentLoading(false)}
              startInLoadingState={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              scalesPageToFit={true}
            />
          )}
        </SafeAreaView>
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
  shareStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: verticalScale(12),
    paddingTop: verticalScale(12),
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  shareStatItem: {
    alignItems: "center",
    flex: 1,
  },
  shareStatValue: {
    fontSize: moderateScale(16),
    fontFamily: "Outfit_700Bold",
    color: "#1E293B",
  },
  shareStatLabel: {
    fontSize: moderateScale(11),
    fontFamily: "Outfit_400Regular",
    color: "#94A3B8",
    marginTop: verticalScale(2),
  },
  oversoldText: {
    color: "#EF4444",
  },
  oversoldBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(12),
    borderRadius: moderateScale(8),
    marginTop: verticalScale(12),
    gap: scale(6),
  },
  oversoldBadgeText: {
    fontSize: moderateScale(12),
    fontFamily: "Outfit_500Medium",
    color: "#EF4444",
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
  fabContainer: {
    position: "absolute",
    bottom: verticalScale(30),
    right: scale(20),
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fab: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  successModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: moderateScale(20),
  },
  successModalContent: {
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
  successModalIconContainer: {
    alignItems: "center",
    marginBottom: verticalScale(16),
  },
  successModalIcon: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(32),
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
  },
  successModalTitle: {
    fontSize: moderateScale(20),
    fontWeight: "700",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: verticalScale(8),
    fontFamily: "Outfit_700Bold",
  },
  successModalMessage: {
    fontSize: moderateScale(14),
    color: "#64748B",
    textAlign: "center",
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(24),
    fontFamily: "Outfit_400Regular",
  },
  successModalButton: {
    backgroundColor: "#10B981",
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    alignItems: "center",
    justifyContent: "center",
  },
  successModalButtonText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "Outfit_600SemiBold",
  },
  documentModalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  documentModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    backgroundColor: "#FFFFFF",
  },
  documentModalCloseButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  documentModalTitle: {
    flex: 1,
    fontSize: moderateScale(16),
    fontFamily: "Outfit_600SemiBold",
    color: "#1E293B",
    textAlign: "center",
    marginHorizontal: scale(12),
  },
  documentLoadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    zIndex: 1,
  },
  documentLoadingText: {
    marginTop: verticalScale(12),
    fontSize: moderateScale(14),
    fontFamily: "Outfit_400Regular",
    color: "#64748B",
  },
  documentWebView: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    maxHeight: SCREEN_HEIGHT * 0.9,
    width: "100%",
  },
  modalContent: {
    padding: moderateScale(20),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(20),
  },
  modalTitle: {
    fontSize: moderateScale(20),
    fontFamily: "Outfit_700Bold",
    color: "#1E293B",
  },
  modalBody: {
    paddingBottom: verticalScale(20),
  },
  modalSubtitle: {
    fontSize: moderateScale(16),
    fontFamily: "Outfit_600SemiBold",
    color: "#1E293B",
    marginBottom: verticalScale(12),
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginBottom: verticalScale(16),
  },
  quantityButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quantityButtonDisabled: {
    opacity: 0.5,
    backgroundColor: "#F1F5F9",
  },
  quantityValueContainer: {
    alignItems: "center",
  },
  quantityValue: {
    fontSize: moderateScale(24),
    fontFamily: "Outfit_700Bold",
    color: "#1E293B",
  },
  quantityLabel: {
    fontSize: moderateScale(12),
    fontFamily: "Outfit_400Regular",
    color: "#64748B",
  },
  amountSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    padding: moderateScale(16),
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(24),
  },
  amountLabel: {
    fontSize: moderateScale(14),
    fontFamily: "Outfit_500Medium",
    color: "#1E40AF",
  },
  amountValue: {
    fontSize: moderateScale(18),
    fontFamily: "Outfit_700Bold",
    color: "#1E40AF",
  },
  maxInvestmentContainer: {
    alignItems: "center",
    marginBottom: verticalScale(16),
  },
  maxInvestmentText: {
    fontSize: moderateScale(12),
    fontFamily: "Outfit_400Regular",
    color: "#64748B",
  },
  notesInput: {
    backgroundColor: "#F8FAFC",
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    height: verticalScale(120),
    fontSize: moderateScale(16),
    fontFamily: "Outfit_400Regular",
    color: "#1E293B",
    marginBottom: verticalScale(24),
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    padding: moderateScale(12),
    borderRadius: moderateScale(8),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorBannerText: {
    marginLeft: scale(8),
    color: "#EF4444",
    fontSize: moderateScale(14),
    fontFamily: "Outfit_500Medium",
    flex: 1,
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    padding: moderateScale(12),
    borderRadius: moderateScale(8),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  successBannerText: {
    marginLeft: scale(8),
    color: "#10B981",
    fontSize: moderateScale(14),
    fontFamily: "Outfit_500Medium",
    flex: 1,
  },
  submitButton: {
    backgroundColor: "#2563EB",
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(12),
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: moderateScale(16),
    fontFamily: "Outfit_600SemiBold",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: moderateScale(8),
    padding: scale(4),
  },
  tabButton: {
    flex: 1,
    paddingVertical: verticalScale(8),
    alignItems: "center",
    borderRadius: moderateScale(6),
  },
  activeTabButton: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: moderateScale(13),
    color: "#64748B",
    fontFamily: "Outfit_500Medium",
  },
  activeTabText: {
    color: "#1E293B",
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: moderateScale(14),
    fontFamily: "Outfit_400Regular",
    paddingVertical: verticalScale(12),
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(8),
    gap: scale(12),
  },
  memberAvatar: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E2E8F0",
  },
  avatarText: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    color: "#64748B",
    fontFamily: "Outfit_600SemiBold",
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#1E293B",
    fontFamily: "Outfit_600SemiBold",
  },
  memberEmail: {
    fontSize: moderateScale(12),
    color: "#64748B",
    fontFamily: "Outfit_400Regular",
  },
  expenseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: verticalScale(8),
  },
  expenseLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(12),
    flex: 1,
  },
  expenseIcon: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: moderateScale(13),
    fontWeight: "500",
    color: "#1E293B",
    fontFamily: "Outfit_500Medium",
    marginBottom: verticalScale(2),
  },
  expenseDate: {
    fontSize: moderateScale(11),
    color: "#94A3B8",
    fontFamily: "Outfit_400Regular",
  },
  expenseAmount: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#EF4444",
    fontFamily: "Outfit_600SemiBold",
  },
});
