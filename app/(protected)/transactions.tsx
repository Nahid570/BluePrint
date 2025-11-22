import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

// Mock Data based on API response
const MOCK_DATA = {
    categories: [
        { type: "deposit", label: "Deposit", total_amount: 1930943.94, count: 27 },
        { type: "withdrawal", label: "Withdrawal", total_amount: 1018653.73, count: 22 },
        { type: "share_deposit", label: "Share Deposit", total_amount: 1003815.86, count: 23 },
        { type: "share_withdrawal", label: "Share Withdrawal", total_amount: 1027494.89, count: 21 },
        { type: "investment", label: "Investment", total_amount: 1251271.72, count: 24 },
        { type: "profit", label: "Profit", total_amount: 784357.04, count: 15 }
    ],
    transactions: [
        {
            id: 1119,
            transaction_number: "TXN-16-20251116-8EAVRS",
            transaction_type: "share_withdrawal",
            transaction_type_label: "Share Withdrawal",
            amount: 31775.63,
            status: "completed",
            status_label: "Completed",
            transaction_date: "2025-11-16 09:54:24",
        },
        {
            id: 1058,
            transaction_number: "TXN-16-20251116-F4U5O0",
            transaction_type: "withdrawal",
            transaction_type_label: "Withdrawal",
            amount: 23494.97,
            status: "completed",
            status_label: "Completed",
            transaction_date: "2025-11-16 09:54:23",
        },
        {
            id: 36,
            transaction_number: "ZXIX65XX",
            transaction_type: "deposit",
            transaction_type_label: "Deposit",
            amount: 10000,
            status: "completed",
            status_label: "Completed",
            transaction_date: "2025-11-16 00:00:00",
        },
        {
            id: 1096,
            transaction_number: "TXN-16-20251116-9JDHE1",
            transaction_type: "investment",
            transaction_type_label: "Investment",
            amount: 83630.07,
            status: "completed",
            status_label: "Completed",
            transaction_date: "2025-11-14 09:54:24",
        },
        {
            id: 1097,
            transaction_number: "TXN-16-20251116-9JDHE2",
            transaction_type: "profit",
            transaction_type_label: "Profit",
            amount: 5000.00,
            status: "completed",
            status_label: "Completed",
            transaction_date: "2025-11-13 10:00:00",
        }
    ]
};

const getTypeColor = (type: string) => {
    const colors: any = {
        deposit: { bg: '#ECFDF5', icon: '#10B981' },
        withdrawal: { bg: '#FEF2F2', icon: '#EF4444' },
        share_deposit: { bg: '#EFF6FF', icon: '#3B82F6' },
        share_withdrawal: { bg: '#FEF2F2', icon: '#F97316' },
        investment: { bg: '#F5F3FF', icon: '#8B5CF6' },
        profit: { bg: '#ECFDF5', icon: '#059669' },
    };
    return colors[type] || { bg: '#F8FAFC', icon: '#64748B' };
};

const getTypeIcon = (type: string) => {
    const icons: any = {
        deposit: 'arrow-down-circle',
        withdrawal: 'arrow-up-circle',
        share_deposit: 'cube',
        share_withdrawal: 'cube-outline',
        investment: 'trending-up',
        profit: 'cash',
    };
    return icons[type] || 'swap-horizontal';
};

