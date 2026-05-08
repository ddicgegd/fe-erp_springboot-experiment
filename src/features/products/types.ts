// ─── Types (khớp API docs) ─────────────────────────────────────────────────────

export interface SkuInfoDto {
  sku: string;
}

export interface MediaItemDto {
  key: string;
  url: string;
}

export interface ProductDto {
  id: string;
  name: string;
  skuInfo?: SkuInfoDto;
  mediaItems?: MediaItemDto[];
  status?: string;
}

export interface PageProductDto {
  totalPages: number;
  totalElements: number;
  number: number; // 0-based (Spring)
  size: number;
  content: ProductDto[];
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

export interface GetProductRequest {
  keyword?: string;
  statuses?: string[];
  category_id?: string[];
  paging: {
    page: number; // 1-based (API yêu cầu)
    size: number;
    orders: Record<string, string>;
  };
}

// ─── Attributes types ──────────────────────────────────────────────────────────

export interface VariantOptionDto {
  key?: string;
  value?: string;
}

export interface AttributesDto {
  id?: string;
  name?: string;
  sku?: SkuInfoDto;
  price?: number;
  salePrice?: number;
  stockQuantity?: number;
  variantOptions?: VariantOptionDto[];
  statusProduct?: string;
  product?: ProductDto;
}

export interface PagingResponseAttributesDto {
  contents?: AttributesDto[];
  paging?: {
    totalPages?: number;
    totalElements?: number;
    pageNumber?: number;
    pageSize?: number;
  };
}

export interface ResponsePagingResponseAttributesDto {
  status?: string;
  data?: PagingResponseAttributesDto;
}

export interface AttributesSearchRequest {
  keyword?: string;
  productIds?: string[];
  statuses?: string[];
  paging: { page: number; size: number; orders: Record<string, string> };
}

// ─── Category types ────────────────────────────────────────────────────────────

export interface CategoryDto {
  id?: string;
  name?: string;
}

export interface PagingResponseCategoryDto {
  contents?: CategoryDto[];
  paging?: { totalPages?: number; totalElements?: number };
}

export interface ResponsePagingResponseCategoryDto {
  status?: string;
  data?: PagingResponseCategoryDto;
}

// ─── Payload types ─────────────────────────────────────────────────────────────

export interface UpdateAttributesPayload {
  id: string;
  name?: string;
  price?: number;
  sale_price?: number;
  stock_quantity?: number;
  statusProduct?: string;
}

export interface CreateProductPayload {
  name: string;
  category_id: string;
  sku?: string;
  status: string;
}

export interface CreateCategoryPayload {
  name: string;
}

export interface VariantGroupInput {
  key: string;
  values: string[];
}

export interface CreateAttributesPayload {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  stockQuantity: number;
  statusProduct: string;
  productId: string;
  variantGroups: VariantGroupInput[];
}
