import type { ApiResponse } from '@/types';
import { API_CONFIG } from './config';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestConfig {
  method: RequestMethod;
  body?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string | number>;
}

type EndpointConfig = readonly ['external', string] | readonly ['internal', string];

class HttpClient {
  private timeout: number;

  constructor(timeout: number = API_CONFIG.timeout) {
    this.timeout = timeout;
  }

  private buildUrl(endpoint: string | EndpointConfig): string {
    if (Array.isArray(endpoint)) {
      const [type, path] = endpoint;
      if (type === 'external') {
        return `${API_CONFIG.external.baseUrl}${path}`;
      }
      return path;
    }
    return endpoint as string;
  }

  private replacePathParams(url: string, params?: Record<string, string | number>): string {
    if (!params) return url;
    
    let result = url;
    for (const [key, value] of Object.entries(params)) {
      result = result.replace(`{${key}}`, String(value));
    }
    return result;
  }

  private async request<T>(
    endpoint: string | EndpointConfig, 
    config: RequestConfig,
    pathParams?: Record<string, string | number>
  ): Promise<ApiResponse<T>> {
    let url = this.buildUrl(endpoint);
    url = this.replacePathParams(url, pathParams);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const isExternal = url.startsWith('http://') || url.startsWith('https://');

    // Get auth token from localStorage if available
    let authToken = '';
    if (typeof window !== 'undefined') {
      authToken = localStorage.getItem('auth_token') || '';
    }

    try {
      const headers: Record<string, string> = {
        ...API_CONFIG.headers,
        ...config.headers,
      };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(url, {
        method: config.method,
        headers,
        body: config.body ? JSON.stringify(config.body) : undefined,
        signal: controller.signal,
        credentials: isExternal ? 'include' : 'same-origin',
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || `HTTP error! status: ${response.status}`,
        };
      }

      return {
        success: true,
        data,
        message: data.message,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return { success: false, error: '请求超时' };
        }
        return { success: false, error: error.message };
      }

      return { success: false, error: '网络错误' };
    }
  }

  async get<T>(
    endpoint: string | EndpointConfig, 
    queryParams?: Record<string, string | number>,
    pathParams?: Record<string, string | number>
  ): Promise<ApiResponse<T>> {
    let url = this.buildUrl(endpoint);
    url = this.replacePathParams(url, pathParams);
    
    if (queryParams) {
      const searchParams = new URLSearchParams(queryParams as Record<string, string>);
      url += `?${searchParams.toString()}`;
    }
    
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string | EndpointConfig, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  async put<T>(endpoint: string | EndpointConfig, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  async patch<T>(endpoint: string | EndpointConfig, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body });
  }

  async delete<T>(endpoint: string | EndpointConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const http = new HttpClient();