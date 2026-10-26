import { CompletedIcon } from '@/components/CompletedIcon'
import { Colors } from '@/constants/Colors'
import { useRouter } from 'expo-router'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

export default function CompleteScreen() {
  const router = useRouter()

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
          使いきれなかった食材があれば、{'\n'}ホームの「廃棄入力」から記録できます。
        </Text>
        
        <TouchableOpacity style={styles.button} onPress={handleGoToMain} accessibilityRole="button">
          <Text style={styles.buttonText}>ホームへ進む</Text>
        </TouchableOpacity>
        
        <Text style={styles.note}>
          記録するものがなくても、そのまま始められます。
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
    color: '#4a5568',
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
  note: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4a5568',
    textAlign: 'center',
  },
})
