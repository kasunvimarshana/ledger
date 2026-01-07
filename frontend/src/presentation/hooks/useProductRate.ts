/**
 * Custom hook for fetching product current rate
 * Encapsulates rate loading logic with loading and error states
 */

import { useState, useEffect } from 'react';
import apiClient from '../../infrastructure/api/apiClient';
import { Rate } from '../../domain/entities/Product';

interface UseProductRateResult {
  currentRate: Rate | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useProductRate = (productId: string | undefined): UseProductRateResult => {
  const [currentRate, setCurrentRate] = useState<Rate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadCurrentRate = async () => {
    if (!productId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<{ data: Rate }>(`/products/${productId}/current-rate`);
      if (response.success && response.data) {
        setCurrentRate(response.data);
      }
    } catch (err) {
      const error = err as Error;
      console.error('Error loading current rate:', error);
      setError(error);
      // Don't show alert for rate loading errors - they're not critical
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentRate();
  }, [productId]);

  return {
    currentRate,
    loading,
    error,
    refetch: loadCurrentRate,
  };
};
