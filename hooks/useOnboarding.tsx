import { UserDB } from '@/database/db/Userdb';
import { Profile } from '@/database/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

const ONBOARDING_KEY = 'hasCompletedOnboarding';

interface OnboardingAnswers {
  householdSize: string;
  cookingFrequency: string;
  shoppingFrequency: string;
}

interface OnboardingContextType {
  // 回答関連
  answers: OnboardingAnswers;
  updateAnswer: (key: keyof OnboardingAnswers, value: string) => void;
  saveToProfile: () => Promise<boolean>;
  isComplete: () => boolean;
  
  // 状態管理関連
  hasCompleted: boolean | null;
  isLoading: boolean;
  markAsCompleted: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  // 回答状態
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    householdSize: '',
    cookingFrequency: '',
    shoppingFrequency: '',
  });

  // 完了状態
  const [hasCompleted, setHasCompleted] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // アプリ起動時にオンボーディング状態を確認
  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_KEY);
      setHasCompleted(value === 'true');
    } catch (error) {
      console.error('オンボーディング状態の確認エラー:', error);
      setHasCompleted(false);
    } finally {
      setIsLoading(false);
    }
  };

  const updateAnswer = (key: keyof OnboardingAnswers, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveToProfile = async (): Promise<boolean> => {
    try {
      if (!answers.householdSize || !answers.cookingFrequency || !answers.shoppingFrequency) {
        console.error('すべての質問に回答してください');
        return false;
      }

      const userDB = new UserDB();
      const profile: Profile = {
        household_size: answers.householdSize,
        cooking_frequency: answers.cookingFrequency,
        shopping_frequency: answers.shoppingFrequency,
      };

      userDB.saveProfile(profile);
      console.log('オンボーディング回答をプロフィールに保存しました:', profile);
      
      // 保存成功時に完了状態もマークする
      await markAsCompleted();
      return true;
    } catch (error) {
      console.error('プロフィール保存エラー:', error);
      return false;
    }
  };

  const isComplete = (): boolean => {
    return !!(answers.householdSize && answers.cookingFrequency && answers.shoppingFrequency);
  };

  const markAsCompleted = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setHasCompleted(true);
      console.log('オンボーディングが完了としてマークされました');
    } catch (error) {
      console.error('オンボーディング完了マークエラー:', error);
    }
  };

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_KEY);
      setHasCompleted(false);
      // 回答もリセット
      setAnswers({
        householdSize: '',
        cookingFrequency: '',
        shoppingFrequency: '',
      });
      console.log('オンボーディング状態がリセットされました');
    } catch (error) {
      console.error('オンボーディングリセットエラー:', error);
    }
  };

  return (
    <OnboardingContext.Provider value={{
      answers,
      updateAnswer,
      saveToProfile,
      isComplete,
      hasCompleted,
      isLoading,
      markAsCompleted,
      resetOnboarding,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
