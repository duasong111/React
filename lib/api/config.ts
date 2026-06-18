const API_TIMEOUT = 30000;

// 后端 Flask API 服务器地址
// 开发环境默认使用 localhost:5000，生产环境应使用环境变量
const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const API_CONFIG = {
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  external: {
    baseUrl: BACKEND_API_URL,
  },
} as const;

export const API_ENDPOINTS = {
  auth: {
    // 注意：Flask 后端 API 路径有尾部斜杠
    login: ['external', '/api/login/'] as const,
    register: ['external', '/api/register/'] as const,
    logout: ['external', '/api/logout/'] as const,
  },
  users: {
    list: ['external', '/api/users'] as const,
    detail: ['external', '/api/users/{id}'] as const,
    changePassword: ['external', '/api/change_password/'] as const,
    contributions: ['external', '/api/user_contributions/'] as const,
  },
  avatar: {
    upload: ['external', '/api/upload_avatar/'] as const,
    get: (filename: string) => (['external', `/api/avatar/${filename}/`] as const),
  },
  devices: {
    list: ['external', '/api/list_devices/'] as const,
    onlineHistory: ['external', '/api/query_device_online_history/'] as const,
    staticTime: ['external', '/api/static_time/'] as const,
    uptime: ['external', '/api/device_uptime/'] as const,
    frpConfig: ['external', '/api/frp_config_update/'] as const,
    n2nConfig: ['external', '/api/n2n_config_update/'] as const,
  },
  operations: {
    addLicense: ['external', '/api/add_license/'] as const,
    batchDeploy: ['external', '/api/batch_deploy/'] as const,
    frpUptime: ['external', '/api/device_uptime/'] as const,
    frpConfig: ['external', '/api/frp_config_update/'] as const,
  },
} as const;

// 头像获取的完整 URL
export const getAvatarUrl = (filename: string) => `${API_CONFIG.external.baseUrl}/api/avatar/${filename}/`;