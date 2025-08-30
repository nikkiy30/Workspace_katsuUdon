import { router } from 'expo-router'
import { useState } from 'react'
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ProfileEditScreen() {
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      // TODO: 実際の保存処理を実装
      setTimeout(() => {
        Alert.alert('成功', 'プロフィールを保存しました', [
          { text: 'OK', onPress: () => router.back() }
        ])
        setLoading(false)
      }, 1000)
    } catch (error) {
      Alert.alert('エラー', '保存に失敗しました')
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>プロフィール編集画面</Text>
        <Text style={styles.subtitle}>（実装予定）</Text>
        
        {/* TODO: 編集フォームを実装 */}
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            ここに編集フォームが入ります
          </Text>
        </View>

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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#156486',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 40,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  saveButton: {
    backgroundColor: '#156486',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#a0aec0',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
})
