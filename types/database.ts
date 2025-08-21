export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          user_id: string
          occupation: 'housewife' | 'student' | 'other'
          living_situation: 'alone' | 'with_family' | 'other'
          cooking_frequency: number
          meal_size: 'small' | 'medium' | 'large'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          occupation: 'housewife' | 'student' | 'other'
          living_situation: 'alone' | 'with_family' | 'other'
          cooking_frequency: number
          meal_size: 'small' | 'medium' | 'large'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          occupation?: 'housewife' | 'student' | 'other'
          living_situation?: 'alone' | 'with_family' | 'other'
          cooking_frequency?: number
          meal_size?: 'small' | 'medium' | 'large'
          created_at?: string
          updated_at?: string
        }
      }
      food_items: {
        Row: {
          id: string
          name: string
          category: string
          typical_shelf_life_days: number
          storage_tips: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          typical_shelf_life_days: number
          storage_tips: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          typical_shelf_life_days?: number
          storage_tips?: string
          created_at?: string
        }
      }
      waste_records: {
        Row: {
          id: string
          user_id: string
          food_name: string
          waste_amount: number
          waste_unit: 'pieces' | 'percentage'
          purchase_amount: number
          purchase_unit: string
          waste_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          food_name: string
          waste_amount: number
          waste_unit: 'pieces' | 'percentage'
          purchase_amount: number
          purchase_unit: string
          waste_date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          food_name?: string
          waste_amount?: number
          waste_unit?: 'pieces' | 'percentage'
          purchase_amount?: number
          purchase_unit?: string
          waste_date?: string
          created_at?: string
        }
      }
      purchase_diagnoses: {
        Row: {
          id: string
          user_id: string
          food_name: string
          expiry_date: string
          planned_amount: number
          amount_unit: string
          ai_recommendation: string
          warning_level: 'low' | 'medium' | 'high'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          food_name: string
          expiry_date: string
          planned_amount: number
          amount_unit: string
          ai_recommendation: string
          warning_level: 'low' | 'medium' | 'high'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          food_name?: string
          expiry_date?: string
          planned_amount?: number
          amount_unit?: string
          ai_recommendation?: string
          warning_level?: 'low' | 'medium' | 'high'
          created_at?: string
        }
      }
    }
  }
}

export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type FoodItem = Database['public']['Tables']['food_items']['Row']
export type WasteRecord = Database['public']['Tables']['waste_records']['Row']
export type PurchaseDiagnosis = Database['public']['Tables']['purchase_diagnoses']['Row']