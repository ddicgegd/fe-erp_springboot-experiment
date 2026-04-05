// API Configuration
// Change these values based on your environment

const API_CONFIG = {
    // Base URL for the backend API
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',

    // API version prefix
    API_VERSION: '/api/v1',

    // Timeout in milliseconds
    TIMEOUT: 30000,

    // Endpoints
    ENDPOINTS: {
        // Dashboard
        DASHBOARD: {
            STATS: '/dashboard/stats',
            ALERTS: '/dashboard/alerts',
            ASSETS: '/dashboard/assets',
            MARKET_FORECAST: '/dashboard/market-forecast',
        },

        // Shipments / Orders
        SHIPMENTS: {
            LIST: '/shipments',
            DETAIL: (id: string) => `/shipments/${id}`,
            TRACKING: (id: string) => `/shipments/${id}/tracking`,
        },

        // Inventory
        INVENTORY: {
            LIST: '/inventory',
            WAREHOUSES: '/inventory/warehouses',
        },

        // Exchange Rates
        EXCHANGE_RATES: {
            LIST: '/exchange-rates',
            CRYPTO: '/exchange-rates/crypto',
        },

        // Authentication
        AUTH: {
            LOGIN: '/auth/login',
            LOGOUT: '/auth/logout',
            REFRESH: '/auth/refresh',
            PROFILE: '/auth/profile',
        },
    },
};

// Helper function to build full URL
export const buildUrl = (endpoint: string): string => {
    return `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}${endpoint}`;
};

// Export config
export default API_CONFIG;
