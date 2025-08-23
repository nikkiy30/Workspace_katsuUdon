import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'

const ONBOARDING_KEY_PREFIX = 'onboarding_completed_'

export function useOnboarding(userId?: string) {
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      loadOnboardingStatus(userId)
    } else {
      // ユーザーIDがない場合は未完了状態
      setOnboardingCompleted(false)
      setLoading(false)
    }
  }, [userId])

  const loadOnboardingStatus = async (userId: string) => {
    try {
      const key = `${ONBOARDING_KEY_PREFIX}${userId}`
      const status = await AsyncStorage.getItem(key)
      setOnboardingCompleted(status === 'true')
    } catch (error) {
      console.error('Error loading onboarding status:', error)
      setOnboardingCompleted(false)
    } finally {
      setLoading(false)
    }
  }

  const completeOnboarding = async () => {
    if (!userId) return
    
    try {
      const key = `${ONBOARDING_KEY_PREFIX}${userId}`
      await AsyncStorage.setItem(key, 'true')
      setOnboardingCompleted(true)
    } catch (error) {
      console.error('Error saving onboarding status:', error)
    }
  }

  const resetOnboarding = async () => {
    if (!userId) return
    
    try {
      const key = `${ONBOARDING_KEY_PREFIX}${userId}`
      await AsyncStorage.removeItem(key)
      setOnboardingCompleted(false)
    } catch (error) {
      console.error('Error resetting onboarding status:', error)
    }
  }

  return {
    onboardingCompleted,
    loading,
    completeOnboarding,
    resetOnboarding,
  }
}