export default function TransactionsScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [showFilterModal, setShowFilterModal] = useState(false);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // Calculate totals
    const totalIn = MOCK_DATA.categories
        .filter(c => ['deposit', 'share_deposit', 'profit'].includes(c.type))
        .reduce((sum, c) => sum + c.total_amount, 0);

    const totalOut = MOCK_DATA.categories
        .filter(c => ['withdrawal', 'share_withdrawal', 'investment'].includes(c.type))
        .reduce((sum, c) => sum + c.total_amount, 0);

    // Filter transactions
    const filteredTransactions = MOCK_DATA.transactions.filter(t => {
        const matchesSearch = t.transaction_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.transaction_type_label.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = selectedFilter === 'all' || t.transaction_type === selectedFilter;
        return matchesSearch && matchesFilter;
    });

    const handleFilterSelect = (type: string) => {
        setSelectedFilter(type);
        setShowFilterModal(false);
    };

    const FilterOption = ({ label, count, type, icon }: any) => {
        const isSelected = selectedFilter === type;
        const colors = type === 'all'
            ? { bg: '#F1F5F9', icon: '#64748B' }
            : getTypeColor(type);

        return (
            <TouchableOpacity
                style={[
                    styles.filterOption,
                    isSelected && styles.filterOptionSelected
                ]}
                onPress={() => handleFilterSelect(type)}
            >
                <View style={[styles.filterIcon, { backgroundColor: colors.bg }]}>
                    <Ionicons name={icon || getTypeIcon(type) as any} size={scale(20)} color={colors.icon} />
                </View>
                <View style={styles.filterContent}>
                    <Text style={styles.filterLabel}>
                        {label}
                    </Text>
                    <Text style={styles.filterCount}>{count} transactions</Text>
                </View>
                {isSelected && (
                    <View style={styles.checkmarkContainer}>
                        <Ionicons name="checkmark" size={scale(14)} color="#FFFFFF" />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const TransactionItem = ({ item }: any) => {
        const colors = getTypeColor(item.transaction_type);
        const isNegative = item.transaction_type.includes('withdrawal') || item.transaction_type === 'investment';

        return (
            <TouchableOpacity
                style={styles.transactionItem}
                onPress={() => router.push('/(protected)/transaction-detail')}
            >
                <View style={styles.transactionLeft}>
                    <View style={[styles.transactionIcon, { backgroundColor: colors.bg }]}>
                        <Ionicons name={getTypeIcon(item.transaction_type) as any} size={scale(20)} color={colors.icon} />
                    </View>
                    <View>
                        <Text style={styles.transactionTitle}>{item.transaction_type_label}</Text>
                        <Text style={styles.transactionDate}>{formatDate(item.transaction_date)}</Text>
                    </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[
                        styles.transactionAmount,
                        { color: isNegative ? '#EF4444' : '#10B981' }
                    ]}>
                        {isNegative ? '-' : '+'}{formatCurrency(item.amount)}
                    </Text>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{item.status_label}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.content}>
                <FlatList
                    data={filteredTransactions}
                    extraData={selectedFilter}
                    renderItem={({ item }) => <TransactionItem item={item} />}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <>
                            {/* Summary Cards */}
                            <View style={styles.summaryContainer}>
                                <View style={[styles.summaryCard, { backgroundColor: '#ECFDF5' }]}>
                                    <View style={[styles.summaryIcon, { backgroundColor: '#10B981' }]}>
                                        <Ionicons name="arrow-down" size={scale(20)} color="#FFFFFF" />
                                    </View>
                                    <Text style={styles.summaryLabel}>Total In</Text>
                                    <Text style={[styles.summaryAmount, { color: '#10B981' }]}>
                                        {formatCurrency(totalIn)}
                                    </Text>
                                </View>

                                <View style={[styles.summaryCard, { backgroundColor: '#FEF2F2' }]}>
                                    <View style={[styles.summaryIcon, { backgroundColor: '#EF4444' }]}>
                                        <Ionicons name="arrow-up" size={scale(20)} color="#FFFFFF" />
                                    </View>
                                    <Text style={styles.summaryLabel}>Total Out</Text>
                                    <Text style={[styles.summaryAmount, { color: '#EF4444' }]}>
                                        {formatCurrency(totalOut)}
                                    </Text>
                                </View>
                            </View>

                            {/* Search & Filter */}
                            <View style={styles.searchSection}>
                                <View style={styles.searchBar}>
                                    <Ionicons name="search" size={scale(20)} color="#94A3B8" />
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder="Search transactions..."
                                        placeholderTextColor="#CBD5E1"
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                    />
                                </View>
                                <TouchableOpacity
                                    style={styles.filterButton}
                                    onPress={() => setShowFilterModal(true)}
                                >
                                    <Ionicons name="filter" size={scale(20)} color="#2563EB" />
                                    {selectedFilter !== 'all' && <View style={styles.filterBadge} />}
                                </TouchableOpacity>
                            </View>
                        </>
                    }
                />
            </View>

            {/* Filter Modal */}
            <Modal
                visible={showFilterModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowFilterModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filter by Category</Text>
                            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                                <Ionicons name="close" size={scale(24)} color="#64748B" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.filterOptions}>
                            <FilterOption
                                label="All Transactions"
                                count={MOCK_DATA.transactions.length}
                                type="all"
                                icon="grid"
                            />
                            {MOCK_DATA.categories.map((category) => (
                                <FilterOption
                                    key={category.type}
                                    label={category.label}
                                    count={category.count}
                                    type={category.type}
                                />
                            ))}
                        </View>
                    </View>
                </View>
            </Modal>
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
    listContainer: {
        paddingBottom: verticalScale(20),
    },
    summaryContainer: {
        flexDirection: 'row',
        paddingHorizontal: moderateScale(20),
        paddingTop: verticalScale(20),
        gap: scale(12),
        marginBottom: verticalScale(20),
    },
    summaryCard: {
        flex: 1,
        padding: moderateScale(16),
        borderRadius: moderateScale(16),
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    summaryIcon: {
        width: scale(32),
        height: scale(32),
        borderRadius: scale(10),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(8),
    },
    summaryLabel: {
        fontSize: moderateScale(12),
        color: '#64748B',
        marginBottom: verticalScale(4),
        fontFamily: 'Outfit_400Regular',
    },
    summaryAmount: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        fontFamily: 'Outfit_700Bold',
    },
    searchSection: {
        flexDirection: 'row',
        paddingHorizontal: moderateScale(20),
        gap: scale(12),
        marginBottom: verticalScale(20),
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: scale(12),
        height: verticalScale(44),
        borderRadius: moderateScale(12),
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    searchInput: {
        flex: 1,
        marginLeft: scale(8),
        fontSize: moderateScale(14),
        color: '#1E293B',
        fontFamily: 'Outfit_400Regular',
    },
    filterButton: {
        width: verticalScale(44),
        height: verticalScale(44),
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: moderateScale(12),
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    filterBadge: {
        position: 'absolute',
        top: scale(10),
        right: scale(10),
        width: scale(8),
        height: scale(8),
        borderRadius: scale(4),
        backgroundColor: '#EF4444',
    },
    transactionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: moderateScale(16),
        marginHorizontal: moderateScale(20),
        marginBottom: verticalScale(12),
        borderRadius: moderateScale(16),
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
    transactionTitle: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: verticalScale(2),
        fontFamily: 'Outfit_500Medium',
    },
    transactionDate: {
        fontSize: moderateScale(12),
        color: '#94A3B8',
        fontFamily: 'Outfit_400Regular',
    },
    transactionAmount: {
        fontSize: moderateScale(14),
        fontWeight: '700',
        fontFamily: 'Outfit_700Bold',
    },
    statusBadge: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(2),
        borderRadius: scale(4),
        marginTop: verticalScale(4),
    },
    statusText: {
        fontSize: moderateScale(10),
        color: '#64748B',
        textTransform: 'capitalize',
        fontFamily: 'Outfit_500Medium',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: moderateScale(24),
        borderTopRightRadius: moderateScale(24),
        padding: moderateScale(24),
        paddingBottom: verticalScale(40),
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(24),
    },
    modalTitle: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: '#1E293B',
        fontFamily: 'Outfit_700Bold',
    },
    filterOptions: {
        gap: verticalScale(12),
    },
    filterOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: moderateScale(12),
        backgroundColor: '#FFFFFF',
        borderRadius: moderateScale(12),
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    filterOptionSelected: {
        borderColor: '#2563EB',
        backgroundColor: '#F8FAFC',
    },
    filterIcon: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(12),
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterContent: {
        flex: 1,
        marginLeft: scale(12),
    },
    filterLabel: {
        fontSize: moderateScale(14),
        color: '#1E293B',
        fontFamily: 'Outfit_600SemiBold',
        marginBottom: verticalScale(2),
    },
    filterCount: {
        fontSize: moderateScale(12),
        color: '#94A3B8',
        fontFamily: 'Outfit_400Regular',
    },
    checkmarkContainer: {
        width: scale(24),
        height: scale(24),
        borderRadius: scale(12),
        backgroundColor: '#2563EB',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
