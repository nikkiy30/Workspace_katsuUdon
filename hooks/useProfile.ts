import { useState } from 'react'

export interface UserProfile {
  id: string
  onboarding_completed: boolean
}

// ローカルのみのプロフィールフック
export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<UserProfile | null>(
    userId ? {
      id: userId,
      onboarding_completed: false,
    } : null
  )
  const [loading, setLoading] = useState(false)

  const updateLocalProfile = (updates: Partial<UserProfile>) => {
    if (!profile) return { data: null, error: null }

    const updatedProfile = {
      ...profile,
      ...updates,
    }
    
    setProfile(updatedProfile)
    return { data: updatedProfile, error: null }
  }

  const completeOnboarding = () => {
    return updateLocalProfile({ onboarding_completed: true })
  }

  return {
    profile,
    loading,
    updateProfile: updateLocalProfile,
    completeOnboarding,
    refetch: () => {},
  }
}
