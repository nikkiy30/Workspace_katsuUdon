import type { WasteRecord } from '../database/types';
export type MonthlyCard = {
    key: string;
    label: string;
    total: number;
    comparison: string;
    weeklyData: number[];
};
// YYYY-MM キー
export const toYMKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
// 直近3ヶ月を左→右＝古い→新しい（右端が今月）で生成
export const buildRecentMonthlyCards = (baseDate = new Date()): MonthlyCard[] => {
    const cards: MonthlyCard[] = [];
    for (let i = 2; i >= 0; i--) {
        const dt = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
        const month = dt.getMonth() + 1;
        cards.push({
            key: toYMKey(dt),
            label: `${month}月`,
            total: 0,
            comparison: '—',
            weeklyData: [0, 0, 0, 0],
        });
    }
    return cards;
};
// レコードをカードへ集計
export const aggregateWasteForCards = (cards: MonthlyCard[], records: WasteRecord[]): MonthlyCard[] => {
    const next = cards.map(c => ({ ...c, total: 0, weeklyData: [0, 0, 0, 0], comparison: '—' }));
    const cardIndexByKey = new Map(next.map((c, i) => [c.key, i] as const));
    for (const r of records) {
        const d = safeParseDate(r.created_at);
        if (!d)
            continue;
        const key = toYMKey(d);
        const idx = cardIndexByKey.get(key);
        if (idx === undefined)
            continue; // 表示対象外の月はスキップ
        const day = d.getDate();
        const weekIdx = Math.min(3, Math.floor((day - 1) / 7)); // 1-7,8-14,15-21,22-
        next[idx].total += 1;
        next[idx].weeklyData[weekIdx] += 1;
    }
    // 先月比を計算（左→右 = 古い→新しい）
    for (let i = 1; i < next.length; i++) {
        const prev = next[i - 1].total;
        const curr = next[i].total;
        if (prev > 0) {
            const diff = ((curr - prev) / prev) * 100;
            const sign = diff === 0 ? '' : diff > 0 ? '+' : '';
            const arrow = diff > 0 ? '↑' : diff < 0 ? '↓' : '';
            next[i].comparison = `${sign}${Math.round(diff)}% ${arrow}`.trim();
        }
        else if (prev === 0 && curr > 0) {
            next[i].comparison = '+∞% ↑';
        }
        else {
            next[i].comparison = '—';
        }
    }
    return next;
};
// 日付安全パース
export const safeParseDate = (v: string): Date | null => {
    if (!v)
        return null;
    // ISO想定。もしスペース区切りの場合は 'YYYY-MM-DD HH:MM:SS' を ISO 風に補正
    const normalized = v.includes('T') ? v : v.replace(' ', 'T');
    const d = new Date(normalized);
    return isNaN(d.getTime()) ? null : d;
};
// 日時表示フォーマット: YYYY-MM-DD HH:mm
export const formatDateTime = (d: Date): string => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
};
