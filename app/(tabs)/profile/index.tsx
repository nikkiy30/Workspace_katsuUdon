import { router } from 'expo-router'
import { Edit3, User } from 'lucide-react-native'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.title}>プロフィール</Text>
              <Text style={styles.subtitle}>あなたの生活スタイル</Text>
            </View>
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={() => router.push('/(tabs)/profile/edit')}
            >
              <Edit3 size={20} color="#156486" />
            </TouchableOpacity>
          </View>
        </View>

        {/* プロフィール表示エリア */}
        <View style={styles.profileContainer}>
          {/* TODO: 実際のプロフィールデータを表示 */}
          <View style={styles.profileSection}>
            <Text style={styles.profileLabel}>世帯人数</Text>
            <View style={styles.profileValueContainer}>
              <User size={18} color="#156486" />
              <Text style={styles.profileValue}>1人</Text>
            </View>
          </View>

          <View style={styles.profileSection}>
            <Text style={styles.profileLabel}>自炊頻度</Text>
            <View style={styles.profileValueContainer}>
              <Text style={styles.profileValue}>週3回</Text>
            </View>
          </View>

          <View style={styles.profileSection}>
            <Text style={styles.profileLabel}>食材の買い物頻度</Text>
            <View style={styles.profileValueContainer}>
              <Text style={styles.profileValue}>週1回</Text>
            </View>
          </View>
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
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#156486',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#4a5568',
    lineHeight: 20,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f9ff',
  },
  profileContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  profileSection: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  profileLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
    marginLeft: 8,
  },
})
