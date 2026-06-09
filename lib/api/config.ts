const API_TIMEOUT = 30000;

export const API_CONFIG = {
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  external: {
    baseUrl: process.env.NEXT_PUBLIC_EXTERNAL_API_URL || 'http://10.1.1.136:8000',
  },
} as const;

export const API_ENDPOINTS = {
  auth: {
    login: ['external', '/api/login'] as const,
    register: ['internal', '/api/auth/register'] as const,
    logout: ['internal', '/api/auth/logout'] as const,
  },
  users: {
    list: ['external', '/api/users'] as const,
    detail: ['external', '/api/users/{id}'] as const,
  },
} as const;