import { customInstance } from '../../api/axios-instance';
import type {
  GetProductRequest,
  PageProductDto,
  AttributesSearchRequest,
  ResponsePagingResponseAttributesDto,
  ResponsePagingResponseCategoryDto,
  UpdateAttributesPayload,
  CreateProductPayload,
  CreateAttributesPayload,
} from './types';

// ─── Read ──────────────────────────────────────────────────────────────────────

export const fetchProducts = (body: GetProductRequest): Promise<PageProductDto> =>
  customInstance<PageProductDto>('/api/merchandise/search-Product', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

export const fetchAttributes = (
  body: AttributesSearchRequest,
): Promise<ResponsePagingResponseAttributesDto> =>
  customInstance<ResponsePagingResponseAttributesDto>('/api/merchandise/search-Attributes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

export const fetchCategories = (): Promise<ResponsePagingResponseCategoryDto> =>
  customInstance<ResponsePagingResponseCategoryDto>('/api/merchandise/search-Category', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paging: { page: 1, size: 100, orders: {} } }),
  });

// ─── Mutations ─────────────────────────────────────────────────────────────────

export const updateAttributes = (payload: UpdateAttributesPayload): Promise<unknown> =>
  customInstance('/api/merchandise/update-Attributes', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

export const createProduct = (payload: CreateProductPayload): Promise<unknown> =>
  customInstance('/api/merchandise/add-Product', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

export const createCategory = (name: string): Promise<unknown> =>
  customInstance(`/api/merchandise/add-Category?name=${encodeURIComponent(name)}`, {
    method: 'POST',
  });

export const createAttributes = (payload: CreateAttributesPayload): Promise<unknown> =>
  customInstance('/api/merchandise/add-Attributes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

// ─── Tracking ──────────────────────────────────────────────────────────────────

export const incrementProductView = (productId: string): Promise<unknown> =>
  customInstance(`/api/merchandise/view-Product/${productId}`, {
    method: 'POST',
  });
