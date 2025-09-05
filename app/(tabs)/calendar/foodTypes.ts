export interface FoodItem {
  id: string;
  name: string;
  quantity: string;
  expiryDate?: string;
  usageDate?: string;
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
