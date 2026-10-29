import { Colors } from '@/constants/Colors'
import { UserDB } from '@/database/db/Userdb'
import { Profile } from '@/database/types'
import { useFocusEffect } from 'expo-router'
import { ChevronDown, CookingPot, ShoppingCart, Users } from 'lucide-react-native'
import { useCallback, useState } from 'react'
import { ActionSheetIOS, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile>({
    household_size: '1人',
    cooking_frequency: '週3回',
    shopping_frequency: '週3回',
  })
  const [loading, setLoading] = useState(false)
  const userDB = new UserDB()

  const loadProfile = async () => {
    try {
      const savedProfile = userDB.getProfile()
      if (savedProfile) {
        setProfile({
          household_size: savedProfile.household_size || '1人',
          cooking_frequency: savedProfile.cooking_frequency || '週3回', 
          shopping_frequency: savedProfile.shopping_frequency || '週1回',
        })
      }
    } catch (error) {
      console.error('プロフィール読み込みエラー:', error)
    }
  }

  // 画面にフォーカスした時にプロフィールを再読み込み
  useFocusEffect(
    useCallback(() => {
      loadProfile()
    }, [])
  )


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
    { label: '不定期', value: "不定期" },
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
            const newValue = options[buttonIndex].value
            onSelect(newValue)
            // 変更時に自動保存
            handleSave({ ...profile, [getProfileKey(title)]: newValue })
          }
        }
      )
    }
  }

  // タイトルからプロフィールキーを取得
  const getProfileKey = (title: string) => {
    if (title.includes('世帯人数')) return 'household_size'
    if (title.includes('自炊')) return 'cooking_frequency'
    if (title.includes('買い物')) return 'shopping_frequency'
    return ''
  }

  const handleSave = async (updatedProfile = profile) => {
    setLoading(true)
    try {
      userDB.saveProfile({
        household_size: updatedProfile.household_size,
        cooking_frequency: updatedProfile.cooking_frequency,
        shopping_frequency: updatedProfile.shopping_frequency
      })
      setLoading(false)
      
      Toast.show({
        type: 'info',
        text1: '☑️　プロフィールが変更されました',
        // text2: 'プロフィール情報を更新しました',
        position: 'bottom',
        visibilityTime: 2000,
        bottomOffset: 120,
      })
    } catch (error) {
      console.error('保存エラー:', error)
      setLoading(false)
      
      Toast.show({
        type: 'error',
        text1: '⚠ 保存に失敗しました',
        text2: 'もう一度お試しください',
        position: 'bottom',
        visibilityTime: 3000,
        bottomOffset: 120,
      })
    }
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>プロフィール情報</Text>
            </View>
          </View>
        </View>

        {/* プロフィール編集エリア */}
        <View style={styles.profileContainer}>
          {/* 世帯人数 */}
          <View style={styles.profileSection}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionHeader}>
                <Users size={22} color="#156486" />
                <Text style={styles.profileLabel}>世帯人数</Text>
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
                <ChevronDown size={20} color="#4a5568" />
              </TouchableOpacity>
            </View>
          </View>

          {/* 自炊頻度 */}
          <View style={styles.profileSection}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionHeader}>
                <CookingPot size={22} color="#156486" />
                <Text style={styles.profileLabel}>自炊頻度</Text>
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
          </View>

          {/* 買い物頻度 */}
          <View style={styles.profileSection}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionHeader}>
                <ShoppingCart size={22} color="#156486" />
                <Text style={styles.profileLabel}>買い物頻度</Text>
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
        </View>
      </View>
      <Toast />
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
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 2,
    borderBottomColor: '#e5e5e5',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#156486',
    marginBottom: 6,
  },
  badge: {
    width: 198,
    height: 48,
    backgroundColor: Colors.light.primary,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 20,
  },
  profileContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  profileSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#20556C',
    marginLeft: 12,
  },
  selectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 50,
    width: "60%",
  },
  selectorText: {
    fontSize: 17,
    color: '#20556C',
    fontWeight: '600',
    flex: 1,
  },
})
