require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

// ─── Config ──────────────────────────────────────────────────────
const PORT = process.env.PORT || 3100;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27018';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ─── MongoDB Connection ─────────────────────────────────────────
let client;
let isConnected = false;

async function connectMongo() {
  try {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    isConnected = true;
    console.log(`✅ Connected to MongoDB: ${MONGO_URI}`);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

function getDb(dbName) {
  if (!isConnected) throw new Error('MongoDB not connected');
  return client.db(dbName);
}

// ─── Health Check ────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: isConnected ? 'ok' : 'disconnected', mongo: MONGO_URI });
});

// ─── Generic CRUD Routes ────────────────────────────────────────
// Tất cả routes match với cấu trúc mà FE client.ts đang gọi:
//   POST /:database/:collection/:operation

// FIND — db.collection.find(filter, options)
app.post('/:database/:collection/find', async (req, res) => {
  try {
    const { database, collection } = req.params;
    const { filter = {}, sort, limit, skip } = req.body;
    const db = getDb(database);

    let cursor = db.collection(collection).find(filter);
    if (sort) cursor = cursor.sort(sort);
    if (skip) cursor = cursor.skip(skip);
    if (limit) cursor = cursor.limit(limit);

    const documents = await cursor.toArray();
    res.json({ documents });
  } catch (err) {
    console.error('[find]', err.message);
    res.status(500).json({ message: err.message });
  }
});

// FIND ONE — db.collection.findOne(filter)
app.post('/:database/:collection/findOne', async (req, res) => {
  try {
    const { database, collection } = req.params;
    const { filter = {} } = req.body;
    const db = getDb(database);

    const document = await db.collection(collection).findOne(filter);
    res.json({ document });
  } catch (err) {
    console.error('[findOne]', err.message);
    res.status(500).json({ message: err.message });
  }
});

// INSERT ONE — db.collection.insertOne(document)
app.post('/:database/:collection/insertOne', async (req, res) => {
  try {
    const { database, collection } = req.params;
    const { document } = req.body;
    const db = getDb(database);

    const result = await db.collection(collection).insertOne(document);
    res.json({ insertedId: result.insertedId.toString() });
  } catch (err) {
    console.error('[insertOne]', err.message);
    res.status(500).json({ message: err.message });
  }
});

// INSERT MANY — db.collection.insertMany(documents)
app.post('/:database/:collection/insertMany', async (req, res) => {
  try {
    const { database, collection } = req.params;
    const { documents } = req.body;
    const db = getDb(database);

    const result = await db.collection(collection).insertMany(documents);
    const insertedIds = Object.values(result.insertedIds).map((id) => id.toString());
    res.json({ insertedIds });
  } catch (err) {
    console.error('[insertMany]', err.message);
    res.status(500).json({ message: err.message });
  }
});

