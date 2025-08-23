import { useAuth } from '@/hooks/useAuth'
import { useOnboarding } from '@/hooks/useOnboarding'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'

const HOUSEHOLD_OPTIONS = [
  { label: '1人', value: 1 },
  { label: '2人', value: 2 },
  { label: '3人', value: 3 },
  { label: '4人', value: 4 },
  { label: '5人以上', value: 5 },
]

const SHOPPING_OPTIONS = [
  '毎日',
  '週に2-3回',
  '週に1回',
  '2週間に1回',
  '月に1回',
  'その他',
]

export default function Question3Screen() {
  const router = useRouter()
  const { user } = useAuth()
  const { completeOnboarding } = useOnboarding(user?.id)
  const [selectedHousehold, setSelectedHousehold] = useState<number | null>(null)
  const [selectedFrequency, setSelectedFrequency] = useState<string | null>(null)

  const handleComplete = () => {
    if (!selectedHousehold || !selectedFrequency) {
      Alert.alert('選択してください', '全ての項目を選択してください')
      return
    }

    // 選択した内容は後でプロフィール機能実装時に保存予定
    console.log('Selected household size:', selectedHousehold)
    console.log('Selected shopping frequency:', selectedFrequency)

    // オンボーディング完了を記録
    completeOnboarding()

    router.push('/complete')
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← 戻る</Text>
        </TouchableOpacity>
        <Text style={styles.progress}>3/3</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>質問3</Text>
        
        <Text style={styles.sectionTitle}>世帯人数を教えてください</Text>
        <View style={styles.optionsContainer}>
          {HOUSEHOLD_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                selectedHousehold === option.value && styles.optionSelected
              ]}
              onPress={() => setSelectedHousehold(option.value)}
            >
              <Text style={[
                styles.optionText,
                selectedHousehold === option.value && styles.optionTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>買い物の頻度を教えてください</Text>
        <View style={styles.optionsContainer}>
          {SHOPPING_OPTIONS.map((frequency) => (
            <TouchableOpacity
              key={frequency}
              style={[
                styles.option,
                selectedFrequency === frequency && styles.optionSelected
              ]}
              onPress={() => setSelectedFrequency(frequency)}
            >
              <Text style={[
                styles.optionText,
                selectedFrequency === frequency && styles.optionTextSelected
              ]}>
                {frequency}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.completeButton,
            (!selectedHousehold || !selectedFrequency) && styles.completeButtonDisabled
          ]} 
          onPress={handleComplete}
          disabled={!selectedHousehold || !selectedFrequency}
        >
          <Text style={styles.completeButtonText}>完了</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#4299e1',
    fontSize: 16,
  },
  progress: {
    color: '#718096',
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#4a5568',
    fontWeight: '600',
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  option: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  optionSelected: {
    borderColor: '#4299e1',
    backgroundColor: '#ebf8ff',
  },
  optionText: {
    fontSize: 16,
    color: '#4a5568',
    textAlign: 'center',
  },
  optionTextSelected: {
    color: '#2b6cb0',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 40,
    paddingTop: 20,
  },
  completeButton: {
    backgroundColor: '#48bb78',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeButtonDisabled: {
    backgroundColor: '#a0aec0',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
})
