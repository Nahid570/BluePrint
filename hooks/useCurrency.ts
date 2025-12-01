import { useEffect, useState } from 'react';
import { formatCurrencySync, getCurrency } from '../utils/currency';

/**
 * Hook to get the current currency code
 */
export const useCurrency = () => {
    const [currency, setCurrency] = useState<string>('USD');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadCurrency = async () => {
            try {
                const curr = await getCurrency();
                setCurrency(curr);
            } catch (error) {
                console.error('Error loading currency:', error);
                setCurrency('USD');
            } finally {
                setIsLoading(false);
            }
        };

        loadCurrency();
    }, []);

    const formatCurrency = (amount: number): string => {
        return formatCurrencySync(amount, currency);
    };

    return { currency, formatCurrency, isLoading };
};
