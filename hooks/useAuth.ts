import { useState } from 'react'

// ローカルのみの認証フック（Supabase削除）
export function useAuth() {
  const [user, setUser] = useState<{ id: string } | null>({ id: 'local-user' }) // 固定ユーザー
  const [loading, setLoading] = useState(false)

  // 匿名ログイン（実際は何もしない）
  const signInAnonymously = async () => {
    setLoading(true)
    // ローカルユーザーを設定
    setUser({ id: 'local-user' })
    setLoading(false)
    return { data: { user: { id: 'local-user' } }, error: null }
  }

  return {
    session: user ? { user } : null,
    user,
    loading,
    signUp: () => Promise.resolve({ data: null, error: null }),
    signIn: () => Promise.resolve({ data: null, error: null }),
    signOut: () => {
      setUser(null)
      return Promise.resolve({ error: null })
    },
    signInAnonymously,
  }
}