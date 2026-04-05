const snapshotsToTrend = (snapshots, currency) => {
  const dailyMap = {};
  
  snapshots.forEach(s => {
    // Nhóm theo ngày (YYYY-MM-DD)
    const dateKey = s.capturedAt.split('T')[0];
    // Ghi đè để lấy bản ghi mới nhất của ngày đó
    dailyMap[dateKey] = s;
  });

  // Chuyển lại thành mảng và sắp xếp theo thời gian
  const uniqueSnapshots = Object.values(dailyMap).sort((a, b) => 
    a.capturedAt.localeCompare(b.capturedAt)
  );

  return uniqueSnapshots.map((s, i) => {
    const date = new Date(s.capturedAt);
    const label = i === uniqueSnapshots.length - 1
      ? 'Hôm nay'
      : date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    
    return { v: Math.round(s.rate), label };
  });
};

const calculateChange = (trend) => {
  if (trend.length < 2) return 0;
  const start = trend[0].v;
  const end = trend[trend.length - 1].v;
  return +((end - start) / start * 100).toFixed(2);
};

// --- Test cases ---

const dataNormal = [
  { capturedAt: '2026-04-01T10:00:00Z', rate: 25400, baseCurrency: 'VND', targetCurrency: 'USD' },
  { capturedAt: '2026-04-01T15:00:00Z', rate: 25420, baseCurrency: 'VND', targetCurrency: 'USD' }, // Ghi đè lấy bản cuối
  { capturedAt: '2026-04-02T10:00:00Z', rate: 25500, baseCurrency: 'VND', targetCurrency: 'USD' },
  { capturedAt: '2026-04-03T20:00:00Z', rate: 25450, baseCurrency: 'VND', targetCurrency: 'USD' },
];

const dataSingle = [
  { capturedAt: '2026-04-03T10:00:00Z', rate: 25450, baseCurrency: 'VND', targetCurrency: 'USD' },
];

console.log("=== TH1: Data chuẩn (có nhiều ngày và 1 ngày có nhiều record) ===");
const trendNormal = snapshotsToTrend(dataNormal, 'USD');
console.log(trendNormal);
console.log(`=> Change: ${calculateChange(trendNormal)}%\n`);

console.log("=== TH2: Data thiếu (Chỉ có 1 record duy nhất) ===");
const trendSingle = snapshotsToTrend(dataSingle, 'USD');
let finalTrendSingle = trendSingle;
// Mô phỏng fallback của fetchHistoryFromMongo
if (trendSingle.length === 1) {
  finalTrendSingle = [
    { v: trendSingle[0].v, label: `7 ngày trước` },
    ...trendSingle
  ];
}
console.log("Đã fix bù điểm nối:", finalTrendSingle);
console.log(`=> Change: ${calculateChange(finalTrendSingle)}%\n`);

console.log("=== TH3: DB trống (0 records) -> Dùng flatLine ===");
const currentRate = 25450;
const flatLine = [
  { v: currentRate, label: `7 ngày trước` },
  { v: currentRate, label: 'Hôm nay' }
];
console.log(flatLine);
console.log(`=> Change: ${calculateChange(flatLine)}%\n`);
