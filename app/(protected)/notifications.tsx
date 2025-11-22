import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

// Mock Notifications Data
const MOCK_NOTIFICATIONS = [
    {
        id: "1",
        title: "Personal Document Uploaded",
        message: "Your Document document 'BDRAILWAY_TICKET' has been uploaded successfully and is pending review.",
        notification_type: "info",
        is_read: false,
        created_at_human: "2 days ago"
    },
    {
        id: "2",
        title: "Added to Club",
        message: "You have been added to the investment club 'Passenger Cars Equity Group #5'.",
        notification_type: "success",
        is_read: false,
        created_at_human: "5 days ago"
    },
    {
        id: "3",
        title: "Transaction Completed",
        message: "Your withdrawal of BDT 50,000 has been processed successfully.",
        notification_type: "success",
        is_read: true,
        created_at_human: "1 week ago"
    },
    {
        id: "4",
        title: "Investment Opportunity",
        message: "New investment club 'Land Investment Club #2' is now available.",
        notification_type: "info",
        is_read: true,
        created_at_human: "2 weeks ago"
    },
];

const getNotificationIcon = (type: string) => {
    const icons: any = {
        success: 'checkmark-circle',
        info: 'information-circle',
        warning: 'warning',
        error: 'close-circle',
    };
    return icons[type] || 'notifications';
};

const getNotificationColor = (type: string) => {
    const colors: any = {
        success: '#10B981',
        info: '#3B82F6',
        warning: '#F59E0B',
        error: '#EF4444',
    };
    return colors[type] || '#64748B';
};

export default function NotificationsScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

    const filteredNotifications = activeTab === 'unread'
        ? notifications.filter(n => !n.is_read)
        : notifications;

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleMarkAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        );
    };

    const handleMarkAllAsRead = () => {
        setNotifications(prev =>
            prev.map(n => ({ ...n, is_read: true }))
        );
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            'Delete Notification',
            'Are you sure you want to delete this notification?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setNotifications(prev => prev.filter(n => n.id !== id));
                    }
                }
            ]
        );
    };

    const renderRightActions = (id: string) => (
        <TouchableOpacity
            style={styles.deleteAction}
            onPress={() => handleDelete(id)}
        >
            <Ionicons name="trash" size={scale(20)} color="#FFFFFF" />
            <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
    );

    const NotificationItem = ({ item }: any) => {
        const color = getNotificationColor(item.notification_type);
        const icon = getNotificationIcon(item.notification_type);

        return (
            <Swipeable
                renderRightActions={() => renderRightActions(item.id)}
                overshootRight={false}
            >
                <TouchableOpacity
                    style={[
                        styles.notificationCard,
                        !item.is_read && styles.unreadCard
                    ]}
                    onPress={() => !item.is_read && handleMarkAsRead(item.id)}
                >
                    <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                        <Ionicons name={icon} size={scale(24)} color={color} />
                    </View>
                    <View style={styles.contentContainer}>
                        <View style={styles.headerRow}>
                            <Text style={styles.title}>{item.title}</Text>
                            {!item.is_read && <View style={styles.unreadDot} />}
                        </View>
                        <Text style={styles.message} numberOfLines={2}>
                            {item.message}
                        </Text>
                        <Text style={styles.time}>{item.created_at_human}</Text>
                    </View>
                </TouchableOpacity>
            </Swipeable>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <Stack.Screen options={{
                presentation: 'modal',
                headerShown: true,
                title: 'Notifications',
                headerTitleStyle: {
                    fontFamily: 'Outfit_700Bold',
                    fontSize: moderateScale(18),
                    color: '#1E293B',
                },
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
                        <Ionicons name="arrow-back" size={24} color="#1E293B" />
                    </TouchableOpacity>
                ),
                headerRight: () => unreadCount > 0 ? (
                    <TouchableOpacity onPress={handleMarkAllAsRead} style={{ marginRight: 10 }}>
                        <Text style={styles.markAllText}>Mark All Read</Text>
                    </TouchableOpacity>
                ) : null,
            }} />

            <View style={styles.content}>
                {/* Filter Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'all' && styles.tabActive]}
                        onPress={() => setActiveTab('all')}
                    >
                        <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
                            All
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'unread' && styles.tabActive]}
                        onPress={() => setActiveTab('unread')}
                    >
                        <Text style={[styles.tabText, activeTab === 'unread' && styles.tabTextActive]}>
                            Unread {unreadCount > 0 && `(${unreadCount})`}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Notifications List */}
                <FlatList
                    data={filteredNotifications}
                    renderItem={({ item }) => <NotificationItem item={item} />}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="notifications-off-outline" size={scale(64)} color="#CBD5E1" />
                            <Text style={styles.emptyText}>No notifications</Text>
                            <Text style={styles.emptySubtext}>
                                {activeTab === 'unread'
                                    ? "You're all caught up!"
                                    : "You don't have any notifications yet"}
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
    markAllText: {
        fontSize: moderateScale(13),
        fontWeight: '600',
        color: '#2563EB',
        fontFamily: 'Outfit_500Medium',
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: moderateScale(20),
        paddingVertical: verticalScale(12),
        gap: scale(12),
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    tab: {
        flex: 1,
        paddingVertical: verticalScale(10),
        borderRadius: moderateScale(10),
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
    },
    tabActive: {
        backgroundColor: '#2563EB',
    },
    tabText: {
        fontSize: moderateScale(13),
        fontWeight: '600',
        color: '#64748B',
        fontFamily: 'Outfit_500Medium',
    },
    tabTextActive: {
        color: '#FFFFFF',
    },
    listContainer: {
        padding: moderateScale(20),
    },
    notificationCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        padding: moderateScale(14),
        borderRadius: moderateScale(14),
        marginBottom: verticalScale(12),
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    unreadCard: {
        backgroundColor: '#EFF6FF',
        borderLeftWidth: 3,
        borderLeftColor: '#2563EB',
    },
    iconContainer: {
        width: scale(48),
        height: scale(48),
        borderRadius: scale(12),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(12),
    },
    contentContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: verticalScale(4),
    },
    title: {
        fontSize: moderateScale(14),
        fontWeight: '700',
        color: '#1E293B',
        flex: 1,
        fontFamily: 'Outfit_700Bold',
    },
    unreadDot: {
        width: scale(8),
        height: scale(8),
        borderRadius: scale(4),
        backgroundColor: '#2563EB',
        marginLeft: scale(8),
    },
    message: {
        fontSize: moderateScale(13),
        color: '#64748B',
        lineHeight: moderateScale(18),
        marginBottom: verticalScale(6),
        fontFamily: 'Outfit_400Regular',
    },
    time: {
        fontSize: moderateScale(11),
        color: '#94A3B8',
        fontFamily: 'Outfit_400Regular',
    },
    deleteAction: {
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
        width: scale(80),
        borderRadius: moderateScale(14),
        marginBottom: verticalScale(12),
    },
    deleteText: {
        color: '#FFFFFF',
        fontSize: moderateScale(12),
        fontWeight: '600',
        marginTop: verticalScale(4),
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
