import { router } from 'expo-router'
import { CookingPot, Edit3, ShoppingCart, Users } from 'lucide-react-native'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>プロフィール情報</Text>
            <Text style={styles.subtitle}>AIがより適した提案ができるようになります</Text>
          </View>
        </View>

        {/* プロフィール表示エリア */}
        <View style={styles.profileContainer}>
          {/* TODO: 実際のプロフィールデータを表示 */}
          <View style={styles.profileSection}>
            <Text style={styles.profileLabel}>世帯人数</Text>
            <View style={styles.profileValueContainer}>
              <Users size={18} color="#156486" />
              <Text style={styles.profileValue}>1人</Text>
            </View>
          </View>

          <View style={styles.profileSection}>
            <Text style={styles.profileLabel}>自炊頻度</Text>
            <View style={styles.profileValueContainer}>
              <CookingPot size={18} color="#156486" />
              <Text style={styles.profileValue}>週3回</Text>
            </View>
          </View>

          <View style={styles.profileSection}>
            <Text style={styles.profileLabel}>食材の買い物頻度</Text>
            <View style={styles.profileValueContainer}>
              <ShoppingCart size={18} color="#156486" />
              <Text style={styles.profileValue}>週1回</Text>
            </View>
          </View>
        </View>

        {/* 編集ボタン */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={() => router.push('/(tabs)/profile/edit')}
          >
            <Edit3 size={20} color="#ffffff" />
            <Text style={styles.editButtonText}>プロフィールを編集</Text>
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
  subtitle: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
    fontWeight: '500',
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
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  profileLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4b5563',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  profileValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 10,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
    marginBottom: 150,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#156486',
    paddingVertical: 24,
    borderRadius: 24,
    shadowColor: '#156486',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
    marginLeft: 8,
  },
})
