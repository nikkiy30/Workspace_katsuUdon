import { useAuth } from '@/hooks/useAuth'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

export default function DiagnosisScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const [foodName, setFoodName] = useState('')
  const [amount, setAmount] = useState('')
  const [expiryDate, setExpiryDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || expiryDate
    setShowDatePicker(Platform.OS === 'ios')
    setExpiryDate(currentDate)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    }).replace(/\//g, '/')
  }

  const handleSubmit = async () => {
    if (!foodName || !amount) {
      Alert.alert('エラー', '食材名と内容量を入力してください')
      return
    }

    setLoading(true)
    try {
      // 診断データを準備
      const diagnosisData = {
        foodName,
        amount,
        expiryDate: expiryDate.toISOString().split('T')[0], // YYYY-MM-DD形式
        notes,
      }

      // ai-chat.tsxに診断データを渡して遷移
      router.push('/diagnosis/ai-chat' as any)
      
      // TODO: 実際のAPIを呼び出してSupabaseに保存
      
    } catch (error) {
      Alert.alert('エラー', '予期しないエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
          <Text style={styles.saveButtonText}>保存する</Text>
          <Text style={styles.saveButtonArrow}>→</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>商品</Text>
            <TextInput
              style={styles.input}
              value={foodName}
              onChangeText={setFoodName}
              placeholder="例) 卵"
              placeholderTextColor="#a0a0a0"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>内容量</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="例) M 10個"
              placeholderTextColor="#a0a0a0"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>賞味期限/消費期限</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {formatDate(expiryDate)}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={expiryDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="備考"
              placeholderTextColor="#a0a0a0"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    alignItems: 'flex-end',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 18,
    color: '#2563eb',
    fontWeight: '600',
  },
  saveButtonArrow: {
    fontSize: 18,
    color: '#2563eb',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 12,
    fontWeight: '500',
  },
  input: {
    borderWidth: 2,
    borderColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#f8fafc',
    color: '#333333',
  },
  dateInput: {
    borderWidth: 2,
    borderColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#f8fafc',
  },
  dateText: {
    fontSize: 16,
    color: '#333333',
  },
  notesInput: {
    borderWidth: 2,
    borderColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#f8fafc',
    color: '#333333',
    height: 120,
    textAlignVertical: 'top',
  },
})
