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
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

// Mock Data (Same as Profile for initial state)
const INITIAL_DATA = {
    name: "Nafed",
    phone: "01412987876",
    address: "123 Main St, Apt 4B",
    city: "Dhaka",
    state: "Dhaka",
    country: "Bangladesh",
    date_of_birth: "2025-11-05",
    gender: "female",
    marital_status: "single"
};

export default function EditProfileScreen() {
    const router = useRouter();
    const [formData, setFormData] = useState(INITIAL_DATA);

    const handleSave = () => {
        // TODO: Implement API PUT request
        console.log('Saving profile:', formData);
        router.replace('/(protected)/profile');
    };

    const InputField = ({ label, value, field, placeholder, multiline = false }: any) => (
        <View style={styles.inputWrapper}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={[styles.input, multiline && styles.multilineInput]}
                value={value}
                onChangeText={(text) => setFormData({ ...formData, [field]: text })}
                placeholder={placeholder}
                placeholderTextColor="#CBD5E1"
                multiline={multiline}
            />
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <Stack.Screen options={{
                presentation: 'modal',
                headerShown: true,
                title: 'Edit Profile',
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
                headerRight: () => (
                    <TouchableOpacity onPress={handleSave} style={{ marginRight: 10 }}>
                        <Text style={{ color: '#2563EB', fontSize: 16, fontFamily: 'Outfit_700Bold' }}>Save</Text>
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
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Basic Information</Text>
                        <InputField label="Full Name" value={formData.name} field="name" placeholder="Enter your name" />
                        <InputField label="Phone Number" value={formData.phone} field="phone" placeholder="Enter phone number" />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Address Details</Text>
                        <InputField label="Address" value={formData.address} field="address" placeholder="Street address" multiline />
                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: scale(8) }}>
                                <InputField label="City" value={formData.city} field="city" placeholder="City" />
                            </View>
                            <View style={{ flex: 1, marginLeft: scale(8) }}>
                                <InputField label="State" value={formData.state} field="state" placeholder="State" />
                            </View>
                        </View>
                        <InputField label="Country" value={formData.country} field="country" placeholder="Country" />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Personal Details</Text>
                        <InputField label="Date of Birth" value={formData.date_of_birth} field="date_of_birth" placeholder="YYYY-MM-DD" />
                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: scale(8) }}>
                                <InputField label="Gender" value={formData.gender} field="gender" placeholder="Gender" />
                            </View>
                            <View style={{ flex: 1, marginLeft: scale(8) }}>
                                <InputField label="Marital Status" value={formData.marital_status} field="marital_status" placeholder="Status" />
                            </View>
                        </View>
                    </View>

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
    section: {
        marginBottom: verticalScale(24),
    },
    sectionTitle: {
        fontSize: moderateScale(16),
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: verticalScale(16),
        fontFamily: 'Outfit_700Bold',
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
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: moderateScale(12),
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(12),
        fontSize: moderateScale(16),
        color: '#1E293B',
        fontFamily: 'Outfit_400Regular',
    },
    multilineInput: {
        height: verticalScale(80),
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
    },
});
