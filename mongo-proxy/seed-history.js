require('dotenv').config();
const { MongoClient } = require('mongodb');

// Sử dụng MONGO_URI từ .env hoặc mặc định
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27018';
const DATABASE = 'fe_erp_live';
const COLLECTION = 'exchange_rate_snapshots';

/**
 * Hàm tính % chênh lệch
 */
function calculatePercentChange(current, previous) {
    if (!previous || previous === 0) return 0;
    return +(((current - previous) / previous) * 100).toFixed(2);
}

async function seed() {
    console.log('⏳ Đang kết nối MongoDB...');
    const client = new MongoClient(MONGO_URI);
    
    try {
        await client.connect();
        const db = client.db(DATABASE);
        const col = db.collection(COLLECTION);
        
        // Để tính được biến động 30 ngày cho ngày 30/12/2025, ta cần dữ liệu từ cuối tháng 11/2025
        const endDate = new Date().toISOString().split('T')[0]; // Luôn lấy đến ngày hôm nay
        const startDate = '2025-11-20'; // Lấy dư ra để có mốc so sánh cho những ngày đầu tiên
        const url = `https://api.frankfurter.dev/v2/rates?from=${startDate}&to=${endDate}&base=USD&quotes=VND,CNY`;
        
        console.log(`🌐 Đang gọi API lấy dữ liệu từ ${startDate} đến ${endDate}...`);
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API error: ${response.statusText}`);
        const data = await response.json();
        
        if (!Array.isArray(data)) throw new Error('Dữ liệu API không đúng định dạng');

        // 1. Tổ chức dữ liệu theo ngày để dễ truy xuất
        const history = { USD: {}, CNY: {} };
        const dates = [];

        data.forEach(item => {
            if (!dates.includes(item.date)) dates.push(item.date);
            
            if (item.quote === 'VND') {
                history.USD[item.date] = item.rate;
            } else if (item.quote === 'CNY') {
                // Ta cần VND/USD để tính CNY/VND
                // Tỷ giá VND/USD được lưu trong quote 'VND' của cùng ngày đó
                const usdRate = data.find(d => d.date === item.date && d.quote === 'VND')?.rate;
                if (usdRate) {
                    history.CNY[item.date] = usdRate / item.rate;
                }
            }
        });

        dates.sort(); // Đảm bảo thứ tự thời gian

        const snapshots = [];
        
        // 2. Tính toán trend cho từng ngày
        for (let i = 0; i < dates.length; i++) {
            const currentDate = dates[i];
            
            ['USD', 'CNY'].forEach(currency => {
                const currentRate = history[currency][currentDate];
                if (!currentRate) return;

                // Tìm giá trị 7 ngày trước (hoặc gần nhất trước đó 7 ngày)
                // Vì API không có dữ liệu cuối tuần, ta lùi lại tối đa 10 ngày để tìm bản ghi thực tế
                let rate7d = null;
                let rate30d = null;

                // Tìm mốc 7 ngày
                for (let j = i - 1; j >= 0; j--) {
                    const diffDays = (new Date(currentDate) - new Date(dates[j])) / (1000 * 60 * 60 * 24);
                    if (diffDays >= 7 && diffDays <= 10 && !rate7d) {
                        rate7d = history[currency][dates[j]];
                    }
                    if (diffDays >= 30 && diffDays <= 35 && !rate30d) {
                        rate30d = history[currency][dates[j]];
                    }
                    if (diffDays > 35) break; 
                }

                snapshots.push({
                    baseCurrency: 'VND',
                    targetCurrency: currency,
                    rate: Math.round(currentRate),
                    change7d: calculatePercentChange(currentRate, rate7d),
                    change30d: calculatePercentChange(currentRate, rate30d),
                    source: 'frankfurter-historical',
                    capturedAt: new Date(currentDate + 'T00:00:00Z').toISOString(),
                    capturedBy: 'system-seed',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            });
        }

        // Lọc bớt những ngày quá cũ (chỉ giữ lại từ 30/12/2025 đến nay để lưu vào DB)
        const finalSnapshots = snapshots.filter(s => s.capturedAt >= '2025-12-30T00:00:00Z');

        console.log(`📦 Chuẩn bị lưu ${finalSnapshots.length} bản ghi có kèm trend...`);

        // 3. Cập nhật vào DB
        // Xóa các bản ghi cũ của frankfurter để tránh trùng
        await col.deleteMany({ source: 'frankfurter-historical' });
        // Cũng xóa cả bản ghi manual test hoặc exchangerate-api để dọn dẹp sạch sẽ
        await col.deleteMany({ source: { $in: ['manual-test', 'exchangerate-api'] } });

        const result = await col.insertMany(finalSnapshots);
        console.log(`✅ Thành công! Đã lưu ${result.insertedCount} bản ghi vào MongoDB.`);
        
    } catch (err) {
        console.error('❌ Thất bại:', err);
    } finally {
        await client.close();
        console.log('🔌 Đã ngắt kết nối.');
    }
}

seed();
