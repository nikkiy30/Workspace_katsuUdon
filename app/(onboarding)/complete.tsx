import { CompletedIcon } from '@/components/CompletedIcon'
import { Colors } from '@/constants/Colors'
import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

export default function CompleteScreen() {
  const router = useRouter()

  useEffect(() => {
    // 3秒後に自動的にメイン画面に遷移
    const timer = setTimeout(() => {
      router.replace('/(tabs)')
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  const handleGoToMain = () => {
    router.replace('/(tabs)')
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>プロフィール設定が完了しました！</Text>
        <CompletedIcon
          width={250}
          height={340}
        />

        <Text style={styles.description}>
          さあ、CHOPとあなただけの{'\n'}フードロス削減プランを始めましょう！
        </Text>
        
        <TouchableOpacity style={styles.button} onPress={handleGoToMain}>
          <Text style={styles.buttonText}>アプリを始める</Text>
        </TouchableOpacity>
        
        <Text style={styles.autoRedirect}>
          3秒後に自動的に画面が切り替わります
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  icon: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 20,
    color: '#4a5568',
    textAlign: 'center',
    marginBottom: 32,
  },
  description: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
  },
  button: {
    backgroundColor: Colors.light.accent,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 200,
    marginBottom: 24,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  autoRedirect: {
    fontSize: 12,
    color: '#a0aec0',
    textAlign: 'center',
  },
})
