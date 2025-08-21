import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { UserProfile } from '@/types/database'

export default function ProfileScreen() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    occupation: 'other',
    living_situation: 'alone',
    cooking_frequency: 3,
    meal_size: 'medium',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (data) {
      setProfile(data)
    }
  }

  const saveProfile = async () => {
    if (!user) return

    setLoading(true)
    try {
      const profileData = {
        user_id: user.id,
        ...profile,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('user_profiles')
        .upsert(profileData)

      if (error) {
        Alert.alert('エラー', 'プロフィールの保存に失敗しました')
      } else {
        Alert.alert('成功', 'プロフィールを保存しました')
      }
    } catch (error) {
      Alert.alert('エラー', '予期しないエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      Alert.alert('エラー', 'ログアウトに失敗しました')
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>プロフィール設定</Text>
        <Text style={styles.subtitle}>あなたの生活スタイルを教えてください</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>職業</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={profile.occupation}
            onValueChange={(value) => setProfile({ ...profile, occupation: value })}
            style={styles.picker}
          >
            <Picker.Item label="主婦" value="housewife" />
            <Picker.Item label="大学生" value="student" />
            <Picker.Item label="その他" value="other" />
          </Picker>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>生活形態</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={profile.living_situation}
            onValueChange={(value) => setProfile({ ...profile, living_situation: value })}
            style={styles.picker}
          >
            <Picker.Item label="一人暮らし" value="alone" />
            <Picker.Item label="実家暮らし" value="with_family" />
            <Picker.Item label="その他" value="other" />
          </Picker>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>自炊頻度（週あたり）</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={profile.cooking_frequency}
            onValueChange={(value) => setProfile({ ...profile, cooking_frequency: value })}
            style={styles.picker}
          >
            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
              <Picker.Item key={num} label={`${num}回`} value={num} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>食事量</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={profile.meal_size}
            onValueChange={(value) => setProfile({ ...profile, meal_size: value })}
            style={styles.picker}
          >
            <Picker.Item label="小" value="small" />
            <Picker.Item label="中" value="medium" />
            <Picker.Item label="大" value="large" />
          </Picker>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={saveProfile}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? '保存中...' : 'プロフィールを保存'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>ログアウト</Text>
      </TouchableOpacity>
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
  section: {
    backgroundColor: 'white',
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#f7fafc',
  },
  picker: {
    height: 50,
  },
  button: {
    backgroundColor: '#4299e1',
    marginHorizontal: 24,
    marginTop: 32,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#a0aec0',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 32,
    paddingVertical: 12,
    alignItems: 'center',
  },
  signOutText: {
    color: '#e53e3e',
    fontSize: 16,
  },
})