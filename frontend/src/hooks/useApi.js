import { useAuth } from '../contexts/AuthContext';
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export const useApi = () => {
  const { apiCall } = useAuth();
  const [loading, setLoading] = useState(false);

  const makeRequest = useCallback(async (method, endpoint, data = null, options = {}) => {
    setLoading(true);
    try {
      const response = await apiCall(method, endpoint, data);
      
      if (options.successMessage) {
        toast.success(options.successMessage);
      }
      
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred';
      
      if (options.showErrorToast !== false) {
        toast.error(errorMessage);
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  return { makeRequest, loading };
};