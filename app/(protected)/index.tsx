import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const { width } = Dimensions.get('window');

// Mock Data based on API response
const DASHBOARD_DATA = {
    available_balance: 341318.7,
    available_share_quantity: 160,
    available_share_amount: 78377.8,
    ongoing_clubs_count: 5,
    money_flow_graph: [
        { value: 607737.78, label: 'Aug', frontColor: '#10B981' },
        { value: 367640.82, frontColor: '#EF4444' },
        { value: 1359349.83, label: 'Sep', frontColor: '#10B981' },
        { value: 1027828.93, frontColor: '#EF4444' },
        { value: 1527503.08, label: 'Oct', frontColor: '#10B981' },
        { value: 352441.27, frontColor: '#EF4444' },
        { value: 1475797.87, label: 'Nov', frontColor: '#10B981' },
        { value: 298237.6, frontColor: '#EF4444' },
    ],
    club_investment_distribution: [
        { value: 2000, color: '#3B82F6', text: 'Land' },
        { value: 2755.6, color: '#8B5CF6', text: 'Cows' },
        { value: 1000, color: '#F59E0B', text: 'Infra' }, // Mocked non-zero for visual
    ],
    profit_trend_graph: [
        { value: 0, label: 'Jul' },
        { value: 98220.41, label: 'Aug' },
        { value: 192559.15, label: 'Sep' },
        { value: 399137.49, label: 'Oct' },
        { value: 94439.99, label: 'Nov' },
    ],
    transactions: [
        { type: 'deposit', label: 'Deposit', amount: 1930943.94, count: 27 },
        { type: 'withdrawal', label: 'Withdrawal', amount: 1018653.73, count: 22 },
        { type: 'profit', label: 'Profit', amount: 784357.04, count: 15 },
    ],
    investment_summary: {
        total_investment: 1251271.72,
        total_profit: 784357.04,
        roi_percentage: 62.68,
        active_clubs_count: 5,
    }
};

