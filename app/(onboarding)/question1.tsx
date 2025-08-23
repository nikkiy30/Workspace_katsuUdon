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

const FOOD_OPTIONS = [
  '野菜・果物',
  '肉類',
  '魚・海鮮',
  '米・パン・麺類',
  '乳製品',
  '調味料・スパイス',
  'お菓子・デザート',
  '飲み物',
]

export default function Question1Screen() {
  const router = useRouter()
  const [selectedFoods, setSelectedFoods] = useState<string[]>([])

  const toggleFood = (food: string) => {
    setSelectedFoods(prev => 
      prev.includes(food) 
        ? prev.filter(f => f !== food)
        : [...prev, food]
    )
  }

  const handleNext = () => {
    if (selectedFoods.length === 0) {
      Alert.alert('選択してください', '少なくとも1つの食品カテゴリを選択してください')
      return
    }

    // 選択した内容は後でプロフィール機能実装時に保存予定
    console.log('Selected foods:', selectedFoods)

    router.push('/question2')
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
        <Text style={styles.progress}>1/3</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>質問1</Text>
        <Text style={styles.question}>
          よく食べる食品カテゴリを{'\n'}
          選択してください
        </Text>
        <Text style={styles.subtitle}>
          （複数選択可）
        </Text>

        <View style={styles.optionsContainer}>
          {FOOD_OPTIONS.map((food) => (
            <TouchableOpacity
              key={food}
              style={[
                styles.option,
                selectedFoods.includes(food) && styles.optionSelected
              ]}
              onPress={() => toggleFood(food)}
            >
              <Text style={[
                styles.optionText,
                selectedFoods.includes(food) && styles.optionTextSelected
              ]}>
                {food}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.nextButton,
            selectedFoods.length === 0 && styles.nextButtonDisabled
          ]} 
          onPress={handleNext}
          disabled={selectedFoods.length === 0}
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
