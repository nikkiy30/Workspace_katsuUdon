import { ChevronDown } from 'lucide-react-native'
import { useState } from 'react'
import {
  ActionSheetIOS,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

interface ProfileData {
  householdSize: number
  cookingFrequency: number
  shoppingFrequency: string
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<ProfileData>({
    householdSize: 1,
    cookingFrequency: 3,
    shoppingFrequency: 'weekly',
  })
  const [loading, setLoading] = useState(false)

  // 選択肢の定義
  const householdOptions = [
    { label: '1人', value: 1 },
    { label: '2人', value: 2 },
    { label: '3人', value: 3 },
    { label: '4人', value: 4 },
    { label: '5人', value: 5 },
    { label: '6人', value: 6 },
    { label: '7人以上', value: 7 },
  ]

  const cookingOptions = [
    { label: 'ほとんどしない', value: 0 },
    { label: '週1回', value: 1 },
    { label: '週2回', value: 2 },
    { label: '週3回', value: 3 },
    { label: '週4回', value: 4 },
    { label: '週5回', value: 5 },
    { label: '週6回', value: 6 },
    { label: '週7回', value: 7 },
    { label: '毎日2回以上', value: 14 },
  ]

  const shoppingOptions = [
    { label: '毎日', value: 'daily' },
    { label: '週2-3回', value: 'several_times_week' },
    { label: '週1回', value: 'weekly' },
    { label: '2週間に1回', value: 'biweekly' },
    { label: '月1回', value: 'monthly' },
    { label: '特に決めていない', value: 'irregular' },
  ]

  // 選択肢表示用のヘルパー関数
  const getDisplayValue = (options: any[], value: any) => {
    const found = options.find(option => option.value === value)
    return found ? found.label : '選択してください'
  }

  // iOS ActionSheet表示関数
  const showActionSheet = (options: any[], currentValue: any, onSelect: (value: any) => void, title: string) => {
    const labels = options.map(option => option.label)
    const cancelButtonIndex = labels.length
    
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [...labels, 'キャンセル'],
          cancelButtonIndex,
          title,
        },
        (buttonIndex) => {
          if (buttonIndex !== cancelButtonIndex) {
            onSelect(options[buttonIndex].value)
          }
        }
      )
    }
  }

  const saveProfile = async () => {
    setLoading(true)
    try {
      // TODO: データベース保存処理を後で実装
      console.log('Profile to save:', profile)
      
      // 仮の保存処理
      setTimeout(() => {
        Alert.alert('成功', 'プロフィールを保存しました')
        setLoading(false)
      }, 1000)
    } catch (error) {
      Alert.alert('エラー', '予期しないエラーが発生しました')
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.title}>プロフィール設定</Text>
          <Text style={styles.subtitle}>あなたの生活スタイルを教えてください</Text>
        </View>

        {/* フォームエリア */}
        <View style={styles.formContainer}>
          {/* 世帯人数 */}
          <View style={styles.section}>
            <Text style={styles.label}>世帯人数</Text>
            <TouchableOpacity
              style={styles.selectorContainer}
              onPress={() => showActionSheet(
                householdOptions,
                profile.householdSize,
                (value) => setProfile({ ...profile, householdSize: value }),
                '世帯人数を選択してください'
              )}
            >
              <Text style={styles.selectorText}>
                {getDisplayValue(householdOptions, profile.householdSize)}
              </Text>
              <ChevronDown size={20} color="#4a5568" />
            </TouchableOpacity>
          </View>

          {/* 自炊頻度 */}
          <View style={styles.section}>
            <Text style={styles.label}>自炊頻度</Text>
            <TouchableOpacity
              style={styles.selectorContainer}
              onPress={() => showActionSheet(
                cookingOptions,
                profile.cookingFrequency,
                (value) => setProfile({ ...profile, cookingFrequency: value }),
                '自炊頻度を選択してください'
              )}
            >
              <Text style={styles.selectorText}>
                {getDisplayValue(cookingOptions, profile.cookingFrequency)}
              </Text>
              <ChevronDown size={20} color="#4a5568" />
            </TouchableOpacity>
          </View>

          {/* 買い物頻度 */}
          <View style={styles.section}>
            <Text style={styles.label}>食材の買い物頻度</Text>
            <TouchableOpacity
              style={styles.selectorContainer}
              onPress={() => showActionSheet(
                shoppingOptions,
                profile.shoppingFrequency,
                (value) => setProfile({ ...profile, shoppingFrequency: value }),
                '買い物頻度を選択してください'
              )}
            >
              <Text style={styles.selectorText}>
                {getDisplayValue(shoppingOptions, profile.shoppingFrequency)}
              </Text>
              <ChevronDown size={20} color="#4a5568" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 保存ボタン */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={saveProfile}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? '保存中...' : 'プロフィールを保存'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#156486',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#4a5568',
    lineHeight: 20,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    justifyContent: 'space-around',
  },
  section: {
    backgroundColor: 'white',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 10,
  },
  selectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#f7fafc',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 45,
  },
  selectorText: {
    fontSize: 16,
    color: '#2d3748',
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
  },
  button: {
    backgroundColor: '#156486',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#156486',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#a0aec0',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
})