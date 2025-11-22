import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useSession } from '../../context/AuthContext';

// Mock Data based on API response
const PROFILE_DATA = {
    id: 31,
    name: "Nafed",
    email: "nafed25458@canvect.com",
    phone: "01412987876",
    investor_id: "100003",
    balance: 341318.7,
    share_quantity: 160,
    share_amount: 78377.8,
    status: "active",
    avatar: "https://blueprint.lssoft.xyz/public/documents/company_16/members/avatars/1763532883_avatar_jbss.webp",
    address: "123 Main St, Apt 4B",
    city: "Dhaka",
    state: "Dhaka",
    country: "Bangladesh",
    date_of_birth: "2025-11-05",
    gender: "female",
    marital_status: "single"
};

export default function ProfileScreen() {
    const router = useRouter();
    const { signOut } = useSession();

    const handleSignOut = () => {
        Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Sign Out",
                    onPress: signOut,
                    style: "destructive"
                }
            ]
        );
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const InfoRow = ({ icon, label, value }: { icon: any, label: string, value: string | null }) => (
        <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
                <Ionicons name={icon} size={scale(18)} color="#64748B" />
            </View>
            <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value || 'Not set'}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: PROFILE_DATA.avatar }}
                            style={styles.avatar}
                        />
                        <View style={styles.statusBadge}>
                            <View style={styles.statusDot} />
                        </View>
                    </View>
                    <Text style={styles.name}>{PROFILE_DATA.name}</Text>
                    <View style={styles.idBadge}>
                        <Text style={styles.idText}>ID: {PROFILE_DATA.investor_id}</Text>
                    </View>
                </View>

                {/* Stats Row */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Total Shares</Text>
                        <Text style={styles.statValue}>{PROFILE_DATA.share_quantity}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Wallet Balance</Text>
                        <Text style={styles.statValue}>{formatCurrency(PROFILE_DATA.balance)}</Text>
                    </View>
                </View>

                {/* Contact Information */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Contact Information</Text>
                        <TouchableOpacity onPress={() => router.push('/(protected)/edit-profile')}>
                            <Text style={styles.editLink}>Edit</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.card}>
                        <InfoRow icon="mail-outline" label="Email" value={PROFILE_DATA.email} />
                        <View style={styles.divider} />
                        <InfoRow icon="call-outline" label="Phone" value={PROFILE_DATA.phone} />
                        <View style={styles.divider} />
                        <InfoRow icon="location-outline" label="Address" value={`${PROFILE_DATA.address}, ${PROFILE_DATA.city}, ${PROFILE_DATA.country}`} />
                    </View>
                </View>

                {/* Personal Details */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Personal Details</Text>
                    </View>
                    <View style={styles.card}>
                        <InfoRow icon="calendar-outline" label="Date of Birth" value={PROFILE_DATA.date_of_birth} />
                        <View style={styles.divider} />
                        <InfoRow icon="person-outline" label="Gender" value={PROFILE_DATA.gender} />
                        <View style={styles.divider} />
                        <InfoRow icon="heart-outline" label="Marital Status" value={PROFILE_DATA.marital_status} />
                    </View>
                </View>

                {/* Settings & Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Settings</Text>
                    <View style={styles.card}>
                        <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/(protected)/change-password')}>
                            <View style={styles.actionLeft}>
                                <View style={[styles.actionIcon, { backgroundColor: '#EFF6FF' }]}>
                                    <Ionicons name="lock-closed-outline" size={scale(20)} color="#3B82F6" />
                                </View>
                                <Text style={styles.actionLabel}>Change Password</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={scale(20)} color="#94A3B8" />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity style={styles.actionRow} onPress={handleSignOut}>
                            <View style={styles.actionLeft}>
                                <View style={[styles.actionIcon, { backgroundColor: '#FEF2F2' }]}>
                                    <Ionicons name="log-out-outline" size={scale(20)} color="#EF4444" />
                                </View>
                                <Text style={[styles.actionLabel, { color: '#EF4444' }]}>Sign Out</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
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
        alignItems: 'center',
        marginBottom: verticalScale(24),
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: verticalScale(12),
    },
    avatar: {
        width: scale(100),
        height: scale(100),
        borderRadius: scale(50),
        borderWidth: 4,
        borderColor: '#FFFFFF',
    },
    statusBadge: {
        position: 'absolute',
        bottom: scale(4),
        right: scale(4),
        width: scale(24),
        height: scale(24),
        borderRadius: scale(12),
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusDot: {
        width: scale(16),
        height: scale(16),
        borderRadius: scale(8),
        backgroundColor: '#10B981',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    name: {
        fontSize: moderateScale(24),
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: verticalScale(4),
        fontFamily: 'Outfit_700Bold',
    },
    idBadge: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(4),
        borderRadius: scale(12),
    },
    idText: {
        fontSize: moderateScale(12),
        color: '#3B82F6',
        fontWeight: '600',
        fontFamily: 'Outfit_500Medium',
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: moderateScale(16),
        padding: moderateScale(16),
        marginBottom: verticalScale(24),
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: '#E2E8F0',
        marginHorizontal: scale(16),
    },
    statLabel: {
        fontSize: moderateScale(12),
        color: '#64748B',
        marginBottom: verticalScale(4),
        fontFamily: 'Outfit_400Regular',
    },
    statValue: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: '#1E293B',
        fontFamily: 'Outfit_700Bold',
    },
    section: {
        marginBottom: verticalScale(24),
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    sectionTitle: {
        fontSize: moderateScale(16),
        fontWeight: '700',
        color: '#1E293B',
        fontFamily: 'Outfit_700Bold',
        marginBottom: verticalScale(12),
    },
    editLink: {
        fontSize: moderateScale(14),
        color: '#3B82F6',
        fontWeight: '600',
        fontFamily: 'Outfit_500Medium',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: moderateScale(16),
        padding: moderateScale(16),
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: verticalScale(8),
    },
    infoIconContainer: {
        width: scale(32),
        height: scale(32),
        borderRadius: scale(8),
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(12),
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: moderateScale(12),
        color: '#94A3B8',
        marginBottom: verticalScale(2),
        fontFamily: 'Outfit_400Regular',
    },
    infoValue: {
        fontSize: moderateScale(14),
        color: '#1E293B',
        fontWeight: '500',
        fontFamily: 'Outfit_500Medium',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: verticalScale(8),
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: verticalScale(8),
    },
    actionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionIcon: {
        width: scale(36),
        height: scale(36),
        borderRadius: scale(10),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(12),
    },
    actionLabel: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#1E293B',
        fontFamily: 'Outfit_500Medium',
    },
});
