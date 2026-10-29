import type { FoodItem, MarkedDates } from '../app/(tabs)/calendar/foodTypes';
export function buildMarkedDates(items: FoodItem[], selected: string, today: string, primaryColor: string): MarkedDates {
    const marked: MarkedDates = {};
    items.forEach((item) => {
        // 使用予定日のマーキング
        if (item.usageDate) {
            if (!marked[item.usageDate]) {
                marked[item.usageDate] = { dots: [], marked: true };
            }
            marked[item.usageDate].dots?.push({
                color: primaryColor,
                selectedDotColor: '#ffffff',
            });
        }
        // 消費期限のマーキング
        if (item.expiryDate) {
            const isExpired = item.expiryDate < today;
            if (!marked[item.expiryDate]) {
                marked[item.expiryDate] = { dots: [], marked: true };
            }
            marked[item.expiryDate].dots?.push({
                color: isExpired ? '#ef4444' : '#FF7B53',
                selectedDotColor: '#ffffff',
            });
        }
    });
    // 選択された日付のハイライト
    if (marked[selected]) {
        marked[selected] = {
            ...marked[selected],
            selected: true,
            selectedColor: primaryColor,
        };
    }
    else {
        marked[selected] = {
            selected: true,
            selectedColor: primaryColor,
            dots: [],
        };
    }
    return marked;
}
