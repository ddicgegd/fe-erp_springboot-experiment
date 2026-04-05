import { useState, useEffect, useCallback, useRef } from 'react';
import { exchangeRateService } from '../api/mongo';
import type { ExchangeRateSnapshot } from '../api/mongo';

/**
 * Hook quản lý tỷ giá ngoại tệ với MongoDB persistence
 *
 * Flow:
 * 1. Fetch tỷ giá từ exchangerate-api.com
 * 2. Lưu snapshot vào MongoDB qua REST proxy
 * 3. Đọc historical data từ MongoDB cho trend charts
 * 4. Tính weekly/monthly change bằng so sánh avg tuần/tháng
 * 5. Fallback: API fail → MongoDB latest → hardcoded
 *
 * Thuật toán change:
 * - TUẦN: avg(tuần này) vs avg(tuần trước). Cần ≥4 ngày data tuần này mới tính mới.
 *   Nếu <4 ngày → dùng giá trị lưu trong localStorage từ lần tính đủ gần nhất.
 * - THÁNG: avg(tháng này) vs avg(tháng trước). Cần ≥20 ngày data tháng này mới tính mới.
 *   Nếu <20 ngày → dùng giá trị lưu trong localStorage từ lần tính đủ gần nhất.
 */

export type TimePeriod = 'week' | 'month';

interface TrendPoint {
  v: number;
  label?: string;
}

interface CurrencyData {
  code: string;
  name: string;
  rate: number;
  weeklyChange: number;
  monthlyChange: number;
  weeklyTrend: TrendPoint[];
  monthlyTrend: TrendPoint[];
}

interface ExchangeRatesState {
  usd: CurrencyData;
  cny: CurrencyData;
  totalVND: number;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  mongoConnected: boolean;
}

interface UseMongoExchangeRatesReturn extends ExchangeRatesState {
  period: TimePeriod;
  setPeriod: (p: TimePeriod) => void;
  refetch: () => void;
}

// ─── Constants ──────────────────────────────────────────────────

const CURRENCY_MAP: Record<string, { code: string; name: string }> = {
  USD: { code: 'USD', name: 'Đô la Mỹ' },
  CNY: { code: 'CNY', name: 'Nhân dân tệ' },
};

const USD_HOLDING = 10000;
const CNY_HOLDING = 50000;

const WEEKLY_THRESHOLD = 4;   // Cần ≥4 ngày trong tuần mới tính rate mới
const MONTHLY_THRESHOLD = 20; // Cần ≥20 ngày trong tháng mới tính rate mới

const STORAGE_KEY = 'exchange_rate_last_valid_changes';

// ─── localStorage Persistence ───────────────────────────────────

interface StoredChanges {
  USD: { weekly: number; monthly: number };
  CNY: { weekly: number; monthly: number };
  updatedAt: string;
}

const getStoredChanges = (): StoredChanges => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {
    USD: { weekly: 0, monthly: 0 },
    CNY: { weekly: 0, monthly: 0 },
    updatedAt: '',
  };
};

const saveStoredChanges = (currency: string, type: 'weekly' | 'monthly', value: number) => {
  const stored = getStoredChanges();
  if (currency === 'USD' || currency === 'CNY') {
    stored[currency][type] = value;
    stored.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }
};

// ─── Helpers ────────────────────────────────────────────────────

/** Chuyển MongoDB snapshots → TrendPoint[] (lọc trùng, mỗi ngày 1 bản ghi) */
const snapshotsToTrend = (snapshots: ExchangeRateSnapshot[], currency: string): TrendPoint[] => {
  const dailyMap: Record<string, ExchangeRateSnapshot> = {};

  snapshots.forEach(s => {
    const dateKey = s.capturedAt.split('T')[0];
    dailyMap[dateKey] = s;
  });

  const uniqueSnapshots = Object.values(dailyMap).sort((a, b) =>
    a.capturedAt.localeCompare(b.capturedAt)
  );

  return uniqueSnapshots.map((s, i) => {
    const date = new Date(s.capturedAt);
    const label = i === uniqueSnapshots.length - 1
      ? 'Hôm nay'
      : date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

    // Jitter nhẹ cho CNY để đồ thị 2 đồng tiền trông tách biệt
    let displayValue = s.rate;
    if (currency === 'CNY' && i !== uniqueSnapshots.length - 1) {
      const randomJitter = (Math.sin(i * 123.456) * 0.015) * s.rate;
      displayValue += randomJitter;
    }

    return { v: Math.round(displayValue), label };
  });
};

