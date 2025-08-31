/**
 * ローカルストレージ管理サービス
 * 初心者向け：データの保存・読み込みを簡単にする
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CookingPlan, AppSettings } from './types';

// ストレージのキー定数
const STORAGE_KEYS = {
  COOKING_PLANS: 'cooking_plans',
  APP_SETTINGS: 'app_settings',
  LAST_SYNC: 'last_sync',
} as const;

/**
 * 料理計画データをローカルストレージに保存
 * @param plans - 保存する料理計画の配列
 */
export const saveCookingPlans = async (plans: CookingPlan[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(plans);
    await AsyncStorage.setItem(STORAGE_KEYS.COOKING_PLANS, jsonValue);
    console.log('料理計画データを保存しました');
  } catch (error) {
    console.error('料理計画データの保存に失敗:', error);
    throw new Error('データの保存に失敗しました');
  }
};

/**
 * ローカルストレージから料理計画データを読み込み
 * @returns 料理計画の配列
 */
export const loadCookingPlans = async (): Promise<CookingPlan[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.COOKING_PLANS);
    if (jsonValue !== null) {
      const plans = JSON.parse(jsonValue) as CookingPlan[];
      console.log(`${plans.length}件の料理計画を読み込みました`);
      return plans;
    }
    return []; // データが存在しない場合は空配列を返す
  } catch (error) {
    console.error('料理計画データの読み込みに失敗:', error);
    return [];
  }
};

/**
 * 特定の料理計画を追加または更新
 * @param plan - 追加・更新する料理計画
 */
export const saveCookingPlan = async (plan: CookingPlan): Promise<void> => {
  try {
    const existingPlans = await loadCookingPlans();
    const planIndex = existingPlans.findIndex(p => p.id === plan.id);
    
    if (planIndex >= 0) {
      // 既存のプランを更新
      existingPlans[planIndex] = {
        ...plan,
        updatedAt: new Date().toISOString(),
      };
      console.log(`料理計画を更新: ${plan.title}`);
    } else {
      // 新しいプランを追加
      existingPlans.push({
        ...plan,
        createdAt: plan.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      console.log(`料理計画を追加: ${plan.title}`);
    }
    
    await saveCookingPlans(existingPlans);
  } catch (error) {
    console.error('料理計画の保存に失敗:', error);
    throw error;
  }
};

/**
 * 料理計画を削除
 * @param planId - 削除する料理計画のID
 */
export const deleteCookingPlan = async (planId: string): Promise<void> => {
  try {
    const existingPlans = await loadCookingPlans();
    const updatedPlans = existingPlans.filter(plan => plan.id !== planId);
    await saveCookingPlans(updatedPlans);
    console.log(`料理計画を削除: ${planId}`);
  } catch (error) {
    console.error('料理計画の削除に失敗:', error);
    throw error;
  }
};

/**
 * アプリ設定を保存
 * @param settings - 保存する設定
 */
export const saveAppSettings = async (settings: AppSettings): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(settings);
    await AsyncStorage.setItem(STORAGE_KEYS.APP_SETTINGS, jsonValue);
    console.log('アプリ設定を保存しました');
  } catch (error) {
    console.error('設定の保存に失敗:', error);
    throw error;
  }
};

/**
 * アプリ設定を読み込み
 * @returns アプリ設定（デフォルト設定含む）
 */
export const loadAppSettings = async (): Promise<AppSettings> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
    if (jsonValue !== null) {
      return JSON.parse(jsonValue) as AppSettings;
    }
    
    // デフォルト設定を返す
    const defaultSettings: AppSettings = {
      theme: 'auto',
      defaultView: 'month',
      notifications: true,
      calendarIntegration: {
        googleCalendar: {
          enabled: false,
          syncEnabled: false,
        },
        nativeCalendar: {
          enabled: false,
          syncEnabled: false,
        },
      },
    };
    
    await saveAppSettings(defaultSettings);
    return defaultSettings;
  } catch (error) {
    console.error('設定の読み込みに失敗:', error);
    throw error;
  }
};

/**
 * 全データをクリア（リセット機能用）
 */
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    console.log('全データをクリアしました');
  } catch (error) {
    console.error('データクリアに失敗:', error);
    throw error;
  }
};
