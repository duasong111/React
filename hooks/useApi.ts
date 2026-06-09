import { useState, useEffect, useCallback } from 'react';
import type { ApiResponse, PaginationParams, PaginationResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

export function useApi<T>(endpoint: string, options: {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: object;
  headers?: HeadersInit;
  skip?: boolean;
} = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (options.skip) return;

    setLoading(true);
    setError(null);

    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const config: RequestInit = {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      };

      if (options.body && (options.method === 'POST' || options.method === 'PUT')) {
        config.body = JSON.stringify(options.body);
      }

      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<T> = await response.json();
      
      if (result.success) {
        setData(result.data || null);
      } else {
        setError(result.error || '请求失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误');
    } finally {
      setLoading(false);
    }
  }, [endpoint, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function usePaginatedApi<T>(
  endpoint: string,
  initialParams: PaginationParams = { page: 1, limit: 10 }
) {
  const [params, setParams] = useState<PaginationParams>(initialParams);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const { data, loading, error, refetch } = useApi<PaginationResponse<T>>(
    `${endpoint}?page=${params.page}&limit=${params.limit}`
  );

  useEffect(() => {
    if (data) {
      setTotal(data.total);
      setTotalPages(data.totalPages);
    }
  }, [data]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setParams(prev => ({ ...prev, page }));
    }
  };

  const setLimit = (limit: number) => {
    setParams({ page: 1, limit });
  };

  return {
    data: data?.data || [],
    loading,
    error,
    refetch,
    params,
    total,
    totalPages,
    goToPage,
    setLimit,
    hasNextPage: params.page < totalPages,
    hasPrevPage: params.page > 1,
  };
}