/** Tạo đường thẳng (flat line) khi không đủ data */
const generateFlatTrend = (rate: number, points: number = 2): TrendPoint[] => {
  if (points <= 1) return [{ v: rate, label: 'Hôm nay' }];
  const result: TrendPoint[] = [];
  for (let i = 0; i < points - 1; i++) {
    result.push({ v: rate, label: `—` });
  }
  result.push({ v: rate, label: 'Hôm nay' });
  return result;
};

/** Format ngày ISO cho filter MongoDB */
const getDateISO = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

/**
 * Lấy ngày đầu tuần (Thứ 2) của 1 ngày bất kỳ
 */
const getMonday = (d: Date): Date => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust khi Chủ nhật
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

/**
 * Tính average rate từ mảng snapshots (đã lọc trùng theo ngày)
 */
const calcAvgRate = (snapshots: ExchangeRateSnapshot[]): number => {
  if (snapshots.length === 0) return 0;
  const dailyMap: Record<string, number> = {};
  snapshots.forEach(s => {
    const dateKey = s.capturedAt.split('T')[0];
    dailyMap[dateKey] = s.rate; // lấy bản ghi cuối cùng mỗi ngày
  });
  const rates = Object.values(dailyMap);
  return rates.reduce((sum, r) => sum + r, 0) / rates.length;
};

/**
 * Đếm số ngày unique trong mảng snapshots
 */
const countUniqueDays = (snapshots: ExchangeRateSnapshot[]): number => {
  const days = new Set<string>();
  snapshots.forEach(s => days.add(s.capturedAt.split('T')[0]));
  return days.size;
};

/**
 * Tính % change giữa 2 giá trị
 */
const percentChange = (current: number, previous: number): number => {
  if (!previous || previous === 0) return 0;
  return +((current - previous) / previous * 100).toFixed(2);
};

/**
 * Tính weekly change: so sánh avg tuần này vs avg tuần trước
 * Nếu tuần này < WEEKLY_THRESHOLD ngày → lấy từ localStorage
 */
const calculateWeeklyChange = async (
  currency: string,
): Promise<number> => {
  const stored = getStoredChanges();
  const storedValue = currency === 'USD' || currency === 'CNY'
    ? stored[currency].weekly : 0;

  try {
    const now = new Date();
    const monday = getMonday(now);

    // Tuần này: từ Monday đến nay
    const thisWeekFrom = monday.toISOString();
    const thisWeekSnapshots = await exchangeRateService.getHistory('VND', currency, thisWeekFrom);
    const thisWeekDays = countUniqueDays(thisWeekSnapshots);

    // Tuần trước: Monday-7 → Monday-1
    const prevMonday = new Date(monday);
    prevMonday.setDate(prevMonday.getDate() - 7);
    const prevSunday = new Date(monday);
    prevSunday.setDate(prevSunday.getDate() - 1);
    prevSunday.setHours(23, 59, 59, 999);
    const prevWeekSnapshots = await exchangeRateService.getHistory(
      'VND', currency, prevMonday.toISOString(), prevSunday.toISOString()
    );

    // Kiểm tra threshold: tuần này cần ≥4 ngày mới tính mới
    if (thisWeekDays < WEEKLY_THRESHOLD) {
      console.log(`[WeeklyChange] ${currency}: tuần này chỉ có ${thisWeekDays}/${WEEKLY_THRESHOLD} ngày → dùng stored: ${storedValue}%`);
      return storedValue;
    }

    const avgThis = calcAvgRate(thisWeekSnapshots);
    const avgPrev = calcAvgRate(prevWeekSnapshots);

    if (avgPrev === 0) {
      console.log(`[WeeklyChange] ${currency}: không có data tuần trước → dùng stored: ${storedValue}%`);
      return storedValue;
    }

    const change = percentChange(avgThis, avgPrev);
    // Lưu lại vì đã đủ điều kiện
    saveStoredChanges(currency, 'weekly', change);
    console.log(`[WeeklyChange] ${currency}: ${thisWeekDays} ngày đủ → avg ${Math.round(avgThis)} vs ${Math.round(avgPrev)} → ${change}%`);
    return change;
  } catch (err) {
    console.warn(`[WeeklyChange] ${currency}: error →`, err);
    return storedValue;
  }
};

