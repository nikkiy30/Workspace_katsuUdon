import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList,
} from 'react-native'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { PurchaseDiagnosis } from '@/types/database'

export default function DiagnosisScreen() {
  const { user } = useAuth()
  const [foodName, setFoodName] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [plannedAmount, setPlannedAmount] = useState('')
  const [amountUnit, setAmountUnit] = useState('個')
  const [loading, setLoading] = useState(false)
  const [diagnoses, setDiagnoses] = useState<PurchaseDiagnosis[]>([])

  useEffect(() => {
    if (user) {
      loadDiagnoses()
    }
  }, [user])

  const loadDiagnoses = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('purchase_diagnoses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (data) {
      setDiagnoses(data)
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
        Alert.alert('診断完了', recommendation)
        setFoodName('')
        setExpiryDate('')
        setPlannedAmount('')
        loadDiagnoses()
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

  const renderDiagnosis = ({ item }: { item: PurchaseDiagnosis }) => (
    <View style={[styles.diagnosisItem, { borderLeftColor: getWarningColor(item.warning_level) }]}>
      <Text style={styles.diagnosisTitle}>{item.food_name}</Text>
      <Text style={styles.diagnosisAmount}>
        {item.planned_amount}{item.amount_unit} (賞味期限: {new Date(item.expiry_date).toLocaleDateString('ja-JP')})
      </Text>
      <Text style={styles.diagnosisRecommendation}>{item.ai_recommendation}</Text>
      <Text style={styles.diagnosisDate}>
        {new Date(item.created_at).toLocaleDateString('ja-JP')}
      </Text>
    </View>
  )

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI購入診断</Text>
        <Text style={styles.subtitle}>購入予定の食材について適量をアドバイスします</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>食材名</Text>
          <TextInput
            style={styles.input}
            value={foodName}
            onChangeText={setFoodName}
            placeholder="例: トマト"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>賞味期限</Text>
          <TextInput
            style={styles.input}
            value={expiryDate}
            onChangeText={setExpiryDate}
            placeholder="YYYY-MM-DD"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>購入予定量</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.inputSmall]}
              value={plannedAmount}
              onChangeText={setPlannedAmount}
              placeholder="数量"
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, styles.inputSmall]}
              value={amountUnit}
              onChangeText={setAmountUnit}
              placeholder="単位"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={getDiagnosis}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? '診断中...' : 'AI診断を実行'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.diagnosesSection}>
        <Text style={styles.diagnosesTitle}>最近の診断結果</Text>
        <FlatList
          data={diagnoses}
          renderItem={renderDiagnosis}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 24,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4a5568',
  },
  form: {
    backgroundColor: 'white',
    margin: 16,
    padding: 24,
    borderRadius: 12,
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
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f7fafc',
  },
  inputSmall: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    backgroundColor: '#4299e1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#a0aec0',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  diagnosesSection: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
  },
  diagnosesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 16,
  },
  diagnosisItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    borderLeftWidth: 4,
    marginBottom: 8,
  },
  diagnosisTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 4,
  },
  diagnosisAmount: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 8,
  },
  diagnosisRecommendation: {
    fontSize: 14,
    color: '#2d3748',
    lineHeight: 20,
    marginBottom: 8,
  },
  diagnosisDate: {
    fontSize: 12,
    color: '#718096',
  },
})