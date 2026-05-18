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
    'w-full bg-[#0A0B10]/80 border border-white/5 rounded-lg text-[13px] py-2 px-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none text-white transition-all';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[400px] bg-[#12131A] rounded-2xl border border-white/5 flex flex-col shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden" style={{ maxHeight: '85vh' }}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/5 relative bg-[#0A0B10]/50 flex items-start justify-between">
          <div className="flex flex-col gap-1 pr-4">
            <div className={`w-fit inline-flex items-center px-2.5 py-0.5 bg-white/5 border border-white/10 rounded mb-0.5`}>
              <span className={`${statusInfo.textClass} text-[10px] font-bold`}>{statusInfo.label}</span>
            </div>
            <h3 className="text-lg font-bold text-white truncate max-w-[260px]" title={attr.name}>
              {attr.name || 'Chưa đặt tên'}
            </h3>
            <p className="text-[11px] text-gray-500 font-mono tracking-wider">SKU: {attr.sku?.sku || 'N/A'}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors border-none cursor-pointer shrink-0 mt-1"
            title="Đóng"
          >
            <span className="material-icons-round text-[16px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Parent product */}
          {attr.product?.name && (
            <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                <span className="material-icons-round text-gray-400 text-[18px]">inventory_2</span>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Sản phẩm gốc</p>
                <p className="text-sm font-semibold text-white">{attr.product.name}</p>
              </div>
            </div>
          )}

          {/* Variant Options */}
          {attr.variantOptions && attr.variantOptions.length > 0 && (
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2">Tùy chọn biến thể</p>
              <div className="flex flex-wrap gap-2">
                {attr.variantOptions.map((opt, i) => (
                  <div key={i} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-white text-xs font-bold">
                    <span className="text-gray-500 font-normal mr-1">{opt.key}:</span>
                    {opt.value}
                  </div>
                ))}
              </div>
            </div>
          )}

          {editing ? (
            /* Edit Form */
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-[2fr_1fr] gap-3">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block mb-1">Tên</label>
                  <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block mb-1">Trạng thái</label>
                  <div className="[&_.select-container]:min-h-[35px] [&_.select-container]:bg-[#0A0B10]/80 [&_.select-container]:border-white/5 [&_.select-container]:rounded-lg [&_.select-value]:text-[13px] [&_.select-value]:py-1.5 [&_.select-value]:px-3">
                    <SearchableSelect
                      label=""
                      placeholder="Trạng thái..."
                      value={form.statusProduct}
                      onChange={(v) => setForm({ ...form, statusProduct: v })}
                      showSearch={false}
                      options={[
                        { value: 'AVAILABLE', label: 'Có sẵn' },
                        { value: 'UNAVAILABLE', label: 'Hết hàng' },
                        { value: 'COMING_SOON', label: 'Sắp ra mắt' },
                        { value: 'NOT_ACTIVE', label: 'Ngừng bán' },
                      ]}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block mb-1">Giá gốc (₫)</label>
                  <div className="relative">
                    <input className={`${inputClass} pr-8`} type="text" value={form.price ? form.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''} onChange={(e) => setForm({ ...form, price: parseInt(e.target.value.replace(/\D/g, '') || '0', 10) })} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none font-medium text-xs">₫</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block mb-1">Giá sale (₫)</label>
                  <div className="relative">
                    <input className={`${inputClass} pr-8`} type="text" value={form.sale_price ? form.sale_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''} onChange={(e) => setForm({ ...form, sale_price: parseInt(e.target.value.replace(/\D/g, '') || '0', 10) })} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none font-medium text-xs">₫</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block mb-1">Tồn kho</label>
                  <input className={inputClass} type="text" value={form.stock_quantity ? form.stock_quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''} onChange={(e) => setForm({ ...form, stock_quantity: parseInt(e.target.value.replace(/\D/g, '') || '0', 10) })} />
                </div>
              </div>
            </div>
          ) : (
            /* View Fields */
            <div className="grid grid-cols-2 gap-px bg-white/5 border border-white/5 rounded-xl overflow-hidden">
              <div className="bg-[#12131A] p-3 flex flex-col justify-center">
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Giá gốc</p>
                <p className="text-sm font-black text-white mt-1">{(attr.price ?? 0).toLocaleString('vi-VN')}₫</p>
              </div>
              <div className="bg-[#12131A] p-3 flex flex-col justify-center">
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Giá sale</p>
                <p className="text-sm font-black text-[#A3E635] mt-1">{attr.salePrice != null && attr.salePrice > 0 ? `${attr.salePrice.toLocaleString('vi-VN')}₫` : '—'}</p>
              </div>
              <div className="bg-[#12131A] p-3 col-span-2 flex justify-between items-center">
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Tồn kho</p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-sm font-black ${(attr.stockQuantity ?? 0) === 0 ? 'text-red-500' : 'text-white'}`}>
                    {attr.stockQuantity?.toLocaleString('vi-VN') ?? '0'}
                  </span>
                  <span className="text-[10px] text-gray-500 font-bold">ĐƠN VỊ</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action */}
        <div className="p-4 border-t border-white/5 bg-[#0A0B10] flex gap-3">
          {editing ? (
            <>
              <button
                onClick={handleCancel}
                className="flex-1 h-11 rounded-xl text-[11px] font-bold bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors border-none cursor-pointer"
              >
                HỦY BỎ
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-[2] h-11 rounded-xl text-[11px] font-bold bg-primary text-black hover:bg-[#86efac] active:scale-95 transition-all border-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving && <LoadingSpinner size={14} color="black" />}
                {saving ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="w-full h-11 rounded-xl text-xs font-bold bg-primary text-black hover:bg-[#86efac] transition-colors border-none cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-icons-round text-[16px]">edit</span>
              CHỈNH SỬA
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttributeDetailPanel;
