import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { PurchaseDiagnosis } from '@/types/database'
import { useEffect, useState } from 'react'
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'

export default function DiagnosisMain() {
  const { user } = useAuth()
  const [currentDiagnosis, setCurrentDiagnosis] = useState<PurchaseDiagnosis | null>(null)
  const [aiQuestion, setAiQuestion] = useState('')
  const [showInputForm, setShowInputForm] = useState(false)
  const [foodName, setFoodName] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [plannedAmount, setPlannedAmount] = useState('')
  const [amountUnit, setAmountUnit] = useState('個')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadLatestDiagnosis()
    }
  }, [user])

  const loadLatestDiagnosis = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('purchase_diagnoses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)

    if (data && data.length > 0) {
      setCurrentDiagnosis(data[0])
    }
  }

  const generateAIRecommendation = (foodName: string, expiryDate: string, amount: number, unit: string) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    let recommendation = ''
    let warningLevel: 'low' | 'medium' | 'high' = 'low'

    if (daysUntilExpiry <= 3) {
      warningLevel = 'high'
      recommendation = `⚠️ 賞味期限まで${daysUntilExpiry}日です！${amount}${unit}は多すぎる可能性があります。半分の量にして、残りは冷凍保存を検討してください。`
    } else if (daysUntilExpiry <= 7) {
      warningLevel = 'medium'
      recommendation = `⚡ 賞味期限まで${daysUntilExpiry}日です。${amount}${unit}を消費するには週${Math.ceil(amount / 2)}回の調理が必要です。計画的に使いましょう。`
    } else {
      if (amount > 5) {
        warningLevel = 'medium'
        recommendation = `💡 ${amount}${unit}は少し多めです。${Math.floor(amount * 0.7)}${unit}程度でも十分かもしれません。余った場合は適切な保存方法で長持ちさせましょう。`
      } else {
        recommendation = `✅ 適量です！${foodName}は${daysUntilExpiry}日以内に美味しく消費できそうです。`
      }
    }

    return { recommendation, warningLevel }
  }

  const getDiagnosis = async () => {
    if (!user || !foodName || !expiryDate || !plannedAmount) {
      Alert.alert('エラー', 'すべての項目を入力してください')
      return
    }

    setLoading(true)
    try {
      const { recommendation, warningLevel } = generateAIRecommendation(
        foodName,
        expiryDate,
        parseFloat(plannedAmount),
        amountUnit
      )

      const { error } = await supabase
        .from('purchase_diagnoses')
        .insert({
          user_id: user.id,
          food_name: foodName,
          expiry_date: expiryDate,
          planned_amount: parseFloat(plannedAmount),
          amount_unit: amountUnit,
          ai_recommendation: recommendation,
          warning_level: warningLevel,
        })

      if (error) {
        Alert.alert('エラー', '診断結果の保存に失敗しました')
      } else {
        // 新しい診断結果を現在の診断として設定
        const newDiagnosis: PurchaseDiagnosis = {
          id: Date.now().toString(), // 仮のID
          user_id: user.id,
          food_name: foodName,
          expiry_date: expiryDate,
          planned_amount: parseFloat(plannedAmount),
          amount_unit: amountUnit,
          ai_recommendation: recommendation,
          warning_level: warningLevel,
          created_at: new Date().toISOString(),
        }
        setCurrentDiagnosis(newDiagnosis)
        setShowInputForm(false)
        setFoodName('')
        setExpiryDate('')
        setPlannedAmount('')
        loadLatestDiagnosis()
      }
    } catch (error) {
      Alert.alert('エラー', '予期しないエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const getWarningColor = (level: string) => {
    switch (level) {
      case 'high': return '#e53e3e'
      case 'medium': return '#dd6b20'
      default: return '#38a169'
    }
  }

  const handleAiQuestion = () => {
    if (!aiQuestion.trim()) return
    
    // AI質問機能は後で実装
    Alert.alert('AI質問', 'AI質問機能は開発中です')
    setAiQuestion('')
  }

  if (showInputForm) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setShowInputForm(false)}
          >
            <Text style={styles.backButtonText}>← 戻る</Text>
          </TouchableOpacity>
          <Text style={styles.title}>購入診断入力</Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>食材名</Text>
              <TextInput
                style={styles.input}
                value={foodName}
                onChangeText={setFoodName}
                placeholder="例: 卵"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>賞味期限</Text>
              <TextInput
                style={styles.input}
                value={expiryDate}
                onChangeText={setExpiryDate}
                placeholder="2025/9/3"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>購入予定量</Text>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.inputSmall]}
                  value={plannedAmount}
                  onChangeText={setPlannedAmount}
                  placeholder="10"
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.input, styles.inputSmall]}
                  value={amountUnit}
                  onChangeText={setAmountUnit}
                  placeholder="個"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.buttonDisabled]}
              onPress={getDiagnosis}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? '診断中...' : 'AI診断を実行'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setShowInputForm(true)}
        >
          <Text style={styles.backButtonText}>← 入力画面へ</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {currentDiagnosis ? (
          <>
            <View style={styles.diagnosisCard}>
              <Text style={styles.diagnosisLabel}>購入診断</Text>
              <View style={styles.diagnosisContent}>
                <Text style={styles.foodInfo}>
                  {currentDiagnosis.food_name} {currentDiagnosis.planned_amount}{currentDiagnosis.amount_unit}
                </Text>
                <Text style={styles.expiryInfo}>
                  賞味期限 {new Date(currentDiagnosis.expiry_date).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric'
                  })}
                </Text>
                <Text style={styles.noteInfo}>
                  備考：今日3個使う予定
                </Text>
              </View>
            </View>

            <View style={styles.aiRecommendationCard}>
              <View style={styles.aiHeader}>
                <View style={styles.aiIcon}>
                  <Text style={styles.aiIconText}>AI</Text>
                </View>
              </View>
              <Text style={styles.aiRecommendationText}>
                {currentDiagnosis.ai_recommendation}
              </Text>
              <TouchableOpacity style={styles.reasonButton}>
                <Text style={styles.reasonButtonText}>理由を見る</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>まだ診断結果がありません</Text>
            <TouchableOpacity 
              style={styles.startButton}
              onPress={() => setShowInputForm(true)}
            >
              <Text style={styles.startButtonText}>診断を開始</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.aiQuestionContainer}>
          <TextInput
            style={styles.aiQuestionInput}
            value={aiQuestion}
            onChangeText={setAiQuestion}
            placeholder="AIに質問"
            multiline
          />
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={handleAiQuestion}
          >
            <Text style={styles.sendButtonText}>送信</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#2563eb',
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
    marginLeft: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  diagnosisCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  diagnosisLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 12,
  },
  diagnosisContent: {
    gap: 4,
  },
  foodInfo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  expiryInfo: {
    fontSize: 14,
    color: '#4a5568',
  },
  noteInfo: {
    fontSize: 14,
    color: '#4a5568',
  },
  aiRecommendationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiIcon: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiIconText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  aiRecommendationText: {
    fontSize: 14,
    color: '#2d3748',
    lineHeight: 20,
    marginBottom: 12,
  },
  reasonButton: {
    alignSelf: 'flex-start',
  },
  reasonButtonText: {
    color: '#6b7280',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  aiQuestionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  aiQuestionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 80,
  },
  sendButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  inputSmall: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  submitButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})
