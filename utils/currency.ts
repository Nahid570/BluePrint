import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { setStorageItemAsync } from '../hooks/useStorageState';

const CURRENCY_KEY = 'app_currency';

/**
 * Store currency code
 */
export const storeCurrency = async (currency: string): Promise<void> => {
    await setStorageItemAsync(CURRENCY_KEY, currency);
};

/**
 * Get stored currency code
 */
export const getCurrency = async (): Promise<string> => {
    try {
        if (Platform.OS === 'web') {
            if (typeof localStorage !== 'undefined') {
                return localStorage.getItem(CURRENCY_KEY) || 'USD';
            }
            return 'USD';
        } else {
            const currency = await SecureStore.getItemAsync(CURRENCY_KEY);
            return currency || 'USD';
        }
    } catch (error) {
        console.error('Error getting currency:', error);
        return 'USD';
    }
};

/**
 * Format currency with the stored currency code
 */
export const formatCurrency = async (amount: number): Promise<string> => {
    const currency = await getCurrency();
    const formattedNumber = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
    return `${currency} ${formattedNumber}`;
};

/**
 * Synchronous version for use in components (requires currency to be passed)
 */
export const formatCurrencySync = (amount: number, currency: string = 'USD'): string => {
    const formattedNumber = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
    return `${currency} ${formattedNumber}`;
};
