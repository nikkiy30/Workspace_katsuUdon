import DateTimePicker from '@react-native-community/datetimepicker'
import * as Localization from 'expo-localization'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  Alert,
  Keyboard,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { Colors } from '../../../constants/Colors'
import { DiagnosisDB } from '@/database/db/Diagnosisdb';

export default function DiagnosisScreen() {
  const router = useRouter()
  const [foodName, setFoodName] = useState('')
  const [amount, setAmount] = useState('')
  const [expiryDate, setExpiryDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [keyboardVisible, setKeyboardVisible] = useState(false)

  // デバイスの言語設定を取得（日本語を優先）
  const deviceLocale = Localization.getLocales()[0]?.languageTag || 'ja-JP'

  // キーボード表示/非表示の検知
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true)
    })
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false)
    })

    return () => {
      showSubscription?.remove()
      hideSubscription?.remove()
    }
  }, [])

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
    })
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

      // DBに保存（サジェスト用）
      try {
        const db = new DiagnosisDB();
        db.addEntry({
          food_name: diagnosisData.foodName,
          amount: diagnosisData.amount,
          expiry_date: diagnosisData.expiryDate,
        });
      } catch (e) {
        console.warn('診断入力の保存に失敗しました（続行します）:', e);
      }

      // ai-chat.tsxに診断データを渡して遷移
      router.push({
        pathname: '/(tabs)/diagnosis/ai-chat',
        params: {
          foodName,
          amount,
          expiryDate: diagnosisData.expiryDate,
          notes: notes || ''
        }
      })
      
      // TODO: 実APIでの保存（必要に応じて）
      
    } catch (error) {
      Alert.alert('エラー', '予期しないエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }
  //! UI ここから
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
          <Text style={styles.saveButtonText}>診断する</Text>
          <Text style={styles.saveButtonArrow}>→</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.form, keyboardVisible && styles.formWithKeyboard]}>
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
              onPress={() => setShowDatePicker((prev) => !prev)}
            >
              <Text style={styles.dateText}>
                {formatDate(expiryDate)}
              </Text>
              <Text style={styles.dateIcon}>📅</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={expiryDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                onChange={handleDateChange}
                themeVariant="light"
                style={Platform.OS === 'ios' ? styles.datePickerIOS : {}}
                locale={deviceLocale.startsWith('ja') ? 'ja' : 'ja-JP'}
              />
            )}
          </View>

          {/* <View style={styles.inputGroup}>
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
          </View> */}
                </View>
      </ScrollView>
    </SafeAreaView>
  )
}
  //! UI ここまで

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
    color: Colors.light.primary,
    fontWeight: '600',
  },
  saveButtonArrow: {
    fontSize: 18,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  form: {
    paddingBottom: 100,
  },
  formWithKeyboard: {
    paddingBottom: 350,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: Colors.light.primary,
    marginBottom: 12,
    fontWeight: '500',
  },
  input: {
    borderWidth: 2,
    borderColor: Colors.light.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#f8fafc',
    color: Colors.light.primary,
  },
  dateInput: {
    borderWidth: 2,
    borderColor: Colors.light.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  dateIcon: {
    fontSize: 18,
    opacity: 0.7,
  },
  notesInput: {
    borderWidth: 2,
    borderColor: Colors.light.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#f8fafc',
    color: Colors.light.primary,
    height: 120,
    textAlignVertical: 'top',
  },
  datePickerIOS: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginTop: 8,
  },
})
