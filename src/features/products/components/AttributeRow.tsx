import React from 'react';
import type { AttributesDto } from '../types';
import { getAttrStatusInfo } from '../helpers';

interface AttributeRowProps {
  attr: AttributesDto;
  isSelected: boolean;
  onSelect: () => void;
}

const AttributeRow: React.FC<AttributeRowProps> = ({ attr, isSelected, onSelect }) => {
  const statusInfo = getAttrStatusInfo(attr.statusProduct);

  return (
    <tr
      className={`group cursor-pointer transition-all duration-300 border-t border-gray-100 dark:border-white/5 ${isSelected
          ? 'bg-cyan-500/10 dark:bg-cyan-500/20 shadow-[inset_4px_0_0_0_#06b6d4]'
          : 'hover:bg-white/40 dark:hover:bg-white/5'
        }`}
      onClick={onSelect}
    >
      {/* Trạng thái */}
      <td className="py-2 px-3">
        <div className={`px-2 py-1 ${statusInfo.bgClass} rounded-lg inline-flex items-center gap-1.5`}>
          <span className={`w-2 h-2 rounded-full ${statusInfo.dotClass}`} />
          <span className={`${statusInfo.textClass} text-xs font-bold`}>{statusInfo.label}</span>
        </div>
      </td>

      {/* Tên biến thể */}
      <td className="py-2 px-3">
        <span
          className="font-bold text-base text-gray-800 dark:text-white truncate max-w-[200px] block"
          title={attr.name}
        >
          {attr.name || <span className="italic text-stone-400">Chưa đặt tên</span>}
        </span>
      </td>

      {/* Mã SKU */}
      <td className="py-2 px-3 font-mono font-medium text-gray-500 dark:text-gray-400 text-sm">
        {attr.sku?.sku || <span className="italic text-stone-400">N/A</span>}
      </td>

      {/* Giá bán */}
      <td className="py-2 px-3">
        <div className="flex flex-col gap-0.5">
          {attr.salePrice != null && attr.salePrice !== attr.price ? (
            <>
              <span className="font-bold text-sm text-primary">
                {attr.salePrice.toLocaleString('vi-VN')}₫
              </span>
              <span className="text-stone-400 line-through text-[10px]">
                {(attr.price ?? 0).toLocaleString('vi-VN')}₫
              </span>
            </>
          ) : (
            <span className="font-bold text-sm text-gray-800 dark:text-white">
              {(attr.price ?? 0).toLocaleString('vi-VN')}₫
            </span>
          )}
        </div>
      </td>

      {/* Tồn kho */}
      <td className="py-2 px-3">
        <span
          className={`font-bold text-sm ${(attr.stockQuantity ?? 0) === 0
              ? 'text-red-500'
              : (attr.stockQuantity ?? 0) < 10
                ? 'text-orange-500'
                : 'text-gray-800 dark:text-white'
            }`}
        >
          {attr.stockQuantity?.toLocaleString('vi-VN') ?? '0'}
        </span>
      </td>

      {/* Sản phẩm gốc */}
      <td className="py-2 px-3">
        {attr.product?.name ? (
          <div className="flex items-center gap-2">
            <span className="material-icons-round text-stone-400 text-[14px]">inventory_2</span>
            <span
              className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate max-w-[150px]"
              title={attr.product.name}
            >
              {attr.product.name}
            </span>
          </div>
        ) : (
          <span className="italic text-stone-400 text-sm">—</span>
        )}
      </td>

      {/* Tùy chọn / Variant Options */}
      <td className="py-2 px-3">
        {attr.variantOptions && attr.variantOptions.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {attr.variantOptions.slice(0, 3).map((opt, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[10px] font-bold"
                title={`${opt.key}: ${opt.value}`}
              >
                {opt.value}
              </span>
            ))}
            {attr.variantOptions.length > 3 && (
              <span className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-500 text-[10px] font-bold">
                +{attr.variantOptions.length - 3}
              </span>
            )}
          </div>
        ) : (
          <span className="italic text-stone-400 text-[10px]">Không có</span>
        )}
      </td>
    </tr>
  );
};

export default AttributeRow;
