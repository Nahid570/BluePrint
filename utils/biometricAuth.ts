import * as Device from "expo-device";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import {
  disableBiometric,
  enableBiometric,
  getBiometricStatus,
  loginWithBiometric,
} from "../services/api/auth";
import { BiometricEnableRequest, BiometricLoginRequest } from "../services/api/types";

/**
 * Generate a short unique device ID (max 100 chars)
 */
const generateShortDeviceId = (): string => {
  const os = (Device.osName || "unk").substring(0, 3).toLowerCase();
  const model = (Device.modelId || Device.modelName || "dev").substring(0, 20).replace(/[^a-zA-Z0-9]/g, "");
  const timestamp = Date.now().toString().slice(-10); // Last 10 digits of timestamp
  const random = Math.random().toString(36).substring(2, 8); // 6 char random string
  
  // Format: ios-iphone15-1234567890-abc123 (max ~40 chars)
  const deviceId = `${os}-${model}-${timestamp}-${random}`;
  
  // Ensure it's max 100 chars (should be way under, but just in case)
  return deviceId.substring(0, 100);
};

const BIOMETRIC_TOKEN_KEY = "biometric_token";
const DEVICE_ID_KEY = "device_id";
const BIOMETRIC_EMAIL_KEY = "biometric_email";
const BIOMETRIC_COMPANY_ID_KEY = "biometric_company_id";

/**
 * Get unique device ID (max 100 characters as per API requirement)
 */
export const getDeviceId = async (): Promise<string> => {
  try {
    // Try to get stored device ID first
    const storedDeviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    if (storedDeviceId && storedDeviceId.length <= 100) {
      return storedDeviceId;
    }

    // If stored ID is too long, clear it and generate a new one
    if (storedDeviceId && storedDeviceId.length > 100) {
      await SecureStore.deleteItemAsync(DEVICE_ID_KEY);
    }

    // Generate a short unique device ID (ensures it's under 100 chars)
    const deviceId = generateShortDeviceId();
    await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
    return deviceId;
  } catch (error) {
    console.error("[BiometricAuth] Error getting device ID:", error);
    // Fallback to a short ID
    const fallbackId = `dev-${Date.now().toString().slice(-10)}-${Math.random().toString(36).substring(2, 8)}`;
    return fallbackId.substring(0, 100);
  }
};

/**
 * Get device name
 */
export const getDeviceName = (): string => {
  const osName = Device.osName || "Unknown";
  const modelName = Device.modelName || Device.modelId || "Device";
  return `${modelName} (${osName})`;
};

/**
 * Get device type (ios or android)
 */
export const getDeviceType = (): "ios" | "android" => {
  return Device.osName?.toLowerCase() === "ios" ? "ios" : "android";
};

/**
 * Check if biometric authentication is available on the device
 */
export const isBiometricAvailable = async (): Promise<boolean> => {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) return false;

    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return enrolled;
  } catch (error) {
    console.error("[BiometricAuth] Error checking availability:", error);
    return false;
  }
};

/**
 * Get available biometric types
 */
export const getBiometricType = async (): Promise<string> => {
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return "Face ID";
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return "Fingerprint";
    }
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return "Iris";
    }
    
    return "Biometric";
  } catch (error) {
    console.error("[BiometricAuth] Error getting biometric type:", error);
    return "Biometric";
  }
};

/**
 * Authenticate using biometrics
 */
export const authenticateWithBiometric = async (
  reason: string = "Authenticate to sign in"
): Promise<boolean> => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      cancelLabel: "Cancel",
      disableDeviceFallback: false, // Allow device PIN/password as fallback
      fallbackLabel: "Use Password",
    });

    return result.success;
  } catch (error) {
    console.error("[BiometricAuth] Authentication error:", error);
    return false;
  }
};

/**
 * Enable biometric authentication on backend
 */
