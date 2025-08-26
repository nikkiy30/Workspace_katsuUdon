/**
 * カレンダーアプリで使用する型定義
 * 初心者向け：TypeScriptの型定義により、コードの安全性と可読性を向上
 */

// 料理計画の基本情報を定義する型
export interface CookingPlan {
  id: string; // 一意識別子
  title: string; // 料理名
  description?: string; // 詳細説明（オプション）
  date: string; // 予定日（YYYY-MM-DD形式）
  time?: string; // 時間（HH:mm形式、オプション）
  ingredients?: string[]; // 材料リスト
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack'; // 食事カテゴリ
  difficulty: 'easy' | 'medium' | 'hard'; // 難易度
  prepTime?: number; // 準備時間（分）
  cookTime?: number; // 調理時間（分）
  servings?: number; // 人数分
  createdAt: string; // 作成日時
  updatedAt: string; // 更新日時
}

// カレンダー表示用のマーク情報
export interface CalendarMarking {
  selected?: boolean; // 選択状態
  marked?: boolean; // マーク表示
  selectedColor?: string; // 選択時の色
  dotColor?: string; // ドットの色
  activeOpacity?: number; // タップ時の透明度
}

// カレンダーのマーキング情報をまとめる型
export interface CalendarMarkings {
  [date: string]: CalendarMarking;
}

// 外部カレンダー連携用の設定型
export interface CalendarIntegration {
  googleCalendar: {
    enabled: boolean;
    syncEnabled: boolean;
    lastSyncDate?: string;
  };
  nativeCalendar: {
    enabled: boolean;
    syncEnabled: boolean;
    calendarId?: string;
  };
}

// アプリの設定情報
export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  defaultView: 'month' | 'week' | 'day';
  notifications: boolean;
  calendarIntegration: CalendarIntegration;
}
