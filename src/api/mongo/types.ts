/**
 * MongoDB Document Types
 * Định nghĩa các kiểu dữ liệu lưu trữ động trên MongoDB
 */

// ─── Base Document ───────────────────────────────────────────────
export interface MongoDocument {
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Exchange Rate Snapshot ──────────────────────────────────────
export interface ExchangeRateSnapshot extends MongoDocument {
  baseCurrency: string;       // VD: 'VND'
  targetCurrency: string;     // VD: 'USD', 'CNY'
  rate: number;               // Tỷ giá tại thời điểm lưu
  change7d?: number;          // Biến động % so với 7 ngày trước (VD: +0.65)
  change30d?: number;         // Biến động % so với 30 ngày trước (VD: -1.2)
  source: string;             // Nguồn lấy: 'exchangerate-api', 'manual', 'fallback'
  capturedAt: string;         // ISO timestamp khi capture
  capturedBy?: string;        // userId hoặc 'system'
}

// ─── Dynamic Config ─────────────────────────────────────────────
export interface DynamicConfig extends MongoDocument {
  key: string;                // VD: 'usd_holding', 'cny_holding', 'refresh_interval'
  value: string | number | boolean;
  description?: string;
  lastModifiedBy?: string;
}

// ─── Change Log Entry ───────────────────────────────────────────
export interface ChangeLogEntry extends MongoDocument {
  collection: string;         // Collection nào bị thay đổi
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  documentId?: string;
  previousValue?: unknown;
  newValue?: unknown;
  changedBy?: string;
  changedAt: string;          // ISO timestamp
  description?: string;
}

// ─── MongoDB API Response Types ─────────────────────────────────
export interface MongoFindResponse<T> {
  documents: T[];
}

export interface MongoInsertOneResponse {
  insertedId: string;
}

export interface MongoUpdateResponse {
  matchedCount: number;
  modifiedCount: number;
}

export interface MongoDeleteResponse {
  deletedCount: number;
}

// ─── Collection Names ───────────────────────────────────────────
export const COLLECTIONS = {
  EXCHANGE_RATE_SNAPSHOTS: 'exchange_rate_snapshots',
  DYNAMIC_CONFIGS: 'dynamic_configs',
  CHANGE_LOGS: 'change_logs',
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
