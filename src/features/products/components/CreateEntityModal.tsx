import React, { useState, useEffect } from 'react';
import type { ProductDto, CategoryDto } from '../types';
import { createProduct, createCategory, createAttributes } from '../api';
import { generateId } from '../helpers';
import { CREATE_META } from '../constants';
import LoadingSpinner from './LoadingSpinner';
import SearchableSelect from './SearchableSelect';

interface CreateEntityModalProps {
  type: 'product' | 'attributes' | 'category';
  products: ProductDto[];
  categories: CategoryDto[];
  onClose: () => void;
  onSuccess: () => void;
}

const CreateEntityModal: React.FC<CreateEntityModalProps> = ({
  type,
  products,
  categories,
  onClose,
  onSuccess,
}) => {
  const meta = CREATE_META[type];
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // ── Product form ──
  const [productName, setProductName] = useState('');
  const [productCategorySku, setProductCategorySku] = useState('');
  const [productStatus, setProductStatus] = useState('ACTIVE');

  // ── Category form ──
  const [categoryName, setCategoryName] = useState('');

  // ── Attributes form ──
  const [attrProductSku, setAttrProductSku] = useState('');
  const [attrName, setAttrName] = useState('');
  const [attrPrice, setAttrPrice] = useState(0);
  const [attrSalePrice, setAttrSalePrice] = useState(0);
  const [attrStock, setAttrStock] = useState(0);
  const [attrStatus, setAttrStatus] = useState('ACTIVE');
  const [variantOptions, setVariantOptions] = useState<{ key: string; value: string; target: string | null }[]>([
    { key: '', value: '', target: null },
  ]);
  const [promotions, setPromotions] = useState<{ key: string; data: string }[]>([]);
  const [specifications, setSpecifications] = useState<{ title: string; items: { key: string; data: string }[] }[]>([]);
  const [attrKeywords, setAttrKeywords] = useState('');

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const inputClass =
    'w-full bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm py-3 px-4 focus:ring-2 focus:ring-primary outline-none text-gray-800 dark:text-gray-200 transition-all placeholder:text-gray-400';

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      if (type === 'product') {
        if (!productName.trim()) {
          setError('Tên sản phẩm không được để trống');
          setSaving(false);
          return;
        }
        if (!productCategorySku) {
          setError('Vui lòng chọn danh mục cha cho sản phẩm');
          setSaving(false);
          return;
        }
        await createProduct({
          name: productName.trim(),
          category_sku: productCategorySku,
          status: productStatus,
        });
      } else if (type === 'category') {
        if (!categoryName.trim()) {
          setError('Tên danh mục không được để trống');
          setSaving(false);
          return;
        }
        await createCategory(categoryName.trim());
      } else if (type === 'attributes') {
        if (!attrName.trim()) {
          setError('Tên biến thể không được để trống');
          setSaving(false);
          return;
        }
        if (!attrProductSku) {
          setError('Vui lòng chọn sản phẩm cha cho biến thể');
          setSaving(false);
          return;
        }
        const validOptions = variantOptions
          .filter((o) => o.key.trim() && o.value.trim())
          .map((o) => ({
            key: o.key.trim(),
            value: o.value.trim(),
            target: o.target ? o.target.trim() || null : null,
          }));
        if (validOptions.length === 0) {
          setError('Phải có ít nhất 1 tùy chọn biến thể');
          setSaving(false);
          return;
        }

        const validPromotions = promotions
          .filter((p) => p.key.trim() && p.data.trim())
          .map((p) => ({ key: p.key.trim(), data: p.data.trim() }));

        const validSpecifications = specifications
          .filter((g) => g.title.trim() && g.items.some((i) => i.key.trim() && i.data.trim()))
          .map((g) => ({
            title: g.title.trim(),
            items: g.items
              .filter((i) => i.key.trim() && i.data.trim())
              .map((i) => ({ key: i.key.trim(), data: i.data.trim() })),
          }));

        const keywordsArray = attrKeywords
          .split(',')
          .map((k) => k.trim())
          .filter((k) => k !== '');

        await createAttributes({
          name: attrName.trim(),
          product_sku: attrProductSku,
          keywords: keywordsArray,
          attributes: [
            {
              price: attrPrice,
              salePrice: attrSalePrice || undefined,
              stockQuantity: attrStock,
              statusProduct: attrStatus === 'ACTIVE' ? 'AVAILABLE' : 'NOT_ACTIVE',
              variantOptions: validOptions,
              specifications: validSpecifications,
              promotions: validPromotions,
            }
          ]
        });
      }
      onSuccess();
    } catch (err: any) {
      console.error('Error creating entity:', err);
      let errorMsg = 'Đã xảy ra lỗi khi tạo mới';
      
      const data = err.response?.data;
      if (data) {
        if (typeof data === 'string') {
          errorMsg = data;
        } else if (data.detail) {
          // Trực quan hóa lỗi technical thành thân thiện hơn
          if (data.detail.includes('Cannot deserialize') || data.title === 'Invalid Request Body') {
            errorMsg = 'Dữ liệu gửi lên không hợp lệ hoặc sai định dạng. Vui lòng kiểm tra lại.';
          } else {
            errorMsg = data.detail;
          }
        } else if (data.title) {
          errorMsg = data.title;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-center p-4 overflow-y-auto py-12"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative m-auto w-full max-w-[700px] bg-white dark:bg-surface-dark rounded-4xl shadow-2xl border border-gray-200 dark:border-white/10"
        style={{ animation: 'fadeIn 0.2s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`p-8 pb-6 bg-gradient-to-br ${meta.accent} border-b border-gray-200 dark:border-white/5 rounded-t-4xl`}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <span className="w-12 h-12 rounded-2xl bg-white/50 dark:bg-white/10 flex items-center justify-center">
                <span className={`material-icons-round ${meta.color} text-[24px]`}>{meta.icon}</span>
              </span>
              <div>
                <h2 className="text-xl font-black text-gray-800 dark:text-white">{meta.title}</h2>
                <p className="text-xs text-stone-400 mt-0.5">{meta.subtitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 transition text-stone-400 border-none cursor-pointer bg-transparent"
            >
              <span className="material-icons-round text-[22px]">close</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-5">
          {/* ── Product Form ── */}
          {type === 'product' && (
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 sm:col-span-8">
                  <label className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider block mb-2">
                    Tên sản phẩm <span className="text-red-400">*</span>
                  </label>
                  <input
                    className={inputClass}
                    placeholder="Nhập tên sản phẩm..."
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="col-span-12 sm:col-span-4">
                  <label className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider block mb-2">
                    Danh mục <span className="text-red-400">*</span>
                  </label>
                  <SearchableSelect
                    label=""
                    placeholder="Tìm và chọn danh mục..."
                    value={productCategorySku}
                    onChange={setProductCategorySku}
                    options={categories
                      .filter((c) => c.skuInfo?.sku)
                      .map((c) => ({ value: c.skuInfo!.sku, label: c.name || 'Không tên' }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 sm:col-span-4">
                  <label className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider block mb-2">
                    Trạng thái <span className="text-red-400">*</span>
                  </label>
                  <SearchableSelect
                    label=""
                    placeholder="Chọn..."
                    value={productStatus}
                    onChange={setProductStatus}
                    showSearch={false}
                    options={[
                      { value: 'ACTIVE', label: 'Sẵn sàng' },
                      { value: 'LOCKED', label: 'Cần bảo trì' },
                    ]}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Category Form ── */}
          {type === 'category' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider block mb-2">
                  Tên danh mục <span className="text-red-400">*</span>
                </label>
                <input
                  className={inputClass}
                  placeholder="Nhập tên danh mục..."
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* ── Attributes Form ── */}
          {type === 'attributes' && (
            <div className="space-y-5">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 sm:col-span-8">
                  <label className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider block mb-2">
                    Tên biến thể <span className="text-red-400">*</span>
                  </label>
                  <input
                    className={inputClass}
                    placeholder="Nhập tên biến thể..."
                    value={attrName}
                    onChange={(e) => setAttrName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="col-span-12 sm:col-span-4">
                  <label className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider block mb-2">
                    Thuộc sản phẩm <span className="text-red-400">*</span>
                  </label>
                  <SearchableSelect
                    label=""
                    placeholder="Tìm và chọn sản phẩm..."
                    value={attrProductSku}
                    onChange={setAttrProductSku}
                    options={products
                      .filter((p) => p.skuInfo?.sku)
                      .map((p) => ({ value: p.skuInfo!.sku, label: p.name || 'Không tên' }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider block mb-2">
                  Từ khóa <span className="text-gray-400 font-normal lowercase">(Cách nhau bằng dấu phẩy)</span>
                </label>
                <input
                  className={inputClass}
                  placeholder="Ví dụ: hoodie, ao khoac, unisex"
                  value={attrKeywords}
                  onChange={(e) => setAttrKeywords(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6 sm:col-span-3">
                  <label className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider block mb-2">
                    Giá gốc (₫) <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      className={`${inputClass} pr-8`}
                      type="text"
                      placeholder="0"
                      value={attrPrice ? attrPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''}
                      onChange={(e) => setAttrPrice(parseInt(e.target.value.replace(/\D/g, '') || '0', 10))}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none font-medium">₫</span>
                  </div>
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <label className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider block mb-2">
                    Giá sale (₫)
                  </label>
                  <div className="relative">
                    <input
                      className={`${inputClass} pr-8`}
                      type="text"
                      placeholder="0"
                      value={attrSalePrice ? attrSalePrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''}
                      onChange={(e) => setAttrSalePrice(parseInt(e.target.value.replace(/\D/g, '') || '0', 10))}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none font-medium">₫</span>
                  </div>
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <label className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider block mb-2">
                    Tồn kho <span className="text-red-400">*</span>
                  </label>
                  <input
                    className={inputClass}
                    type="text"
                    placeholder="0"
                    value={attrStock ? attrStock.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''}
                    onChange={(e) => setAttrStock(parseInt(e.target.value.replace(/\D/g, '') || '0', 10))}
                  />
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <label className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider block mb-2">
                    Trạng thái <span className="text-red-400">*</span>
                  </label>
                  <SearchableSelect
                    label=""
                    placeholder="Chọn..."
                    value={attrStatus}
                    onChange={setAttrStatus}
                    showSearch={false}
                    options={[
                      { value: 'ACTIVE', label: 'Sẵn sàng' },
                      { value: 'LOCKED', label: 'Cần bảo trì' },
                    ]}
                  />
                </div>
              </div>

              {/* Variant Options */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">
                    Các tùy chọn biến thể <span className="text-red-400">*</span>
                  </label>
                  <button
                    className="text-xs text-cyan-500 font-bold flex items-center gap-1 hover:text-cyan-400 transition border-none bg-transparent cursor-pointer"
                    onClick={() => setVariantOptions([...variantOptions, { key: '', value: '', target: null }])}
                  >
                    <span className="material-icons-round text-[16px]">add_circle_outline</span>
                    Thêm tùy chọn
                  </button>
                </div>
                
                <div className="space-y-3">
                  {variantOptions.map((opt, idx) => (
                    <div key={idx} className="flex gap-3 items-start relative group">
                      <div className="flex-1">
                        <input
                          className={inputClass}
                          placeholder="Tên thuộc tính (VD: Màu sắc)"
                          value={opt.key}
                          onChange={(e) => {
                            const updated = [...variantOptions];
                            updated[idx].key = e.target.value;
                            setVariantOptions(updated);
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          className={inputClass}
                          placeholder="Giá trị (VD: Đen)"
                          value={opt.value}
                          onChange={(e) => {
                            const updated = [...variantOptions];
                            updated[idx].value = e.target.value;
                            setVariantOptions(updated);
                          }}
                        />
                      </div>
                      
                      {/* Target (Color) Input */}
                      {opt.target !== null ? (
                        <div className="w-[140px] flex-shrink-0 relative group/target">
                          <div className="relative flex items-center h-[46px]">
                            <div className="absolute left-3 w-6 h-6 rounded-full border border-gray-300 dark:border-white/10 overflow-hidden shadow-inner flex-shrink-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAACFJREFUeNpiZGBg4GegAsBlFBVgYzCgCoEIhIqA1AACDACtGgAhfH9t8QAAAABJRU5ErkJggg==')]">
                              <div 
                                className="w-full h-full pointer-events-none" 
                                style={{ backgroundColor: opt.target || 'transparent' }}
                              />
                              <input 
                                type="color" 
                                className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer opacity-0"
                                value={opt.target || '#000000'}
                                onChange={(e) => {
                                  const updated = [...variantOptions];
                                  updated[idx].target = e.target.value;
                                  setVariantOptions(updated);
                                }}
                              />
                            </div>
                            <input
                              className={`${inputClass} pl-[2.75rem] font-mono text-xs pr-8`}
                              placeholder="#Hex"
                              value={opt.target || ''}
                              onChange={(e) => {
                                const updated = [...variantOptions];
                                updated[idx].target = e.target.value;
                                setVariantOptions(updated);
                              }}
                            />
                          </div>
                          <button
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition border-none bg-transparent cursor-pointer opacity-0 group-hover/target:opacity-100"
                            onClick={() => {
                              const updated = [...variantOptions];
                              updated[idx].target = null;
                              setVariantOptions(updated);
                            }}
                            title="Bỏ màu sắc/target"
                          >
                            <span className="material-icons-round text-[14px]">close</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          className="h-[46px] px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-gray-400 hover:text-[#A3E635] hover:bg-[#A3E635]/10 transition border border-dashed border-gray-300 dark:border-white/10 bg-transparent cursor-pointer flex-shrink-0"
                          onClick={() => {
                            const updated = [...variantOptions];
                            updated[idx].target = '';
                            setVariantOptions(updated);
                          }}
                          title="Thêm màu sắc"
                        >
                          <span className="material-icons-round text-[16px]">palette</span>
                        </button>
                      )}

                      {/* Delete Option Button */}
                      {variantOptions.length > 1 ? (
                        <button
                          className="w-[46px] h-[46px] rounded-xl flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition border-none bg-transparent cursor-pointer flex-shrink-0"
                          onClick={() => setVariantOptions(variantOptions.filter((_, i) => i !== idx))}
                          title="Xóa tùy chọn này"
                        >
                          <span className="material-icons-round text-[20px]">close</span>
                        </button>
                      ) : (
                        <div className="w-[46px] h-[46px] flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Promotions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">
                    Khuyến mãi (Tuỳ chọn)
                  </label>
                  <button
                    className="text-xs text-cyan-500 font-bold flex items-center gap-1 hover:text-cyan-400 transition border-none bg-transparent cursor-pointer"
                    onClick={() => setPromotions([...promotions, { key: '', data: '' }])}
                  >
                    <span className="material-icons-round text-[16px]">add_circle_outline</span>
                    Thêm khuyến mãi
                  </button>
                </div>
                {promotions.length > 0 && (
                  <div className="space-y-3 bg-gray-50 dark:bg-[#12131A] border border-gray-200 dark:border-white/5 rounded-2xl p-5 transition-colors">
                    {promotions.map((promo, idx) => (
                      <div key={idx} className="flex gap-3 items-start relative group">
                        <div className="flex-1">
                          <input
                            className={inputClass}
                            placeholder="Tiêu đề (VD: Quà tặng)"
                            value={promo.key}
                            onChange={(e) => {
                              const updated = [...promotions];
                              updated[idx].key = e.target.value;
                              setPromotions(updated);
                            }}
                          />
                        </div>
                        <div className="flex-[2]">
                          <input
                            className={inputClass}
                            placeholder="Nội dung khuyến mãi..."
                            value={promo.data}
                            onChange={(e) => {
                              const updated = [...promotions];
                              updated[idx].data = e.target.value;
                              setPromotions(updated);
                            }}
                          />
                        </div>
                        <button
                          className="w-[46px] h-[46px] rounded-xl flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition border-none bg-transparent cursor-pointer flex-shrink-0"
                          onClick={() => setPromotions(promotions.filter((_, i) => i !== idx))}
                          title="Xóa khuyến mãi này"
                        >
                          <span className="material-icons-round text-[20px]">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Specifications */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">
                    Thông số kỹ thuật (Tuỳ chọn)
                  </label>
                  <button
                    className="text-xs text-cyan-500 font-bold flex items-center gap-1 hover:text-cyan-400 transition border-none bg-transparent cursor-pointer"
                    onClick={() => setSpecifications([...specifications, { title: '', items: [{ key: '', data: '' }] }])}
                  >
                    <span className="material-icons-round text-[16px]">add_circle_outline</span>
                    Thêm nhóm thông số
                  </button>
                </div>
                
                {specifications.length > 0 && (
                  <div className="space-y-4">
                    {specifications.map((group, groupIdx) => (
                      <div key={groupIdx} className="bg-gray-50 dark:bg-[#12131A] border border-gray-200 dark:border-white/5 rounded-2xl p-5 relative group transition-colors">
                        <button
                          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition cursor-pointer bg-transparent border-none opacity-0 group-hover:opacity-100"
                          onClick={() => setSpecifications(specifications.filter((_, i) => i !== groupIdx))}
                          title="Xóa nhóm này"
                        >
                          <span className="material-icons-round text-[18px]">delete_outline</span>
                        </button>
                        
                        <div className="mb-5 pr-10">
                          <label className="text-[11px] text-gray-500 uppercase font-bold tracking-wider block mb-1.5">
                            Tên nhóm <span className="text-gray-400 font-normal lowercase">(Ví dụ: Màn hình, Camera)</span>
                          </label>
                          <input
                            className={inputClass}
                            placeholder="Nhập tên nhóm thông số..."
                            value={group.title}
                            onChange={(e) => {
                              const updated = [...specifications];
                              updated[groupIdx].title = e.target.value;
                              setSpecifications(updated);
                            }}
                          />
                        </div>
                        
                        <div>
                          <div className="space-y-3">
                            {group.items.map((item, itemIdx) => (
                              <div key={itemIdx} className="flex gap-3 items-start">
                                <div className="flex-1">
                                  <input
                                    className={inputClass}
                                    placeholder="Tên (VD: Công nghệ màn hình)"
                                    value={item.key}
                                    onChange={(e) => {
                                      const updated = [...specifications];
                                      updated[groupIdx].items[itemIdx].key = e.target.value;
                                      setSpecifications(updated);
                                    }}
                                  />
                                </div>
                                <div className="flex-[2]">
                                  <input
                                    className={inputClass}
                                    placeholder="Giá trị (VD: Super AMOLED)"
                                    value={item.data}
                                    onChange={(e) => {
                                      const updated = [...specifications];
                                      updated[groupIdx].items[itemIdx].data = e.target.value;
                                      setSpecifications(updated);
                                    }}
                                  />
                                </div>
                                <button
                                  className="w-[46px] h-[46px] rounded-xl flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition border-none bg-transparent cursor-pointer flex-shrink-0"
                                  onClick={() => {
                                    const updated = [...specifications];
                                    updated[groupIdx].items = updated[groupIdx].items.filter((_, i) => i !== itemIdx);
                                    setSpecifications(updated);
                                  }}
                                  title="Xóa dòng này"
                                >
                                  <span className="material-icons-round text-[20px]">close</span>
                                </button>
                              </div>
                            ))}
                          </div>
                          
                          <button
                            className="mt-4 text-xs text-[#A3E635] font-bold flex items-center gap-1.5 hover:text-[#A3E635]/80 transition border-none bg-transparent cursor-pointer px-3 py-1.5 rounded-lg hover:bg-[#A3E635]/10"
                            onClick={() => {
                              const updated = [...specifications];
                              updated[groupIdx].items.push({ key: '', data: '' });
                              setSpecifications(updated);
                            }}
                          >
                            <span className="material-icons-round text-[16px]">add</span>
                            Thêm thông số
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {error && error.trim() && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 rounded-xl">
              <span className="material-icons-round text-red-400 text-[16px]">error</span>
              <p className="text-xs text-red-400 font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 pt-4 border-t border-gray-200 dark:border-white/5 flex justify-end gap-3 rounded-b-4xl">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-2xl text-sm font-bold bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition border-none cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-8 py-3 rounded-2xl text-sm font-bold text-white transition-all border-none cursor-pointer flex items-center gap-2 disabled:opacity-50 active:scale-95 ${
              type === 'product'
                ? 'bg-emerald-500 hover:bg-emerald-600'
                : type === 'attributes'
                ? 'bg-cyan-500 hover:bg-cyan-600'
                : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            {saving && <LoadingSpinner size={14} color="white" />}
            {saving ? 'Đang tạo...' : 'Xác nhận tạo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateEntityModal;