export default function DashboardScreen() {
    const router = useRouter();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Good Morning,</Text>
                        <Text style={styles.userName}>Nafed</Text>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => router.push('/(protected)/notifications')}
                        >
                            <Ionicons name="notifications-outline" size={scale(24)} color="#1E293B" />
                            <View style={styles.badge} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.avatar}
                            onPress={() => router.push('/(protected)/profile')}
                        >
                            <Text style={styles.avatarText}>N</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Hero Card */}
                <LinearGradient
                    colors={['#2563EB', '#4F46E5']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.heroCard}
                >
                    <View>
                        <Text style={styles.heroLabel}>Total Balance</Text>
                        <Text style={styles.heroAmount}>
                            {formatCurrency(DASHBOARD_DATA.available_balance)}
                        </Text>
                    </View>
                    <View style={styles.heroStats}>
                        <View style={styles.heroStatItem}>
                            <View style={[styles.statIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                <Ionicons name="trending-up" size={scale(16)} color="#FFF" />
                            </View>
                            <Text style={styles.statLabel}>+12.5%</Text>
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
                            <View style={[styles.investmentIcon, { backgroundColor: '#EFF6FF' }]}>
                                <Ionicons name="briefcase" size={scale(18)} color="#3B82F6" />
                            </View>
                            <Text style={styles.investmentLabel}>Total Investment</Text>
                            <Text style={styles.investmentValue}>
                                {formatCurrency(DASHBOARD_DATA.investment_summary.total_investment)}
                            </Text>
                        </View>
                        <View style={styles.investmentCard}>
                            <View style={[styles.investmentIcon, { backgroundColor: '#ECFDF5' }]}>
                                <Ionicons name="cash" size={scale(18)} color="#10B981" />
                            </View>
                            <Text style={styles.investmentLabel}>Total Profit</Text>
                            <Text style={[styles.investmentValue, { color: '#10B981' }]}>
                                {formatCurrency(DASHBOARD_DATA.investment_summary.total_profit)}
                            </Text>
                        </View>
                        <View style={styles.investmentCard}>
                            <View style={[styles.investmentIcon, { backgroundColor: '#FEF3C7' }]}>
                                <Ionicons name="stats-chart" size={scale(18)} color="#F59E0B" />
                            </View>
                            <Text style={styles.investmentLabel}>ROI</Text>
                            <Text style={[styles.investmentValue, { color: '#F59E0B' }]}>
                                {DASHBOARD_DATA.investment_summary.roi_percentage}%
                            </Text>
                        </View>
                        <View style={styles.investmentCard}>
                            <View style={[styles.investmentIcon, { backgroundColor: '#F5F3FF' }]}>
                                <Ionicons name="people" size={scale(18)} color="#8B5CF6" />
                            </View>
                            <Text style={styles.investmentLabel}>Active Clubs</Text>
                            <Text style={styles.investmentValue}>
                                {DASHBOARD_DATA.investment_summary.active_clubs_count}
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
                        <View style={[styles.gridIcon, { backgroundColor: '#EFF6FF' }]}>
                            <Ionicons name="cube-outline" size={scale(20)} color="#3B82F6" />
                        </View>
                        <Text style={styles.gridValue}>{DASHBOARD_DATA.available_share_quantity}</Text>
                        <Text style={styles.gridLabel}>Total Shares</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <View style={[styles.gridIcon, { backgroundColor: '#F5F3FF' }]}>
                            <Ionicons name="business-outline" size={scale(20)} color="#8B5CF6" />
                        </View>
                        <Text style={styles.gridValue}>{DASHBOARD_DATA.ongoing_clubs_count}</Text>
                        <Text style={styles.gridLabel}>Active Clubs</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <View style={[styles.gridIcon, { backgroundColor: '#ECFDF5' }]}>
                            <Ionicons name="wallet-outline" size={scale(20)} color="#10B981" />
                        </View>
                        <Text style={styles.gridValue}>
                            {formatCurrency(DASHBOARD_DATA.available_share_amount)}
                        </Text>
                        <Text style={styles.gridLabel}>Share Value</Text>
                    </View>
                </ScrollView>

                {/* Money Flow Chart */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Money Flow (Last 4 Months)</Text>
                    <View style={styles.chartContainer}>
                        <BarChart
                            data={DASHBOARD_DATA.money_flow_graph}
                            barWidth={12}
                            spacing={24}
                            roundedTop
                            roundedBottom
                            hideRules
                            xAxisThickness={0}
                            yAxisThickness={0}
                            yAxisTextStyle={{ color: '#94A3B8', fontSize: 10 }}
                            yAxisLabelContainerStyle={{ paddingRight: 10 }}
                            noOfSections={3}
                            maxValue={2000000}
                            height={180}
                            width={width - moderateScale(110)}
                        />
                        <View style={styles.legendContainer}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                                <Text style={styles.legendText}>Inflow</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
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
                            data={DASHBOARD_DATA.profit_trend_graph}
                            color="#2563EB"
                            thickness={3}
                            startFillColor="rgba(37, 99, 235, 0.2)"
                            endFillColor="rgba(37, 99, 235, 0.01)"
                            startOpacity={0.9}
                            endOpacity={0.2}
                            initialSpacing={20}
                            noOfSections={4}
                            maxValue={500000}
                            yAxisTextStyle={{ color: '#94A3B8', fontSize: 10 }}
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

                {/* Transaction Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Transaction Summary</Text>
                    {DASHBOARD_DATA.transactions.map((item, index) => (
                        <View key={index} style={styles.transactionItem}>
                            <View style={styles.transactionLeft}>
                                <View style={[
                                    styles.transactionIcon,
                                    { backgroundColor: item.type === 'deposit' ? '#ECFDF5' : item.type === 'withdrawal' ? '#FEF2F2' : '#EFF6FF' }
                                ]}>
                                    <Ionicons
                                        name={item.type === 'deposit' ? 'arrow-down' : item.type === 'withdrawal' ? 'arrow-up' : 'trending-up'}
                                        size={scale(18)}
                                        color={item.type === 'deposit' ? '#10B981' : item.type === 'withdrawal' ? '#EF4444' : '#3B82F6'}
                                    />
                                </View>
                                <View>
                                    <Text style={styles.transactionLabel}>{item.label}</Text>
                                    <Text style={styles.transactionCount}>{item.count} Transactions</Text>
                                </View>
                            </View>
                            <Text style={[
                                styles.transactionAmount,
                                { color: item.type === 'withdrawal' ? '#EF4444' : '#10B981' }
                            ]}>
                                {item.type === 'withdrawal' ? '-' : '+'}{formatCurrency(item.amount)}
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
        backgroundColor: '#F8FAFC',
    },
    scrollContent: {
        padding: moderateScale(20),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(24),
    },
    greeting: {
        fontSize: moderateScale(14),
        color: '#64748B',
        marginBottom: verticalScale(4),
        fontFamily: 'Outfit_400Regular',
    },
    userName: {
        fontSize: moderateScale(20),
        fontWeight: '700',
        color: '#1E293B',
        fontFamily: 'Outfit_700Bold',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(12),
    },
    iconButton: {
        padding: scale(8),
        backgroundColor: '#FFFFFF',
        borderRadius: scale(12),
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    badge: {
        position: 'absolute',
        top: scale(8),
        right: scale(8),
        width: scale(8),
        height: scale(8),
        borderRadius: scale(4),
        backgroundColor: '#EF4444',
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
    },
    avatar: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(12),
        backgroundColor: '#E0E7FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: '#4F46E5',
    },
    heroCard: {
        borderRadius: moderateScale(24),
        padding: moderateScale(24),
        marginBottom: verticalScale(24),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    heroLabel: {
        fontSize: moderateScale(14),
        color: 'rgba(255,255,255,0.8)',
        marginBottom: verticalScale(8),
        fontFamily: 'Outfit_400Regular',
    },
    heroAmount: {
        fontSize: moderateScale(28),
        fontWeight: '700',
        color: '#FFFFFF',
        fontFamily: 'Outfit_700Bold',
    },
    heroStats: {
        alignItems: 'flex-end',
    },
    heroStatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(4),
        borderRadius: scale(8),
    },
    statIcon: {
        width: scale(20),
        height: scale(20),
        borderRadius: scale(10),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(4),
    },
    statLabel: {
        fontSize: moderateScale(12),
        fontWeight: '600',
        color: '#FFFFFF',
        fontFamily: 'Outfit_500Medium',
    },
    gridContainer: {
        flexDirection: 'row',
        paddingRight: moderateScale(20),
        marginBottom: verticalScale(24),
    },
    gridItem: {
        width: scale(130),
        marginRight: scale(12),
        backgroundColor: '#FFFFFF',
        padding: moderateScale(16),
        borderRadius: moderateScale(16),
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    gridIcon: {
        width: scale(32),
        height: scale(32),
        borderRadius: scale(10),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    gridValue: {
        fontSize: moderateScale(16),
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: verticalScale(4),
        fontFamily: 'Outfit_700Bold',
    },
    gridLabel: {
        fontSize: moderateScale(12),
        color: '#64748B',
        fontFamily: 'Outfit_400Regular',
    },
    section: {
        marginBottom: verticalScale(24),
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(16),
    },
    sectionTitle: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: verticalScale(16),
        fontFamily: 'Outfit_700Bold',
    },
    seeAll: {
        fontSize: moderateScale(13),
        fontWeight: '600',
        color: '#2563EB',
        fontFamily: 'Outfit_500Medium',
    },
    investmentGrid: {
        flexDirection: 'row',
        paddingRight: moderateScale(20),
    },
    investmentCard: {
        width: scale(150),
        marginRight: scale(12),
        backgroundColor: '#FFFFFF',
        padding: moderateScale(12),
        borderRadius: moderateScale(14),
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    investmentIcon: {
        width: scale(32),
        height: scale(32),
        borderRadius: scale(10),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(8),
    },
    investmentLabel: {
        fontSize: moderateScale(10),
        color: '#64748B',
        marginBottom: verticalScale(4),
        fontFamily: 'Outfit_400Regular',
    },
    investmentValue: {
        fontSize: moderateScale(13),
        fontWeight: '700',
        color: '#1E293B',
        fontFamily: 'Outfit_700Bold',
    },
    chartContainer: {
        backgroundColor: '#FFFFFF',
        padding: moderateScale(16),
        borderRadius: moderateScale(20),
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        alignItems: 'center',
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: verticalScale(16),
        gap: scale(24),
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(8),
    },
    legendDot: {
        width: scale(8),
        height: scale(8),
        borderRadius: scale(4),
    },
    legendText: {
        fontSize: moderateScale(12),
        color: '#64748B',
        fontWeight: '500',
        fontFamily: 'Outfit_500Medium',
    },
    transactionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: moderateScale(16),
        borderRadius: moderateScale(16),
        marginBottom: verticalScale(12),
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    transactionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(12),
    },
    transactionIcon: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(12),
        justifyContent: 'center',
        alignItems: 'center',
    },
    transactionLabel: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: verticalScale(2),
        fontFamily: 'Outfit_500Medium',
    },
    transactionCount: {
        fontSize: moderateScale(12),
        color: '#94A3B8',
        fontFamily: 'Outfit_400Regular',
    },
    transactionAmount: {
        fontSize: moderateScale(14),
        fontWeight: '700',
        fontFamily: 'Outfit_700Bold',
    },
});
