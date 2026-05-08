// ─── Product status maps ───────────────────────────────────────────────────────

export const STATUS_MAP: Record<
  string,
  { label: string; dotClass: string; textClass: string; bgClass: string }
> = {
  AVAILABLE:  { label: 'Có sẵn',           dotClass: 'bg-primary shadow-glow',   textClass: 'text-primary',                          bgClass: 'bg-primary/10' },
  IN_STOCK:   { label: 'Có sẵn',           dotClass: 'bg-primary shadow-glow',   textClass: 'text-primary',                          bgClass: 'bg-primary/10' },
  OUT_OF_STOCK:{ label: 'Hết hàng',        dotClass: 'bg-red-500',               textClass: 'text-red-600 dark:text-red-400',        bgClass: 'bg-red-500/10' },
  COMING_SOON:{ label: 'Sắp ra mắt',       dotClass: 'bg-cyan-500',              textClass: 'text-cyan-500',                         bgClass: 'bg-cyan-500/10' },
  INACTIVE:   { label: 'Không hoạt động',  dotClass: 'bg-gray-400',              textClass: 'text-gray-500',                         bgClass: 'bg-gray-100 dark:bg-white/10' },
  DISABLED:   { label: 'Không hoạt động',  dotClass: 'bg-gray-400',              textClass: 'text-gray-500',                         bgClass: 'bg-gray-100 dark:bg-white/10' },
  ACTIVE:     { label: 'Sẵn sàng',         dotClass: 'bg-primary shadow-glow',   textClass: 'text-primary',                          bgClass: 'bg-primary/10' },
  LOCKED:     { label: 'Cần bảo trì',      dotClass: 'bg-red-500',               textClass: 'text-red-600 dark:text-red-400',        bgClass: 'bg-red-500/10' },
};

// Figma-style status for detail panel
export const STATUS_DETAIL_MAP: Record<
  string,
  { label: string; textClass: string; bgClass: string }
> = {
  AVAILABLE:   { label: 'Có sẵn',          textClass: 'text-green-700',   bgClass: 'bg-green-700/20' },
  IN_STOCK:    { label: 'Có sẵn',          textClass: 'text-green-700',   bgClass: 'bg-green-700/20' },
  OUT_OF_STOCK:{ label: 'Hết hàng',        textClass: 'text-red-700',     bgClass: 'bg-red-700/20' },
  COMING_SOON: { label: 'Sắp ra mắt',      textClass: 'text-cyan-700',    bgClass: 'bg-cyan-700/20' },
  INACTIVE:    { label: 'Không hoạt động', textClass: 'text-stone-500',   bgClass: 'bg-stone-500/10' },
  DISABLED:    { label: 'Không hoạt động', textClass: 'text-stone-500',   bgClass: 'bg-stone-500/10' },
  ACTIVE:      { label: 'Sẵn sàng',        textClass: 'text-green-700',   bgClass: 'bg-green-700/20' },
  LOCKED:      { label: 'Cần bảo trì',     textClass: 'text-red-700',     bgClass: 'bg-red-700/20' },
};

// ─── Attribute status map ──────────────────────────────────────────────────────

export const ATTR_STATUS_MAP: Record<
  string,
  { label: string; dotClass: string; textClass: string; bgClass: string }
> = {
  AVAILABLE: {
    label: 'Có sẵn',
    dotClass: 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-500/10',
  },
  UNAVAILABLE: {
    label: 'Hết hàng',
    dotClass: 'bg-red-500',
    textClass: 'text-red-500',
    bgClass: 'bg-red-500/10',
  },
  COMING_SOON: {
    label: 'Sắp ra mắt',
    dotClass: 'bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.6)]',
    textClass: 'text-cyan-600 dark:text-cyan-400',
    bgClass: 'bg-cyan-500/10',
  },
  NOT_ACTIVE: {
    label: 'Không hoạt động',
    dotClass: 'bg-gray-400',
    textClass: 'text-gray-500',
    bgClass: 'bg-gray-500/10',
  },
};

// ─── Icon / color palettes ─────────────────────────────────────────────────────

export const ICON_LIST = [
  'memory',
  'smart_screen',
  'smart_toy',
  'router',
  'devices',
  'category',
  'precision_manufacturing',
];

export const ICON_COLOR = [
  'text-primary',
  'text-cyan-500',
  'text-secondary',
  'text-emerald-500',
  'text-orange-400',
];

export const BG_COLOR = [
  'bg-primary/10',
  'bg-cyan-500/10',
  'bg-secondary/10',
  'bg-emerald-500/10',
  'bg-orange-400/10',
];

// ─── Pagination ────────────────────────────────────────────────────────────────

export const PAGE_SIZE = 10;

// ─── Create modal metadata ─────────────────────────────────────────────────────

export const CREATE_META: Record<
  string,
  { title: string; subtitle: string; icon: string; color: string; accent: string }
> = {
  product: {
    title: 'Tạo sản phẩm mới',
    subtitle: 'Thêm sản phẩm vào hệ thống kho hàng',
    icon: 'inventory_2',
    color: 'text-emerald-500',
    accent: 'from-emerald-500/10 to-emerald-500/5 dark:from-emerald-500/20 dark:to-emerald-500/10',
  },
  attributes: {
    title: 'Tạo biến thể mới',
    subtitle: 'Thêm biến thể / thuộc tính cho sản phẩm',
    icon: 'tune',
    color: 'text-cyan-500',
    accent: 'from-cyan-500/10 to-blue-500/5 dark:from-cyan-500/20 dark:to-blue-500/10',
  },
  category: {
    title: 'Tạo danh mục mới',
    subtitle: 'Thêm danh mục phân loại sản phẩm',
    icon: 'category',
    color: 'text-orange-500',
    accent: 'from-orange-500/10 to-amber-500/5 dark:from-orange-500/20 dark:to-amber-500/10',
  },
};
