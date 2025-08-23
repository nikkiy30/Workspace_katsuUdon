import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

const DIETARY_OPTIONS = [
  'なし',
  'ベジタリアン',
  'ヴィーガン',
  'グルテンフリー',
  'アレルギー対応',
  'ハラル',
  'コーシャ',
  'その他',
]

export default function Question2Screen() {
  const router = useRouter()
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([])

  const toggleRestriction = (restriction: string) => {
    if (restriction === 'なし') {
      setSelectedRestrictions(['なし'])
    } else {
      setSelectedRestrictions(prev => {
        const withoutNone = prev.filter(r => r !== 'なし')
        return withoutNone.includes(restriction) 
          ? withoutNone.filter(r => r !== restriction)
          : [...withoutNone, restriction]
      })
    }
  }

  const handleNext = () => {

    // 選択した内容は後でプロフィール機能実装時に保存予定
    console.log('Selected dietary restrictions:', selectedRestrictions)

    router.push('/question3')
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
        <Text style={styles.progress}>2/3</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>質問2</Text>
        <Text style={styles.question}>
          食事制限やアレルギーは{'\n'}
          ありますか？
        </Text>
        <Text style={styles.subtitle}>
          （複数選択可、該当しない場合は「なし」を選択）
        </Text>

        <View style={styles.optionsContainer}>
          {DIETARY_OPTIONS.map((restriction) => (
            <TouchableOpacity
              key={restriction}
              style={[
                styles.option,
                selectedRestrictions.includes(restriction) && styles.optionSelected
              ]}
              onPress={() => toggleRestriction(restriction)}
            >
              <Text style={[
                styles.optionText,
                selectedRestrictions.includes(restriction) && styles.optionTextSelected
              ]}>
                {restriction}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.nextButton,
            selectedRestrictions.length === 0 && styles.nextButtonDisabled
          ]} 
          onPress={handleNext}
          disabled={selectedRestrictions.length === 0}
        >
          <Text style={styles.nextButtonText}>次へ</Text>
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
    marginBottom: 16,
  },
  question: {
    fontSize: 20,
    color: '#4a5568',
    lineHeight: 28,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 32,
  },
  optionsContainer: {
    gap: 12,
    paddingBottom: 20,
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
  nextButton: {
    backgroundColor: '#4299e1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#a0aec0',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
})
