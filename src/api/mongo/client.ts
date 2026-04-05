import axios, { AxiosInstance } from 'axios';

/**
 * MongoDB REST Client
 *
 * Kết nối tới MongoDB thông qua REST proxy (ví dụ: RESTHeart, mongo-express-rest,
 * hoặc custom Express proxy chạy trong Docker).
 *
 * ⚠️  Browser KHÔNG THỂ kết nối trực tiếp MongoDB qua driver.
 *     Cần có 1 REST layer trung gian phía trước MongoDB.
 *
 * Docker compose ví dụ:
 *   - live-mongo (port 27018) <-- MongoDB
 *   - mongo-rest (port 3100)  <-- REST proxy expose cho FE
 */

// ─── Config ──────────────────────────────────────────────────────

const MONGO_API_URL = import.meta.env.VITE_MONGO_API_URL || 'http://localhost:3100';
const MONGO_DATABASE = import.meta.env.VITE_MONGO_DATABASE || 'fe_erp_live';

// ─── Axios Instance ──────────────────────────────────────────────

const mongoAxios: AxiosInstance = axios.create({
  baseURL: MONGO_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor — log requests in dev
mongoAxios.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.debug(`[Mongo] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — normalize errors
mongoAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Lỗi kết nối MongoDB';
    console.error(`[Mongo] Error: ${message}`, error);
    return Promise.reject(new Error(message));
  },
);

// ─── Generic CRUD Operations ─────────────────────────────────────

export const mongoClient = {
  /**
   * Lấy danh sách documents từ collection
   */
  find: async <T>(
    collection: string,
    filter: Record<string, unknown> = {},
    options?: { sort?: Record<string, 1 | -1>; limit?: number; skip?: number },
  ): Promise<T[]> => {
    const response = await mongoAxios.post(`/${MONGO_DATABASE}/${collection}/find`, {
      filter,
      ...options,
    });
    return response.data?.documents ?? response.data ?? [];
  },

  /**
   * Lấy 1 document
   */
  findOne: async <T>(
    collection: string,
    filter: Record<string, unknown>,
  ): Promise<T | null> => {
    const response = await mongoAxios.post(`/${MONGO_DATABASE}/${collection}/findOne`, {
      filter,
    });
    return response.data?.document ?? response.data ?? null;
  },

  /**
   * Thêm 1 document
   */
  insertOne: async <T extends Record<string, unknown>>(
    collection: string,
    document: T,
  ): Promise<string> => {
    const docWithTimestamp = {
      ...document,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const response = await mongoAxios.post(`/${MONGO_DATABASE}/${collection}/insertOne`, {
      document: docWithTimestamp,
    });
    return response.data?.insertedId ?? response.data?._id ?? '';
  },

  /**
   * Thêm nhiều documents
   */
  insertMany: async <T extends Record<string, unknown>>(
    collection: string,
    documents: T[],
  ): Promise<string[]> => {
    const now = new Date().toISOString();
    const docsWithTimestamp = documents.map((doc) => ({
      ...doc,
      createdAt: now,
      updatedAt: now,
    }));
    const response = await mongoAxios.post(`/${MONGO_DATABASE}/${collection}/insertMany`, {
      documents: docsWithTimestamp,
    });
    return response.data?.insertedIds ?? [];
  },

  /**
   * Cập nhật 1 document
   */
  updateOne: async (
    collection: string,
    filter: Record<string, unknown>,
    update: Record<string, unknown>,
  ): Promise<{ matchedCount: number; modifiedCount: number }> => {
    const response = await mongoAxios.post(`/${MONGO_DATABASE}/${collection}/updateOne`, {
      filter,
      update: {
        $set: {
          ...update,
          updatedAt: new Date().toISOString(),
        },
      },
    });
    return {
      matchedCount: response.data?.matchedCount ?? 0,
      modifiedCount: response.data?.modifiedCount ?? 0,
    };
  },

  /**
   * Xóa 1 document
   */
  deleteOne: async (
    collection: string,
    filter: Record<string, unknown>,
  ): Promise<{ deletedCount: number }> => {
    const response = await mongoAxios.post(`/${MONGO_DATABASE}/${collection}/deleteOne`, {
      filter,
    });
    return { deletedCount: response.data?.deletedCount ?? 0 };
  },

  /**
   * Đếm documents
   */
  count: async (
    collection: string,
    filter: Record<string, unknown> = {},
  ): Promise<number> => {
    const response = await mongoAxios.post(`/${MONGO_DATABASE}/${collection}/count`, {
      filter,
    });
    return response.data?.count ?? response.data ?? 0;
  },
};

export { MONGO_API_URL, MONGO_DATABASE };
export default mongoClient;
