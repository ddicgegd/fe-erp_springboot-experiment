import React, { useState, useEffect } from 'react';
import type { ProductDto, MediaItemDto } from '../types';
import { getImageUrl } from '../helpers';
import { updateProduct } from '../api';
import LoadingSpinner from './LoadingSpinner';
import SearchableSelect from './SearchableSelect';

interface ProductEditModalProps {
  product: ProductDto;
  onClose: () => void;
  onSave: (data: ProductDto) => void;
}

const ProductEditModal: React.FC<ProductEditModalProps> = ({ product, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'media'>('info');
  const [isSaving, setIsSaving] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Form state
  const [formName, setFormName] = useState(product.name || '');
  const [formSku, setFormSku] = useState(product.skuInfo?.sku || '');
  const [formStatus, setFormStatus] = useState(product.status || 'ACTIVE');

  // Media state
  const [mediaItems, setMediaItems] = useState<MediaItemDto[]>(product.mediaItems || []);
  const [pendingDeletes, setPendingDeletes] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading] = useState(false);
  const [pendingPreviews, setPendingPreviews] = useState<{ name: string; url: string }[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (previewImage) setPreviewImage(null);
        else onClose();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose, previewImage]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => { pendingPreviews.forEach((p) => URL.revokeObjectURL(p.url)); };
  }, [pendingPreviews]);

  const handleStageFiles = (files: FileList | File[]) => {
    const fileArr = Array.from(files);
    setPendingFiles((prev) => [...prev, ...fileArr]);
    const previews = fileArr.map((f) => ({ name: f.name, url: URL.createObjectURL(f) }));
    setPendingPreviews((prev) => [...prev, ...previews]);
  };

  const handleDeleteImage = (e: React.MouseEvent, imageKey: string) => {
    e.stopPropagation();
    setPendingDeletes((prev) => [...prev, imageKey]);
    setMediaItems((prev) => prev.filter((m) => m.key !== imageKey));
  };

  const handleRemovePendingFile = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    URL.revokeObjectURL(pendingPreviews[index].url);
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
    setPendingPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) handleStageFiles(e.dataTransfer.files);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      // 1. Delete images marked for removal
      for (const imageKey of pendingDeletes) {
        await fetch(
          `${baseUrl}/api/merchandise/delete-Product-Image/${product.id}?imageKey=${encodeURIComponent(imageKey)}`,
          { method: 'DELETE', headers },
        );
      }

      // 2. Upload new images
      if (pendingFiles.length > 0) {
        const formData = new FormData();
        pendingFiles.forEach((f) => formData.append('images', f));
        await fetch(`${baseUrl}/api/merchandise/add-Product-Images/${product.id}`, {
          method: 'POST',
          headers,
          body: formData,
        });
      }

      // 3. Update product details (Name, Status)
      await updateProduct({
        id: product.id,
        name: formName,
        status: formStatus,
      });
      
    } catch (err) {
      console.error('Save failed:', err);
    }

    onSave({ ...product, name: formName, skuInfo: { sku: formSku }, status: formStatus, mediaItems });
    setIsSaving(false);
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    pendingPreviews.forEach((p) => URL.revokeObjectURL(p.url));
    await new Promise((r) => setTimeout(r, 300));
    setIsCancelling(false);
    onClose();
  };

  const statusOptions = [
    { value: 'ACTIVE', label: 'Sẵn sàng' },
    { value: 'INACTIVE', label: 'Ngừng bán' },
    { value: 'LOCKED', label: 'Cần bảo trì' },
  ];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: 'fadeIn 0.25s ease-out' }}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-[680px] max-h-[90vh] bg-white dark:bg-surface-dark rounded-3xl border border-gray-200 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden"
        style={{ animation: 'modalSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* Header */}
        <div className="px-8 pt-7 pb-5 border-b border-gray-100 dark:border-white/5 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-all border-none cursor-pointer bg-transparent"
            title="Đóng (Esc)"
          >
            <span className="material-icons-round text-[20px]">close</span>
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <span className="material-icons-round text-primary text-[22px]">edit_note</span>
            </div>
            <div>
              <h2 className="text-gray-900 dark:text-white text-xl font-bold leading-tight">
                Chỉnh sửa sản phẩm
              </h2>
              <p className="text-gray-500 dark:text-stone-400 text-xs font-normal mt-0.5 leading-relaxed">
                Cập nhật thông tin sản phẩm. Xác nhận thay đổi bằng nút "Lưu thay đổi".
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 mt-4 relative">
            <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gray-200 dark:bg-white/10" />
            {(['info', 'media'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 text-sm font-semibold border-none cursor-pointer transition-all relative bg-transparent ${
                  activeTab === tab
                    ? 'text-gray-900 dark:text-white'
                    : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
                }`}
              >
                {tab === 'info' ? 'Thông tin chung' : 'Hình ảnh & Media'}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {activeTab === 'info' ? (
            <div className="flex gap-8">
              {/* Left column */}
              <div className="flex-1 flex flex-col gap-5">
                <div className="text-gray-900 dark:text-white text-sm font-semibold mb-1">
                  Thông tin sản phẩm
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-700 dark:text-stone-400 text-xs font-medium">
                    Tên sản phẩm
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-accent-dark/50 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-stone-400"
                    placeholder="Nhập tên sản phẩm..."
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-700 dark:text-stone-400 text-xs font-medium">
                    Mã SKU
                  </label>
                  <input
                    type="text"
                    value={formSku}
                    readOnly
                    className="w-full h-10 px-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white text-sm outline-none cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-700 dark:text-stone-400 text-xs font-medium">
                    Trạng thái
                  </label>
                  <div className="relative">
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="w-full h-10 px-3.5 pr-10 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-accent-dark/50 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer"
                    >
                      {statusOptions.map((s) => (
                        <option
                          key={s.value}
                          value={s.value}
                          className="bg-white dark:bg-[#0A0B10] text-gray-900 dark:text-white"
                        >
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <span className="material-icons-round absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-[18px] pointer-events-none">
                      unfold_more
                    </span>
                  </div>
                </div>

                {/* Read-only stats */}
                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-gray-700 dark:text-stone-400 text-xs font-medium">
                      Lượt xem
                    </label>
                    <div className="w-full h-10 px-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white text-sm font-bold flex items-center cursor-not-allowed">
                      {((product as any).viewCount || 0).toLocaleString('vi-VN')}
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-gray-700 dark:text-stone-400 text-xs font-medium">
                      Đã bán
                    </label>
                    <div className="w-full h-10 px-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white text-sm font-bold flex items-center cursor-not-allowed">
                      {((product as any).totalSoldQuantity || 0).toLocaleString('vi-VN')}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-700 dark:text-stone-400 text-xs font-medium">
                    Doanh thu
                  </label>
                  <div className="w-full h-10 px-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-sm font-black flex items-center cursor-not-allowed">
                    {((product as any).totalRevenue || 0).toLocaleString('vi-VN')} ₫
                  </div>
                </div>
              </div>

              {/* Right column — Metadata */}
              <div className="w-[200px] flex flex-col gap-5 flex-shrink-0">
                <div className="flex items-start gap-2">
                  <span className="material-icons-round text-stone-400 text-[16px] mt-0.5">image</span>
                  <div className="flex flex-col">
                    <span className="text-gray-900 dark:text-white text-xs font-semibold">Ảnh đại diện</span>
                    <span className="text-gray-500 dark:text-stone-400 text-[10px] font-light">Tùy chọn</span>
                  </div>
                </div>
                {mediaItems.length > 0 ? (
                  <div className="flex gap-2 flex-wrap">
                    {mediaItems.slice(0, 3).map((img, i) => (
                      <img
                        key={i}
                        src={getImageUrl(img.url)}
                        alt=""
                        className="w-14 h-14 rounded-xl object-cover border border-gray-200 dark:border-white/10 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setPreviewImage(getImageUrl(img.url))}
                      />
                    ))}
                  </div>
                ) : (
                  <div
                    className="w-full h-20 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary/40 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span className="material-icons-round text-stone-300 dark:text-stone-500 text-[20px]">cloud_upload</span>
                    <span className="text-stone-400 text-[10px] font-medium">Tải lên</span>
                  </div>
                )}

                <button
                  className="w-full h-9 px-4 bg-primary/10 hover:bg-primary/20 rounded-xl flex items-center justify-center gap-2 border-none cursor-pointer transition-all group"
                  onClick={() => setActiveTab('media')}
                >
                  <span className="material-icons-round text-primary text-[16px] group-hover:scale-110 transition-transform">upload_file</span>
                  <span className="text-primary text-xs font-semibold">Tải ảnh mới</span>
                </button>
              </div>
            </div>
          ) : (
            /* Media tab */
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="text-gray-900 dark:text-white text-sm font-semibold">
                  Quản lý hình ảnh & Media
                </div>
                <span className="text-stone-400 text-xs">
                  {mediaItems.length + pendingPreviews.length} ảnh
                  {pendingDeletes.length > 0 ? ` • ${pendingDeletes.length} chờ xóa` : ''}
                  {pendingPreviews.length > 0 ? ` • ${pendingPreviews.length} chờ tải` : ''}
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleStageFiles(e.target.files);
                  e.target.value = '';
                }}
              />

              {mediaItems.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {mediaItems.map((img, i) => (
                    <div
                      key={img.key || i}
                      className="relative group rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 cursor-pointer"
                      onClick={() => setPreviewImage(getImageUrl(img.url))}
                    >
                      <img
                        src={getImageUrl(img.url)}
                        alt={`${product.name} ${i + 1}`}
                        className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <button
                        className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-red-500/80 backdrop-blur-sm flex items-center justify-center border-none cursor-pointer hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 z-10 shadow-lg"
                        onClick={(e) => handleDeleteImage(e, img.key)}
                        title="Xóa ảnh"
                      >
                        <span className="material-icons-round text-white text-[14px]">delete</span>
                      </button>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all pointer-events-none" />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded-lg">
                        <span className="text-white text-[10px] font-mono">{img.key || `img_${i + 1}`}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : pendingPreviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-accent-dark/50 flex items-center justify-center">
                    <span className="material-icons-round text-stone-300 dark:text-stone-500 text-[32px]">photo_library</span>
                  </div>
                  <p className="text-stone-400 text-sm font-medium">Chưa có hình ảnh nào</p>
                  <p className="text-stone-400 text-xs">Thêm hình ảnh để hiển thị sản phẩm</p>
                </div>
              ) : null}

              {/* Pending uploads */}
              {pendingPreviews.length > 0 && (
                <div>
                  <div className="text-stone-400 text-xs font-semibold mb-2 flex items-center gap-1.5">
                    <span className="material-icons-round text-[14px] text-primary">schedule</span>
                    Ảnh chờ tải lên ({pendingPreviews.length})
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {pendingPreviews.map((p, i) => (
                      <div
                        key={i}
                        className="relative group rounded-2xl overflow-hidden border-2 border-dashed border-primary/30 cursor-pointer"
                        onClick={() => setPreviewImage(p.url)}
                      >
                        <img src={p.url} alt={p.name} className="w-full h-32 object-cover opacity-80" />
                        <button
                          className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-red-500/80 backdrop-blur-sm flex items-center justify-center border-none cursor-pointer hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 z-10 shadow-lg"
                          onClick={(e) => handleRemovePendingFile(e, i)}
                          title="Bỏ ảnh"
                        >
                          <span className="material-icons-round text-white text-[14px]">close</span>
                        </button>
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-primary/70 backdrop-blur-sm rounded-lg">
                          <span className="text-black text-[10px] font-bold">MỚI</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Drop zone */}
              <div
                className={`w-full h-28 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                  isUploading
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 dark:border-white/10 hover:border-primary/40 hover:bg-primary/5'
                }`}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                {isUploading ? (
                  <>
                    <LoadingSpinner size={24} color="#A3E635" />
                    <span className="text-primary text-xs font-semibold">Đang tải lên...</span>
                  </>
                ) : (
                  <>
                    <span className="material-icons-round text-stone-300 dark:text-stone-500 text-[28px]">cloud_upload</span>
                    <span className="text-stone-400 text-xs font-medium">Kéo thả hoặc nhấn để tải ảnh lên</span>
                    <span className="text-stone-400 text-[10px]">PNG, JPG, WEBP • Tối đa 5MB</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-accent-dark/20 flex items-center justify-between gap-3">
          <div className="text-stone-400 text-[10px] font-mono flex items-center gap-1.5">
            <span className="material-icons-round text-[12px]">info_outline</span>
            ESC để đóng • Tab để chuyển trường
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              disabled={isSaving || isCancelling}
              className="h-10 px-6 rounded-xl border border-gray-300 dark:border-white/15 bg-transparent text-gray-700 dark:text-stone-300 text-sm font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCancelling ? (
                <>
                  <LoadingSpinner size={14} />
                  <span>Đang đóng...</span>
                </>
              ) : (
                'Hủy bỏ'
              )}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || isCancelling}
              className="h-10 px-7 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold cursor-pointer hover:bg-gray-800 dark:hover:bg-gray-100 transition-all flex items-center gap-2 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <LoadingSpinner
                    size={14}
                    color={
                      typeof window !== 'undefined' &&
                      document.documentElement.classList.contains('dark')
                        ? '#1F2230'
                        : '#fff'
                    }
                  />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <span className="material-icons-round text-[16px]">save</span>
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center"
          onClick={() => setPreviewImage(null)}
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center border-none cursor-pointer transition-all z-10"
          >
            <span className="material-icons-round text-white text-[22px]">close</span>
          </button>
          <img
            src={previewImage}
            alt="Preview"
            className="relative max-w-[85vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(24px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default ProductEditModal;
