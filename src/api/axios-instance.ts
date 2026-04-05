import Axios, { AxiosRequestConfig } from 'axios';

const AXIOS_INSTANCE = Axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// Request interceptor: attach JWT token
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

// Response interceptor: handle 401
AXIOS_INSTANCE.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('access_token');
            window.location.href = window.location.origin + '/login';
        }
        return Promise.reject(error);
    },
);

/**
 * Custom Axios instance for Orval generated code.
 * Orval v8 calls this with (url, requestInit) — fetch-style signature.
 * We translate it to an Axios request.
 */
export const customInstance = <T>(
    url: string,
    options?: RequestInit,
): Promise<T> => {
    // Translate fetch RequestInit to Axios config
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
