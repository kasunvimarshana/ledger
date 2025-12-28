/**
 * API Client for making HTTP requests
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_TIMEOUT, TOKEN_STORAGE_KEY } from '../../core/constants/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.timeout = API_TIMEOUT;
  }

  /**
   * Get authorization token from storage
   */
  private async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  /**
   * Make HTTP request
   */
  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
    data?: any,
    requiresAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      // Add authorization token if required
      if (requiresAuth) {
        const token = await this.getToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const config: RequestInit = {
        method,
        headers,
      };

      // Add body for POST, PUT, PATCH requests
      if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
        config.body = JSON.stringify(data);
      }

      // Make the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response
      const responseData: ApiResponse<T> = await response.json();

      if (!response.ok) {
        throw responseData;
      }

      return responseData;
    } catch (error: any) {
      console.error('API Error:', error);
      
      if (error.name === 'AbortError') {
        throw {
          success: false,
          message: 'Request timeout',
        };
      }

      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, requiresAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'GET', undefined, requiresAuth);
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data: any, requiresAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'POST', data, requiresAuth);
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data: any, requiresAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PUT', data, requiresAuth);
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data: any, requiresAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PATCH', data, requiresAuth);
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, requiresAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'DELETE', undefined, requiresAuth);
  }
}

export default new ApiClient();
