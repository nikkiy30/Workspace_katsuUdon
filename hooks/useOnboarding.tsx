import { UserDB } from '@/database/db/Userdb';
import { hasAllAnswers, OnboardingAnswers, persistOnboardingAnswers, readOnboardingCompletion } from '@/services/onboardingPersistence';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

const ONBOARDING_KEY = 'hasCompletedOnboarding';

interface OnboardingContextType {
  // 回答関連
  answers: OnboardingAnswers;
  updateAnswer: (key: keyof OnboardingAnswers, value: string) => void;
  saveToProfile: () => Promise<boolean>;
  isComplete: () => boolean;
  
  // 状態管理関連
  hasCompleted: boolean | null;
  isLoading: boolean;
  statusError: boolean;
  retryStatus: () => Promise<void>;
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
  const [statusError, setStatusError] = useState(false);

  // アプリ起動時にオンボーディング状態を確認
  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    setIsLoading(true);
    setStatusError(false);
    try {
      const completed = await readOnboardingCompletion(() => AsyncStorage.getItem(ONBOARDING_KEY));
      setHasCompleted(completed);
    } catch (error) {
      console.error('オンボーディング状態の確認エラー:', error);
      setHasCompleted(null);
      setStatusError(true);
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
      return await persistOnboardingAnswers(answers, {
        saveProfile: (profile) => new UserDB().saveProfile(profile),
        markCompleted: markAsCompleted,
      });
    } catch (error) {
      console.error('プロフィール保存エラー:', error);
      return false;
    }
  };

  const isComplete = (): boolean => {
    return hasAllAnswers(answers);
  };

  const markAsCompleted = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setHasCompleted(true);
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
      statusError,
      retryStatus: checkOnboardingStatus,
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
