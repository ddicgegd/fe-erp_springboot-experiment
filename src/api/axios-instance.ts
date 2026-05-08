import Axios, { AxiosRequestConfig } from 'axios';

// ─── Logout callback registry ──────────────────────────────────────────────────
// Giải quyết circular dependency: axios không import AuthContext,
// mà AuthContext chủ động đăng ký callback vào đây khi mount.
type LogoutFn = (() => void) | null;
let _globalLogout: LogoutFn = null;

export function setGlobalLogout(fn: LogoutFn): void {
  _globalLogout = fn;
}

// ─── Axios Instance ────────────────────────────────────────────────────────────
const AXIOS_INSTANCE = Axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor: đính kèm JWT token
AXIOS_INSTANCE.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: xử lý 401 (token hết hạn / bị thu hồi)
// Bỏ qua auto-logout cho các endpoint tracking/analytics (fire-and-forget)
const SKIP_LOGOUT_PATTERNS = ['/view-Product/', '/view-image/'];

AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const isTrackingCall = SKIP_LOGOUT_PATTERNS.some((p) => requestUrl.includes(p));

      if (!isTrackingCall) {
        // Endpoint quan trọng bị 401 → token thực sự hết hạn
        if (_globalLogout) {
          _globalLogout();
        } else {
          localStorage.removeItem('access_token');
          localStorage.removeItem('nexus_user_info');
        }
      }
      // Tracking call bị 401 → skip logout, để catch block xử lý silent fail
    }
    return Promise.reject(error);
  },
);

/**
 * Custom Axios instance cho cả Orval generated code và manual API calls.
 * Orval v8 gọi hàm này với signature (url, requestInit) kiểu fetch.
 * Ta translate sang Axios request.
 */
export const customInstance = <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  const config: AxiosRequestConfig = {
    url,
    method: (options?.method as AxiosRequestConfig['method']) ?? 'GET',
    data: options?.body,
    headers: options?.headers as AxiosRequestConfig['headers'],
    signal: options?.signal as AbortSignal,
  };

  return AXIOS_INSTANCE(config).then(({ data }) => data);
};

export default customInstance;
