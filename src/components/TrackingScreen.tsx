import React, { useState } from 'react';
import { useGetOrderByOrderNumber } from '../api/generated/order-management/order-management';
import { OrderDtoStatus } from '../api/generated/eRPExperimentAPI.schemas';

const TrackingScreen: React.FC = () => {
  const [searchValue, setSearchValue] = useState('ORD-001');
  const [orderNumber, setOrderNumber] = useState('ORD-001');

  const { data: orderResponse, isLoading, isError } = useGetOrderByOrderNumber(orderNumber);
  const order = orderResponse?.data.data;

  const handleSearch = () => {
    setOrderNumber(searchValue);
  };

  const getStatusStep = (status?: string) => {
    if (!status) return 0;
    const orderMap: Record<string, number> = {
      'PENDING': 0,
      'CONFIRMED': 1,
      'PROCESSING': 2,
      'PACKED': 2,
      'SHIPPED': 2,
      'DELIVERED': 3,
      'COMPLETED': 3
    };
    return orderMap[status] || 0;
  };

  const currentStep = getStatusStep(order?.status);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      {/* Search Bar Detail */}
      <div className="max-w-3xl mx-auto relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-2xl opacity-20 group-hover:opacity-100 transition duration-500 blur-xl"></div>
        <div className="relative flex items-center bg-white dark:bg-surface-dark rounded-2xl p-2 border border-gray-200 dark:border-white/5 shadow-2xl">
          <div className="pl-6 pr-3 text-gray-400">
            <span className="material-icons-round text-2xl">location_searching</span>
          </div>
          <input
            className="w-full bg-transparent border-none focus:ring-0 text-lg font-mono placeholder-gray-400 dark:text-white uppercase tracking-widest"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="NHẬP MÃ VẬN ĐƠN..."
          />
          <button 
            onClick={handleSearch}
            disabled={isLoading}
            className="bg-primary hover:bg-[#8FD325] text-black px-8 py-3.5 rounded-xl font-bold transition-all shadow-glow flex items-center gap-2 disabled:opacity-50"
          >
            <span>{isLoading ? 'ĐANG TÌM...' : 'THEO DÕI'}</span>
            <span className="material-icons-round">{isLoading ? 'sync' : 'arrow_forward'}</span>
          </button>
        </div>
      </div>

      {isError ? (
        <div className="bg-red-500/10 border border-red-500/20 p-10 rounded-4xl text-center">
          <span className="material-icons-round text-5xl text-red-500 mb-4">search_off</span>
          <h3 className="text-xl font-bold text-red-500">Không tìm thấy mã vận đơn</h3>
          <p className="text-gray-500 mt-2">Vui lòng kiểm tra lại mã {orderNumber} và thử lại.</p>
        </div>
      ) : order ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cột trái: Dòng thời gian */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white/50 dark:bg-surface-dark/50 backdrop-blur-xl rounded-4xl p-8 border border-gray-200 dark:border-white/5 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h3 className="text-xl font-bold">Hành trình Vận chuyển</h3>
                  <p className="text-[10px] font-mono text-gray-500 mt-1 uppercase tracking-widest">Mã Vận đơn: #{order.orderNumber}</p>
                </div>
                <span className="px-4 py-1 rounded-xl bg-primary/10 text-primary text-[10px] font-bold font-mono border border-primary/20">{order.status}</span>
              </div>

              <div className="relative pl-6 border-l-2 border-gray-200 dark:border-gray-800 space-y-12 ml-2">
                <TimelineStep
                  time={order.orderDate ? new Date(order.orderDate).toLocaleString() : '---'}
                  title="Đã nhận hàng"
                  desc="Trung tâm tiếp nhận Nexus"
                  completed={currentStep >= 0}
                />
                <TimelineStep
                  time="QUY TRÌNH HỆ THỐNG"
                  title="Đang xử lý/Đóng gói"
                  desc="Kho trung chuyển tổng hợp"
                  completed={currentStep >= 1}
                />

                <div className={`relative ${currentStep >= 2 ? 'opacity-100' : 'opacity-40'}`}>
                  <div className="absolute -left-[33px] -top-1.5">
                    <div className="relative flex items-center justify-center w-8 h-8">
                      <span className="absolute h-full w-full rounded-full bg-primary/20 radar-ring"></span>
                      <span className="relative rounded-full h-4 w-4 bg-primary border-4 border-white dark:border-surface-dark shadow-glow"></span>
                    </div>
                  </div>
                  <div className="bg-primary/5 dark:bg-primary/10 p-5 rounded-2xl border border-primary/30">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-mono font-bold text-primary tracking-widest">TRẠNG THÁI HIỆN TẠI</span>
                      <span className="material-icons-round text-primary text-sm animate-pulse">local_shipping</span>
                    </div>
                    <p className="font-bold text-lg leading-tight mb-1">{order.status === 'SHIPPED' ? 'Đang giao hàng' : order.status}</p>
                    <p className="text-xs text-gray-500 font-medium">{order.shippingInfo?.address}, {order.shippingInfo?.city}</p>
                  </div>
                </div>

                <TimelineStep
                  time={order.completedAt ? new Date(order.completedAt).toLocaleString() : 'DỰ KIẾN: HOÀN TẤT'}
                  title="Giao hàng Cuối cùng"
                  desc="Địa chỉ Khách hàng"
                  completed={currentStep >= 3}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <StatsCard label="Trọng lượng (Ước tính)" value={order.shippingInfo?.shippingFee?.toString() === '0' ? "---" : "0.5"} unit="KG" />
              <StatsCard label="Số lượng Vật phẩm" value={order.orderItems?.length || 0} unit="KIỆN" />
            </div>
          </div>

          {/* Cột phải: Bản đồ & Hóa đơn */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Tactical Map (Giữ nguyên UI vì chưa có GPS thật) */}
            <div className="flex-1 min-h-[450px] bg-gray-900 rounded-4xl overflow-hidden relative border border-white/5 shadow-2xl group">
              <img
                alt="Bản đồ"
                className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale contrast-125"
                src="https://picsum.photos/seed/tacticalmap/1200/800"
              />
              <div className="absolute inset-0 tech-grid opacity-20 pointer-events-none"></div>

              <div className="absolute bottom-8 left-8 right-8 md:right-auto md:w-80 bg-gray-900/90 backdrop-blur-2xl p-6 rounded-3xl border-l-4 border-primary shadow-2xl">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Duy trì Kết nối</p>
                    <p className="text-3xl font-bold text-white mt-1">ONLINE</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Electronic Invoice */}
            <div className="bg-white/50 dark:bg-surface-dark/50 backdrop-blur-xl rounded-4xl p-8 border border-gray-200 dark:border-white/5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                    <span className="material-icons-round text-2xl">description</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-tight">Chi tiết Vận đơn điện tử</h3>
                    <p className="text-[10px] text-gray-500 font-mono mt-1">SYSTEM_AUTH_APPROVED • ID: {order.id?.substring(0, 8)}</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-white/10 text-gray-500 uppercase tracking-widest">
                      <th className="py-4 px-4 font-bold">MÃ SKU</th>
                      <th className="py-4 px-4 font-bold">MÔ TẢ</th>
                      <th className="py-4 px-4 font-bold text-right">SL</th>
                      <th className="py-4 px-4 font-bold text-right">ĐƠN GIÁ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.orderItems?.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-100 dark:border-white/5 hover:bg-white/5 transition-all">
                        <td className="py-5 px-4 text-primary font-bold">{item.productSku || 'SKU-000'}</td>
                        <td className="py-5 px-4 dark:text-gray-300 font-medium">{item.productName}</td>
                        <td className="py-5 px-4 text-right text-gray-500">{item.quantity}</td>
                        <td className="py-5 px-4 text-right font-bold dark:text-white">${item.unitPrice?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="py-6 px-4 text-right text-[10px] text-gray-500 font-bold uppercase tracking-widest">Tổng cộng quyết toán</td>
                      <td className="py-6 px-4 text-right text-2xl font-bold text-primary">${order.totalAmount?.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white/5 p-10 rounded-4xl text-center">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
            <p className="text-gray-500">Đang đồng bộ dữ liệu vệ tinh...</p>
        </div>
      )}
    </div>
  );
};

const TimelineStep = ({ time, title, desc, completed }: any) => (
  <div className={`relative ${completed ? 'opacity-100' : 'opacity-40'}`}>
    <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 ${completed ? 'bg-gray-300 dark:bg-gray-600 border-white dark:border-surface-dark' : 'border-dashed border-gray-400 bg-transparent'}`}></div>
    <div>
      <p className="text-[10px] font-mono text-gray-400 mb-1">{time}</p>
      <h4 className="font-bold text-gray-800 dark:text-gray-200">{title}</h4>
      <p className="text-xs text-gray-500">{desc}</p>
    </div>
  </div>
);

const StatsCard = ({ label, value, unit }: any) => (
  <div className="bg-white/50 dark:bg-surface-dark/50 backdrop-blur-md p-6 rounded-3xl border border-gray-200 dark:border-white/5">
    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">{label}</p>
    <div className="flex items-baseline gap-1.5">
      <span className="text-3xl font-bold dark:text-white">{value}</span>
      <span className="text-xs text-gray-400">{unit}</span>
    </div>
  </div>
);

export default TrackingScreen;