export const enableBiometricOnBackend = async (
  email: string,
  companyId: number | null
): Promise<void> => {
  try {
    const deviceId = await getDeviceId();
    const deviceName = getDeviceName();
    const deviceType = getDeviceType();

    const request: BiometricEnableRequest = {
      device_id: deviceId,
      device_name: deviceName,
      device_type: deviceType,
    };

    const response = await enableBiometric(request);

    if (response.success && response.data) {
      // Store biometric token and related data
      await SecureStore.setItemAsync(BIOMETRIC_TOKEN_KEY, response.data.biometric_token);
      await SecureStore.setItemAsync(BIOMETRIC_EMAIL_KEY, email);
      if (companyId !== null) {
        await SecureStore.setItemAsync(BIOMETRIC_COMPANY_ID_KEY, companyId.toString());
      }
    }
  } catch (error) {
    console.error("[BiometricAuth] Error enabling biometric:", error);
    throw error;
  }
};

/**
 * Disable biometric authentication on backend
 */
export const disableBiometricOnBackend = async (): Promise<void> => {
  try {
    const deviceId = await getDeviceId();
    await disableBiometric({ device_id: deviceId });
    
    // Clear stored data
    await SecureStore.deleteItemAsync(BIOMETRIC_TOKEN_KEY);
    await SecureStore.deleteItemAsync(BIOMETRIC_EMAIL_KEY);
    await SecureStore.deleteItemAsync(BIOMETRIC_COMPANY_ID_KEY);
  } catch (error) {
    console.error("[BiometricAuth] Error disabling biometric:", error);
    // Still clear local data even if API call fails
    await SecureStore.deleteItemAsync(BIOMETRIC_TOKEN_KEY);
    await SecureStore.deleteItemAsync(BIOMETRIC_EMAIL_KEY);
    await SecureStore.deleteItemAsync(BIOMETRIC_COMPANY_ID_KEY);
  }
};

/**
 * Check if biometric is enabled (has stored token)
 */
export const hasBiometricEnabled = async (): Promise<boolean> => {
  try {
    const token = await SecureStore.getItemAsync(BIOMETRIC_TOKEN_KEY);
    return token !== null;
  } catch (error) {
    console.error("[BiometricAuth] Error checking biometric status:", error);
    return false;
  }
};

/**
 * Get stored biometric token
 */
export const getBiometricToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(BIOMETRIC_TOKEN_KEY);
  } catch (error) {
    console.error("[BiometricAuth] Error getting biometric token:", error);
    return null;
  }
};

/**
 * Get stored email for biometric login
 */
export const getBiometricEmail = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(BIOMETRIC_EMAIL_KEY);
  } catch (error) {
    console.error("[BiometricAuth] Error getting biometric email:", error);
    return null;
  }
};

/**
 * Get stored company ID for biometric login
 */
export const getBiometricCompanyId = async (): Promise<number | null> => {
  try {
    const companyIdStr = await SecureStore.getItemAsync(BIOMETRIC_COMPANY_ID_KEY);
    return companyIdStr ? parseInt(companyIdStr, 10) : null;
  } catch (error) {
    console.error("[BiometricAuth] Error getting biometric company ID:", error);
    return null;
  }
};

/**
 * Login with biometric (authenticate device + call API)
 */
export const loginWithBiometricAuth = async () => {
  try {
    // First authenticate with device biometric
    const authenticated = await authenticateWithBiometric("Use biometric to sign in");
    if (!authenticated) {
      throw new Error("Biometric authentication cancelled or failed");
    }

    // Get stored data
    const token = await getBiometricToken();
    const email = await getBiometricEmail();
    const companyId = await getBiometricCompanyId();
    const deviceId = await getDeviceId();

    if (!token || !email) {
      throw new Error("Biometric not enabled. Please login with email and password first.");
    }

    // Login with biometric token
    const request: BiometricLoginRequest = {
      biometric_token: token,
      device_id: deviceId,
      email: email,
      company_id: companyId,
    };

    return await loginWithBiometric(request);
  } catch (error: any) {
    console.error("[BiometricAuth] Error logging in with biometric:", error);
    throw error;
  }
};

/**
 * Check biometric status from backend
 */
export const checkBiometricStatus = async (): Promise<boolean> => {
  try {
    const response = await getBiometricStatus();
    if (response.success && response.data) {
      return response.data.is_enabled;
    }
    return false;
  } catch (error) {
    console.error("[BiometricAuth] Error checking biometric status:", error);
    return false;
  }
};
