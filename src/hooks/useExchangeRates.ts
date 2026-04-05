import { useState, useEffect, useCallback } from 'react';

export type TimePeriod = 'week' | 'month';

interface TrendPoint {
    v: number;
    label?: string;
}

interface ExchangeRate {
    code: string;
    name: string;
    rate: number;
    weeklyChange: number;
    monthlyChange: number;
    weeklyTrend: TrendPoint[];
    monthlyTrend: TrendPoint[];
}

interface ExchangeRatesData {
    usd: ExchangeRate;
    cny: ExchangeRate;
    totalVND: number;
    loading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    period: TimePeriod;
    setPeriod: (period: TimePeriod) => void;
}

// Dữ liệu lịch sử tỷ giá giả lập (trong thực tế sẽ lấy từ API lịch sử)
const generateHistoricalData = (baseRate: number, days: number, volatility: number = 0.003): TrendPoint[] => {
    const data: TrendPoint[] = [];
    let currentRate = baseRate * (1 - volatility * days / 2); // Start from a lower point

    for (let i = 0; i < days; i++) {
        // Simulate realistic rate movement
        const change = (Math.random() - 0.45) * baseRate * volatility;
        currentRate = Math.max(currentRate + change, baseRate * 0.95);
        currentRate = Math.min(currentRate, baseRate * 1.05);

        data.push({
            v: Math.round(currentRate),
            label: `Ngày ${i + 1}`
        });
    }

    // Ensure last point is close to current rate
    data[data.length - 1] = { v: baseRate, label: 'Hôm nay' };

    return data;
};

const calculateChange = (trend: TrendPoint[]): number => {
    if (trend.length < 2) return 0;
    const startValue = trend[0].v;
    const endValue = trend[trend.length - 1].v;
    return +((endValue - startValue) / startValue * 100).toFixed(2);
};

const useExchangeRates = (): ExchangeRatesData => {
    const [period, setPeriod] = useState<TimePeriod>('week');
    const [data, setData] = useState<ExchangeRatesData>({
        usd: {
            code: 'USD',
            name: 'Đô la Mỹ',
            rate: 0,
            weeklyChange: 0,
            monthlyChange: 0,
            weeklyTrend: [],
            monthlyTrend: []
        },
        cny: {
            code: 'CNY',
            name: 'Nhân dân tệ',
            rate: 0,
            weeklyChange: 0,
            monthlyChange: 0,
            weeklyTrend: [],
            monthlyTrend: []
        },
        totalVND: 0,
        loading: true,
        error: null,
        lastUpdated: null,
        period: 'week',
        setPeriod: () => { }
    });

    const handleSetPeriod = useCallback((newPeriod: TimePeriod) => {
        setPeriod(newPeriod);
    }, []);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const response = await fetch(
                    'https://api.exchangerate-api.com/v4/latest/VND'
                );

                if (!response.ok) {
                    throw new Error('Không thể lấy tỷ giá');
                }

                const result = await response.json();

                const usdRate = Math.round(1 / result.rates.USD);
                const cnyRate = Math.round(1 / result.rates.CNY);

                // Generate historical data
                const usdWeeklyTrend = generateHistoricalData(usdRate, 7, 0.002);
                const usdMonthlyTrend = generateHistoricalData(usdRate, 30, 0.0015);
                const cnyWeeklyTrend = generateHistoricalData(cnyRate, 7, 0.003);
                const cnyMonthlyTrend = generateHistoricalData(cnyRate, 30, 0.002);

                const usdHolding = 10000;
                const cnyHolding = 50000;
                const totalVND = usdHolding * usdRate + cnyHolding * cnyRate;

                setData({
                    usd: {
                        code: 'USD',
                        name: 'Đô la Mỹ',
                        rate: usdRate,
                        weeklyChange: calculateChange(usdWeeklyTrend),
                        monthlyChange: calculateChange(usdMonthlyTrend),
                        weeklyTrend: usdWeeklyTrend,
                        monthlyTrend: usdMonthlyTrend
                    },
                    cny: {
                        code: 'CNY',
                        name: 'Nhân dân tệ',
                        rate: cnyRate,
                        weeklyChange: calculateChange(cnyWeeklyTrend),
                        monthlyChange: calculateChange(cnyMonthlyTrend),
                        weeklyTrend: cnyWeeklyTrend,
                        monthlyTrend: cnyMonthlyTrend
                    },
                    totalVND,
                    loading: false,
                    error: null,
                    lastUpdated: new Date(),
                    period,
                    setPeriod: handleSetPeriod
                });
            } catch (err) {
                // Fallback data
                const fallbackUsdRate = 25450;
                const fallbackCnyRate = 3490;

                const usdWeeklyTrend = [
                    { v: 25320 }, { v: 25380 }, { v: 25350 }, { v: 25400 },
                    { v: 25420 }, { v: 25430 }, { v: 25450 }
                ];
                const usdMonthlyTrend = generateHistoricalData(fallbackUsdRate, 30, 0.0015);
                const cnyWeeklyTrend = [
                    { v: 3450 }, { v: 3460 }, { v: 3470 }, { v: 3465 },
                    { v: 3480 }, { v: 3485 }, { v: 3490 }
                ];
                const cnyMonthlyTrend = generateHistoricalData(fallbackCnyRate, 30, 0.002);

                const usdHolding = 10000;
                const cnyHolding = 50000;

                setData({
                    usd: {
                        code: 'USD',
                        name: 'Đô la Mỹ',
                        rate: fallbackUsdRate,
                        weeklyChange: calculateChange(usdWeeklyTrend),
                        monthlyChange: calculateChange(usdMonthlyTrend),
                        weeklyTrend: usdWeeklyTrend,
                        monthlyTrend: usdMonthlyTrend
                    },
                    cny: {
                        code: 'CNY',
                        name: 'Nhân dân tệ',
                        rate: fallbackCnyRate,
                        weeklyChange: calculateChange(cnyWeeklyTrend),
                        monthlyChange: calculateChange(cnyMonthlyTrend),
                        weeklyTrend: cnyWeeklyTrend,
                        monthlyTrend: cnyMonthlyTrend
                    },
                    totalVND: usdHolding * fallbackUsdRate + cnyHolding * fallbackCnyRate,
                    loading: false,
                    error: 'Sử dụng tỷ giá dự phòng',
                    lastUpdated: new Date(),
                    period,
                    setPeriod: handleSetPeriod
                });
            }
        };

        fetchRates();
        const interval = setInterval(fetchRates, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [period, handleSetPeriod]);

    return { ...data, period, setPeriod: handleSetPeriod };
};

export default useExchangeRates;
