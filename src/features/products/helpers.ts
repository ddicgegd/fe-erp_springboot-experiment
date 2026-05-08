import { STATUS_MAP, STATUS_DETAIL_MAP, ATTR_STATUS_MAP, ICON_LIST } from './constants';

// ─── Status helpers ────────────────────────────────────────────────────────────

export function getStatusInfo(status?: string) {
  if (!status) return STATUS_MAP.INACTIVE;
  return STATUS_MAP[status] ?? {
    label: status,
    dotClass: 'bg-gray-400',
    textClass: 'text-gray-500',
    bgClass: 'bg-gray-100 dark:bg-white/10',
  };
}

export function getStatusDetailInfo(status?: string) {
  if (!status) return STATUS_DETAIL_MAP.INACTIVE;
  return STATUS_DETAIL_MAP[status] ?? {
    label: status,
    textClass: 'text-stone-500',
    bgClass: 'bg-stone-500/10',
  };
}

export const getAttrStatusInfo = (status?: string) =>
  ATTR_STATUS_MAP[status || ''] || {
    label: status || 'N/A',
    dotClass: 'bg-gray-300',
    textClass: 'text-gray-400',
    bgClass: 'bg-gray-100 dark:bg-white/5',
  };

// ─── Image URL ─────────────────────────────────────────────────────────────────

export const getImageUrl = (imageName: string | undefined | null): string => {
  if (!imageName) return '';
  if (imageName.startsWith('http')) return imageName;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  return `${baseUrl}/api/merchandise/view-image/${imageName}`;
};

// ─── Pagination ────────────────────────────────────────────────────────────────

export function buildPages(currentZero: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const p: (number | '…')[] = [];
  if (currentZero <= 3) {
    p.push(0, 1, 2, 3, '…', total - 1);
  } else if (currentZero >= total - 4) {
    p.push(0, '…', total - 4, total - 3, total - 2, total - 1);
  } else {
    p.push(0, '…', currentZero - 1, currentZero, currentZero + 1, '…', total - 1);
  }
  return p;
}

// ─── Misc ──────────────────────────────────────────────────────────────────────

export function hashName(name: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % mod;
  return Math.abs(h);
}

export const generateId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

// Icon index helpers (dùng ICON_LIST để tính)
export const getIconIdx = (name: string) => hashName(name, ICON_LIST.length);
