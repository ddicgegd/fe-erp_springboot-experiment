import React from 'react';
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
  const iconIdx = hashName(product.name, ICON_LIST.length);
  const colorIdx = hashName(product.name, ICON_COLOR.length);
  // Silence unused-var warnings — kept for future icon display
  void iconIdx;
  void colorIdx;

  return (
    <tr
      className={`group cursor-pointer transition-all duration-300 border-t border-gray-100 dark:border-white/5 ${
        isSelected
          ? 'bg-primary/10 dark:bg-primary/20 shadow-[inset_4px_0_0_0_#98FF98] dark:shadow-[inset_4px_0_0_0_#4ade80]'
          : 'hover:bg-white/40 dark:hover:bg-white/5'
      }`}
      onClick={onSelect}
    >
      {/* Trạng thái */}
      <td className="py-2 px-3">
        <div className={`px-3 py-1.5 ${statusInfo.bgClass} rounded-xl inline-flex items-center gap-2`}>
          <span className={`w-2 h-2 rounded-full ${getStatusInfo(product.status).dotClass}`} />
          <span className={`${statusInfo.textClass} text-xs font-bold`}>{statusInfo.label}</span>
        </div>
      </td>

      {/* Tên sản phẩm */}
      <td className="py-2 px-3">
        <span
          className="font-bold text-base text-gray-800 dark:text-white truncate max-w-[200px] block"
          title={product.name}
        >
          {product.name}
        </span>
      </td>

      {/* Mã SKU */}
      <td className="py-2 px-3 font-mono font-medium text-gray-500 dark:text-gray-400 text-sm">
        {product.skuInfo?.sku || <span className="italic text-stone-400">N/A</span>}
      </td>

      {/* Hình ảnh */}
      <td className="py-2 px-3">
        {product.mediaItems && product.mediaItems.length > 0 ? (
          <div className="flex space-x-2">
            {product.mediaItems.slice(0, 2).map((img, i) => (
              <img
                key={i}
                src={getImageUrl(img.url)}
                alt=""
                className="w-8 h-8 rounded-lg object-cover bg-white shadow-sm border border-gray-200 dark:border-white/10"
              />
            ))}
            {product.mediaItems.length > 2 && (
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold text-gray-500">
                +{product.mediaItems.length - 2}
              </div>
            )}
          </div>
        ) : (
          <span className="text-xs text-stone-400 italic">—</span>
        )}
      </td>

      {/* Cập nhật */}
      <td className="py-2 px-3 font-mono font-medium text-gray-500 dark:text-gray-400 text-sm">
        {new Date().toLocaleDateString('vi-VN')}
      </td>

      {/* Tác vụ */}
      <td className="py-2 px-3 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-center space-x-1">
          <button
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all shadow-sm ${
              isSelected
                ? 'bg-primary text-black'
                : 'text-gray-400 hover:bg-white hover:text-primary dark:hover:bg-white/10'
            }`}
            onClick={onSelect}
            title="Xem chi tiết"
          >
            <span className="material-icons-round text-[18px]">
              {isSelected ? 'keyboard_arrow_right' : 'visibility'}
            </span>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ProductRow;
