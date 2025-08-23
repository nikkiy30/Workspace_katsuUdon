import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export interface UserProfile {
  id: string
  email?: string
  onboarding_completed: boolean
  preferences?: {
    favorite_foods?: string[]
    dietary_restrictions?: string[]
    household_size?: number
    shopping_frequency?: string
  }
  created_at: string
  updated_at: string
}

// Supabase関連の関数（将来使用するために定義のみ）
export const supabaseProfileFunctions = {
  // プロフィールをSupabaseから取得
  async fetchProfileFromSupabase(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Profile fetch error:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Profile fetch error:', error)
      return null
    }
  },

  // プロフィールをSupabaseに作成
  async createProfileInSupabase(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: userId,
            onboarding_completed: false,
            preferences: {},
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Profile creation error:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Profile creation error:', error)
      return null
    }
  },

  // プロフィールをSupabaseで更新
  async updateProfileInSupabase(userId: string, updates: Partial<UserProfile>) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('Profile update error:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Profile update error:', error)
      return { data: null, error }
    }
  }
}

// ローカル状態のみで動作するプロフィールフック
export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setProfile(null)
      setLoading(false)
      return
    }

    // ローカルで初期プロフィールを作成（Supabaseは使用しない）
    initializeLocalProfile(userId)
  }, [userId])

  const initializeLocalProfile = (userId: string) => {
    // ローカル状態でプロフィールを初期化
    const localProfile: UserProfile = {
      id: userId,
      onboarding_completed: false,
      preferences: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    setProfile(localProfile)
    setLoading(false)
  }

  const updateLocalProfile = (updates: Partial<UserProfile>) => {
    if (!profile) return

    const updatedProfile = {
      ...profile,
      ...updates,
      updated_at: new Date().toISOString(),
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
    refetch: () => initializeLocalProfile(userId || ''),
  }
}
