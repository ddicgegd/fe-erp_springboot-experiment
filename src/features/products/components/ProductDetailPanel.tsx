import React, { useState } from 'react';
import type { ProductDto } from '../types';
import { getStatusDetailInfo, getImageUrl } from '../helpers';
import { useProductViewTracking } from '../hooks/useProductViewTracking';

// Extended product type cho admin fields (Backend @JsonView trả thêm cho ADMIN)
interface ProductWithAnalytics extends ProductDto {
  viewCount?: number;
  totalSoldQuantity?: number;
  totalRevenue?: number;
  totalOrders?: number;
  averageRating?: number;
  reviewCount?: number;
}

interface ProductDetailPanelProps {
  product: ProductDto;
  onClose: () => void;
  onEdit: () => void;
}

const ProductDetailPanel: React.FC<ProductDetailPanelProps> = ({ product, onClose, onEdit }) => {
  const statusInfo = getStatusDetailInfo(product.status);
  const [showHistory, setShowHistory] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // Cast an toàn — Backend có thể trả thêm fields tùy role
  const analytics = product as ProductWithAnalytics;

  // Tracking: tăng lượt xem khi panel mở (1 lần/session/product)
  useProductViewTracking(product.id);

  return (
    <div
      className="w-[350px] flex-shrink-0 sticky top-6 bg-white/50 dark:bg-surface-dark/50 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-white/5 flex flex-col animate-in slide-in-from-right-8 fade-in duration-300 ease-out overflow-hidden relative"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-7 right-6 w-6 h-6 flex items-center justify-center text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-white/5 dark:hover:bg-white/20 transition-all z-20 border-none cursor-pointer"
        title="Đóng"
      >
        <span className="material-icons-round text-[16px]">close</span>
      </button>

      <div className="p-6 pt-7 flex flex-col gap-6 overflow-y-auto flex-1 relative">
        {/* Header: Name */}
        <div className="pr-8">
          <div
            className="text-neutral-900 dark:text-white text-[19px] font-bold leading-tight"
            title={product.name ?? ''}
          >
            {product.name ?? 'Không có tên'}
          </div>
        </div>

        {/* Info grid: SKU / Status / ID */}
        <div className="flex flex-col gap-5">
          {/* Row 1: 3 columns */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-2">
              <span className="text-stone-500 text-[10px] font-bold">Mã SKU</span>
              <span className="text-black dark:text-white text-xs font-bold">
                {product.skuInfo?.sku || 'N/A'}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-stone-500 text-[10px] font-bold">Trạng thái</span>
              <div className={`px-2 py-1 ${statusInfo.bgClass} rounded-lg flex items-center justify-center gap-1 w-max`}>
                <span className={`${statusInfo.textClass} text-[10px] font-semibold whitespace-nowrap`}>
                  {statusInfo.label}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-stone-500 text-[10px] font-bold">Mã SP</span>
              <span className="text-black dark:text-white text-xs font-bold">
                {product.id ? String(product.id).substring(0, 10) : 'N/A'}
              </span>
            </div>
          </div>

          {/* Hình ảnh sản phẩm */}
          <div className="flex flex-col gap-2">
            <span className="text-stone-500 text-[10px] font-bold">Hình ảnh</span>
            {product.mediaItems && product.mediaItems.length > 0 ? (
              <div className="flex gap-2 flex-wrap">
                {product.mediaItems.map((img, i) => {
                  const url = getImageUrl(img.url);
                  return (
                    <img
                      key={img.key || i}
                      src={url}
                      alt={`${product.name ?? ''} ${i + 1}`}
                      className="w-16 h-16 rounded-lg object-cover border border-gray-200 dark:border-white/10 cursor-pointer hover:scale-105 hover:shadow-lg transition-all"
                      onClick={() => url && setLightboxImg(url)}
                    />
                  );
                })}
              </div>
            ) : (
              <span className="text-stone-400 text-xs italic">Chưa có ảnh</span>
            )}
          </div>

          {/* Analytics rows */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-2">
              <span className="text-stone-500 text-[10px] font-bold">Lượt xem</span>
              <span className="text-gray-900 dark:text-white text-xs font-bold">
                {(analytics.viewCount ?? 0).toLocaleString('vi-VN')}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-stone-500 text-[10px] font-bold">Số lượng ảnh</span>
              <span className="text-gray-900 dark:text-white text-xs font-bold">
                {product.mediaItems?.length ?? 0}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-2">
              <span className="text-stone-500 text-[10px] font-bold">Đã bán</span>
              <span className="text-gray-900 dark:text-white text-xs font-bold">
                {(analytics.totalSoldQuantity ?? 0).toLocaleString('vi-VN')}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-stone-500 text-[10px] font-bold">Doanh thu</span>
              <span className="text-green-600 dark:text-green-400 text-xs font-black">
                {(analytics.totalRevenue ?? 0).toLocaleString('vi-VN')} ₫
              </span>
            </div>
          </div>

          {/* Review History */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1 hover:opacity-70 transition-opacity bg-transparent border-none p-0 cursor-pointer"
            >
              <span className="material-icons-round text-stone-950 dark:text-white text-[14px]">
                {showHistory ? 'expand_more' : 'chevron_right'}
              </span>
              <span className="text-black dark:text-white text-[10px] font-bold">
                Lịch sử thay đổi
              </span>
            </button>
            {showHistory && (
              <div className="pl-4 text-stone-400 text-[10px] italic animate-in fade-in duration-200">
                Chưa có lịch sử thay đổi.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action button */}
      <div className="py-2 px-3 pt-2 pb-8">
        <button
          onClick={onEdit}
          className="w-full h-12 flex justify-center items-center px-6 bg-primary font-bold hover:scale-[1.02] active:scale-95 shadow-glow rounded-2xl text-black transition-all border-none cursor-pointer"
        >
          <span className="material-icons-round text-[18px] mr-2">edit</span>
          CHỈNH SỬA
        </button>
      </div>

      {/* Lightbox — render INSIDE the component div, not as sibling */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200 cursor-pointer"
          onClick={() => setLightboxImg(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img
              src={lightboxImg}
              alt="Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-white/90 dark:bg-surface-dark/90 flex items-center justify-center text-gray-800 dark:text-white shadow-lg border-none cursor-pointer hover:scale-110 transition-transform"
            >
              <span className="material-icons-round">close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPanel;
