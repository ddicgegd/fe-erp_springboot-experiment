import { useEffect, useRef } from 'react';
import { incrementProductView } from '../api';

const STORAGE_KEY = 'product_viewed_ids';

/**
 * Custom hook: gọi API tăng lượt xem sản phẩm khi component mount.
 *
 * Chống spam bằng sessionStorage — mỗi sản phẩm chỉ được ghi nhận 1 lần
 * trong cùng một session trình duyệt. Khi user đóng tab/trình duyệt,
 * danh sách sẽ bị xóa (sessionStorage), cho phép đếm lại lần sau.
 *
 * Lỗi API sẽ bị nuốt (silent fail) vì đây chỉ là tracking ngầm.
 *
 * @param productId - ID sản phẩm cần tracking view
 *
 * @example
 * ```tsx
 * const ProductDetail: React.FC<{ productId: string }> = ({ productId }) => {
 *   useProductViewTracking(productId);
 *   return <div>...</div>;
 * };
 * ```
 */
export function useProductViewTracking(productId: string | undefined) {
  // Dùng ref để đảm bảo chỉ gọi 1 lần duy nhất cho mỗi productId,
  // kể cả khi React StrictMode double-mount trong dev.
  const calledRef = useRef<string | null>(null);

  useEffect(() => {
    if (!productId) return;

    // Guard: đã gọi cho ID này trong lần mount hiện tại rồi
    if (calledRef.current === productId) return;

    // Check sessionStorage — sản phẩm đã được xem trong session này chưa?
    const getViewedIds = (): string[] => {
      try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    };

    const markAsViewed = (id: string) => {
      try {
        const ids = getViewedIds();
        if (!ids.includes(id)) {
          ids.push(id);
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
        }
      } catch {
        // sessionStorage không khả dụng — bỏ qua
      }
    };

    const viewedIds = getViewedIds();
    if (viewedIds.includes(productId)) {
      // Đã xem trong session này — skip API call
      calledRef.current = productId;
      return;
    }

    // Gọi API bất đồng bộ, không block UI, nuốt lỗi
    calledRef.current = productId;

    (async () => {
      try {
        await incrementProductView(productId);
        markAsViewed(productId);
      } catch (err) {
        // Silent fail — tracking thất bại không ảnh hưởng UX
        console.debug('[useProductViewTracking] Failed to track view:', err);
      }
    })();
  }, [productId]);
}
