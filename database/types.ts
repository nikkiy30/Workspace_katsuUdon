/**
 //! プロフィールと廃棄データベース以外は一旦適当
 */

export interface Profile {
  household_size: string;
  cooking_frequency: string;
  shopping_frequency: string;
}

export interface WasteRecord {
  id: number;
  food_name: string;
  throw_amount: string;
  buy_amount: string;
  created_at: string;
}

export interface FoodItem {
  id?: number;
  user_id: number;
  food_name: string;
  amount?: string;
  purchase_date?: string;
  expiry_date?: string;
  storage_location?: 'fridge' | 'freezer' | 'pantry' | 'other';
  notes?: string;
  is_consumed?: boolean;
  consumed_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DiagnosisHistory {
  id?: number;
  user_id: number;
  food_name: string;
  amount?: string;
  expiry_date?: string;
  notes?: string;
  ai_recommendation?: string;
  purchase_decision?: boolean;
  diagnosis_date?: string;
}

// データベース操作の結果型
export interface DatabaseResult {
  lastInsertRowId?: number;
  changes?: number;
}

// 統計データ用の型
export interface WasteStatistics {
  total_waste_count: number;
  waste_this_month: number;
  most_wasted_food: string;
  average_waste_per_month: number;
}
