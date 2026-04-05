import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { customInstance } from '../api/axios-instance';

// ─── Types (khớp API docs) ─────────────────────────────────────────────────────

interface SkuInfoDto {
  sku: string;
}
interface MediaItemDto {
  key: string;
  url: string;
}
interface ProductDto {
  id: string;
  name: string;
  skuInfo?: SkuInfoDto;
  mediaItems?: MediaItemDto[];
  status?: string;
}
interface PageProductDto {
  totalPages: number;
  totalElements: number;
  number: number; // 0-based (Spring)
  size: number;
  content: ProductDto[];
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}
interface GetProductRequest {
  keyword?: string;
  statuses?: string[];
  paging: {
    page: number; // 1-based (API yêu cầu)
    size: number;
    orders: Record<string, string>;
  };
}

// ─── API call ──────────────────────────────────────────────────────────────────
// customInstance đã unwrap response.data → trả thẳng PageProductDto

const fetchProducts = (body: GetProductRequest): Promise<PageProductDto> =>
  customInstance<PageProductDto>('/api/merchandise/search-Product', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

// ─── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; dotClass: string; textClass: string; bgClass: string }> = {
  ACTIVE: {
    label: 'Sẵn sàng',
    dotClass: 'bg-primary shadow-glow',
    textClass: 'text-primary',
    bgClass: 'bg-primary/10',
  },
  INACTIVE: {
    label: 'Ngừng bán',
    dotClass: 'bg-gray-400',
    textClass: 'text-gray-500',
    bgClass: 'bg-gray-100 dark:bg-white/10',
  },
  LOCKED: {
    label: 'Cần bảo trì',
    dotClass: 'bg-red-500',
    textClass: 'text-red-600 dark:text-red-400',
    bgClass: 'bg-red-500/10',
  },
};

function getStatusInfo(status?: string) {
  if (!status) return STATUS_MAP.INACTIVE;
  return STATUS_MAP[status] ?? {
    label: status,
    dotClass: 'bg-gray-400',
    textClass: 'text-gray-500',
    bgClass: 'bg-gray-100 dark:bg-white/10',
  };
}

const ICON_LIST = ['memory', 'smart_screen', 'smart_toy', 'router', 'devices', 'category', 'precision_manufacturing'];
const ICON_COLOR = ['text-primary', 'text-cyan-500', 'text-secondary', 'text-emerald-500', 'text-orange-400'];
const BG_COLOR   = ['bg-primary/10', 'bg-cyan-500/10', 'bg-secondary/10', 'bg-emerald-500/10', 'bg-orange-400/10'];

function hashName(name: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % mod;
  return Math.abs(h);
}

const getImageUrl = (imageName: string) => {
  if (!imageName) return '';
  if (imageName.startsWith('http')) return imageName;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  return `${baseUrl}/api/merchandise/view-image/${imageName}`;
};

function buildPages(currentZero: number, total: number): (number | '…')[] {
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

const PAGE_SIZE = 10;

// ─── Skeleton Row ──────────────────────────────────────────────────────────────

const SkeletonRow: React.FC = () => (
  <tr className="border-t border-gray-100 dark:border-white/5 animate-pulse">
    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
      <td key={i} className="p-6">
        <div className="h-4 bg-gray-200 dark:bg-white/10 rounded-xl w-3/4" />
      </td>
    ))}
  </tr>
);

// ─── Main Component ────────────────────────────────────────────────────────────

