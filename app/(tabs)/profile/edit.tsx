import { UserDB } from '@/database/db/Userdb'
import { Profile } from '@/database/types'
import { router } from 'expo-router'
import { ChevronDown, CookingPot, ShoppingCart, Users } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { ActionSheetIOS, Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ProfileEditScreen() {
  const [profile, setProfile] = useState<Profile>({
    household_size: "1人",
    cooking_frequency: "週3回",
    shopping_frequency: "週3回",
  })
  const [loading, setLoading] = useState(false)
  const userDB = new UserDB()

  // 既存プロフィールを読み込み
  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const savedProfile = userDB.getProfile()
      if (savedProfile) {
        setProfile({
          household_size: savedProfile.household_size || '1人',
          cooking_frequency: savedProfile.cooking_frequency || '週3回',
          shopping_frequency: savedProfile.shopping_frequency || '週1回'
        })
      }
    } catch (error) {
      console.error('プロフィール読み込みエラー:', error)
    }
  }

  // 選択肢の定義
  const householdOptions = [
    { label: '1人', value: "1人" },
    { label: '2人', value: "2人" },
    { label: '3人', value: "3人" },
    { label: '4人', value: "4人" },
    { label: '5人', value: "5人" },
    { label: '6人', value: "6人" },
    { label: '7人以上', value: "7人以上" },
  ]

  const cookingOptions = [
    { label: 'ほとんどしない', value: "ほとんどしない" },
    { label: '週1回', value: "週1回" },
    { label: '週2回', value: "週2回" },
    { label: '週3回', value: "週3回" },
    { label: '週4回', value: "週4回" },
    { label: '週5回', value: "週5回" },
    { label: '週6回', value: "週6回" },
    { label: '毎日', value: "毎日" },
  ]

  const shoppingOptions = [
    { label: '週1回', value: "週1回" },
    { label: '週2回', value: "週2回" },
    { label: '週3回', value: "週3回" },
    { label: '週4回', value: "週4回" },
    { label: '週5回', value: "週5回" },
    { label: '週6回', value: "週6回" },
    { label: '毎日', value: "毎日" },
    { label: '特に決めてない', value: "特に決めてない" },
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

  const handleSave = async () => {
    setLoading(true)
    try {
      // 直接データベースに保存（複雑な変換なし）
      userDB.saveProfile({
        household_size: profile.household_size,
        cooking_frequency: profile.cooking_frequency,
        shopping_frequency: profile.shopping_frequency
      })
      
      Alert.alert('成功', 'プロフィールを保存しました', [
        { text: 'OK', onPress: () => router.back() }
      ])
      setLoading(false)
    } catch (error) {
      console.error('保存エラー:', error)
      Alert.alert('エラー', '保存に失敗しました')
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* 編集フォーム */}
        <View style={styles.formContainer}>
          {/* 世帯人数 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
            <Users size={22} color="#20556C" />
            <Text style={styles.label}>世帯人数</Text>
            </View>
            <TouchableOpacity
              style={styles.selectorContainer}
              onPress={() => showActionSheet(
                householdOptions,
                profile.household_size,
                (value) => setProfile({ ...profile, household_size: value }),
                '世帯人数を選択してください'
              )}
            >
              <Text style={styles.selectorText}>
                {getDisplayValue(householdOptions, profile.household_size)}
              </Text>
              <ChevronDown size={20} color="#20556C" />
            </TouchableOpacity>
          </View>

          {/* 自炊頻度 */}
          <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CookingPot size={22} color="#156486" />
            <Text style={styles.label}>自炊頻度</Text>
            </View>
            <TouchableOpacity
              style={styles.selectorContainer}
              onPress={() => showActionSheet(
                cookingOptions,
                profile.cooking_frequency,
                (value) => setProfile({ ...profile, cooking_frequency: value }),
                '自炊頻度を選択してください'
              )}
            >
              <Text style={styles.selectorText}>
                {getDisplayValue(cookingOptions, profile.cooking_frequency)}
              </Text>
              <ChevronDown size={20} color="#4a5568" />
            </TouchableOpacity>
          </View>

          {/* 買い物頻度 */}
          <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ShoppingCart size={22} color="#156486" />
            <Text style={styles.label}>食材の買い物頻度</Text>
            </View>
            <TouchableOpacity
              style={styles.selectorContainer}
              onPress={() => showActionSheet(
                shoppingOptions,
                profile.shopping_frequency,
                (value) => setProfile({ ...profile, shopping_frequency: value }),
                '買い物頻度を選択してください'
              )}
            >
              <Text style={styles.selectorText}>
                {getDisplayValue(shoppingOptions, profile.shopping_frequency)}
              </Text>
              <ChevronDown size={20} color="#4a5568" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 保存ボタン */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? '保存中...' : '保存'}
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
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  section: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#20556C',
    // marginBottom: 12,
    marginLeft: 12,
  },
  selectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 50,
  },
  selectorText: {
    fontSize: 17,
    color: '#111827',
    fontWeight: '600',
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
  },
  saveButton: {
    backgroundColor: '#156486',
    paddingVertical: 24,
    borderRadius: 24,
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
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
})
