import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export function AuthScreen() {
  const [loading, setLoading] = useState(false)
  const { signInAnonymously } = useAuth()
  const router = useRouter()

  const handleStart = async () => {
    setLoading(true)
    try {
      await signInAnonymously()
      router.push('/(onboarding)/welcome')
    } catch (err) {
      Alert.alert('エラー', '開始に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>食品ロス削減アプリ</Text>
        <Text style={styles.subtitle}>katsuUdon</Text>
        
        <TouchableOpacity
          style={[styles.startButton, loading && styles.buttonDisabled]}
          onPress={handleStart}
          disabled={loading}
        >
          <Text style={styles.startButtonText}>
            {loading ? '開始中...' : 'アプリを始める'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#156486',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 60,
  },
  startButton: {
    backgroundColor: '#156486',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 8,
    minWidth: 200,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
})