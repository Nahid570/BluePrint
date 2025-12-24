import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { useSession } from "../../context/AuthContext";
import { loginInvestor } from "../../services/api/auth";
import { LoginRequest } from "../../services/api/types";
import {
  enableBiometricOnBackend,
  getBiometricType,
  hasBiometricEnabled as checkBiometricEnabled,
  isBiometricAvailable,
  loginWithBiometricAuth,
} from "../../utils/biometricAuth";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  // Default to true initially so button shows, then update based on actual check
  const [biometricAvailable, setBiometricAvailable] = useState(true);
  const [biometricType, setBiometricType] = useState<string>("Biometric");
  const [hasBiometricEnabled, setHasBiometricEnabled] = useState(false);

  // Check biometric availability on mount and when screen comes into focus
  useEffect(() => {
    const checkBiometric = async () => {
      try {
        const available = await isBiometricAvailable();
        const enabled = available ? await checkBiometricEnabled() : false;
        const type = available ? await getBiometricType() : "Biometric";
        
        if (__DEV__) {
          console.log("[Login] Biometric check:", { available, enabled, type });
        }
        
        setBiometricAvailable(available);
        setHasBiometricEnabled(enabled);
        setBiometricType(type);
      } catch (error) {
        console.error("[Login] Error checking biometric:", error);
        // On error, still show button (let user try) - better UX
        setBiometricAvailable(true);
        setHasBiometricEnabled(false);
        setBiometricType("Biometric");
      }
    };
    
    checkBiometric();
  }, []);

  // Login mutation with React Query
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => loginInvestor(credentials),
    onSuccess: async (response) => {
      if (response.success && response.data?.token) {
        // Enable biometric on backend (only if biometric is available and not already enabled)
        if (biometricAvailable && !hasBiometricEnabled && email) {
          try {
            const companyId = response.data?.company?.id || null;
            await enableBiometricOnBackend(email, companyId);
            // Update state to reflect biometric is now enabled
            setHasBiometricEnabled(true);
          } catch (error) {
            console.error("[Login] Failed to enable biometric:", error);
            // Don't block login if biometric enable fails
          }
        }
        
        // Token is already stored by loginInvestor function
        // Update context to mark user as signed in
        signIn(response.data.token);
        // Navigate to protected area
        router.replace("/(protected)" as any);
      }
    },
  });

  // Biometric login mutation
  const biometricLoginMutation = useMutation({
    mutationFn: () => loginWithBiometricAuth(),
    onSuccess: (response) => {
      if (response.success && response.data?.token) {
        // Update local state - biometric is now confirmed to be enabled
        setHasBiometricEnabled(true);
        // Token is already stored by loginWithBiometricAuth
        // Update context to mark user as signed in
        signIn(response.data.token);
        // Navigate to protected area
        router.replace("/(protected)" as any);
      }
    },
    onError: (error: any) => {
      // Update local state if error indicates biometric is not enabled
      if (error.message?.includes("not enabled") || error.message?.includes("Biometric login not enabled")) {
        setHasBiometricEnabled(false);
      }
    },
  });

  const handleLogin = () => {
    // Clear previous errors
    setValidationError(null);
    loginMutation.reset();

    // Basic validation
    if (!email.trim()) {
      setValidationError("Please enter your email address");
      return;
    }

    if (!password.trim()) {
      setValidationError("Please enter your password");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError("Please enter a valid email address");
      return;
    }

    // Prepare login request
    const credentials: LoginRequest = {
      email: email.trim(),
      password: password.trim(),
      company_id: null, // TODO: Get this from config or user selection
    };

    // Trigger login mutation
    loginMutation.mutate(credentials);
  };

  const handleBiometricLogin = async () => {
    try {
      // Clear previous errors
      setValidationError(null);
      biometricLoginMutation.reset();

      // If biometric is not enabled locally, check if we should show a message
      // The API endpoint requires authentication, so we can't enable it before login
      if (!hasBiometricEnabled) {
        setValidationError(
          "Biometric login needs to be set up first. Please login with your email and password. After successful login, biometric will be automatically enabled for future logins."
        );
        return;
      }

      // Trigger biometric login mutation (handles device auth + API call)
      biometricLoginMutation.mutate();
    } catch (error: any) {
      console.error("[Login] Biometric login error:", error);
      // Show user-friendly error message
      const errorMsg = error.message || "Biometric authentication failed";
      if (errorMsg.includes("not enabled") || errorMsg.includes("Biometric login not enabled")) {
        setValidationError(
          "Biometric login is not set up yet. Please login with email and password first. After successful login, biometric will be automatically enabled for future logins."
        );
      } else {
        setValidationError(errorMsg);
      }
    }
  };

  // Get the error message to display - API already provides user-friendly messages
  const errorMessage =
    validationError ||
    (loginMutation.isError && loginMutation.error?.message
      ? loginMutation.error.message
      : null) ||
    (biometricLoginMutation.isError && biometricLoginMutation.error?.message
      ? biometricLoginMutation.error.message
      : null);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerContainer}>
            <View style={styles.iconContainer}>
              <Image
                source={require("../../assets/logo/blueprint.png")}
                style={styles.logoImage}
                contentFit="contain"
              />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to your investor account
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={scale(20)}
                  color="#94A3B8"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#CBD5E1"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.lastInputWrapper}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={scale(20)}
                  color="#94A3B8"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#CBD5E1"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={scale(20)}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Error Message */}
            {errorMessage && (
              <View style={styles.errorContainer}>
                <Ionicons
                  name="alert-circle"
                  size={scale(16)}
                  color="#EF4444"
                />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* Sign In Buttons Row */}
            <View style={styles.buttonsRow}>
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  loginMutation.isPending && styles.loginButtonDisabled,
                ]}
                onPress={handleLogin}
                activeOpacity={0.8}
                disabled={loginMutation.isPending}
              >
                <LinearGradient
                  colors={
                    loginMutation.isPending
                      ? ["#94A3B8", "#94A3B8"]
                      : ["#2563EB", "#4F46E5"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  {loginMutation.isPending ? (
                    <>
                      <ActivityIndicator size="small" color="#FFF" />
                      <Text
                        style={[
                          styles.loginButtonText,
                          { marginLeft: scale(8) },
                        ]}
                      >
                        Signing In...
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.loginButtonText}>Sign In</Text>
                      <Ionicons
                        name="arrow-forward"
                        size={scale(20)}
                        color="#FFF"
                      />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Biometric Sign In Button */}
              {biometricAvailable && (
                <TouchableOpacity
                  style={styles.biometricButton}
                  onPress={handleBiometricLogin}
                  activeOpacity={0.7}
                  disabled={loginMutation.isPending || biometricLoginMutation.isPending}
                >
                  {biometricLoginMutation.isPending ? (
                    <ActivityIndicator size="small" color="#2563EB" />
                  ) : (
                    <Ionicons
                      name={
                        biometricType === "Face ID"
                          ? "face-recognition"
                          : "finger-print"
                      }
                      size={scale(28)}
                      color="#2563EB"
                    />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: moderateScale(24),
    paddingTop: verticalScale(40),
    paddingBottom: verticalScale(20),
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: verticalScale(40),
  },
  iconContainer: {
    marginBottom: verticalScale(24),
  },
  iconGradient: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(24),
    justifyContent: "center",
    alignItems: "center",
    transform: [{ rotate: "-10deg" }],
  },
  logoImage: {
    width: scale(80),
    height: scale(80),
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: verticalScale(8),
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: moderateScale(16),
    color: "#64748B",
    textAlign: "center",
  },
  formContainer: {
    marginBottom: verticalScale(24),
  },
  inputWrapper: {
    marginBottom: verticalScale(20),
  },
  lastInputWrapper: {
    marginBottom: verticalScale(12),
  },
  label: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#334155",
    marginBottom: verticalScale(8),
    marginLeft: scale(4),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: "#E2E8F0",
    height: verticalScale(56),
    paddingHorizontal: scale(16),
    shadowColor: "#94A3B8",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: scale(12),
  },
  input: {
    flex: 1,
    fontSize: moderateScale(16),
    color: "#1E293B",
    height: "100%",
  },
  eyeIcon: {
    padding: scale(4),
  },
  loginButton: {
    flex: 1,
    borderRadius: moderateScale(16),
    overflow: "hidden",
    shadowColor: "#2563EB",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: verticalScale(56),
    paddingHorizontal: scale(24),
  },
  loginButtonText: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: "#FFFFFF",
    marginRight: scale(8),
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(12),
    marginTop: verticalScale(4),
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: {
    flex: 1,
    fontSize: moderateScale(14),
    color: "#DC2626",
    marginLeft: scale(8),
    fontWeight: "500",
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: scale(12),
  },
  biometricButton: {
    width: scale(56),
    height: verticalScale(56),
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(16),
    borderWidth: 2,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#94A3B8",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
});
