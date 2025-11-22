import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    SectionList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

// Mock Data from API
const MOCK_REPORT = {
    summary: {
        total_investment: 1251271.72,
        total_profit: 784357.04,
        roi_percentage: 62.68,
        active_clubs_count: 5,
    }
};

const MOCK_CLUBS = [
    {
        id: 6,
        name: "Land Investment Club #1",
        status: "active",
        investment_type: "Real Estate",
        risk_level: "aggressive",
        investment_horizon_label: "3 Months",
        share_price: 59.6,
        expected_return: 16.96,
        current_members: 19,
        max_members: 98,
        category: {
            name: "Land",
            icon: "land",
            color: "violet"
        },
        is_member: false,
    },
    {
        id: 22,
        name: "Breeding Cow Investment Equity Fund #17",
        status: "active",
        investment_type: "Real Estate",
        risk_level: "moderate",
        investment_horizon_label: "5 Years",
        share_price: 16.6,
        expected_return: 15.67,
        current_members: 15,
        max_members: 16,
        category: {
            name: "Breeding Cow Investment",
            icon: "farm",
            color: "rose"
        },
        is_member: true,
    },
    {
        id: 35,
        name: "Tech Startup Seed Fund #4",
        status: "active",
        investment_type: "Venture Capital",
        risk_level: "aggressive",
        investment_horizon_label: "7 Years",
        share_price: 120.5,
        expected_return: 25.4,
        current_members: 42,
        max_members: 50,
        category: {
            name: "Tech Startups",
            icon: "rocket",
            color: "cyan"
        },
        is_member: false,
    },
    {
        id: 41,
        name: "Green Energy Bond Series A",
        status: "active",
        investment_type: "Bonds",
        risk_level: "conservative",
        investment_horizon_label: "3 Years",
        share_price: 1000,
        expected_return: 8.5,
        current_members: 156,
        max_members: 200,
        category: {
            name: "Green Energy",
            icon: "leaf",
            color: "green"
        },
        is_member: false,
    },
    {
        id: 56,
        name: "Commercial Real Estate Trust",
        status: "active",
        investment_type: "REIT",
        risk_level: "moderate",
        investment_horizon_label: "10 Years",
        share_price: 500,
        expected_return: 12.2,
        current_members: 89,
        max_members: 100,
        category: {
            name: "Commercial RE",
            icon: "business",
            color: "amber"
        },
        is_member: true,
    },
    {
        id: 63,
        name: "Crypto Assets Diversified",
        status: "active",
        investment_type: "Crypto",
        risk_level: "speculative",
        investment_horizon_label: "1 Year",
        share_price: 10.5,
        expected_return: 45.0,
        current_members: 312,
        max_members: 500,
        category: {
            name: "Crypto",
            icon: "logo-bitcoin",
            color: "violet"
        },
        is_member: false,
    },
    {
        id: 78,
        name: "Agro-Farming Expansion Project",
        status: "active",
        investment_type: "Agriculture",
        risk_level: "moderate",
        investment_horizon_label: "2 Years",
        share_price: 75.25,
        expected_return: 14.8,
        current_members: 67,
        max_members: 150,
        category: {
            name: "Agriculture",
            icon: "nutrition",
            color: "green"
        },
        is_member: false,
    },
    {
        id: 92,
        name: "Blue Chip Dividend Fund",
        status: "active",
        investment_type: "Stocks",
        risk_level: "conservative",
        investment_horizon_label: "5 Years",
        share_price: 250.0,
        expected_return: 9.5,
        current_members: 204,
        max_members: 300,
        category: {
            name: "Stocks",
            icon: "trending-up",
            color: "blue"
        },
        is_member: true,
    },
];

const getCategoryColor = (color: string) => {
    const colors: any = {
        violet: '#8B5CF6',
        rose: '#F43F5E',
        red: '#EF4444',
        cyan: '#06B6D4',
        amber: '#F59E0B',
        gray: '#6B7280',
    };
    return colors[color] || '#64748B';
};

const getRiskColor = (risk: string) => {
    const colors: any = {
        conservative: '#10B981',
        moderate: '#3B82F6',
        aggressive: '#F97316',
        speculative: '#EF4444',
    };
    return colors[risk] || '#64748B';
};

