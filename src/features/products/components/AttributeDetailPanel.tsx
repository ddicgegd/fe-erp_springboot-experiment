import React, { useState, useEffect } from 'react';
import type { AttributesDto } from '../types';
import { getAttrStatusInfo } from '../helpers';
import { updateAttributes } from '../api';
import LoadingSpinner from './LoadingSpinner';
import SearchableSelect from './SearchableSelect';

interface AttributeDetailPanelProps {
  attr: AttributesDto;
  onClose: () => void;
  onSave: (updated: AttributesDto) => void;
}

const AttributeDetailPanel: React.FC<AttributeDetailPanelProps> = ({
  attr,
  onClose,
  onSave,
}) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: attr.name || '',
    price: attr.price ?? 0,
    sale_price: attr.salePrice ?? 0,
    stock_quantity: attr.stockQuantity ?? 0,
    statusProduct: attr.statusProduct || 'AVAILABLE',
  });

  // Reset form when attr changes
  useEffect(() => {
    setForm({
      name: attr.name || '',
      price: attr.price ?? 0,
      sale_price: attr.salePrice ?? 0,
      stock_quantity: attr.stockQuantity ?? 0,
      statusProduct: attr.statusProduct || 'AVAILABLE',
    });
    setEditing(false);
  }, [attr.id]);

  const statusInfo = getAttrStatusInfo(attr.statusProduct);

  const handleSave = async () => {
    if (!attr.id) return;
    setSaving(true);
    try {
      await updateAttributes({ id: attr.id, ...form });
      const updatedAttr: AttributesDto = {
        ...attr,
        name: form.name,
        price: form.price,
        salePrice: form.sale_price,
        stockQuantity: form.stock_quantity,
        statusProduct: form.statusProduct,
      };
      setEditing(false);
      onSave(updatedAttr);
    } catch (err) {
      console.error('Failed to update attribute:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      name: attr.name || '',
      price: attr.price ?? 0,
      sale_price: attr.salePrice ?? 0,
      stock_quantity: attr.stockQuantity ?? 0,
      statusProduct: attr.statusProduct || 'AVAILABLE',
    });
    setEditing(false);
  };

  const inputClass =
    'w-full bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm py-2.5 px-3 focus:ring-2 focus:ring-cyan-500 outline-none text-gray-800 dark:text-gray-200 transition-all';

  return (
    <div className="w-[350px] flex-shrink-0 sticky top-6 bg-white/50 dark:bg-surface-dark/50 backdrop-blur-xl rounded-4xl border border-gray-200 dark:border-white/5 overflow-hidden animate-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 dark:from-cyan-500/20 dark:to-blue-500/10 border-b border-gray-200 dark:border-white/5">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <div className={`inline-flex items-center gap-2 px-3 py-1 ${statusInfo.bgClass} rounded-full mb-3`}>
              <span className={`w-2 h-2 rounded-full ${statusInfo.dotClass}`} />
              <span className={`text-xs font-bold ${statusInfo.textClass}`}>{statusInfo.label}</span>
            </div>
            <h3
              className="text-lg font-black text-gray-800 dark:text-white truncate"
              title={attr.name}
            >
              {attr.name || 'Chưa đặt tên'}
            </h3>
            <p className="text-xs text-stone-400 font-mono mt-1">SKU: {attr.sku?.sku || 'N/A'}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 transition text-stone-400 border-none cursor-pointer bg-transparent"
          >
            <span className="material-icons-round text-[20px]">close</span>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-5 max-h-[500px] overflow-y-auto">
        {/* Parent product */}
        {attr.product?.name && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
            <span className="material-icons-round text-stone-400 text-[16px]">inventory_2</span>
            <div>
              <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">
                Sản phẩm gốc
              </p>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {attr.product.name}
              </p>
            </div>
          </div>
        )}

        {/* Variant Options */}
        {attr.variantOptions && attr.variantOptions.length > 0 && (
          <div>
            <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider mb-2">
              Tùy chọn biến thể
            </p>
            <div className="flex flex-wrap gap-2">
              {attr.variantOptions.map((opt, i) => (
                <div key={i} className="px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold">
                  <span className="text-stone-400 font-normal mr-1">{opt.key}:</span>
                  {opt.value}
                </div>
              ))}
            </div>
          </div>
        )}

        {editing ? (
          /* Edit Form */
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block mb-1">
                Tên
              </label>
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block mb-1">
                  Giá gốc (₫)
                </label>
                <input
                  className={inputClass}
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: +e.target.value })}
                />
              </div>
              <div>
                <label className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block mb-1">
                  Giá sale (₫)
                </label>
                <input
                  className={inputClass}
                  type="number"
                  value={form.sale_price}
                  onChange={(e) => setForm({ ...form, sale_price: +e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block mb-1">
                Tồn kho
              </label>
              <input
                className={inputClass}
                type="number"
                value={form.stock_quantity}
                onChange={(e) => setForm({ ...form, stock_quantity: +e.target.value })}
              />
            </div>

            <div>
              <label className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block mb-1">
                Trạng thái
              </label>
              <SearchableSelect
                label=""
                placeholder="Chọn trạng thái..."
                value={form.statusProduct}
                onChange={(v) => setForm({ ...form, statusProduct: v })}
                showSearch={false}
                options={[
                  { value: 'AVAILABLE', label: 'Có sẵn' },
                  { value: 'UNAVAILABLE', label: 'Hết hàng' },
                  { value: 'COMING_SOON', label: 'Sắp ra mắt' },
                  { value: 'NOT_ACTIVE', label: 'Không hoạt động' },
                ]}
              />
            </div>
          </div>
        ) : (
          /* View Fields */
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">
                  Giá gốc
                </p>
                <p className="text-lg font-black text-gray-800 dark:text-white mt-0.5">
                  {(attr.price ?? 0).toLocaleString('vi-VN')}₫
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">
                  Giá sale
                </p>
                <p className="text-lg font-black text-primary mt-0.5">
                  {attr.salePrice != null ? `${attr.salePrice.toLocaleString('vi-VN')}₫` : '—'}
                </p>
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
              <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">
                Tồn kho
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span
                  className={`text-2xl font-black ${
                    (attr.stockQuantity ?? 0) === 0
                      ? 'text-red-500'
                      : (attr.stockQuantity ?? 0) < 10
                      ? 'text-orange-500'
                      : 'text-gray-800 dark:text-white'
                  }`}
                >
                  {attr.stockQuantity?.toLocaleString('vi-VN') ?? '0'}
                </span>
                <span className="text-xs text-stone-400">đơn vị</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200 dark:border-white/5 flex gap-3">
        {editing ? (
          <>
            <button
              onClick={handleCancel}
              className="flex-1 py-3 rounded-2xl text-sm font-bold bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition border-none cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 rounded-2xl text-sm font-bold bg-cyan-500 text-white hover:bg-cyan-600 active:scale-95 transition-all border-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving && <LoadingSpinner size={14} color="white" />}
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="w-full py-3 rounded-2xl text-sm font-bold bg-cyan-500 text-white hover:bg-cyan-600 active:scale-95 transition-all border-none cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-icons-round text-[18px]">edit</span>
            CHỈNH SỬA
          </button>
        )}
      </div>
    </div>
  );
};

export default AttributeDetailPanel;
