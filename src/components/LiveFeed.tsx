
import React from 'react';

const LiveFeed: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 lg:left-24 right-0 h-10 bg-surface-dark text-white z-40 flex items-center overflow-hidden border-t border-accent-dark">
      <div className="bg-primary text-black px-4 h-full flex items-center font-bold text-xs uppercase z-10 shrink-0">
        Bản tin Trực tiếp
      </div>
      <div className="whitespace-nowrap animate-marquee flex gap-12 items-center px-4 text-[10px] font-mono text-gray-400 uppercase tracking-widest">
        <span className="flex items-center gap-2"><span className="text-green-400">▲</span> NASDAQ 14,890.30 (+1.2%)</span>
        <span className="flex items-center gap-2"><span className="text-red-400">▼</span> BTC/USD 34,210.00 (-0.5%)</span>
        <span className="flex items-center gap-2"><span className="text-green-400">▲</span> VẬN ĐƠN #9982 ĐÃ CẬP CẢNG SINGAPORE</span>
        <span className="flex items-center gap-2"><span className="text-blue-400">●</span> AI ĐANG TỐI ƯU HÓA TUYẾN ĐƯỜNG BẮC MỸ</span>
        <span className="flex items-center gap-2"><span className="text-green-400">▲</span> ETH/USD 1,890.30 (+0.8%)</span>
        <span className="flex items-center gap-2"><span className="text-primary">●</span> TRUNG TÂM HÀN QUỐC ĐÃ NHẬP KHO: 5000 CHIP BÁN DẪN</span>
        {/* Lặp lại để chạy mượt */}
        <span className="flex items-center gap-2"><span className="text-green-400">▲</span> NASDAQ 14,890.30 (+1.2%)</span>
        <span className="flex items-center gap-2"><span className="text-red-400">▼</span> BTC/USD 34,210.00 (-0.5%)</span>
        <span className="flex items-center gap-2"><span className="text-green-400">▲</span> VẬN ĐƠN #9982 ĐÃ CẬP CẢNG SINGAPORE</span>
      </div>
    </div>
  );
};

export default LiveFeed;
