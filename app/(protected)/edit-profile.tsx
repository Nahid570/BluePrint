import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useRef, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { getProfile, updateProfile } from '../../services/api/profile';
import { UpdateProfileRequest } from '../../services/api/types';

export default function EditProfileScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [validationError, setValidationError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const isSavingRef = useRef(false);
    const [showGenderModal, setShowGenderModal] = useState(false);
    const [showMaritalStatusModal, setShowMaritalStatusModal] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const genderOptions = [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
        { label: 'Other', value: 'other' },
    ];

    const maritalStatusOptions = [
        { label: 'Single', value: 'single' },
        { label: 'Married', value: 'married' },
        { label: 'Divorced', value: 'divorced' },
        { label: 'Widowed', value: 'widowed' },
    ];

    // Fetch current profile data
    const {
        data: profileResponse,
        isLoading: isLoadingProfile,
    } = useQuery({
        queryKey: ['profile'],
        queryFn: getProfile,
    });

    // Initialize form data from API
    const [formData, setFormData] = useState<UpdateProfileRequest>({
        name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: '',
        date_of_birth: '',
        gender: 'male',
        marital_status: 'single',
    });

    // Reset form data to original API values when profile is loaded or screen comes into focus
    const resetFormData = useCallback(() => {
        if (profileResponse?.data) {
            const profile = profileResponse.data;
            const dobDate = profile.date_of_birth ? new Date(profile.date_of_birth) : null;
            setFormData({
                name: profile.name || '',
                phone: profile.phone || '',
                address: profile.address || '',
                city: profile.city || '',
                state: profile.state || '',
                country: profile.country || '',
                date_of_birth: profile.date_of_birth || '',
                gender: profile.gender || 'male',
                marital_status: profile.marital_status || 'single',
            });
            setSelectedDate(dobDate && !isNaN(dobDate.getTime()) ? dobDate : new Date());
        }
    }, [profileResponse]);

    // Update form data when profile is loaded (but not if we just saved successfully)
    React.useEffect(() => {
        // Don't reset form if we just saved (prevent clearing success message)
        if (!isSavingRef.current) {
            resetFormData();
        }
    }, [resetFormData]);

    // Update profile mutation
    const updateProfileMutation = useMutation({
        mutationFn: (data: UpdateProfileRequest) => updateProfile(data),
        onSuccess: () => {
            isSavingRef.current = true;
            setSuccessMessage('Profile updated successfully');
            setValidationError(null);
            // Invalidate profile query to refetch updated data
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            // Navigate back to profile after 2 seconds
            setTimeout(() => {
                isSavingRef.current = false;
                setSuccessMessage(null);
                router.push('/(protected)/profile');
            }, 2000);
        },
        onError: (error: any) => {
            isSavingRef.current = false;
            setSuccessMessage(null);
            setValidationError(error.message || 'Failed to update profile');
        },
    });

    // Clear messages and reset form to original values when screen comes into focus
    // Only reset if we're not in the middle of a save operation
    useFocusEffect(
        useCallback(() => {
            // Don't reset if we just successfully saved (prevent clearing success message)
            if (!isSavingRef.current) {
                setValidationError(null);
                updateProfileMutation.reset();
                // Reset form to original API values (discard any unsaved changes)
                resetFormData();
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [resetFormData])
    );

    const handleSave = () => {
        setValidationError(null);
        setSuccessMessage(null);
        updateProfileMutation.reset();

        // Client-side validation
        if (!formData.name?.trim()) {
            setValidationError('Please enter your name');
            return;
        }

        const updateData: UpdateProfileRequest = {
            name: formData.name.trim(),
            phone: formData.phone?.trim() || undefined,
            address: formData.address?.trim() || undefined,
            city: formData.city?.trim() || undefined,
            state: formData.state?.trim() || undefined,
            country: formData.country?.trim() || undefined,
            date_of_birth: formData.date_of_birth?.trim() || undefined,
            gender: formData.gender,
            marital_status: formData.marital_status,
        };

        updateProfileMutation.mutate(updateData);
    };

    const errorMessage = validationError || (updateProfileMutation.isError ? updateProfileMutation.error?.message : null);

    const handleFieldChange = (field: keyof UpdateProfileRequest, text: string) => {
        setFormData((prev) => ({ ...prev, [field]: text }));
    };

    const handleDateChange = (event: any, date?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        if (date) {
            setSelectedDate(date);
            // Format date as YYYY-MM-DD
            const formattedDate = date.toISOString().split('T')[0];
            handleFieldChange('date_of_birth', formattedDate);
        }
    };

    const formatDateForDisplay = (dateString: string | undefined): string => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toISOString().split('T')[0];
        } catch {
            return dateString;
        }
    };

    // Loading state
    if (isLoadingProfile) {
        return (
            <SafeAreaView style={styles.container} edges={['bottom']}>
                <Stack.Screen options={{
                    headerShown: true,
                    title: 'Edit Profile',
                    headerTitleStyle: {
                        fontFamily: 'Outfit_700Bold',
                        fontSize: moderateScale(18),
                        color: '#1E293B',
                    },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.push("/(protected)/profile")} style={{ marginLeft: 10 }}>
                            <Ionicons name="arrow-back" size={24} color="#1E293B" />
                        </TouchableOpacity>
                    ),
                }} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2563EB" />
                    <Text style={styles.loadingText}>Loading profile...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <Stack.Screen options={{
                headerShown: true,
                title: 'Edit Profile',
                headerTitleStyle: {
                    fontFamily: 'Outfit_700Bold',
                    fontSize: moderateScale(18),
                    color: '#1E293B',
                },
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.push("/(protected)/profile")} style={{ marginLeft: 10 }}>
                        <Ionicons name="arrow-back" size={24} color="#1E293B" />
                    </TouchableOpacity>
                ),
                headerRight: () => (
                    <TouchableOpacity
                        onPress={handleSave}
                        style={{ marginRight: 10 }}
                        disabled={updateProfileMutation.isPending}
                    >
                        {updateProfileMutation.isPending ? (
                            <ActivityIndicator size="small" color="#2563EB" />
                        ) : (
                            <Text style={{ color: '#2563EB', fontSize: 16, fontFamily: 'Outfit_700Bold' }}>Save</Text>
                        )}
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
                    {errorMessage && (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle" size={scale(16)} color="#EF4444" />
                            <Text style={styles.errorText}>{errorMessage}</Text>
                        </View>
                    )}

                    {successMessage && (
                        <View style={styles.successContainer}>
                            <Ionicons name="checkmark-circle" size={scale(16)} color="#10B981" />
                            <Text style={styles.successText}>{successMessage}</Text>
                        </View>
                    )}

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Basic Information</Text>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.name || ''}
                                onChangeText={(text) => handleFieldChange('name', text)}
                                placeholder="Enter your name"
                                placeholderTextColor="#CBD5E1"
                                editable={!updateProfileMutation.isPending}
                                autoCapitalize="words"
                            />
                        </View>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Phone Number</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.phone || ''}
                                onChangeText={(text) => handleFieldChange('phone', text)}
                                placeholder="Enter phone number"
                                placeholderTextColor="#CBD5E1"
                                keyboardType="phone-pad"
                                editable={!updateProfileMutation.isPending}
                            />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Address Details</Text>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Address</Text>
                            <TextInput
                                style={[styles.input, styles.multilineInput]}
                                value={formData.address || ''}
                                onChangeText={(text) => handleFieldChange('address', text)}
                                placeholder="Street address"
                                placeholderTextColor="#CBD5E1"
                                multiline
                                editable={!updateProfileMutation.isPending}
                            />
                        </View>
                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: scale(8) }}>
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.label}>City</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.city || ''}
                                        onChangeText={(text) => handleFieldChange('city', text)}
                                        placeholder="City"
                                        placeholderTextColor="#CBD5E1"
                                        editable={!updateProfileMutation.isPending}
                                        autoCapitalize="words"
                                    />
                                </View>
                            </View>
                            <View style={{ flex: 1, marginLeft: scale(8) }}>
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.label}>State</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.state || ''}
                                        onChangeText={(text) => handleFieldChange('state', text)}
                                        placeholder="State"
                                        placeholderTextColor="#CBD5E1"
                                        editable={!updateProfileMutation.isPending}
                                        autoCapitalize="words"
                                    />
                                </View>
                            </View>
                        </View>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Country</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.country || ''}
                                onChangeText={(text) => handleFieldChange('country', text)}
                                placeholder="Country"
                                placeholderTextColor="#CBD5E1"
                                editable={!updateProfileMutation.isPending}
                                autoCapitalize="words"
                            />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Personal Details</Text>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Date of Birth</Text>
                            <TouchableOpacity
                                style={styles.dropdown}
                                onPress={() => setShowDatePicker(true)}
                                disabled={updateProfileMutation.isPending}
                            >
                                <Text style={[
                                    styles.dropdownText,
                                    !formData.date_of_birth && styles.dropdownPlaceholder
                                ]}>
                                    {formData.date_of_birth
                                        ? formatDateForDisplay(formData.date_of_birth)
                                        : 'Select Date of Birth'}
                                </Text>
                                <Ionicons name="calendar-outline" size={scale(20)} color="#94A3B8" />
                            </TouchableOpacity>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={selectedDate || new Date()}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={handleDateChange}
                                    maximumDate={new Date()}
                                    onTouchCancel={() => Platform.OS === 'ios' && setShowDatePicker(false)}
                                />
                            )}
                            {Platform.OS === 'ios' && showDatePicker && (
                                <View style={styles.datePickerActions}>
                                    <TouchableOpacity
                                        style={styles.datePickerButton}
                                        onPress={() => {
                                            setShowDatePicker(false);
                                        }}
                                    >
                                        <Text style={styles.datePickerButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.datePickerButton, styles.datePickerButtonPrimary]}
                                        onPress={() => {
                                            if (selectedDate) {
                                                const formattedDate = selectedDate.toISOString().split('T')[0];
                                                handleFieldChange('date_of_birth', formattedDate);
                                            }
                                            setShowDatePicker(false);
                                        }}
                                    >
                                        <Text style={[styles.datePickerButtonText, { color: '#FFFFFF' }]}>Done</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: scale(8) }}>
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.label}>Gender</Text>
                                    <TouchableOpacity
                                        style={styles.dropdown}
                                        onPress={() => setShowGenderModal(true)}
                                        disabled={updateProfileMutation.isPending}
                                    >
                                        <Text style={[
                                            styles.dropdownText,
                                            !formData.gender && styles.dropdownPlaceholder
                                        ]}>
                                            {formData.gender
                                                ? genderOptions.find(opt => opt.value === formData.gender)?.label || formData.gender
                                                : 'Select Gender'}
                                        </Text>
                                        <Ionicons name="chevron-down" size={scale(20)} color="#94A3B8" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={{ flex: 1, marginLeft: scale(8) }}>
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.label}>Marital Status</Text>
                                    <TouchableOpacity
                                        style={styles.dropdown}
                                        onPress={() => setShowMaritalStatusModal(true)}
                                        disabled={updateProfileMutation.isPending}
                                    >
                                        <Text style={[
                                            styles.dropdownText,
                                            !formData.marital_status && styles.dropdownPlaceholder
                                        ]}>
                                            {formData.marital_status
                                                ? maritalStatusOptions.find(opt => opt.value === formData.marital_status)?.label || formData.marital_status
                                                : 'Select Status'}
                                        </Text>
                                        <Ionicons name="chevron-down" size={scale(20)} color="#94A3B8" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Gender Dropdown Modal */}
            <Modal
                visible={showGenderModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowGenderModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowGenderModal(false)}
                >
                    <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Gender</Text>
                            <TouchableOpacity onPress={() => setShowGenderModal(false)}>
                                <Ionicons name="close" size={scale(24)} color="#64748B" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalOptions}>
                            {genderOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.modalOption,
                                        formData.gender === option.value && styles.modalOptionSelected,
                                    ]}
                                    onPress={() => {
                                        handleFieldChange('gender', option.value);
                                        setShowGenderModal(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.modalOptionText,
                                        formData.gender === option.value && styles.modalOptionTextSelected,
                                    ]}>
                                        {option.label}
                                    </Text>
                                    {formData.gender === option.value && (
                                        <Ionicons name="checkmark" size={scale(20)} color="#2563EB" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Marital Status Dropdown Modal */}
            <Modal
                visible={showMaritalStatusModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowMaritalStatusModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowMaritalStatusModal(false)}
                >
                    <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Marital Status</Text>
                            <TouchableOpacity onPress={() => setShowMaritalStatusModal(false)}>
                                <Ionicons name="close" size={scale(24)} color="#64748B" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalOptions}>
                            {maritalStatusOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.modalOption,
                                        formData.marital_status === option.value && styles.modalOptionSelected,
                                    ]}
                                    onPress={() => {
                                        handleFieldChange('marital_status', option.value);
                                        setShowMaritalStatusModal(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.modalOptionText,
                                        formData.marital_status === option.value && styles.modalOptionTextSelected,
                                    ]}>
                                        {option.label}
                                    </Text>
                                    {formData.marital_status === option.value && (
                                        <Ionicons name="checkmark" size={scale(20)} color="#2563EB" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: moderateScale(24),
    },
    loadingText: {
        marginTop: verticalScale(16),
        fontSize: moderateScale(16),
        color: '#64748B',
        fontFamily: 'Outfit_400Regular',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEE2E2',
        borderRadius: moderateScale(12),
        paddingVertical: verticalScale(10),
        paddingHorizontal: scale(12),
        marginBottom: verticalScale(16),
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    errorText: {
        flex: 1,
        fontSize: moderateScale(13),
        color: '#EF4444',
        marginLeft: scale(8),
        fontFamily: 'Outfit_400Regular',
    },
    successContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#D1FAE5',
        borderRadius: moderateScale(12),
        paddingVertical: verticalScale(10),
        paddingHorizontal: scale(12),
        marginBottom: verticalScale(16),
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    successText: {
        flex: 1,
        fontSize: moderateScale(13),
        color: '#10B981',
        marginLeft: scale(8),
        fontFamily: 'Outfit_400Regular',
    },
    dropdown: {
        backgroundColor: '#FFFFFF',
        borderRadius: moderateScale(12),
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(12),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownText: {
        fontSize: moderateScale(16),
        color: '#1E293B',
        fontFamily: 'Outfit_400Regular',
        flex: 1,
    },
    dropdownPlaceholder: {
        color: '#CBD5E1',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: moderateScale(20),
        borderTopRightRadius: moderateScale(20),
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: moderateScale(20),
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    modalTitle: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: '#1E293B',
        fontFamily: 'Outfit_700Bold',
    },
    modalOptions: {
        maxHeight: verticalScale(400),
    },
    modalOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: moderateScale(16),
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    modalOptionSelected: {
        backgroundColor: '#EFF6FF',
    },
    modalOptionText: {
        fontSize: moderateScale(16),
        color: '#1E293B',
        fontFamily: 'Outfit_400Regular',
    },
    modalOptionTextSelected: {
        color: '#2563EB',
        fontFamily: 'Outfit_500Medium',
    },
    datePickerActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: moderateScale(12),
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        gap: scale(12),
    },
    datePickerButton: {
        paddingVertical: verticalScale(8),
        paddingHorizontal: scale(16),
        borderRadius: moderateScale(8),
        backgroundColor: '#F1F5F9',
    },
    datePickerButtonPrimary: {
        backgroundColor: '#2563EB',
    },
    datePickerButtonText: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#1E293B',
        fontFamily: 'Outfit_500Medium',
    },
});
