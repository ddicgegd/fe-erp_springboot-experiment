import React, { useState, useEffect, useCallback } from 'react';
import { Package, Wrench, Truck, Wallet, Plus, Search } from 'lucide-react';
import ErrorBoundary from '../../components/ErrorBoundary';
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

  const { data: attrData, isLoading: attrLoading, isFetching: attrFetching, refetch: refetchAttr } = useQuery({
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
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center border-l-4 border-primary pl-4 uppercase">
            Danh sách sản phẩm
          </h1>
          <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mt-2 ml-5">
            Logistics_Core // Inventory_Control
          </p>
        </div>
      </div>

      {/* Stats Widgets */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-[#12131A] border border-white/5 rounded-2xl p-4 flex items-center gap-4 min-w-[160px]">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Package size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Tổng sản phẩm</p>
            <p className="text-xl font-black text-white leading-tight">{isLoading ? '...' : totalElements.toLocaleString('vi-VN')}</p>
          </div>
        </div>
        {/* Card 2 */}
        <div className="bg-[#12131A] border border-white/5 rounded-2xl p-4 flex items-center gap-4 min-w-[160px]">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
            <Wrench size={20} className="text-red-500" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Cần bảo trì</p>
            <p className="text-xl font-black text-red-500 leading-tight">{isLoading ? '...' : products.filter((p) => p.status === 'LOCKED').length}</p>
          </div>
        </div>
        {/* Card 3 */}
        <div className="bg-[#12131A] border border-white/5 rounded-2xl p-4 flex items-center gap-4 min-w-[160px]">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
            <Truck size={20} className="text-blue-500" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Sắp về</p>
            <p className="text-xl font-black text-blue-500 leading-tight">+240</p>
          </div>
        </div>
        {/* Card 4 */}
        <div className="bg-[#12131A] border border-white/5 rounded-2xl p-4 flex items-center gap-4 min-w-[160px]">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
            <Wallet size={20} className="text-purple-500" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Giá trị</p>
            <p className="text-xl font-black text-purple-400 leading-tight">$4.2M</p>
          </div>
        </div>
      </section>

      {/* Main Split Layout */}
      <div className="flex gap-8 items-start relative pb-10">
        {/* Left Panel */}
        <div className="bg-[#12131A] rounded-3xl border border-white/5 overflow-hidden flex flex-col w-full">

          {/* Search & Filter */}
          <section className="px-4 md:px-6 py-4 border-b border-white/5 flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex-1 min-w-[200px] max-w-sm relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                className="w-full bg-[#0A0B10] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 transition-colors"
                placeholder={activeTab === 'products' ? 'Tìm sản phẩm, mã SKU...' : 'Tìm biến thể, thuộc tính...'}
                value={activeTab === 'products' ? inputValue : attrInputValue}
                onChange={(e) => activeTab === 'products' ? setInputValue(e.target.value) : setAttrInputValue(e.target.value)}
              />
            </div>

            {/* Divider */}
            <div className="w-px h-7 bg-white/5 hidden md:block" />

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              {activeTab === 'products' ? (
                <SearchableSelect label="DANH MỤC:" placeholder="Tất cả danh mục" value={categoryFilter} onChange={setCategoryFilter}
                  options={[{ value: 'ALL', label: 'Tất cả danh mục' }, ...categories.map((cat) => ({ value: cat.id!, label: cat.name || 'N/A' }))]} />
              ) : (
                <SearchableSelect label="SẢN PHẨM:" placeholder="Tất cả sản phẩm" value={attrProductFilter} onChange={setAttrProductFilter}
                  options={[{ value: 'ALL', label: 'Tất cả sản phẩm' }, ...products.map((p) => ({ value: p.id!, label: p.name || 'N/A' }))]} />
              )}

              {activeTab === 'products' ? (
                <SearchableSelect label="TRẠNG THÁI:" placeholder="Mọi trạng thái" value={statusFilter} onChange={setStatusFilter} showSearch={false}
                  options={[{ value: 'ALL', label: 'Mọi trạng thái' }, { value: 'ACTIVE', label: 'Sẵn sàng' }, { value: 'LOCKED', label: 'Cần bảo trì' }]} />
              ) : (
                <SearchableSelect label="TRẠNG THÁI:" placeholder="Mọi trạng thái" value={attrStatusFilter} onChange={setAttrStatusFilter} showSearch={false}
                  options={[{ value: 'ALL', label: 'Mọi trạng thái' }, { value: 'AVAILABLE', label: 'Có sẵn' }, { value: 'UNAVAILABLE', label: 'Hết hàng' }, { value: 'COMING_SOON', label: 'Sắp ra mắt' }, { value: 'NOT_ACTIVE', label: 'Không hoạt động' }]} />
              )}
            </div>

            {/* Spacer */}
            <div className="flex-1 hidden md:block" />

            {/* Add button */}
            <div className="relative w-full md:w-auto" ref={addMenuRef}>
              <button
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary text-black px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#86efac] transition-colors shrink-0 cursor-pointer border-none"
                onClick={() => setAddMenuOpen(!addMenuOpen)}
              >
                <Plus size={18} strokeWidth={3} />
                THÊM MỚI
              </button>
              {addMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-[240px] bg-white dark:bg-[#0A0B10] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 z-50 overflow-hidden py-2" style={{ animation: 'fadeIn 0.15s ease-out' }}>
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
          <div className="px-6 flex gap-8 border-b border-white/5">
            {(['products', 'attributes'] as const).map((tab) => (
              <button key={tab}
                onClick={() => { setActiveTab(tab); setSelectedProduct(null); setSelectedAttribute(null); }}
                className={`flex items-center gap-2 py-4 text-sm tracking-wide transition-all border-none bg-transparent cursor-pointer ${activeTab === tab
                  ? 'border-b-2 border-primary text-white font-bold'
                  : 'border-b-2 border-transparent text-gray-500 font-bold hover:text-gray-300'}`}
              >
                {tab === 'products' ? 'SẢN PHẨM' : 'BIẾN THỂ'}
                <span className={`px-2 py-0.5 rounded-full text-xs font-black ${activeTab === tab
                  ? 'bg-primary text-black'
                  : 'bg-white/10 text-gray-400'}`}>
                  {tab === 'products' ? totalElements : attrTotalElements}
                </span>
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto min-h-[300px]">
            {activeTab === 'products' ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Trạng thái', 'Tên sản phẩm', 'Mã SKU', 'Hình ảnh', 'Cập nhật', 'Tác vụ'].map((h) => (
                      <th key={h} className="px-6 py-5 text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
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
                  <tr className="border-b border-white/5">
                    {['Trạng thái', 'Tên biến thể', 'Mã SKU', 'Giá bán', 'Tồn kho', 'Sản phẩm gốc', 'Tùy chọn'].map((h) => (
                      <th key={h} className="px-6 py-5 text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
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
          <div className="p-4 md:px-6 md:py-4 bg-[#12131A] flex flex-col sm:flex-row justify-between items-center text-sm border-t border-white/5 gap-4">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Hiển thị <span className="text-white">{fromItem}</span> đến <span className="text-white">{toItem}</span> trong số <span className="text-white">{curTotalElements.toLocaleString('vi-VN')}</span> mục
            </div>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white/5 transition-colors bg-transparent border-none cursor-pointer disabled:opacity-30"
                onClick={() => changePage(curPage - 1)} disabled={curPage === 1 || (activeTab === 'products' ? isLoading : attrLoading)}>
                <span className="material-icons-round text-sm">chevron_left</span>
              </button>
              {pageButtons.map((pg, idx) =>
                pg === '…' ? <span key={`ell-${idx}`} className="px-1 text-stone-400 font-black">···</span> : (
                  <button key={`pg-${pg}`}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border-none cursor-pointer transition-colors ${pg === curCurrentPage ? 'bg-primary text-black' : 'bg-transparent text-gray-500 hover:bg-white/5'}`}
                    onClick={() => changePage(pg as number)}>{pg}
                  </button>
                )
              )}
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white/5 transition-colors bg-transparent border-none cursor-pointer disabled:opacity-30"
                onClick={() => changePage(curPage + 1)} disabled={curPage === curTotalPages || (activeTab === 'products' ? isLoading : attrLoading)}>
                <span className="material-icons-round text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        {selectedProduct && (
          <ErrorBoundary key={`product-${selectedProduct.id}`}>
            <ProductDetailPanel product={selectedProduct} onClose={() => setSelectedProduct(null)} onEdit={() => setEditProduct(selectedProduct)} />
          </ErrorBoundary>
        )}
        {selectedAttribute && (
          <ErrorBoundary key={`attr-${selectedAttribute.id}`}>
            <AttributeDetailPanel attr={selectedAttribute} onClose={() => setSelectedAttribute(null)}
              onSave={async (updated) => {
                setSelectedAttribute(updated);
                refetchAttr();
              }} />
          </ErrorBoundary>
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