const ProductListScreen: React.FC = () => {
  const [inputValue, setInputValue]     = useState('');
  const [keyword, setKeyword]           = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage]                 = useState(1); // 1-based

  // Debounce keyword 400 ms
  useEffect(() => {
    const t = setTimeout(() => {
      setKeyword(inputValue.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [inputValue]);

  // Reset trang khi đổi filter
  useEffect(() => { setPage(1); }, [statusFilter]);

  // Build request body — để trống = get all
  const body: GetProductRequest = {
    paging: { page, size: PAGE_SIZE, orders: {} },
    ...(keyword ? { keyword } : {}),
    ...(statusFilter !== 'ALL' ? { statuses: [statusFilter] } : {}),
  };

  const { data, isLoading, isError, error, isFetching } = useQuery<PageProductDto>({
    queryKey: ['searchProducts', keyword, statusFilter, page],
    queryFn: () => fetchProducts(body),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });

  // Spring trả PageProductDto trực tiếp (không wrapper)
  const products      = data?.content ?? [];
  const totalPages    = data?.totalPages ?? 1;
  const totalElements = data?.totalElements ?? 0;
  const currentPage   = (data?.number ?? 0) + 1; // hiển thị 1-based

  const changePage = (p: number) => {
    if (p >= 1 && p <= totalPages) setPage(p);
  };

  const pageButtons = buildPages(page - 1, totalPages).map((p) =>
    p === '…' ? p : (p as number) + 1,
  );

  const fromItem = totalElements === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const toItem   = Math.min(page * PAGE_SIZE, totalElements);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Page Header ─────────────────────────── */}
      <div className="flex justify-between items-end border-l-4 border-primary pl-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-gray-800 dark:text-white">DANH SÁCH SẢN PHẨM</h1>
          <p className="text-primary font-mono text-sm tracking-widest uppercase mt-2">LOGISTICS_CORE // INVENTORY_CONTROL</p>
        </div>
        <div className="hidden md:block text-right font-mono text-xs text-gray-500 leading-tight">
          COORD: 40.7128° N, 74.0060° W<br />
          SEC: OPERATIONAL_AREA_04
        </div>
      </div>

      {/* ── Inventory Status Widgets ─────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Tổng sản phẩm */}
        <div className="bg-white/50 dark:bg-surface-dark/50 backdrop-blur-xl rounded-4xl p-6 relative group overflow-hidden border border-gray-200 dark:border-white/5">
          <div className="absolute top-6 right-6 text-primary">
            <span className="material-icons-round text-3xl transition-transform group-hover:scale-110">inventory_2</span>
          </div>
          <div>
            <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">TỔNG SẢN PHẨM</p>
            <h2 className="text-4xl font-black mt-2 text-gray-800 dark:text-white">
              {isLoading ? '...' : totalElements.toLocaleString('vi-VN')}
            </h2>
          </div>
          <div className="mt-6 h-2 w-full bg-gray-100 dark:bg-black/30 rounded-full overflow-hidden">
            <div className="h-full bg-primary w-3/4 shadow-glow rounded-full" />
          </div>
        </div>

        {/* Cần bảo trì */}
        <div className="bg-white/50 dark:bg-surface-dark/50 backdrop-blur-xl rounded-4xl p-6 relative group overflow-hidden border border-gray-200 dark:border-white/5">
          <div className="absolute top-6 right-6 text-red-500">
            <span className="material-icons-round text-3xl transition-transform group-hover:scale-110">build_circle</span>
          </div>
          <div>
            <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">CẦN BẢO TRÌ</p>
            <h2 className="text-4xl font-black mt-2 text-red-500">
              {isLoading ? '...' : products.filter((p) => p.status === 'LOCKED').length}
            </h2>
          </div>
          <div className="mt-6 flex space-x-1.5 h-2">
            <div className="flex-1 bg-red-500 rounded-full" />
            <div className="flex-1 bg-red-500 rounded-full" />
            <div className="flex-1 bg-red-500/20 rounded-full" />
            <div className="flex-1 bg-red-500/20 rounded-full" />
            <div className="flex-1 bg-red-500/20 rounded-full" />
          </div>
        </div>

        {/* Lô hàng sắp về */}
        <div className="bg-white/50 dark:bg-surface-dark/50 backdrop-blur-xl rounded-4xl p-6 relative group overflow-hidden border border-gray-200 dark:border-white/5">
          <div className="absolute top-6 right-6 text-cyan-500">
            <span className="material-icons-round text-3xl transition-transform group-hover:scale-110">local_shipping</span>
          </div>
          <div>
            <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">LÔ HÀNG SẮP VỀ</p>
            <h2 className="text-4xl font-black mt-2 text-cyan-500">+240</h2>
          </div>
          <div className="mt-6 mb-[-4px] text-xs font-bold text-cyan-500 flex items-center bg-cyan-500/10 dark:bg-cyan-500/20 w-fit px-3 py-1 rounded-full">
            <span className={`material-icons-round text-[14px] mr-1 ${isFetching ? 'animate-spin' : ''}`}>sync</span>
            {isFetching ? 'ĐANG ĐỒNG BỘ...' : 'ĐÃ ĐỒNG BỘ'}
          </div>
        </div>

        {/* Giá trị tổng */}
        <div className="bg-white/50 dark:bg-surface-dark/50 backdrop-blur-xl rounded-4xl p-6 relative group overflow-hidden border border-gray-200 dark:border-white/5">
          <div className="absolute top-6 right-6 text-secondary">
            <span className="material-icons-round text-3xl transition-transform group-hover:scale-110">payments</span>
          </div>
          <div>
            <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">GIÁ TRỊ TỔNG</p>
            <h2 className="text-4xl font-black mt-2 text-secondary">$4.2M</h2>
          </div>
          <div className="mt-6 h-2 w-full bg-gray-100 dark:bg-black/30 rounded-full overflow-hidden">
            <div className="h-full bg-secondary w-1/2 rounded-full shadow-glow-purple" />
          </div>
        </div>
      </section>

      {/* ── Main Content Area ────────────────────── */}
      <div className="bg-white/50 dark:bg-surface-dark/50 backdrop-blur-xl rounded-4xl border border-gray-200 dark:border-white/5 overflow-hidden flex flex-col">
        {/* Search & Filter */}
        <section className="p-6 border-b border-gray-200 dark:border-white/5 flex flex-wrap items-center gap-4">
          {/* Ô tìm kiếm */}
          <div className="flex-1 min-w-[300px] relative">
            <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input
              className="w-full bg-gray-100/50 dark:bg-accent-dark/50 border-none rounded-2xl text-sm py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary placeholder:text-gray-400 dark:text-gray-300 outline-none transition-all dark:focus:bg-accent-dark/80"
              placeholder="Tìm kiếm sản phẩm, mã SKU..."
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>

          {/* Lọc trạng thái */}
          <div className="flex items-center space-x-2 bg-gray-100/50 dark:bg-accent-dark/50 rounded-2xl p-1 pr-4 border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-3">TRẠNG THÁI:</span>
            <select
              className="bg-transparent text-gray-800 dark:text-gray-200 border-none text-sm font-semibold py-3 px-2 focus:ring-0 appearance-none outline-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Mọi trạng thái</option>
              <option value="ACTIVE">Sẵn sàng</option>
              <option value="INACTIVE">Ngừng bán</option>
              <option value="LOCKED">Cần bảo trì</option>
            </select>
          </div>

          {/* Nút lọc */}
          <button
            className="bg-primary text-black font-bold h-12 px-8 rounded-2xl hover:scale-[1.02] shadow-glow active:scale-95 transition-all flex items-center"
            onClick={() => { setInputValue(''); setStatusFilter('ALL'); setPage(1); }}
          >
            <span className="material-icons-round mr-2 text-lg">filter_list</span>
            ĐẶT LẠI
          </button>
        </section>

        {/* Product Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-accent-dark/30">
                <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Mã SKU</th>
                <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Hình ảnh</th>
                <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Tác vụ</th>
              </tr>
            </thead>
            <tbody className="text-sm dark:text-gray-200">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <span className="material-icons-round text-5xl text-gray-400">cloud_off</span>
                      <p className="text-base font-medium">Ôi hỏng! Không thể lấy dữ liệu lúc này, vui lòng thử lại sau.</p>
                      <p className="text-xs text-red-400/70">Mã lỗi: {(error as any)?.message || 'Không rõ'}</p>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <span className="material-icons-round text-5xl text-gray-300">inventory_2</span>
                      <p className="text-base font-medium">Dữ liệu trống! Chưa có sản phẩm nào ở đây cả.</p>
                      <p className="text-xs italic opacity-70">Hãy thử thay đổi điều kiện lọc hoặc thêm sản phẩm mới.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <ProductRow key={product.id} product={product} />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-6 bg-gray-50/50 dark:bg-accent-dark/30 flex flex-col sm:flex-row justify-between items-center text-sm font-medium text-gray-500 border-t border-gray-200 dark:border-white/5">
          <div className="mb-4 sm:mb-0">
            Hiển thị{' '}
            <strong className="text-gray-800 dark:text-white">{fromItem}</strong> đến{' '}
            <strong className="text-gray-800 dark:text-white">{toItem}</strong> trong số{' '}
            <strong className="text-gray-800 dark:text-white">{totalElements.toLocaleString('vi-VN')}</strong> mục
          </div>
          <div className="flex space-x-2">
            <button
              className="px-4 py-2 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors disabled:opacity-30"
              onClick={() => changePage(page - 1)}
              disabled={page === 1 || isLoading}
            >
              Trước
            </button>
            <div className="flex space-x-1 items-center">
              {pageButtons.map((pg, idx) =>
                pg === '…' ? (
                  <span key={`ell-${idx}`} className="px-2">...</span>
                ) : (
                  <button
                    key={`pg-${pg}`}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      pg === currentPage
                        ? 'bg-primary text-black font-black shadow-glow'
                        : 'hover:bg-gray-200 dark:hover:bg-white/10'
                    }`}
                    onClick={() => changePage(pg as number)}
                  >
                    {pg}
                  </button>
                ),
              )}
            </div>
            <button
              className="px-4 py-2 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors disabled:opacity-30"
              onClick={() => changePage(page + 1)}
              disabled={page === totalPages || isLoading}
            >
              Tiếp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── ProductRow ────────────────────────────────────────────────────────────────

const ProductRow: React.FC<{ product: ProductDto }> = ({ product }) => {
  const statusInfo  = getStatusInfo(product.status);
  const iconIdx     = hashName(product.name, ICON_LIST.length);
  const colorIdx    = hashName(product.name, ICON_COLOR.length);
  const icon        = ICON_LIST[iconIdx];
  const iconColor   = ICON_COLOR[colorIdx];
  const bgColor     = BG_COLOR[colorIdx];
  const thumbnail   = product.mediaItems?.[0]?.url;

  return (
    <tr className="group hover:bg-white/40 dark:hover:bg-white/5 transition-colors border-t border-gray-100 dark:border-white/5">
      {/* Tên sản phẩm */}
      <td className="p-6">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-2xl ${bgColor} flex items-center justify-center overflow-hidden flex-shrink-0`}>
            {thumbnail ? (
              <img src={getImageUrl(thumbnail)} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <span className={`material-icons-round ${iconColor}`}>{icon}</span>
            )}
          </div>
          <span className="font-bold text-base text-gray-800 dark:text-white truncate max-w-[200px]" title={product.name}>
            {product.name}
          </span>
        </div>
      </td>

      {/* Mã SKU */}
      <td className="p-6 font-mono font-medium text-gray-500 dark:text-gray-400">
        {product.skuInfo?.sku || <span className="italic text-gray-400">N/A</span>}
      </td>

      {/* Hình ảnh */}
      <td className="p-6">
        {product.mediaItems && product.mediaItems.length > 0 ? (
          <div className="flex space-x-1">
            {product.mediaItems.slice(0, 2).map((img, i) => (
              <img key={i} src={getImageUrl(img.url)} alt="" className="w-9 h-9 rounded-lg object-cover border border-gray-200 dark:border-white/10" />
            ))}
            {product.mediaItems.length > 2 && (
              <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-gray-500">
                +{product.mediaItems.length - 2}
              </div>
            )}
          </div>
        ) : (
          <span className="text-xs text-gray-400 italic">Chưa có ảnh</span>
        )}
      </td>

      {/* Trạng thái */}
      <td className="p-6">
        <div className={`flex items-center ${statusInfo.textClass} font-bold text-xs ${statusInfo.bgClass} w-fit px-3 py-1.5 rounded-xl`}>
          <span className={`w-2 h-2 ${statusInfo.dotClass} rounded-full mr-2`} />
          {statusInfo.label}
        </div>
      </td>

      {/* Tác vụ */}
      <td className="p-6">
        <div className="flex items-center justify-center space-x-2">
          <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-white/80 dark:hover:bg-white/10 hover:text-primary rounded-xl transition-all shadow-sm" title="Xem chi tiết">
            <span className="material-icons-round text-[20px]">visibility</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-white/80 dark:hover:bg-white/10 hover:text-cyan-500 rounded-xl transition-all shadow-sm" title="Chỉnh sửa">
            <span className="material-icons-round text-[20px]">edit</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-white/80 dark:hover:bg-red-500/20 hover:text-red-500 rounded-xl transition-all shadow-sm" title="Xóa">
            <span className="material-icons-round text-[20px]">delete_outline</span>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ProductListScreen;