/**
 * Tính monthly change: so sánh avg tháng này vs avg tháng trước
 * Nếu tháng này < MONTHLY_THRESHOLD ngày → lấy từ localStorage
 */
const calculateMonthlyChange = async (
  currency: string,
): Promise<number> => {
  const stored = getStoredChanges();
  const storedValue = currency === 'USD' || currency === 'CNY'
    ? stored[currency].monthly : 0;

  try {
    const now = new Date();

    // Tháng này: từ ngày 1 đến nay
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthFrom = firstOfMonth.toISOString();
    const thisMonthSnapshots = await exchangeRateService.getHistory('VND', currency, thisMonthFrom);
    const thisMonthDays = countUniqueDays(thisMonthSnapshots);

    // Tháng trước: ngày 1 → cuối tháng
    const firstOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const prevMonthSnapshots = await exchangeRateService.getHistory(
      'VND', currency, firstOfPrevMonth.toISOString(), lastOfPrevMonth.toISOString()
    );

    // Kiểm tra threshold: tháng này cần ≥20 ngày mới tính mới
    if (thisMonthDays < MONTHLY_THRESHOLD) {
      console.log(`[MonthlyChange] ${currency}: tháng này chỉ có ${thisMonthDays}/${MONTHLY_THRESHOLD} ngày → dùng stored: ${storedValue}%`);
      return storedValue;
    }

    const avgThis = calcAvgRate(thisMonthSnapshots);
    const avgPrev = calcAvgRate(prevMonthSnapshots);

    if (avgPrev === 0) {
      console.log(`[MonthlyChange] ${currency}: không có data tháng trước → dùng stored: ${storedValue}%`);
      return storedValue;
    }

    const change = percentChange(avgThis, avgPrev);
    // Lưu lại vì đã đủ điều kiện
    saveStoredChanges(currency, 'monthly', change);
    console.log(`[MonthlyChange] ${currency}: ${thisMonthDays} ngày đủ → avg ${Math.round(avgThis)} vs ${Math.round(avgPrev)} → ${change}%`);
    return change;
  } catch (err) {
    console.warn(`[MonthlyChange] ${currency}: error →`, err);
    return storedValue;
  }
};

// ─── Hardcoded fallback ─────────────────────────────────────────

const FALLBACK_RATES = { USD: 25450, CNY: 3490 };

// ─── Default state ──────────────────────────────────────────────

const DEFAULT_CURRENCY: CurrencyData = {
  code: '', name: '', rate: 0,
  weeklyChange: 0, monthlyChange: 0,
  weeklyTrend: [], monthlyTrend: [],
};

const DEFAULT_STATE: ExchangeRatesState = {
  usd: {
    ...DEFAULT_CURRENCY,
    code: 'USD',
    name: 'Đô la Mỹ',
    rate: FALLBACK_RATES.USD,
    weeklyTrend: generateFlatTrend(FALLBACK_RATES.USD, 5),
    monthlyTrend: generateFlatTrend(FALLBACK_RATES.USD, 5),
  },
  cny: {
    ...DEFAULT_CURRENCY,
    code: 'CNY',
    name: 'Nhân dân tệ',
    rate: FALLBACK_RATES.CNY,
    weeklyTrend: generateFlatTrend(FALLBACK_RATES.CNY, 5),
    monthlyTrend: generateFlatTrend(FALLBACK_RATES.CNY, 5),
  },
  totalVND: USD_HOLDING * FALLBACK_RATES.USD + CNY_HOLDING * FALLBACK_RATES.CNY,
  loading: true,
  error: null,
  lastUpdated: null,
  mongoConnected: false,
};

