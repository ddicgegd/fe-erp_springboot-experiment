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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-[400px] bg-[#12131A] rounded-2xl border border-white/5 flex flex-col shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden"
        style={{ fontFamily: "'Inter', sans-serif", maxHeight: '85vh' }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/5 relative bg-[#0A0B10]/50 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white truncate max-w-[280px]" title={product.name ?? ''}>
              {product.name ?? 'Không có tên'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors border-none cursor-pointer shrink-0"
          >
            <span className="material-icons-round text-[16px]">close</span>
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5 overflow-y-auto flex-1">
          {/* Key Info Grid */}
          <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
            <div className="flex flex-col gap-1">
              <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Mã SKU</span>
              <span className="text-white text-xs font-bold">{product.skuInfo?.sku || 'N/A'}</span>
            </div>
            <div className="w-px h-6 bg-white/10"></div>
            <div className="flex flex-col gap-1 items-center">
              <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Trạng thái</span>
              <span className={`${statusInfo.textClass} text-xs font-bold`}>{statusInfo.label}</span>
            </div>
            <div className="w-px h-6 bg-white/10"></div>
            <div className="flex flex-col gap-1 items-end">
              <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Mã SP</span>
              <span className="text-white text-xs font-bold">{product.id ? String(product.id).substring(0, 8) : 'N/A'}</span>
            </div>
          </div>

          {/* Hình ảnh */}
          <div className="flex flex-col gap-2">
            <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Hình ảnh ({product.mediaItems?.length || 0})</span>
            {product.mediaItems && product.mediaItems.length > 0 ? (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {product.mediaItems.map((img, i) => {
                  const url = getImageUrl(img.url);
                  return (
                    <img
                      key={img.key || i}
                      src={url}
                      alt={`${product.name ?? ''} ${i + 1}`}
                      className="w-14 h-14 rounded-lg object-cover border border-white/5 cursor-pointer hover:scale-105 transition-transform shrink-0"
                      onClick={() => url && setLightboxImg(url)}
                    />
                  );
                })}
              </div>
            ) : (
              <span className="text-gray-600 text-xs italic">Chưa có ảnh</span>
            )}
          </div>

          {/* Analytics Grid */}
          <div className="flex flex-col gap-2">
            <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Thống kê</span>
            <div className="grid grid-cols-2 gap-px bg-white/5 border border-white/5 rounded-xl overflow-hidden">
              <div className="bg-[#12131A] p-3 flex justify-between items-center">
                <span className="text-gray-500 text-[10px] uppercase font-bold">Lượt xem</span>
                <span className="text-white text-xs font-bold">{(analytics.viewCount ?? 0).toLocaleString('vi-VN')}</span>
              </div>
              <div className="bg-[#12131A] p-3 flex justify-between items-center">
                <span className="text-gray-500 text-[10px] uppercase font-bold">Đã bán</span>
                <span className="text-white text-xs font-bold">{(analytics.totalSoldQuantity ?? 0).toLocaleString('vi-VN')}</span>
              </div>
              <div className="bg-[#12131A] p-3 col-span-2 flex justify-between items-center">
                <span className="text-gray-500 text-[10px] uppercase font-bold">Doanh thu</span>
                <span className="text-[#A3E635] text-sm font-black">{(analytics.totalRevenue ?? 0).toLocaleString('vi-VN')} ₫</span>
              </div>
            </div>
          </div>

          {/* Lịch sử */}
          <div className="pt-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1 hover:opacity-70 transition-opacity bg-transparent border-none p-0 cursor-pointer w-fit"
            >
              <span className="material-icons-round text-white text-[16px]">
                {showHistory ? 'expand_more' : 'chevron_right'}
              </span>
              <span className="text-white text-[11px] font-bold">Lịch sử thay đổi</span>
            </button>
            {showHistory && (
              <div className="pl-6 pt-2 text-gray-500 text-[11px] italic animate-in fade-in duration-200">
                Chưa có lịch sử thay đổi.
              </div>
            )}
          </div>
        </div>

        {/* Action */}
        <div className="p-4 border-t border-white/5 bg-[#0A0B10]">
          <button
            onClick={onEdit}
            className="w-full h-11 flex justify-center items-center gap-2 bg-primary font-bold hover:bg-[#86efac] rounded-xl text-black transition-colors border-none cursor-pointer"
          >
            <span className="material-icons-round text-[16px]">edit</span>
            <span className="text-xs">CHỈNH SỬA</span>
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center animate-in fade-in duration-200 cursor-pointer"
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
              className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white border-none cursor-pointer hover:scale-110 transition-transform backdrop-blur-md"
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
