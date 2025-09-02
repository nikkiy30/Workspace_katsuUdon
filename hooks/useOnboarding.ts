import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'

const ONBOARDING_KEY = 'onboarding_completed'

export function useOnboarding(userId: string = 'local-user') {
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOnboardingStatus()
  }, [])

  const loadOnboardingStatus = async () => {
    try {
      const status = await AsyncStorage.getItem(ONBOARDING_KEY)
      setOnboardingCompleted(status === 'true')
    } catch (error) {
      console.error('Error loading onboarding status:', error)
      setOnboardingCompleted(false)
    } finally {
      setLoading(false)
    }
  }

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true')
      setOnboardingCompleted(true)
    } catch (error) {
      console.error('Error saving onboarding status:', error)
    }
  }

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_KEY)
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