// UPDATE ONE — db.collection.updateOne(filter, update)
app.post('/:database/:collection/updateOne', async (req, res) => {
  try {
    const { database, collection } = req.params;
    const { filter = {}, update = {} } = req.body;
    const db = getDb(database);

    const result = await db.collection(collection).updateOne(filter, update);
    res.json({
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error('[updateOne]', err.message);
    res.status(500).json({ message: err.message });
  }
});

// DELETE ONE — db.collection.deleteOne(filter)
app.post('/:database/:collection/deleteOne', async (req, res) => {
  try {
    const { database, collection } = req.params;
    const { filter = {} } = req.body;
    const db = getDb(database);

    const result = await db.collection(collection).deleteOne(filter);
    res.json({ deletedCount: result.deletedCount });
  } catch (err) {
    console.error('[deleteOne]', err.message);
    res.status(500).json({ message: err.message });
  }
});

// COUNT — db.collection.countDocuments(filter)
app.post('/:database/:collection/count', async (req, res) => {
  try {
    const { database, collection } = req.params;
    const { filter = {} } = req.body;
    const db = getDb(database);

    const count = await db.collection(collection).countDocuments(filter);
    res.json({ count });
  } catch (err) {
    console.error('[count]', err.message);
    res.status(500).json({ message: err.message });
  }
});

// AGGREGATE — db.collection.aggregate(pipeline)
app.post('/:database/:collection/aggregate', async (req, res) => {
  try {
    const { database, collection } = req.params;
    const { pipeline = [] } = req.body;
    const db = getDb(database);

    const documents = await db.collection(collection).aggregate(pipeline).toArray();
    res.json({ documents });
  } catch (err) {
    console.error('[aggregate]', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ─── Auto Backfill ───────────────────────────────────────────────
// Tự động bù data exchange rate bị thiếu khi server khởi động
// hoặc khi chạy daily schedule

const BACKFILL_DB = 'fe_erp_live';
const BACKFILL_COLLECTION = 'exchange_rate_snapshots';

function calculatePercentChange(current, previous) {
  if (!previous || previous === 0) return 0;
  return +(((current - previous) / previous) * 100).toFixed(2);
}

async function autoBackfill() {
  try {
    const db = getDb(BACKFILL_DB);
    const col = db.collection(BACKFILL_COLLECTION);

    // 1. Tìm ngày cuối cùng có data trong DB
    const latestDoc = await col.findOne(
      { source: { $in: ['frankfurter-historical', 'exchangerate-api'] } },
      { sort: { capturedAt: -1 } }
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    let lastDateStr;
    if (latestDoc) {
      lastDateStr = latestDoc.capturedAt.split('T')[0];
    } else {
      // Nếu DB trống → seed từ 40 ngày trước
      const d = new Date(today);
      d.setDate(d.getDate() - 40);
      lastDateStr = d.toISOString().split('T')[0];
    }

    // 2. Kiểm tra có cần backfill không
    const lastDate = new Date(lastDateStr);
    const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      console.log(`✅ [Backfill] Data đã cập nhật đến ${lastDateStr}. Không cần backfill.`);
      return;
    }

    console.log(`⚠️  [Backfill] Phát hiện thiếu ${diffDays} ngày data (last: ${lastDateStr}, today: ${todayStr})`);

    // 3. Lấy data từ Frankfurter API 
    // Cần lấy thêm 35 ngày trước lastDate để tính change7d/change30d
    const extendedStart = new Date(lastDate);
    extendedStart.setDate(extendedStart.getDate() - 35);
    const startStr = extendedStart.toISOString().split('T')[0];

    const url = `https://api.frankfurter.dev/v2/rates?from=${startStr}&to=${todayStr}&base=USD&quotes=VND,CNY`;
    console.log(`🌐 [Backfill] Fetching: ${startStr} → ${todayStr}`);

    const response = await fetch(url);
    if (!response.ok) {
      console.error(`❌ [Backfill] API error: ${response.statusText}`);
      return;
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      console.error('❌ [Backfill] Dữ liệu API không đúng định dạng');
      return;
    }

    // 4. Tổ chức dữ liệu theo ngày
    const history = { USD: {}, CNY: {} };
    const dates = [];

    data.forEach(item => {
      if (!dates.includes(item.date)) dates.push(item.date);
      if (item.quote === 'VND') {
        history.USD[item.date] = item.rate;
      } else if (item.quote === 'CNY') {
        const usdRate = data.find(d => d.date === item.date && d.quote === 'VND')?.rate;
        if (usdRate) {
          history.CNY[item.date] = usdRate / item.rate;
        }
      }
    });

    dates.sort();

    // 5. Tạo snapshots CHỈ cho các ngày mới (sau lastDate)
    const snapshots = [];
    for (let i = 0; i < dates.length; i++) {
      const currentDate = dates[i];
      // Chỉ tạo snapshot cho ngày SAU lastDate
      if (currentDate <= lastDateStr) continue;

      ['USD', 'CNY'].forEach(currency => {
        const currentRate = history[currency][currentDate];
        if (!currentRate) return;

        let rate7d = null;
        let rate30d = null;

        for (let j = i - 1; j >= 0; j--) {
          const diffD = (new Date(currentDate) - new Date(dates[j])) / (1000 * 60 * 60 * 24);
          if (diffD >= 7 && diffD <= 10 && !rate7d) {
            rate7d = history[currency][dates[j]];
          }
          if (diffD >= 30 && diffD <= 35 && !rate30d) {
            rate30d = history[currency][dates[j]];
          }
          if (diffD > 35) break;
        }

        snapshots.push({
          baseCurrency: 'VND',
          targetCurrency: currency,
          rate: Math.round(currentRate),
          change7d: calculatePercentChange(currentRate, rate7d),
          change30d: calculatePercentChange(currentRate, rate30d),
          source: 'frankfurter-historical',
          capturedAt: new Date(currentDate + 'T00:00:00Z').toISOString(),
          capturedBy: 'system-backfill',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });
    }

    if (snapshots.length === 0) {
      console.log('✅ [Backfill] Không có ngày nào cần bù (Frankfurter không có data cuối tuần/lễ).');
      return;
    }

    const result = await col.insertMany(snapshots);
    console.log(`✅ [Backfill] Đã bù ${result.insertedCount} bản ghi (${snapshots.length / 2} ngày × 2 currencies)`);
  } catch (err) {
    console.error('❌ [Backfill] Error:', err.message);
  }
}

// ─── Start Server ────────────────────────────────────────────────
connectMongo().then(async () => {
  // Chạy backfill ngay khi khởi động
  await autoBackfill();

  app.listen(PORT, () => {
    console.log(`🚀 Mongo REST Proxy running on http://localhost:${PORT}`);
    console.log(`   MongoDB: ${MONGO_URI}`);
    console.log(`   Health:  http://localhost:${PORT}/health`);
  });

  // Schedule backfill mỗi 24h
  setInterval(autoBackfill, 24 * 60 * 60 * 1000);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  if (client) await client.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (client) await client.close();
  process.exit(0);
});
