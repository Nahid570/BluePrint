import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { changePassword } from "../../services/api/auth";
import { ChangePasswordRequest } from "../../services/api/types";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (passwords: ChangePasswordRequest) => changePassword(passwords),
    onSuccess: () => {
      setSuccessMessage("Password updated successfully");
      setValidationError(null);
      // Clear form after success
      setFormData({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      });
      // Navigate back to profile after 2 seconds
      setTimeout(() => {
        router.push("/(protected)/profile");
      }, 2000);
    },
    onError: (error: any) => {
      setSuccessMessage(null);
      setValidationError(error.message || "Failed to change password");
    },
  });

  // Clear success message and error when screen comes into focus
  // Using useFocusEffect to clear state every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      setSuccessMessage(null);
      setValidationError(null);
      // Reset mutation state to clear any cached errors
      changePasswordMutation.reset();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const handleChangePassword = () => {
    setValidationError(null);
    setSuccessMessage(null);
    changePasswordMutation.reset();

    // Client-side validation
    if (!formData.current_password.trim()) {
      setValidationError("Please enter your current password");
      return;
    }

    if (!formData.new_password.trim()) {
      setValidationError("Please enter a new password");
      return;
    }

    if (formData.new_password.length < 8) {
      setValidationError("Password must be at least 8 characters long");
      return;
    }

    if (formData.new_password !== formData.new_password_confirmation) {
      setValidationError("New password and confirmation do not match");
      return;
    }

    const passwords: ChangePasswordRequest = {
      current_password: formData.current_password.trim(),
      new_password: formData.new_password.trim(),
      new_password_confirmation: formData.new_password_confirmation.trim(),
    };

    changePasswordMutation.mutate(passwords);
  };

  const errorMessage =
    validationError ||
    (changePasswordMutation.isError
      ? changePasswordMutation.error?.message
      : null);

  const handleFieldChange = (
    field: "current_password" | "new_password" | "new_password_confirmation",
    text: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: text }));
  };

  const handleTogglePassword = (showKey: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [showKey]: !prev[showKey] }));
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Change Password",
          headerTitleStyle: {
            fontFamily: "Outfit_700Bold",
            fontSize: moderateScale(18),
            color: "#1E293B",
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push("/(protected)/profile")}
              style={{ marginLeft: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#1E293B" />
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={styles.infoCard}>
            <Ionicons
              name="information-circle-outline"
              size={scale(20)}
              color="#3B82F6"
            />
            <Text style={styles.infoText}>
              Password must be at least 8 characters long
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Current Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.input}
                  value={formData.current_password}
                  onChangeText={(text) =>
                    handleFieldChange("current_password", text)
                  }
                  placeholder="Enter current password"
                  placeholderTextColor="#CBD5E1"
                  secureTextEntry={!showPasswords.current}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => handleTogglePassword("current")}
                >
                  <Ionicons
                    name={
                      showPasswords.current ? "eye-off-outline" : "eye-outline"
                    }
                    size={scale(20)}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.input}
                  value={formData.new_password}
                  onChangeText={(text) =>
                    handleFieldChange("new_password", text)
                  }
                  placeholder="Enter new password"
                  placeholderTextColor="#CBD5E1"
                  secureTextEntry={!showPasswords.new}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => handleTogglePassword("new")}
                >
                  <Ionicons
                    name={showPasswords.new ? "eye-off-outline" : "eye-outline"}
                    size={scale(20)}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Confirm New Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.input}
                  value={formData.new_password_confirmation}
                  onChangeText={(text) =>
                    handleFieldChange("new_password_confirmation", text)
                  }
                  placeholder="Re-enter new password"
                  placeholderTextColor="#CBD5E1"
                  secureTextEntry={!showPasswords.confirm}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => handleTogglePassword("confirm")}
                >
                  <Ionicons
                    name={
                      showPasswords.confirm ? "eye-off-outline" : "eye-outline"
                    }
                    size={scale(20)}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {errorMessage && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={scale(16)} color="#EF4444" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {successMessage && (
            <View style={styles.successContainer}>
              <Ionicons
                name="checkmark-circle"
                size={scale(16)}
                color="#10B981"
              />
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.submitButton,
              changePasswordMutation.isPending && styles.submitButtonDisabled,
            ]}
            onPress={handleChangePassword}
            disabled={changePasswordMutation.isPending}
          >
            {changePasswordMutation.isPending ? (
              <View style={styles.submitButtonContent}>
                <ActivityIndicator
                  size="small"
                  color="#FFF"
                  style={{ marginRight: scale(8) }}
                />
                <Text style={styles.submitButtonText}>Updating...</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>Update Password</Text>
            )}
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
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    padding: moderateScale(20),
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    padding: moderateScale(12),
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(24),
    gap: scale(8),
  },
  infoText: {
    flex: 1,
    fontSize: moderateScale(13),
    color: "#3B82F6",
    fontFamily: "Outfit_400Regular",
  },
  section: {
    marginBottom: verticalScale(24),
  },
  inputWrapper: {
    marginBottom: verticalScale(16),
  },
  label: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#334155",
    marginBottom: verticalScale(8),
    marginLeft: scale(4),
    fontFamily: "Outfit_500Medium",
  },
  passwordContainer: {
    position: "relative",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    paddingRight: scale(48),
    fontSize: moderateScale(16),
    color: "#1E293B",
    fontFamily: "Outfit_400Regular",
  },
  eyeIcon: {
    position: "absolute",
    right: scale(16),
    top: "50%",
    transform: [{ translateY: -scale(10) }],
  },
  submitButton: {
    backgroundColor: "#2563EB",
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
    alignItems: "center",
    justifyContent: "center",
    minHeight: verticalScale(48),
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "Outfit_700Bold",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(12),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: {
    flex: 1,
    fontSize: moderateScale(13),
    color: "#EF4444",
    marginLeft: scale(8),
    fontFamily: "Outfit_400Regular",
  },
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(12),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  successText: {
    flex: 1,
    fontSize: moderateScale(13),
    color: "#10B981",
    marginLeft: scale(8),
    fontFamily: "Outfit_400Regular",
  },
});