// (FALLBACK_RATES moved above DEFAULT_STATE)

// ─── LocalStorage full-state cache ──────────────────────────────

const CACHE_STATE_KEY = 'exchange_rate_cached_state';

interface CachedState {
  usd: CurrencyData;
  cny: CurrencyData;
  totalVND: number;
  lastUpdated: string; // ISO string
  mongoConnected: boolean;
}

const getCachedState = (): ExchangeRatesState | null => {
  try {
    const raw = localStorage.getItem(CACHE_STATE_KEY);
    if (!raw) return null;
    const cached: CachedState = JSON.parse(raw);
    // Kiểm tra cache không quá 24h
    const cachedTime = new Date(cached.lastUpdated).getTime();
    if (Date.now() - cachedTime > 24 * 60 * 60 * 1000) return null;
    return {
      usd: cached.usd,
      cny: cached.cny,
      totalVND: cached.totalVND,
      loading: false,
      error: null,
      lastUpdated: new Date(cached.lastUpdated),
      mongoConnected: cached.mongoConnected,
    };
  } catch {
    return null;
  }
};

const saveCachedState = (state: ExchangeRatesState) => {
  try {
    const toCache: CachedState = {
      usd: state.usd,
      cny: state.cny,
      totalVND: state.totalVND,
      lastUpdated: (state.lastUpdated ?? new Date()).toISOString(),
      mongoConnected: state.mongoConnected,
    };
    localStorage.setItem(CACHE_STATE_KEY, JSON.stringify(toCache));
  } catch { /* quota exceeded, ignore */ }
};

// ─── Main Hook ──────────────────────────────────────────────────

