import mongoClient from './client';
import {
  COLLECTIONS,
  type ExchangeRateSnapshot,
  type DynamicConfig,
  type ChangeLogEntry,
} from './types';

/**
 * Exchange Rate Service
 * Lưu/lấy các snapshot tỷ giá từ MongoDB
 */
export const exchangeRateService = {
  /**
   * Lưu 1 snapshot tỷ giá (ví dụ khi FE fetch từ API tỷ giá bên ngoài)
   */
  saveSnapshot: async (snapshot: Omit<ExchangeRateSnapshot, '_id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    return mongoClient.insertOne(COLLECTIONS.EXCHANGE_RATE_SNAPSHOTS, snapshot);
  },

  /**
   * Lưu nhiều snapshots cùng lúc (batch save)
   */
  saveSnapshots: async (snapshots: Omit<ExchangeRateSnapshot, '_id' | 'createdAt' | 'updatedAt'>[]): Promise<string[]> => {
    return mongoClient.insertMany(COLLECTIONS.EXCHANGE_RATE_SNAPSHOTS, snapshots);
  },

  /**
   * Lấy snapshot mới nhất của 1 cặp tiền tệ
   */
  getLatest: async (baseCurrency: string, targetCurrency: string): Promise<ExchangeRateSnapshot | null> => {
    const results = await mongoClient.find<ExchangeRateSnapshot>(
      COLLECTIONS.EXCHANGE_RATE_SNAPSHOTS,
      { baseCurrency, targetCurrency },
      { sort: { capturedAt: -1 }, limit: 1 },
    );
    return results[0] ?? null;
  },

  /**
   * Lấy lịch sử tỷ giá trong khoảng thời gian
   */
  getHistory: async (
    baseCurrency: string,
    targetCurrency: string,
    fromDate: string,
    toDate?: string,
  ): Promise<ExchangeRateSnapshot[]> => {
    const filter: Record<string, unknown> = {
      baseCurrency,
      targetCurrency,
      capturedAt: {
        $gte: fromDate,
        ...(toDate && { $lte: toDate }),
      },
    };
    return mongoClient.find<ExchangeRateSnapshot>(
      COLLECTIONS.EXCHANGE_RATE_SNAPSHOTS,
      filter,
      { sort: { capturedAt: 1 } },
    );
  },

  /**
   * Lấy tất cả tỷ giá mới nhất (mỗi cặp tiền tệ 1 record gần nhất)
   */
  getAllLatest: async (): Promise<ExchangeRateSnapshot[]> => {
    // Lấy tất cả, sort theo thời gian mới nhất
    return mongoClient.find<ExchangeRateSnapshot>(
      COLLECTIONS.EXCHANGE_RATE_SNAPSHOTS,
      {},
      { sort: { capturedAt: -1 }, limit: 20 },
    );
  },
};

/**
 * Dynamic Config Service
 * Lưu/lấy các config động thay đổi bởi user (holdings, thresholds, v.v.)
 */
export const dynamicConfigService = {
  /**
   * Lấy giá trị 1 config
   */
  get: async (key: string): Promise<DynamicConfig | null> => {
    return mongoClient.findOne<DynamicConfig>(COLLECTIONS.DYNAMIC_CONFIGS, { key });
  },

  /**
   * Lấy tất cả config
   */
  getAll: async (): Promise<DynamicConfig[]> => {
    return mongoClient.find<DynamicConfig>(COLLECTIONS.DYNAMIC_CONFIGS);
  },

  /**
   * Tạo/cập nhật 1 config (upsert-like: update nếu key đã tồn tại, insert nếu chưa)
   */
  set: async (
    key: string,
    value: string | number | boolean,
    description?: string,
    modifiedBy?: string,
  ): Promise<void> => {
    const existing = await mongoClient.findOne<DynamicConfig>(COLLECTIONS.DYNAMIC_CONFIGS, { key });
    if (existing) {
      await mongoClient.updateOne(COLLECTIONS.DYNAMIC_CONFIGS, { key }, {
        value,
        description: description ?? existing.description,
        lastModifiedBy: modifiedBy,
      });
    } else {
      await mongoClient.insertOne(COLLECTIONS.DYNAMIC_CONFIGS, {
        key,
        value,
        description: description ?? '',
        lastModifiedBy: modifiedBy ?? 'system',
      });
    }
  },

  /**
   * Xóa 1 config
   */
  delete: async (key: string): Promise<void> => {
    await mongoClient.deleteOne(COLLECTIONS.DYNAMIC_CONFIGS, { key });
  },
};

/**
 * Change Log Service
 * Ghi lại mọi thay đổi để audit trail
 */
export const changeLogService = {
  /**
   * Ghi 1 entry log
   */
  log: async (entry: Omit<ChangeLogEntry, '_id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    return mongoClient.insertOne(COLLECTIONS.CHANGE_LOGS, entry);
  },

  /**
   * Lấy lịch sử thay đổi gần nhất
   */
  getRecent: async (limit: number = 50): Promise<ChangeLogEntry[]> => {
    return mongoClient.find<ChangeLogEntry>(
      COLLECTIONS.CHANGE_LOGS,
      {},
      { sort: { changedAt: -1 }, limit },
    );
  },

  /**
   * Lấy lịch sử thay đổi theo collection
   */
  getByCollection: async (collection: string, limit: number = 20): Promise<ChangeLogEntry[]> => {
    return mongoClient.find<ChangeLogEntry>(
      COLLECTIONS.CHANGE_LOGS,
      { collection },
      { sort: { changedAt: -1 }, limit },
    );
  },
};
