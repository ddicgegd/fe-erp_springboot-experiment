
import React from 'react';
import { ResponsiveContainer, AreaChart, Area, Tooltip, LineChart, Line, YAxis, XAxis } from 'recharts';
import useExchangeRates from '../hooks/useMongoExchangeRates';
import { useGetPendingOrders, useGetInProgressOrders } from '../api/generated/order-management/order-management';

const data = [
  { name: '08:00', val: 40 },
  { name: '10:00', val: 30 },
  { name: '12:00', val: 65 },
  { name: '14:00', val: 80 },
  { name: '16:00', val: 45 },
  { name: '18:00', val: 90 },
  { name: '20:00', val: 60 },
];

const DashboardScreen: React.FC = () => {
  const { data: pendingOrdersResponse, isLoading: isLoadingPending } = useGetPendingOrders();
  const { data: inProgressOrdersResponse, isLoading: isLoadingInProgress } = useGetInProgressOrders();

  const pendingCount = pendingOrdersResponse?.data.data?.length || 0;
  const inProgressCount = inProgressOrdersResponse?.data.data?.length || 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-12 gap-6">
        {/* Radar View Container */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white/50 dark:bg-surface-dark/50 backdrop-blur-xl rounded-4xl p-8 h-[420px] border border-gray-200 dark:border-white/5 relative overflow-hidden flex flex-col justify-between group">
            <div className="flex justify-between items-start z-10">
              <div>
                <h2 className="text-xl font-bold dark:text-white">Trung tâm Logistics Toàn cầu</h2>
                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Giám sát tài sản thời gian thực</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-accent-dark text-[10px] font-bold hover:bg-gray-200 transition">LƯỚI 2D</button>
                <button className="px-4 py-2 rounded-xl bg-primary text-black text-[10px] font-bold shadow-glow">RADAR 3D</button>
              </div>
            </div>

            {/* Radar Animation */}
            <div className="absolute inset-0 flex items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity">
              <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full border border-primary/20 relative animate-[spin_60s_linear_infinite]">
                <div className="absolute inset-0 border border-primary/10 rounded-full rotate-45 transform scale-90"></div>
                <div className="absolute inset-0 border border-primary/10 rounded-full -rotate-45 transform scale-90"></div>
                <div className="absolute top-1/2 left-1/2 w-full h-[1px] bg-primary/10 -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute top-1/2 left-1/2 h-full w-[1px] bg-primary/10 -translate-x-1/2 -translate-y-1/2"></div>

                {/* Simulated pings */}
                <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-primary rounded-full shadow-glow animate-pulse"></div>
                <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-secondary rounded-full shadow-glow-purple animate-pulse delay-700"></div>
                <div className="absolute top-2/3 left-1/4 w-2 h-2 bg-primary rounded-full shadow-glow animate-bounce"></div>
              </div>
              <div className="absolute w-80 h-80 bg-primary/5 rounded-full blur-[100px]"></div>
            </div>

            <div className="grid grid-cols-3 gap-8 z-10 pt-8 border-t border-gray-200 dark:border-white/5">
              <StatItem label="Vận đơn Hoạt động" value={isLoadingPending ? "..." : pendingCount.toLocaleString()} color="text-primary" />
              <StatItem label="Tàu đang Di chuyển" value={isLoadingInProgress ? "..." : inProgressCount.toLocaleString()} color="text-secondary" />
              <StatItem label="Sự cố Độ trễ" value="3" color="text-red-400" />
            </div>
          </div>

          {/* Risk Alert Card - Right below Radar */}
          <div className="bg-white/50 dark:bg-surface-dark/50 backdrop-blur-md p-6 rounded-4xl border border-gray-200 dark:border-white/5">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <span className="material-icons-round text-red-400">warning</span>
                </div>
                <div>
                  <h3 className="font-bold dark:text-white">Cảnh báo Sự cố Chậm chễ</h3>
                  <p className="text-xs text-gray-500">3 vận đơn đang bị ảnh hưởng</p>
                </div>
              </div>
              <button className="text-[10px] font-bold text-red-400 bg-red-500/10 px-4 py-2 rounded-full hover:bg-red-500/20 transition">
                XỬ LÝ NGAY
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <RiskAlertItem
                shipmentId="TRK-9821-VN"
                location="Quốc lộ 1A, Thanh Hóa"
                delay="2 giờ 15 phút"
                reason="Tắc nghẽn giao thông"
                severity="high"
              />
              <RiskAlertItem
                shipmentId="TRK-4452-SG"
                location="Cảng Cát Lái, TP.HCM"
                delay="45 phút"
                reason="Kiểm tra hải quan"
                severity="medium"
              />
              <RiskAlertItem
                shipmentId="TRK-1129-HN"
                location="Sân bay Nội Bài"
                delay="30 phút"
                reason="Thời tiết xấu"
                severity="low"
              />
            </div>
          </div>
        </div>

        {/* Right Cards */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <ExchangeRateCard />


          <div className="bg-primary rounded-4xl p-8 text-black relative group hover:shadow-glow transition-all">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Dự báo Thị trường</h3>
              <span className="material-icons-round p-1 bg-black/5 rounded-lg">arrow_outward</span>
            </div>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold">21,105$</span>
              <span className="text-xs font-medium opacity-60">/ Đơn vị</span>
            </div>
            <div className="bg-black/5 rounded-2xl p-4 mb-6">
              <div className="flex justify-between text-[10px] font-bold uppercase mb-2">
                <span>Mục tiêu Tăng trưởng</span>
                <span>+28.21%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                <div className="bg-black h-full rounded-full w-[75%] transition-all duration-1000"></div>
              </div>
            </div>
            {/* Simple Bar Chart Decoration */}
            <div className="h-12 flex items-end gap-1.5 px-1">
              {[0.4, 0.6, 0.45, 0.8, 0.7, 0.95].map((h, i) => (
                <div key={i} className={`flex-1 rounded-t-sm transition-all duration-500 bg-black/${i === 5 ? '80' : '10'}`} style={{ height: `${h * 100}%` }}></div>
              ))}
            </div>
          </div>
        </div>
      </div>


      {/* Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/50 dark:bg-surface-dark/50 backdrop-blur-md p-8 rounded-4xl border border-gray-200 dark:border-white/5">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold">Đơn vị Kho hàng</h3>
            <button className="text-[10px] font-bold text-primary bg-primary/10 px-4 py-2 rounded-full hover:bg-primary/20 transition">XEM TẤT CẢ</button>
          </div>
          <div className="space-y-6">
            <InventoryItem icon="memory" name="Chipset AI-X100" sub="Kho A • 450 đơn vị" status="ỔN ĐỊNH" statusColor="text-green-500" />
            <InventoryItem icon="router" name="Hub 5G Quantum" sub="Kho B • 120 đơn vị" status="THẤP" statusColor="text-yellow-500" />
          </div>
        </div>

        <div className="md:col-span-2 bg-white/50 dark:bg-surface-dark/50 backdrop-blur-md p-8 rounded-4xl border border-gray-200 dark:border-white/5 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-bold">Thông lượng Mạng</h3>
              <p className="text-xs text-gray-500">Lưu lượng dữ liệu 24h (Tbps)</p>
            </div>
            <div className="flex gap-2">
              <span className="px-4 py-1.5 rounded-full text-[10px] font-bold bg-white dark:bg-accent-dark shadow-sm">NGÀY</span>
              <span className="px-4 py-1.5 rounded-full text-[10px] font-bold text-gray-400">TUẦN</span>
            </div>
          </div>
          <div className="flex-1 min-h-[160px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C084FC" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C084FC" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="val" stroke="#C084FC" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2230', border: 'none', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#C084FC' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div>
    <p className="text-[10px] text-gray-500 uppercase tracking-widest">{label}</p>
    <p className={`text-2xl font-mono font-bold mt-1 ${color}`}>{value}</p>
  </div>
);

// Component hiển thị tỷ giá ngoại tệ
const ExchangeRateCard = () => {
  const { usd, cny, totalVND, loading, lastUpdated, period, setPeriod } = useExchangeRates();

  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const formatRate = (rate: number) => {
    return new Intl.NumberFormat('vi-VN').format(rate);
  };

  // Lấy dữ liệu theo period đã chọn
  const getChangeValue = (currency: typeof usd) => {
    return period === 'week' ? currency.weeklyChange : currency.monthlyChange;
  };

  const getTrendData = (currency: typeof usd) => {
    return period === 'week' ? currency.weeklyTrend : currency.monthlyTrend;
  };

  // Skeleton shimmer cho text đang loading
  const SkeletonText = ({ width = '80px', height = '20px' }: { width?: string; height?: string }) => (
    <div
      className="rounded-md animate-pulse"
      style={{
        width,
        height,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.06) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    />
  );

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-4xl p-8 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform shadow-2xl">
      {/* Shimmer keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2"></div>

      {/* Header với toggle Tuần/Tháng */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Tỷ giá Ngoại tệ</p>
          {loading ? (
            <div className="mt-2"><SkeletonText width="180px" height="28px" /></div>
          ) : (
            <h3 className="text-2xl font-bold font-mono mt-2">{formatVND(totalVND)} ₫</h3>
          )}
          <p className="text-[10px] text-gray-500 mt-1">
            {loading
              ? 'Đang tải dữ liệu...'
              : lastUpdated ? `Cập nhật: ${lastUpdated.toLocaleTimeString('vi-VN')}` : ''}
          </p>
        </div>

        {/* Toggle Tuần/Tháng */}
        <div className="flex gap-0.5 bg-white/10 rounded-full p-0.5 backdrop-blur-md">
          <button
            onClick={() => setPeriod('week')}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${period === 'week'
              ? 'bg-primary text-black'
              : 'text-gray-400 hover:text-white'
              }`}
          >
            TUẦN
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${period === 'month'
              ? 'bg-primary text-black'
              : 'text-gray-400 hover:text-white'
              }`}
          >
            THÁNG
          </button>
        </div>
      </div>


      <div className="space-y-4 relative z-10">
        <CurrencyRow
          icon="attach_money"
          name={usd.name}
          code={usd.code}
          rate={loading ? null : formatRate(usd.rate)}
          change={getChangeValue(usd)}
          color="text-green-400"
          sparkData={getTrendData(usd)}
          period={period}
          loading={loading}
        />
        <CurrencyRow
          icon="currency_yuan"
          name={cny.name}
          code={cny.code}
          rate={loading ? null : formatRate(cny.rate)}
          change={getChangeValue(cny)}
          color="text-red-400"
          sparkData={getTrendData(cny)}
          period={period}
          loading={loading}
        />
      </div>
    </div>
  );
};


// Component hiển thị từng dòng tỷ giá
const CurrencyRow = ({ icon, name, code, rate, change, color, sparkData, period, loading }: any) => {
  const isPositive = change >= 0;
  const strokeColor = isPositive ? '#4ADE80' : '#F87171';
  const trendText = isPositive ? `+${change}%` : `${change}%`;
  const periodLabel = period === 'week' ? '/tuần' : '/tháng';

  const SkeletonInline = ({ width = '60px' }: { width?: string }) => (
    <div
      className="rounded-sm inline-block"
      style={{
        width,
        height: '14px',
        background: 'linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.06) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    />
  );

  return (
    <div className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-xl transition-all">
      <div className="flex items-center gap-4 flex-1">
        <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${color}`}>
          <span className="material-icons-round text-lg">{icon}</span>
        </div>
        <div>
          <p className="text-sm font-bold">{name}</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-tighter">{code}/VND</p>
        </div>
      </div>

      {/* Sparkline Chart */}
      <div className={`w-20 h-10 mx-4 ${loading ? 'opacity-30' : 'opacity-60'} group-hover:opacity-100 transition-opacity`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparkData}>
            <defs>
              <linearGradient id={`gradient-${code}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={loading ? '#6B7280' : strokeColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={loading ? '#6B7280' : strokeColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis domain={['dataMin', 'dataMax']} hide />
            <Area
              type="monotone"
              dataKey="v"
              stroke={loading ? '#6B7280' : strokeColor}
              strokeWidth={2}
              fill={`url(#gradient-${code})`}
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="text-right min-w-[80px]">
        {loading ? (
          <>
            <SkeletonInline width="70px" />
            <div className="mt-1"><SkeletonInline width="50px" /></div>
          </>
        ) : (
          <>
            <p className="font-mono text-sm">{rate} ₫</p>
            <p className={`text-[10px] font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {trendText}
              <span className="text-gray-500 font-normal ml-1">{periodLabel}</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
};




const AssetRow = ({ icon, name, code, amount, trend, color, sparkData }: any) => {
  // Trích xuất màu hexa từ class text-
  const strokeColor = color.includes('orange') ? '#FB923C' : '#C084FC';

  return (
    <div className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-xl transition-all">
      <div className="flex items-center gap-4 flex-1">
        <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${color}`}>
          <span className="material-icons-round text-lg">{icon}</span>
        </div>
        <div>
          <p className="text-sm font-bold">{name}</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-tighter">{code}</p>
        </div>
      </div>

      {/* Sparkline Chart */}
      <div className="w-16 h-8 mx-4 opacity-50 group-hover:opacity-100 transition-opacity">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparkData}>
            <Line
              type="monotone"
              dataKey="v"
              stroke={strokeColor}
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="text-right">
        <p className="font-mono text-sm">{amount} {code}</p>
        <p className="text-[10px] text-green-400 font-bold">{trend}</p>
      </div>
    </div>
  );
};

const InventoryItem = ({ icon, name, sub, status, statusColor }: any) => (
  <div className="flex items-center gap-4 group cursor-pointer">
    <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-accent-dark flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-black transition-all">
      <span className="material-icons-round">{icon}</span>
    </div>
    <div className="flex-1">
      <h4 className="text-sm font-bold dark:text-white">{name}</h4>
      <p className="text-xs text-gray-500">{sub}</p>
    </div>
    <span className={`text-[10px] font-mono font-bold px-3 py-1 rounded-lg ${statusColor} bg-white dark:bg-accent-dark shadow-sm`}>{status}</span>
  </div>
);

const RiskAlertItem = ({ shipmentId, location, delay, reason, severity }: {
  shipmentId: string;
  location: string;
  delay: string;
  reason: string;
  severity: 'high' | 'medium' | 'low';
}) => {
  const severityStyles = {
    high: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      dot: 'bg-red-500',
      text: 'text-red-400',
      icon: 'error'
    },
    medium: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      dot: 'bg-yellow-500',
      text: 'text-yellow-400',
      icon: 'warning'
    },
    low: {
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      dot: 'bg-orange-500',
      text: 'text-orange-400',
      icon: 'info'
    }
  };

  const styles = severityStyles[severity];

  return (
    <div className={`p-4 rounded-2xl ${styles.bg} border ${styles.border} group cursor-pointer hover:scale-[1.02] transition-all`}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-2 h-2 rounded-full ${styles.dot} animate-pulse mt-1.5`}></div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-sm font-bold dark:text-white">{shipmentId}</span>
            <span className={`text-xs font-bold ${styles.text}`}>+{delay}</span>
          </div>
          <p className="text-xs text-gray-500 mb-2">{location}</p>
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${styles.bg} ${styles.text}`}>
            <span className="material-icons-round text-xs">{styles.icon}</span>
            <span className="text-[10px] font-medium">{reason}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;
