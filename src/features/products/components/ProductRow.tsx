import React from 'react';
import { Eye, ChevronRight, Image as ImageIcon } from 'lucide-react';
import type { ProductDto } from '../types';
import { getStatusInfo, getStatusDetailInfo, hashName, getImageUrl } from '../helpers';
import { ICON_LIST, ICON_COLOR } from '../constants';

interface ProductRowProps {
  product: ProductDto;
  isSelected: boolean;
  onSelect: () => void;
}

const ProductRow: React.FC<ProductRowProps> = ({ product, isSelected, onSelect }) => {
  const statusInfo = getStatusDetailInfo(product.status);
  const iconIdx = hashName(product.name ?? '', ICON_LIST.length);
  const colorIdx = hashName(product.name ?? '', ICON_COLOR.length);
  // Silence unused-var warnings — kept for future icon display
  void iconIdx;
  void colorIdx;

  const statusBadge = () => {
    switch (product.status) {
      case 'ACTIVE':
        return (
          <div className="flex items-center gap-2 bg-[#A3E635]/10 w-fit px-3 py-1.5 rounded-full border border-[#A3E635]/20">
            <div className="w-1.5 h-1.5 rounded-full bg-[#A3E635] shadow-[0_0_8px_#A3E635]"></div>
            <span className="text-xs font-bold text-[#A3E635]">{statusInfo.label}</span>
          </div>
        );
      case 'LOCKED':
        return (
          <div className="flex items-center gap-2 bg-amber-500/10 w-fit px-3 py-1.5 rounded-full border border-amber-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_#F59E0B]"></div>
            <span className="text-xs font-bold text-amber-500">{statusInfo.label}</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 bg-gray-500/10 w-fit px-3 py-1.5 rounded-full border border-gray-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>
            <span className="text-xs font-bold text-gray-400">{statusInfo.label}</span>
          </div>
        );
    }
  };

  return (
    <tr
      className={`group cursor-pointer transition-all duration-300 border-t border-white/5 ${
        isSelected
          ? 'bg-primary/5 shadow-[inset_4px_0_0_0_#A3E635]'
          : 'hover:bg-white/[0.02]'
      }`}
      onClick={onSelect}
    >
      {/* Trạng thái */}
      <td className="px-6 py-4">
        {statusBadge()}
      </td>

      {/* Tên sản phẩm */}
      <td className="px-6 py-4">
        <span
          className="font-bold text-white text-sm truncate max-w-[200px] block"
          title={product.name}
        >
          {product.name}
        </span>
      </td>

      {/* Mã SKU */}
      <td className="px-6 py-4 font-mono text-gray-500 text-sm">
        {product.skuInfo?.sku || <span className="italic text-stone-600">N/A</span>}
      </td>

      {/* Hình ảnh */}
      <td className="px-6 py-4">
        {product.mediaItems && product.mediaItems.length > 0 ? (
          <div className="flex space-x-2">
            {product.mediaItems.slice(0, 2).map((img, i) => (
              <img
                key={i}
                src={getImageUrl(img.url)}
                alt=""
                className="w-10 h-10 rounded-lg object-cover bg-[#0A0B10] border border-white/5"
              />
            ))}
            {product.mediaItems.length > 2 && (
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-[10px] font-bold text-gray-400 border border-white/5">
                +{product.mediaItems.length - 2}
              </div>
            )}
          </div>
        ) : (
          <div className="w-10 h-10 rounded-lg bg-[#0A0B10] border border-white/5 flex items-center justify-center overflow-hidden">
            <ImageIcon size={16} className="text-gray-600" />
          </div>
        )}
      </td>

      {/* Cập nhật */}
      <td className="px-6 py-4 font-mono text-gray-400 text-sm">
        {new Date().toLocaleDateString('vi-VN')}
      </td>

      {/* Tác vụ */}
      <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end space-x-1">
          <button
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all border-none cursor-pointer bg-transparent ${
              isSelected
                ? 'bg-primary text-black'
                : 'text-gray-500 hover:text-white hover:bg-white/10'
            }`}
            onClick={onSelect}
            title="Xem chi tiết"
          >
            {isSelected ? <ChevronRight size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ProductRow;
