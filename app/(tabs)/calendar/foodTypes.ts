export interface FoodItem {
  id: string;
  name: string;
  quantity: string;
  expiryDate?: string;
  usageDate?: string;
  usageAmount?: string; // その使用予定日に使う量（例: "200g"）
}

export interface MarkedDates {
  [date: string]: {
    marked?: boolean;
    selected?: boolean;
    selectedColor?: string;
    dots?: Array<{
      color: string;
      selectedDotColor?: string;
    }>;
  };
}
