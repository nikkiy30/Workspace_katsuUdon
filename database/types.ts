/**
 * データベースの型定義
 */

export interface User {
  id?: number;
  email: string;
  name?: string;
  household_size?: number;
  cooking_frequency?: 'daily' | 'weekly' | 'monthly' | 'rarely';
  dietary_restrictions?: string[]; // JSONで保存
  shopping_frequency?: 'daily' | 'weekly' | 'monthly';
  created_at?: string;
  updated_at?: string;
}

export interface WasteRecord {
  id?: number;
  user_id: number;
  food_name: string;
  amount?: string;
  waste_reason?: 'expired' | 'spoiled' | 'too_much' | 'dislike' | 'other';
  purchase_date?: string;
  expiry_date?: string;
  waste_date: string;
  notes?: string;
  created_at?: string;
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

export interface UserProfile {
  user: User;
  waste_statistics: WasteStatistics;
  recent_waste_records: WasteRecord[];
}
