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
  const [productCategoryId, setProductCategoryId] = useState('');
  const [productSku, setProductSku] = useState('');
  const [productStatus, setProductStatus] = useState('ACTIVE');

  // ── Category form ──
  const [categoryName, setCategoryName] = useState('');

  // ── Attributes form ──
  const [attrProductId, setAttrProductId] = useState('');
  const [attrName, setAttrName] = useState('');
  const [attrPrice, setAttrPrice] = useState(0);
  const [attrSalePrice, setAttrSalePrice] = useState(0);
  const [attrStock, setAttrStock] = useState(0);
  const [attrStatus, setAttrStatus] = useState('ACTIVE');
  const [variantGroups, setVariantGroups] = useState<{ key: string; values: string }[]>([
    { key: '', values: '' },
  ]);

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
        if (!productCategoryId) {
          setError('Vui lòng chọn danh mục cha cho sản phẩm');
          setSaving(false);
          return;
        }
        await createProduct({
          name: productName.trim(),
          category_id: productCategoryId,
          sku: productSku.trim() || undefined,
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
        if (!attrProductId) {
          setError('Vui lòng chọn sản phẩm cha cho biến thể');
          setSaving(false);
          return;
        }
        const validGroups = variantGroups
          .filter((g) => g.key.trim() && g.values.trim())
          .map((g) => ({
            key: g.key.trim(),
            values: g.values
              .split(',')
              .map((v) => v.trim())
              .filter(Boolean),
          }));
        if (validGroups.length === 0) {
          setError('Phải có ít nhất 1 nhóm biến thể');
          setSaving(false);
          return;
        }
        await createAttributes({
          id: generateId(),
          name: attrName.trim(),
          price: attrPrice,
          salePrice: attrSalePrice || undefined,
          stockQuantity: attrStock,
          statusProduct: attrStatus,
          productId: attrProductId,
          variantGroups: validGroups,
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Đã xảy ra lỗi khi tạo mới');
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
                    value={productCategoryId}
                    onChange={setProductCategoryId}
                    options={categories
                      .filter((c) => c.id)
                      .map((c) => ({ value: c.id as string, label: c.name || 'Không tên' }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 sm:col-span-8">
                  <label className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider block mb-2">
                    Mã SKU (Tùy chọn)
                  </label>
                  <input
                    className={inputClass}
                    placeholder="Nhập mã SKU..."
                    value={productSku}
                    onChange={(e) => setProductSku(e.target.value)}
                  />
                </div>
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
                    value={attrProductId}
                    onChange={setAttrProductId}
                    options={products
                      .filter((p) => p.id)
                      .map((p) => ({ value: p.id as string, label: p.name || 'Không tên' }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6 sm:col-span-3">
                  <label className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider block mb-2">
                    Giá gốc (₫) <span className="text-red-400">*</span>
                  </label>
                  <input
                    className={inputClass}
                    type="number"
                    placeholder="0"
                    value={attrPrice || ''}
                    onChange={(e) => setAttrPrice(+e.target.value)}
                  />
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <label className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider block mb-2">
                    Giá sale (₫)
                  </label>
                  <input
                    className={inputClass}
                    type="number"
                    placeholder="0"
                    value={attrSalePrice || ''}
                    onChange={(e) => setAttrSalePrice(+e.target.value)}
                  />
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <label className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider block mb-2">
                    Tồn kho <span className="text-red-400">*</span>
                  </label>
                  <input
                    className={inputClass}
                    type="number"
                    placeholder="0"
                    value={attrStock || ''}
                    onChange={(e) => setAttrStock(+e.target.value)}
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

              {/* Variant Groups */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">
                    Nhóm biến thể <span className="text-red-400">*</span>
                  </label>
                  <button
                    className="text-xs text-cyan-500 font-bold flex items-center gap-1 hover:text-cyan-400 transition border-none bg-transparent cursor-pointer"
                    onClick={() => setVariantGroups([...variantGroups, { key: '', values: '' }])}
                  >
                    <span className="material-icons-round text-[14px]">add</span>
                    Thêm nhóm
                  </button>
                </div>
                <div className="space-y-3">
                  {variantGroups.map((group, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <div className="flex-1">
                        <input
                          className={inputClass}
                          placeholder="Tên (VD: Màu sắc)"
                          value={group.key}
                          onChange={(e) => {
                            const updated = [...variantGroups];
                            updated[idx].key = e.target.value;
                            setVariantGroups(updated);
                          }}
                        />
                      </div>
                      <div className="flex-[2]">
                        <input
                          className={inputClass}
                          placeholder="Giá trị, phân cách bằng dấu phẩy (VD: Đỏ, Xanh, Vàng)"
                          value={group.values}
                          onChange={(e) => {
                            const updated = [...variantGroups];
                            updated[idx].values = e.target.value;
                            setVariantGroups(updated);
                          }}
                        />
                      </div>
                      {variantGroups.length > 1 && (
                        <button
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-500/10 transition border-none bg-transparent cursor-pointer flex-shrink-0 mt-0.5"
                          onClick={() =>
                            setVariantGroups(variantGroups.filter((_, i) => i !== idx))
                          }
                        >
                          <span className="material-icons-round text-[18px]">delete_outline</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
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
