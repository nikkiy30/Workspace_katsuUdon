import { useRouter } from 'expo-router'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

export default function WelcomeScreen() {
  const router = useRouter()

  const goToQ1 = () => {
    router.push('/question1')
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>ようこそ！</Text>
        <Text style={styles.subtitle}>KatsuUdonへ</Text>
        
        <Text style={styles.description}>
          食品ロス削減のために、{'\n'}
          あなたの食生活について{'\n'}
          いくつか質問させてください。
        </Text>
        
        <Text style={styles.note}>
          これらの情報は、あなたに最適な{'\n'}
          食材の提案や廃棄予防アドバイスを{'\n'}
          提供するために使用されます。
        </Text>
        
        <TouchableOpacity style={styles.button} onPress={goToQ1}>
          <Text style={styles.buttonText}>はじめる</Text>
        </TouchableOpacity>
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 24,
    color: '#4a5568',
    marginBottom: 48,
  },
  description: {
    fontSize: 18,
    color: '#4a5568',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 32,
  },
  note: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 48,
  },
  button: {
    backgroundColor: '#4299e1',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 200,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
})