export default function ClubsScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'my' | 'all'>('all');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const filteredClubs = activeTab === 'my'
        ? MOCK_CLUBS.filter(club => club.is_member)
        : MOCK_CLUBS;

    const StatCard = ({ icon, label, value, color }: any) => (
        <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={scale(20)} color={color} />
            </View>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>{value}</Text>
        </View>
    );

    const ClubCard = ({ item }: any) => {
        const categoryColor = getCategoryColor(item.category.color);
        const riskColor = getRiskColor(item.risk_level);

        return (
            <TouchableOpacity
                style={styles.clubCard}
                onPress={() => router.push(`/(protected)/club-detail?id=${item.id}`)}
            >
                <View style={styles.clubHeader}>
                    <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
                        <Ionicons name="business" size={scale(16)} color={categoryColor} />
                        <Text style={[styles.categoryText, { color: categoryColor }]}>
                            {item.category.name}
                        </Text>
                    </View>
                    {item.is_member && (
                        <View style={styles.memberBadge}>
                            <Text style={styles.memberText}>Member</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.clubName}>{item.name}</Text>
                <Text style={styles.clubType}>{item.investment_type}</Text>

                <View style={styles.clubStats}>
                    <View style={styles.statItem}>
                        <Text style={styles.statItemLabel}>Share Price</Text>
                        <Text style={styles.statItemValue}>{formatCurrency(item.share_price)}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statItemLabel}>Expected Return</Text>
                        <Text style={[styles.statItemValue, { color: '#10B981' }]}>
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
                        <Text style={styles.footerText}>{item.investment_horizon_label}</Text>
                    </View>
                    <View style={[styles.riskBadge, { backgroundColor: riskColor + '20' }]}>
                        <Text style={[styles.riskText, { color: riskColor }]}>
                            {item.risk_level}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderSectionHeader = () => (
        <View style={styles.stickyHeaderContainer}>
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'all' && styles.tabActive]}
                    onPress={() => setActiveTab('all')}
                >
                    <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
                        All Clubs
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'my' && styles.tabActive]}
                    onPress={() => setActiveTab('my')}
                >
                    <Text style={[styles.tabText, activeTab === 'my' && styles.tabTextActive]}>
                        My Clubs
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.content}>
                <SectionList
                    sections={[{ data: filteredClubs }]}
                    renderItem={({ item }) => <ClubCard item={item} />}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    stickySectionHeadersEnabled={true}
                    renderSectionHeader={renderSectionHeader}
                    ListHeaderComponent={
                        <View style={styles.summaryContainer}>
                            <StatCard
                                icon="briefcase"
                                label="Active Clubs"
                                value={MOCK_REPORT.summary.active_clubs_count}
                                color="#3B82F6"
                            />
                            <StatCard
                                icon="trending-up"
                                label="Total Investment"
                                value={formatCurrency(MOCK_REPORT.summary.total_investment)}
                                color="#8B5CF6"
                            />
                            <StatCard
                                icon="cash"
                                label="Total Profit"
                                value={formatCurrency(MOCK_REPORT.summary.total_profit)}
                                color="#10B981"
                            />
                            <StatCard
                                icon="stats-chart"
                                label="ROI"
                                value={`${MOCK_REPORT.summary.roi_percentage}%`}
                                color="#F59E0B"
                            />
                        </View>
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="business-outline" size={scale(64)} color="#CBD5E1" />
                            <Text style={styles.emptyText}>No clubs found</Text>
                            <Text style={styles.emptySubtext}>
                                {activeTab === 'my'
                                    ? "You haven't joined any clubs yet"
                                    : "No clubs available at the moment"}
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
        backgroundColor: '#F8FAFC',
    },
    content: {
        flex: 1,
    },
    summaryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingTop: verticalScale(16),
        gap: scale(12),
        marginBottom: verticalScale(20),
    },
    statCard: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        padding: moderateScale(16),
        borderRadius: moderateScale(16),
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statIcon: {
        width: scale(36),
        height: scale(36),
        borderRadius: scale(10),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(8),
    },
    statLabel: {
        fontSize: moderateScale(11),
        color: '#64748B',
        marginBottom: verticalScale(4),
        fontFamily: 'Outfit_400Regular',
    },
    statValue: {
        fontSize: moderateScale(16),
        fontWeight: '700',
        color: '#1E293B',
        fontFamily: 'Outfit_700Bold',
    },
    stickyHeaderContainer: {
        backgroundColor: '#F8FAFC',
        paddingBottom: verticalScale(16),
    },
    tabContainer: {
        flexDirection: 'row',
        gap: scale(12),
    },
    tab: {
        flex: 1,
        paddingVertical: verticalScale(12),
        borderRadius: moderateScale(12),
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    tabActive: {
        backgroundColor: '#2563EB',
    },
    tabText: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#64748B',
        fontFamily: 'Outfit_500Medium',
    },
    tabTextActive: {
        color: '#FFFFFF',
    },
    listContainer: {
        paddingHorizontal: moderateScale(20),
        paddingBottom: verticalScale(20),
    },
    clubCard: {
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
    clubHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(6),
        borderRadius: scale(8),
        gap: scale(6),
    },
    categoryText: {
        fontSize: moderateScale(11),
        fontWeight: '600',
        fontFamily: 'Outfit_500Medium',
    },
    memberBadge: {
        backgroundColor: '#ECFDF5',
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(4),
        borderRadius: scale(6),
    },
    memberText: {
        fontSize: moderateScale(10),
        fontWeight: '600',
        color: '#10B981',
        fontFamily: 'Outfit_500Medium',
    },
    clubName: {
        fontSize: moderateScale(16),
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: verticalScale(4),
        fontFamily: 'Outfit_700Bold',
    },
    clubType: {
        fontSize: moderateScale(12),
        color: '#64748B',
        marginBottom: verticalScale(12),
        fontFamily: 'Outfit_400Regular',
    },
    clubStats: {
        flexDirection: 'row',
        gap: scale(16),
        marginBottom: verticalScale(12),
        paddingBottom: verticalScale(12),
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    statItem: {
        flex: 1,
    },
    statItemLabel: {
        fontSize: moderateScale(11),
        color: '#94A3B8',
        marginBottom: verticalScale(4),
        fontFamily: 'Outfit_400Regular',
    },
    statItemValue: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#1E293B',
        fontFamily: 'Outfit_500Medium',
    },
    clubFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(12),
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(4),
    },
    footerText: {
        fontSize: moderateScale(11),
        color: '#94A3B8',
        fontFamily: 'Outfit_400Regular',
    },
    riskBadge: {
        marginLeft: 'auto',
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(4),
        borderRadius: scale(6),
    },
    riskText: {
        fontSize: moderateScale(10),
        fontWeight: '600',
        textTransform: 'capitalize',
        fontFamily: 'Outfit_500Medium',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: verticalScale(60),
    },
    emptyText: {
        fontSize: moderateScale(18),
        fontWeight: '600',
        color: '#1E293B',
        marginTop: verticalScale(16),
        marginBottom: verticalScale(8),
        fontFamily: 'Outfit_500Medium',
    },
    emptySubtext: {
        fontSize: moderateScale(14),
        color: '#94A3B8',
        textAlign: 'center',
        fontFamily: 'Outfit_400Regular',
    },
});
