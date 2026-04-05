/**
 * MongoDB Module - Barrel Export
 *
 * Cấu trúc:
 *   mongo/
 *   ├── index.ts        ← Re-export tất cả (file này)
 *   ├── client.ts       ← Generic CRUD client (axios → REST proxy → MongoDB)
 *   ├── types.ts         ← Document types, collection names
 *   └── services.ts     ← Business-logic services (exchange rates, configs, logs)
 *
 * Usage:
 *   import { exchangeRateService, dynamicConfigService } from '@/api/mongo';
 *   import { mongoClient } from '@/api/mongo';
 *   import type { ExchangeRateSnapshot } from '@/api/mongo';
 */

// Client
export { default as mongoClient, MONGO_API_URL, MONGO_DATABASE } from './client';

// Types
export type {
  MongoDocument,
  ExchangeRateSnapshot,
  DynamicConfig,
  ChangeLogEntry,
  MongoFindResponse,
  MongoInsertOneResponse,
  MongoUpdateResponse,
  MongoDeleteResponse,
  CollectionName,
} from './types';
export { COLLECTIONS } from './types';

// Services
export {
  exchangeRateService,
  dynamicConfigService,
  changeLogService,
} from './services';
