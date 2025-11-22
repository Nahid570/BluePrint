import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

export default function ChangePasswordScreen() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const handleChangePassword = () => {
        // TODO: Implement API POST request
        console.log('Changing password:', formData);
        router.replace('/(protected)/profile');
    };

    const PasswordField = ({
        label,
        value,
        field,
        placeholder,
        showKey
    }: {
        label: string;
        value: string;
        field: 'current_password' | 'new_password' | 'new_password_confirmation';
        placeholder: string;
        showKey: 'current' | 'new' | 'confirm';
    }) => (
        <View style={styles.inputWrapper}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={(text) => setFormData({ ...formData, [field]: text })}
                    placeholder={placeholder}
                    placeholderTextColor="#CBD5E1"
                    secureTextEntry={!showPasswords[showKey]}
                />
                <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPasswords({ ...showPasswords, [showKey]: !showPasswords[showKey] })}
                >
                    <Ionicons
                        name={showPasswords[showKey] ? 'eye-off-outline' : 'eye-outline'}
                        size={scale(20)}
                        color="#94A3B8"
                    />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <Stack.Screen options={{
                presentation: 'modal',
                headerShown: true,
                title: 'Change Password',
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
            }} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.infoCard}>
                        <Ionicons name="information-circle-outline" size={scale(20)} color="#3B82F6" />
                        <Text style={styles.infoText}>
                            Password must be at least 8 characters long
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <PasswordField
                            label="Current Password"
                            value={formData.current_password}
                            field="current_password"
                            placeholder="Enter current password"
                            showKey="current"
                        />
                        <PasswordField
                            label="New Password"
                            value={formData.new_password}
                            field="new_password"
                            placeholder="Enter new password"
                            showKey="new"
                        />
                        <PasswordField
                            label="Confirm New Password"
                            value={formData.new_password_confirmation}
                            field="new_password_confirmation"
                            placeholder="Re-enter new password"
                            showKey="confirm"
                        />
                    </View>

                    <TouchableOpacity style={styles.submitButton} onPress={handleChangePassword}>
                        <Text style={styles.submitButtonText}>Update Password</Text>
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
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
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        padding: moderateScale(12),
        borderRadius: moderateScale(12),
        marginBottom: verticalScale(24),
        gap: scale(8),
    },
    infoText: {
        flex: 1,
        fontSize: moderateScale(13),
        color: '#3B82F6',
        fontFamily: 'Outfit_400Regular',
    },
    section: {
        marginBottom: verticalScale(24),
    },
    inputWrapper: {
        marginBottom: verticalScale(16),
    },
    label: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#334155',
        marginBottom: verticalScale(8),
        marginLeft: scale(4),
        fontFamily: 'Outfit_500Medium',
    },
    passwordContainer: {
        position: 'relative',
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: moderateScale(12),
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(12),
        paddingRight: scale(48),
        fontSize: moderateScale(16),
        color: '#1E293B',
        fontFamily: 'Outfit_400Regular',
    },
    eyeIcon: {
        position: 'absolute',
        right: scale(16),
        top: '50%',
        transform: [{ translateY: -scale(10) }],
    },
    submitButton: {
        backgroundColor: '#2563EB',
        borderRadius: moderateScale(12),
        paddingVertical: verticalScale(14),
        alignItems: 'center',
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonText: {
        fontSize: moderateScale(16),
        fontWeight: '700',
        color: '#FFFFFF',
        fontFamily: 'Outfit_700Bold',
    },
});
