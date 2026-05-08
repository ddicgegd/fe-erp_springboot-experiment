import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { GetProductRequest, AttributesSearchRequest } from './types';
import { fetchProducts, fetchAttributes, fetchCategories } from './api';
import { buildPages } from './helpers';
import { PAGE_SIZE } from './constants';

import SearchableSelect from './components/SearchableSelect';
import SkeletonRow from './components/SkeletonRow';
import ProductRow from './components/ProductRow';
import ProductDetailPanel from './components/ProductDetailPanel';
import ProductEditModal from './components/ProductEditModal';
import AttributeRow from './components/AttributeRow';
import AttributeDetailPanel from './components/AttributeDetailPanel';
import CreateEntityModal from './components/CreateEntityModal';

import type { ProductDto, AttributesDto } from './types';

const ProductListScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'attributes'>('products');

  // Products tab state
  const [inputValue, setInputValue] = useState('');
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<ProductDto | null>(null);
  const [editProduct, setEditProduct] = useState<ProductDto | null>(null);

  // Attributes tab state
  const [attrInputValue, setAttrInputValue] = useState('');
  const [attrKeyword, setAttrKeyword] = useState('');
  const [attrStatusFilter, setAttrStatusFilter] = useState('ALL');
  const [attrProductFilter, setAttrProductFilter] = useState('ALL');
  const [attrPage, setAttrPage] = useState(1);
  const [selectedAttribute, setSelectedAttribute] = useState<AttributesDto | null>(null);

  // Create modal state
  const [createModal, setCreateModal] = useState<'product' | 'attributes' | 'category' | null>(null);
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => { setKeyword(inputValue.trim()); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [inputValue]);

  useEffect(() => {
    const t = setTimeout(() => { setAttrKeyword(attrInputValue.trim()); setAttrPage(1); }, 400);
    return () => clearTimeout(t);
  }, [attrInputValue]);

  useEffect(() => { setPage(1); }, [statusFilter, categoryFilter]);
  useEffect(() => { setAttrPage(1); }, [attrStatusFilter, attrProductFilter]);

  // Product query
  const productBody: GetProductRequest = {
    paging: { page, size: PAGE_SIZE, orders: {} },
    ...(keyword ? { keyword } : {}),
    ...(statusFilter !== 'ALL' ? { statuses: [statusFilter] } : {}),
    ...(categoryFilter !== 'ALL' ? { category_id: [categoryFilter] } : {}),
  };

  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ['searchProducts', keyword, statusFilter, categoryFilter, page],
    queryFn: () => fetchProducts(productBody),
    placeholderData: (prev: any) => prev,
    staleTime: 30_000,
  });

  const products = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalElements = data?.totalElements ?? 0;
  const currentPage = (data?.number ?? 0) + 1;

  // Attributes query
  const attrBody: AttributesSearchRequest = {
    paging: { page: attrPage, size: PAGE_SIZE, orders: {} },
    ...(attrKeyword ? { keyword: attrKeyword } : {}),
    ...(attrStatusFilter !== 'ALL' ? { statuses: [attrStatusFilter] } : {}),
    ...(attrProductFilter !== 'ALL' ? { productIds: [attrProductFilter] } : {}),
  };

  const { data: attrData, isLoading: attrLoading, isFetching: attrFetching } = useQuery({
    queryKey: ['searchAttributes', attrKeyword, attrStatusFilter, attrProductFilter, attrPage],
    queryFn: () => fetchAttributes(attrBody),
    placeholderData: (prev: any) => prev,
    staleTime: 30_000,
    enabled: activeTab === 'attributes',
  });

  const attributes = attrData?.data?.contents ?? [];
  const attrTotalPages = attrData?.data?.paging?.totalPages ?? 1;
  const attrTotalElements = attrData?.data?.paging?.totalElements ?? 0;
  const attrCurrentPage = (attrData?.data?.paging?.pageNumber ?? 0) + 1;

  // Categories
  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 60_000,
  });
  const categories = catData?.data?.contents ?? [];

  // Pagination
  const changePage = (p: number) => {
    if (activeTab === 'products') { if (p >= 1 && p <= totalPages) setPage(p); }
    else { if (p >= 1 && p <= attrTotalPages) setAttrPage(p); }
  };

  const curTotalPages = activeTab === 'products' ? totalPages : attrTotalPages;
  const curPage = activeTab === 'products' ? page : attrPage;
  const curTotalElements = activeTab === 'products' ? totalElements : attrTotalElements;
  const curCurrentPage = activeTab === 'products' ? currentPage : attrCurrentPage;

  const pageButtons = buildPages(curPage - 1, curTotalPages).map((p) =>
    p === '…' ? p : (p as number) + 1,
  );
  const fromItem = curTotalElements === 0 ? 0 : (curPage - 1) * PAGE_SIZE + 1;
  const toItem = Math.min(curPage * PAGE_SIZE, curTotalElements);

  // Close add menu on outside click
  const addMenuRef = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    const handler = (e: MouseEvent) => { if (!el.contains(e.target as Node)) setAddMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Page Header */}
      <div className="flex justify-between items-end border-l-4 border-primary pl-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-gray-800 dark:text-white">DANH SÁCH SẢN PHẨM</h1>
          <p className="text-primary font-mono text-sm tracking-widest uppercase mt-2">LOGISTICS_CORE // INVENTORY_CONTROL</p>
        </div>
        <div className="hidden md:block text-right font-mono text-xs text-gray-500 leading-tight">
          COORD: 40.7128° N, 74.0060° W<br />SEC: OPERATIONAL_AREA_04
        </div>
      </div>

      {/* Stats Widgets */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/50 dark:bg-surface-dark/50 backdrop-blur-xl rounded-4xl p-6 relative group overflow-hidden border border-gray-200 dark:border-white/5">
          <div className="absolute top-6 right-6 text-primary"><span className="material-icons-round text-3xl transition-transform group-hover:scale-110">inventory_2</span></div>
          <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">TỔNG SẢN PHẨM</p>
          <h2 className="text-4xl font-black mt-2 text-gray-800 dark:text-white">{isLoading ? '...' : totalElements.toLocaleString('vi-VN')}</h2>
          <div className="mt-6 h-2 w-full bg-gray-100 dark:bg-black/30 rounded-full overflow-hidden"><div className="h-full bg-primary w-3/4 shadow-glow rounded-full" /></div>
        </div>
        <div className="bg-white/50 dark:bg-surface-dark/50 backdrop-blur-xl rounded-4xl p-6 relative group overflow-hidden border border-gray-200 dark:border-white/5">
          <div className="absolute top-6 right-6 text-red-500"><span className="material-icons-round text-3xl transition-transform group-hover:scale-110">build_circle</span></div>
          <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">CẦN BẢO TRÌ</p>
          <h2 className="text-4xl font-black mt-2 text-red-500">{isLoading ? '...' : products.filter((p) => p.status === 'LOCKED').length}</h2>
          <div className="mt-6 flex space-x-1.5 h-2">
            <div className="flex-1 bg-red-500 rounded-full" /><div className="flex-1 bg-red-500 rounded-full" />
            <div className="flex-1 bg-red-500/20 rounded-full" /><div className="flex-1 bg-red-500/20 rounded-full" /><div className="flex-1 bg-red-500/20 rounded-full" />
          </div>
        </div>
        <div className="bg-white/50 dark:bg-surface-dark/50 backdrop-blur-xl rounded-4xl p-6 relative group overflow-hidden border border-gray-200 dark:border-white/5">
          <div className="absolute top-6 right-6 text-cyan-500"><span className="material-icons-round text-3xl transition-transform group-hover:scale-110">local_shipping</span></div>
          <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">LÔ HÀNG SẮP VỀ</p>
          <h2 className="text-4xl font-black mt-2 text-cyan-500">+240</h2>
          <div className="mt-6 mb-[-4px] text-xs font-bold text-cyan-500 flex items-center bg-cyan-500/10 dark:bg-cyan-500/20 w-fit px-3 py-1 rounded-full">
            <span className={`material-icons-round text-[14px] mr-1 ${isFetching ? 'animate-spin' : ''}`}>sync</span>
            {isFetching ? 'ĐANG ĐỒNG BỘ...' : 'ĐÃ ĐỒNG BỘ'}
          </div>
        </div>
        <div className="bg-white/50 dark:bg-surface-dark/50 backdrop-blur-xl rounded-4xl p-6 relative group overflow-hidden border border-gray-200 dark:border-white/5">
          <div className="absolute top-6 right-6 text-secondary"><span className="material-icons-round text-3xl transition-transform group-hover:scale-110">payments</span></div>
          <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">GIÁ TRỊ TỔNG</p>
          <h2 className="text-4xl font-black mt-2 text-secondary">$4.2M</h2>
          <div className="mt-6 h-2 w-full bg-gray-100 dark:bg-black/30 rounded-full overflow-hidden"><div className="h-full bg-secondary w-1/2 rounded-full shadow-glow-purple" /></div>
        </div>
      </section>

      {/* Main Split Layout */}
      <div className="flex gap-8 items-start relative pb-10">
        {/* Left Panel */}
        <div className={`bg-white/50 dark:bg-surface-dark/50 backdrop-blur-xl rounded-4xl border border-gray-200 dark:border-white/5 overflow-hidden flex flex-col transition-all duration-300 ease-out ${(selectedProduct || selectedAttribute) ? 'w-[calc(100%-350px-2rem)]' : 'w-full'}`}>

          {/* Search & Filter */}
          <section className="p-6 border-b border-gray-200 dark:border-white/5 flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px] relative">
              <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
              <input
                className="w-full bg-gray-100/50 dark:bg-accent-dark/50 border-none rounded-2xl text-sm py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary placeholder:text-gray-400 dark:text-gray-300 outline-none transition-all"
                placeholder={activeTab === 'products' ? 'Tìm kiếm sản phẩm, mã SKU...' : 'Tìm kiếm biến thể, thuộc tính...'}
                value={activeTab === 'products' ? inputValue : attrInputValue}
                onChange={(e) => activeTab === 'products' ? setInputValue(e.target.value) : setAttrInputValue(e.target.value)}
              />
            </div>

            {activeTab === 'products' ? (
              <SearchableSelect label="DANH MỤC:" placeholder="Tìm danh mục..." value={categoryFilter} onChange={setCategoryFilter}
                options={[{ value: 'ALL', label: 'Tất cả danh mục' }, ...categories.map((cat) => ({ value: cat.id!, label: cat.name || 'N/A' }))]} />
            ) : (
              <SearchableSelect label="SẢN PHẨM:" placeholder="Tìm sản phẩm..." value={attrProductFilter} onChange={setAttrProductFilter}
                options={[{ value: 'ALL', label: 'Tất cả sản phẩm' }, ...products.map((p) => ({ value: p.id!, label: p.name || 'N/A' }))]} />
            )}

            {activeTab === 'products' ? (
              <SearchableSelect label="TRẠNG THÁI:" placeholder="Tìm trạng thái..." value={statusFilter} onChange={setStatusFilter} showSearch={false}
                options={[{ value: 'ALL', label: 'Mọi trạng thái' }, { value: 'ACTIVE', label: 'Sẵn sàng' }, { value: 'LOCKED', label: 'Cần bảo trì' }]} />
            ) : (
              <SearchableSelect label="TRẠNG THÁI:" placeholder="Tìm trạng thái..." value={attrStatusFilter} onChange={setAttrStatusFilter} showSearch={false}
                options={[{ value: 'ALL', label: 'Mọi trạng thái' }, { value: 'ACTIVE', label: 'Sẵn sàng' }, { value: 'LOCKED', label: 'Cần bảo trì' }]} />
            )}

            <div className="relative" ref={addMenuRef}>
              <button
                className="bg-primary text-black font-bold h-12 px-8 rounded-2xl hover:scale-[1.02] shadow-glow active:scale-95 transition-all flex items-center cursor-pointer border-none"
                onClick={() => setAddMenuOpen(!addMenuOpen)}
              >
                <span className="material-icons-round mr-2 text-lg">add</span>
                THÊM MỚI
                <span className={`material-icons-round ml-1 text-[18px] transition-transform ${addMenuOpen ? 'rotate-180' : ''}`}>expand_more</span>
              </button>
              {addMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-[240px] bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 z-50 overflow-hidden py-2" style={{ animation: 'fadeIn 0.15s ease-out' }}>
                  {[
                    { key: 'product', icon: 'inventory_2', color: 'text-emerald-500', bg: 'hover:bg-primary/10', label: 'Sản phẩm', sub: 'Tạo sản phẩm mới' },
                    { key: 'attributes', icon: 'tune', color: 'text-cyan-500', bg: 'hover:bg-cyan-500/10', label: 'Biến thể', sub: 'Tạo biến thể sản phẩm' },
                    { key: 'category', icon: 'category', color: 'text-orange-500', bg: 'hover:bg-orange-500/10', label: 'Danh mục', sub: 'Tạo danh mục mới' },
                  ].map((item) => (
                    <button key={item.key}
                      className={`w-full text-left px-5 py-3 flex items-center gap-3 ${item.bg} transition-all text-gray-700 dark:text-gray-300 border-none bg-transparent cursor-pointer`}
                      onClick={() => { setCreateModal(item.key as any); setAddMenuOpen(false); }}
                    >
                      <span className={`w-9 h-9 rounded-xl bg-opacity-10 flex items-center justify-center ${item.color.replace('text-', 'bg-')}/10`}>
                        <span className={`material-icons-round ${item.color} text-[18px]`}>{item.icon}</span>
                      </span>
                      <div>
                        <p className="text-sm font-bold text-gray-800 dark:text-white">{item.label}</p>
                        <p className="text-[10px] text-stone-400">{item.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Tabs */}
          <div className="flex px-6 pt-4 border-b border-gray-200 dark:border-white/5 bg-gray-50/30 dark:bg-accent-dark/10">
            {(['products', 'attributes'] as const).map((tab) => (
              <button key={tab}
                onClick={() => { setActiveTab(tab); setSelectedProduct(null); setSelectedAttribute(null); }}
                className={`px-8 py-3 text-sm font-bold uppercase tracking-widest flex items-center gap-3 rounded-tl-2xl rounded-tr-2xl transition-all border-none cursor-pointer ${tab === 'attributes' ? '-ml-2' : ''} ${activeTab === tab
                  ? 'bg-white dark:bg-surface-dark text-gray-800 dark:text-gray-200 shadow-[0_-4px_20px_0_rgba(0,0,0,0.03)] border border-b-0 border-gray-200 dark:border-white/10 z-10 scale-105 origin-bottom'
                  : 'bg-transparent text-gray-500 hover:bg-gray-200/50 dark:hover:bg-white/5'}`}
              >
                {tab === 'products' ? 'Sản phẩm' : 'Biến thể'}
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === tab
                  ? tab === 'products' ? 'bg-primary text-black' : 'bg-cyan-500 text-white'
                  : 'bg-gray-200 text-gray-500 dark:bg-white/10'}`}>
                  {tab === 'products' ? totalElements : attrTotalElements}
                </span>
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto bg-white/60 dark:bg-surface-dark/60 rounded-b-4xl">
            {activeTab === 'products' ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-accent-dark/30">
                    {['Trạng thái', 'Tên sản phẩm', 'Mã SKU', 'Hình ảnh', 'Cập nhật', 'Tác vụ'].map((h) => (
                      <th key={h} className="py-2 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {isLoading ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />) :
                    isError ? (
                      <tr><td colSpan={6} className="p-16 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-3">
                          <span className="material-icons-round text-5xl text-gray-400">cloud_off</span>
                          <p>Không thể lấy dữ liệu. Lỗi: {(error as any)?.message}</p>
                        </div>
                      </td></tr>
                    ) : products.length === 0 ? (
                      <tr><td colSpan={6} className="p-16 text-center text-gray-400">
                        <div className="flex flex-col items-center gap-3">
                          <span className="material-icons-round text-5xl text-gray-300">inventory_2</span>
                          <p>Chưa có sản phẩm nào.</p>
                        </div>
                      </td></tr>
                    ) : products.map((product) => (
                      <ProductRow key={product.id} product={product}
                        isSelected={selectedProduct?.id === product.id}
                        onSelect={() => setSelectedProduct(selectedProduct?.id === product.id ? null : product)} />
                    ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-accent-dark/30">
                    {['Trạng thái', 'Tên biến thể', 'Mã SKU', 'Giá bán', 'Tồn kho', 'Sản phẩm gốc', 'Tùy chọn'].map((h) => (
                      <th key={h} className="py-2 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {attrLoading ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />) :
                    attributes.length === 0 ? (
                      <tr><td colSpan={7} className="p-16 text-center text-gray-400">
                        <div className="flex flex-col items-center gap-3">
                          <span className="material-icons-round text-5xl text-gray-300">tune</span>
                          <p>Chưa có biến thể nào.</p>
                        </div>
                      </td></tr>
                    ) : attributes.map((attr) => (
                      <AttributeRow key={attr.id} attr={attr}
                        isSelected={selectedAttribute?.id === attr.id}
                        onSelect={() => setSelectedAttribute(selectedAttribute?.id === attr.id ? null : attr)} />
                    ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div className="p-6 bg-white/30 dark:bg-accent-dark/20 flex flex-col sm:flex-row justify-between items-center text-sm border-t border-gray-200 dark:border-white/5 gap-4">
            <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 font-medium">
              <span className="material-icons-round text-sm opacity-50">analytics</span>
              Hiển thị
              <span className="text-gray-900 dark:text-white font-bold px-1.5 py-0.5 bg-gray-100 dark:bg-white/5 rounded-md text-xs">{fromItem}</span>
              đến
              <span className="text-gray-900 dark:text-white font-bold px-1.5 py-0.5 bg-gray-100 dark:bg-white/5 rounded-md text-xs">{toItem}</span>
              trong số
              <span className="text-primary font-black px-1.5 py-0.5 bg-primary/10 rounded-md text-xs">{curTotalElements.toLocaleString('vi-VN')}</span>
              mục
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1 pl-3 pr-4 py-2 text-xs font-bold rounded-xl transition-all disabled:opacity-20 hover:bg-gray-100 dark:hover:bg-white/5 text-stone-600 dark:text-stone-300 bg-transparent border-none cursor-pointer"
                onClick={() => changePage(curPage - 1)} disabled={curPage === 1 || (activeTab === 'products' ? isLoading : attrLoading)}>
                <span className="material-icons-round text-lg">chevron_left</span>Trước
              </button>
              <div className="flex gap-1.5 items-center">
                {pageButtons.map((pg, idx) =>
                  pg === '…' ? <span key={`ell-${idx}`} className="px-1 text-stone-400 font-black">···</span> : (
                    <button key={`pg-${pg}`}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border-none font-bold text-xs cursor-pointer shadow-sm ${pg === curCurrentPage ? 'bg-primary text-black shadow-glow-sm scale-110' : 'hover:bg-gray-100 dark:hover:bg-white/10 bg-white/40 dark:bg-white/5 text-stone-500 dark:text-stone-400'}`}
                      onClick={() => changePage(pg as number)}>{pg}
                    </button>
                  )
                )}
              </div>
              <button className="flex items-center gap-1 pl-4 pr-3 py-2 text-xs font-bold rounded-xl transition-all disabled:opacity-20 hover:bg-gray-100 dark:hover:bg-white/5 text-stone-600 dark:text-stone-300 bg-transparent border-none cursor-pointer"
                onClick={() => changePage(curPage + 1)} disabled={curPage === curTotalPages || (activeTab === 'products' ? isLoading : attrLoading)}>
                Tiếp<span className="material-icons-round text-lg">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        {selectedProduct && (
          <ProductDetailPanel product={selectedProduct} onClose={() => setSelectedProduct(null)} onEdit={() => setEditProduct(selectedProduct)} />
        )}
        {selectedAttribute && (
          <AttributeDetailPanel attr={selectedAttribute} onClose={() => setSelectedAttribute(null)}
            onSave={async (updated) => {
              setSelectedAttribute(updated);
              const fresh = await fetchAttributes(attrBody);
              const freshAttr = fresh?.data?.contents?.find(a => a.id === updated.id);
              if (freshAttr) setSelectedAttribute(freshAttr);
            }} />
        )}

        {editProduct && (
          <ProductEditModal product={editProduct} onClose={() => setEditProduct(null)}
            onSave={(updatedProduct) => { setSelectedProduct(updatedProduct); setEditProduct(null); refetch(); }} />
        )}
      </div>

      {createModal && (
        <CreateEntityModal type={createModal} products={products} categories={categories}
          onClose={() => setCreateModal(null)} onSuccess={() => { setCreateModal(null); refetch(); }} />
      )}
    </div>
  );
};

export default ProductListScreen;