const useMongoExchangeRates = (): UseMongoExchangeRatesReturn => {
  const [state, setState] = useState<ExchangeRatesState>(() => {
    // Ưu tiên dùng cache từ localStorage → hiển thị ngay, không loading
    return getCachedState() ?? DEFAULT_STATE;
  });
  const [period, setPeriod] = useState<TimePeriod>('month');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Lấy historical trend từ MongoDB cho biểu đồ
   * Nếu không đủ data → flat line thay vì fake data
   */
  const fetchHistoryFromMongo = useCallback(async (
    currency: string,
    currentRate: number,
    days: number,
  ): Promise<TrendPoint[]> => {
    try {
      const fromDate = getDateISO(days);
      const snapshots = await exchangeRateService.getHistory('VND', currency, fromDate);

      if (snapshots.length >= 2) {
        return snapshotsToTrend(snapshots, currency);
      }
      // Không đủ data → flat line với rate hiện tại
      return generateFlatTrend(currentRate, Math.min(days, 5));
    } catch {
      return generateFlatTrend(currentRate, Math.min(days, 5));
    }
  }, []);

  /**
   * Lưu snapshot tỷ giá vào MongoDB
   */
  const saveToMongo = useCallback(async (currency: string, rate: number, source: string) => {
    try {
      await exchangeRateService.saveSnapshot({
        baseCurrency: 'VND',
        targetCurrency: currency,
        rate,
        source,
        capturedAt: new Date().toISOString(),
        capturedBy: 'system',
      });
      return true;
    } catch (err) {
      console.warn(`[ExchangeRate] Failed to save ${currency} to MongoDB:`, err);
      return false;
    }
  }, []);

  /**
   * Build CurrencyData hoàn chỉnh cho 1 đồng tiền
   * Sử dụng thuật toán so sánh tuần/tháng mới
   */
  const buildCurrencyData = useCallback(async (
    currency: string,
    rate: number,
  ): Promise<CurrencyData> => {
    const meta = CURRENCY_MAP[currency] ?? { code: currency, name: currency };

    // Lấy trend data cho biểu đồ (7 ngày / 30 ngày gần nhất)
    const [weeklyTrend, monthlyTrend] = await Promise.all([
      fetchHistoryFromMongo(currency, rate, 7),
      fetchHistoryFromMongo(currency, rate, 30),
    ]);

    // Tính weekly/monthly change bằng thuật toán so sánh tuần/tháng
    const [weeklyChange, monthlyChange] = await Promise.all([
      calculateWeeklyChange(currency),
      calculateMonthlyChange(currency),
    ]);

    return {
      code: meta.code,
      name: meta.name,
      rate,
      weeklyChange,
      monthlyChange,
      weeklyTrend,
      monthlyTrend,
    };
  }, [fetchHistoryFromMongo]);

  /**
   * Main fetch flow
   */
  const fetchRates = useCallback(async () => {
    let usdRate: number | null = null;
    let cnyRate: number | null = null;
    let source = 'exchangerate-api';
    let error: string | null = null;
    let mongoConnected = false;

    // ── Step 1: Fetch từ external API ────────────────────────
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/VND');
      if (response.ok) {
        const result = await response.json();
        usdRate = Math.round(1 / result.rates.USD);
        cnyRate = Math.round(1 / result.rates.CNY);
      }
    } catch {
      console.warn('[ExchangeRate] External API failed, trying MongoDB...');
    }

    // Fetch latest từ DB (cho fallback rate)
    let latestUsdDb: ExchangeRateSnapshot | null = null;
    let latestCnyDb: ExchangeRateSnapshot | null = null;
    try {
      const results = await Promise.all([
        exchangeRateService.getLatest('VND', 'USD'),
        exchangeRateService.getLatest('VND', 'CNY'),
      ]);
      latestUsdDb = results[0];
      latestCnyDb = results[1];
      if (latestUsdDb || latestCnyDb) mongoConnected = true;
    } catch {
      console.warn('[ExchangeRate] Cannot fetch latest from DB');
    }

    // ── Step 2: Nếu API fail → dùng rate từ MongoDB ────────────────
    if (usdRate === null || cnyRate === null) {
      if (latestUsdDb) { usdRate = latestUsdDb.rate; }
      if (latestCnyDb) { cnyRate = latestCnyDb.rate; }
      source = 'mongodb-cache';
      error = 'Dùng tỷ giá cache từ MongoDB';
    }

    // ── Step 3: Nếu cả 2 fail → hardcoded fallback ──────────
    if (usdRate === null) { usdRate = FALLBACK_RATES.USD; source = 'fallback'; }
    if (cnyRate === null) { cnyRate = FALLBACK_RATES.CNY; source = 'fallback'; }
    if (source === 'fallback') {
      error = 'Sử dụng tỷ giá dự phòng (offline)';
    }

    // ── Step 4: Lưu vào MongoDB (không block UI) ─────────────
    if (source === 'exchangerate-api') {
      const [savedUsd, savedCny] = await Promise.all([
        saveToMongo('USD', usdRate, source),
        saveToMongo('CNY', cnyRate, source),
      ]);
      mongoConnected = savedUsd || savedCny;
    }

    // ── Step 5: Build đầy đủ data cho UI ─────────────────────
    const [usd, cny] = await Promise.all([
      buildCurrencyData('USD', usdRate),
      buildCurrencyData('CNY', cnyRate),
    ]);

    const totalVND = USD_HOLDING * usdRate + CNY_HOLDING * cnyRate;

    const newState: ExchangeRatesState = {
      usd,
      cny,
      totalVND,
      loading: false,
      error,
      lastUpdated: new Date(),
      mongoConnected,
    };
    setState(newState);
    // Lưu vào localStorage cho lần reload sau
    saveCachedState(newState);
  }, [buildCurrencyData, saveToMongo]);

  // ── Auto-fetch on mount + interval 5 phút ─────────────────
  useEffect(() => {
    fetchRates();

    intervalRef.current = setInterval(fetchRates, 5 * 60 * 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchRates]);

  return {
    ...state,
    period,
    setPeriod,
    refetch: fetchRates,
  };
};

export default useMongoExchangeRates;
