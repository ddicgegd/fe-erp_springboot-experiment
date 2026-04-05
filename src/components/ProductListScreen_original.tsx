import React from 'react';

const ProductListScreen: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex justify-between items-end border-l-4 border-primary pl-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-gray-800 dark:text-white">DANH SÁCH SẢN PHẨM</h1>
          <p className="text-primary font-mono text-sm tracking-widest uppercase mt-2">LOGISTICS_CORE // INVENTORY_CONTROL</p>
        </div>
        <div className="hidden md:block text-right font-mono text-xs text-gray-500 leading-tight">
          COORD: 40.7128° N, 74.0060° W<br />
          SEC: OPERATIONAL_AREA_04
        </div>
      </div>

      {/* Inventory Status Widgets */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Items */}
        <div className="bg-white/50 dark:bg-surface-dark/50 backdrop-blur-xl rounded-4xl p-6 relative group overflow-hidden border border-gray-200 dark:border-white/5">
          <div className="absolute top-6 right-6 text-primary">
            <span className="material-icons-round text-3xl transition-transform group-hover:scale-110">inventory_2</span>
          </div>
          <div>
            <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">TỔNG SẢN PHẨM</p>
            <h2 className="text-4xl font-black mt-2 text-gray-800 dark:text-white">1,284</h2>
          </div>
          <div className="mt-6 h-2 w-full bg-gray-100 dark:bg-black/30 rounded-full overflow-hidden">
            <div className="h-full bg-primary w-3/4 shadow-glow rounded-full"></div>
          </div>
        </div>

        {/* Maintenance Needed */}
        <div className="bg-white/50 dark:bg-surface-dark/50 backdrop-blur-xl rounded-4xl p-6 relative group overflow-hidden border border-gray-200 dark:border-white/5">
          <div className="absolute top-6 right-6 text-red-500">
            <span className="material-icons-round text-3xl transition-transform group-hover:scale-110">build_circle</span>
          </div>
          <div>
            <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">CẦN BẢO TRÌ</p>
            <h2 className="text-4xl font-black mt-2 text-red-500">12</h2>
          </div>
          <div className="mt-6 flex space-x-1.5 h-2">
            <div className="flex-1 bg-red-500 rounded-full"></div>
            <div className="flex-1 bg-red-500 rounded-full"></div>
            <div className="flex-1 bg-red-500/20 rounded-full"></div>
            <div className="flex-1 bg-red-500/20 rounded-full"></div>
            <div className="flex-1 bg-red-500/20 rounded-full"></div>
          </div>
        </div>

        {/* Incoming Shipments */}
        <div className="bg-white/50 dark:bg-surface-dark/50 backdrop-blur-xl rounded-4xl p-6 relative group overflow-hidden border border-gray-200 dark:border-white/5">
          <div className="absolute top-6 right-6 text-cyan-500">
            <span className="material-icons-round text-3xl transition-transform group-hover:scale-110">local_shipping</span>
          </div>
          <div>
            <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">LÔ HÀNG SẮP VỀ</p>
            <h2 className="text-4xl font-black mt-2 text-cyan-500">+240</h2>
          </div>
          <div className="mt-6 mb-[-4px] text-xs font-bold text-cyan-500 flex items-center bg-cyan-500/10 dark:bg-cyan-500/20 w-fit px-3 py-1 rounded-full">
            <span className="material-icons-round text-[14px] mr-1 animate-spin">sync</span> ĐANG ĐỒNG BỘ...
          </div>
        </div>

        {/* Unit Value */}
        <div className="bg-white/50 dark:bg-surface-dark/50 backdrop-blur-xl rounded-4xl p-6 relative group overflow-hidden border border-gray-200 dark:border-white/5">
          <div className="absolute top-6 right-6 text-secondary">
            <span className="material-icons-round text-3xl transition-transform group-hover:scale-110">payments</span>
          </div>
          <div>
            <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">GIÁ TRỊ TỔNG</p>
            <h2 className="text-4xl font-black mt-2 text-secondary">$4.2M</h2>
          </div>
          <div className="mt-6 h-2 w-full bg-gray-100 dark:bg-black/30 rounded-full overflow-hidden">
            <div className="h-full bg-secondary w-1/2 rounded-full shadow-glow-purple"></div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="bg-white/50 dark:bg-surface-dark/50 backdrop-blur-xl rounded-4xl border border-gray-200 dark:border-white/5 overflow-hidden flex flex-col">
        {/* Search & Filtering HUD */}
        <section className="p-6 border-b border-gray-200 dark:border-white/5 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[300px] relative">
            <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input 
              className="w-full bg-gray-100/50 dark:bg-accent-dark/50 border-none rounded-2xl text-sm py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary placeholder:text-gray-400 dark:text-gray-300 outline-none transition-all dark:focus:bg-accent-dark/80" 
              placeholder="Tìm kiếm sản phẩm, mã SKU..." 
              type="text" 
            />
          </div>
          <div className="flex items-center space-x-2 bg-gray-100/50 dark:bg-accent-dark/50 rounded-2xl p-1 pr-4 border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-3">LOẠI:</span>
            <select className="bg-transparent text-gray-800 dark:text-gray-200 border-none text-sm font-semibold py-3 px-2 focus:ring-0 appearance-none outline-none cursor-pointer">
              <option>Tất cả thiết bị</option>
              <option>Chipset</option>
              <option>Mobile Unit</option>
              <option>Neural Module</option>
            </select>
          </div>
          <div className="flex items-center space-x-2 bg-gray-100/50 dark:bg-accent-dark/50 rounded-2xl p-1 pr-4 border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-3">TRẠI THÁI:</span>
            <select className="bg-transparent text-gray-800 dark:text-gray-200 border-none text-sm font-semibold py-3 px-2 focus:ring-0 appearance-none outline-none cursor-pointer">
              <option>Mọi trạng thái</option>
              <option>Sẵn sàng</option>
              <option>Đang vận chuyển</option>
              <option>Bảo trì</option>
            </select>
          </div>
          <button className="bg-primary text-black font-bold h-12 px-8 rounded-2xl hover:scale-[1.02] shadow-glow active:scale-95 transition-all flex items-center">
            <span className="material-icons-round mr-2 text-lg">filter_list</span>
            LỌC
          </button>
        </section>

        {/* Product Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-accent-dark/30">
                <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Mã SKU</th>
                <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Phân loại</th>
                <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Số lượng</th>
                <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Đơn giá</th>
                <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Tác vụ</th>
              </tr>
            </thead>
            <tbody className="text-sm dark:text-gray-200">
              {/* Row 1 */}
              <tr className="group hover:bg-white/40 dark:hover:bg-white/5 transition-colors border-t border-gray-100 dark:border-white/5">
                <td className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <span className="material-icons-round text-primary">memory</span>
                    </div>
                    <span className="font-bold text-base text-gray-800 dark:text-white">Quantum-X Core v2</span>
                  </div>
                </td>
                <td className="p-6 font-mono font-medium text-gray-500 dark:text-gray-400">SKU-992-QX</td>
                <td className="p-6">
                  <span className="text-xs font-bold px-3 py-1.5 bg-gray-100 dark:bg-white/10 rounded-xl text-gray-600 dark:text-gray-300">Chipset</span>
                </td>
                <td className="p-6 font-mono font-bold text-base">412</td>
                <td className="p-6 font-mono font-bold text-base">$1,250.00</td>
                <td className="p-6">
                  <div className="flex items-center text-primary font-bold text-xs bg-primary/10 w-fit px-3 py-1.5 rounded-xl">
                    <span className="w-2 h-2 bg-primary rounded-full mr-2 shadow-glow"></span>
                    Sẵn sàng
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex items-center justify-center space-x-2">
                    <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-white/80 dark:hover:bg-white/10 hover:text-primary rounded-xl transition-all shadow-sm"><span className="material-icons-round text-[20px]">visibility</span></button>
                    <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-white/80 dark:hover:bg-white/10 hover:text-cyan-500 rounded-xl transition-all shadow-sm"><span className="material-icons-round text-[20px]">edit</span></button>
                    <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-white/80 dark:hover:bg-red-500/20 hover:text-red-500 rounded-xl transition-all shadow-sm"><span className="material-icons-round text-[20px]">delete_outline</span></button>
                  </div>
                </td>
              </tr>
              {/* Row 2 */}
              <tr className="group hover:bg-white/40 dark:hover:bg-white/5 transition-colors border-t border-gray-100 dark:border-white/5">
                <td className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                      <span className="material-icons-round text-cyan-500">smart_screen</span>
                    </div>
                    <span className="font-bold text-base text-gray-800 dark:text-white">Neural-Link Pad 7</span>
                  </div>
                </td>
                <td className="p-6 font-mono font-medium text-gray-500 dark:text-gray-400">SKU-001-NLP</td>
                <td className="p-6">
                  <span className="text-xs font-bold px-3 py-1.5 bg-gray-100 dark:bg-white/10 rounded-xl text-gray-600 dark:text-gray-300">Mobile Unit</span>
                </td>
                <td className="p-6 font-mono font-bold text-base">85</td>
                <td className="p-6 font-mono font-bold text-base">$840.00</td>
                <td className="p-6">
                  <div className="flex items-center text-cyan-600 dark:text-cyan-400 font-bold text-xs bg-cyan-500/10 w-fit px-3 py-1.5 rounded-xl">
                    <span className="w-2 h-2 bg-cyan-500 dark:bg-cyan-400 rounded-full mr-2"></span>
                    Vận chuyển
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex items-center justify-center space-x-2">
                    <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-white/80 dark:hover:bg-white/10 hover:text-primary rounded-xl transition-all shadow-sm"><span className="material-icons-round text-[20px]">visibility</span></button>
                    <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-white/80 dark:hover:bg-white/10 hover:text-cyan-500 rounded-xl transition-all shadow-sm"><span className="material-icons-round text-[20px]">edit</span></button>
                    <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-white/80 dark:hover:bg-red-500/20 hover:text-red-500 rounded-xl transition-all shadow-sm"><span className="material-icons-round text-[20px]">delete_outline</span></button>
                  </div>
                </td>
              </tr>
              {/* Row 3 */}
              <tr className="group hover:bg-white/40 dark:hover:bg-white/5 transition-colors border-t border-gray-100 dark:border-white/5">
                <td className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center">
                      <span className="material-icons-round text-secondary">smart_toy</span>
                    </div>
                    <span className="font-bold text-base text-gray-800 dark:text-white">Sentinel Drone MK-II</span>
                  </div>
                </td>
                <td className="p-6 font-mono font-medium text-gray-500 dark:text-gray-400">SKU-544-SD2</td>
                <td className="p-6">
                  <span className="text-xs font-bold px-3 py-1.5 bg-gray-100 dark:bg-white/10 rounded-xl text-gray-600 dark:text-gray-300">Neural Module</span>
                </td>
                <td className="p-6 font-mono font-bold text-base text-red-500">04</td>
                <td className="p-6 font-mono font-bold text-base">$5,400.00</td>
                <td className="p-6">
                  <div className="flex items-center text-red-600 dark:text-red-400 font-bold text-xs bg-red-500/10 w-fit px-3 py-1.5 rounded-xl">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Cần bảo trì
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex items-center justify-center space-x-2">
                    <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-white/80 dark:hover:bg-white/10 hover:text-primary rounded-xl transition-all shadow-sm"><span className="material-icons-round text-[20px]">visibility</span></button>
                    <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-white/80 dark:hover:bg-white/10 hover:text-cyan-500 rounded-xl transition-all shadow-sm"><span className="material-icons-round text-[20px]">edit</span></button>
                    <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-white/80 dark:hover:bg-red-500/20 hover:text-red-500 rounded-xl transition-all shadow-sm"><span className="material-icons-round text-[20px]">delete_outline</span></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="p-6 bg-gray-50/50 dark:bg-accent-dark/30 flex flex-col sm:flex-row justify-between items-center text-sm font-medium text-gray-500 border-t border-gray-200 dark:border-white/5">
          <div className="mb-4 sm:mb-0">Hiển thị <strong className="text-gray-800 dark:text-white">1</strong> đến <strong className="text-gray-800 dark:text-white">3</strong> trong số <strong className="text-gray-800 dark:text-white">1,284</strong> mục</div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">Trước</button>
            <div className="flex space-x-1 items-center">
              <button className="w-10 h-10 rounded-xl bg-primary text-black font-black shadow-glow flex items-center justify-center">1</button>
              <button className="w-10 h-10 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors flex items-center justify-center">2</button>
              <button className="w-10 h-10 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors flex items-center justify-center">3</button>
              <span className="px-2">...</span>
              <button className="w-10 h-10 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors flex items-center justify-center">12</button>
            </div>
            <button className="px-4 py-2 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">Tiếp</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListScreen;
