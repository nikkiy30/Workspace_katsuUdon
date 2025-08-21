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
import { Picker } from '@react-native-picker/picker'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { WasteRecord } from '@/types/database'

export default function WasteScreen() {
  const { user } = useAuth()
  const [foodName, setFoodName] = useState('')
  const [wasteAmount, setWasteAmount] = useState('')
  const [wasteUnit, setWasteUnit] = useState<'pieces' | 'percentage'>('pieces')
  const [purchaseAmount, setPurchaseAmount] = useState('')
  const [purchaseUnit, setPurchaseUnit] = useState('個')
  const [loading, setLoading] = useState(false)
  const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>([])

  useEffect(() => {
    if (user) {
      loadWasteRecords()
    }
  }, [user])

  const loadWasteRecords = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('waste_records')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (data) {
      setWasteRecords(data)
    }
  }

  const saveWasteRecord = async () => {
    if (!user || !foodName || !wasteAmount || !purchaseAmount) {
      Alert.alert('エラー', 'すべての項目を入力してください')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('waste_records')
        .insert({
          user_id: user.id,
          food_name: foodName,
          waste_amount: parseFloat(wasteAmount),
          waste_unit: wasteUnit,
          purchase_amount: parseFloat(purchaseAmount),
          purchase_unit: purchaseUnit,
          waste_date: new Date().toISOString(),
        })

      if (error) {
        Alert.alert('エラー', '廃棄記録の保存に失敗しました')
      } else {
        Alert.alert('成功', '廃棄記録を保存しました')
        setFoodName('')
        setWasteAmount('')
        setPurchaseAmount('')
        loadWasteRecords()
      }
    } catch (error) {
      Alert.alert('エラー', '予期しないエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const renderWasteRecord = ({ item }: { item: WasteRecord }) => (
    <View style={styles.recordItem}>
      <Text style={styles.recordTitle}>{item.food_name}</Text>
      <Text style={styles.recordDetail}>
        廃棄量: {item.waste_amount}{item.waste_unit === 'pieces' ? '個' : '%'}
      </Text>
      <Text style={styles.recordDetail}>
        購入量: {item.purchase_amount}{item.purchase_unit}
      </Text>
      <Text style={styles.recordDate}>
        {new Date(item.waste_date).toLocaleDateString('ja-JP')}
      </Text>
    </View>
  )

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>廃棄記録</Text>
        <Text style={styles.subtitle}>食材の廃棄を記録して改善につなげましょう</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>食材名</Text>
          <TextInput
            style={styles.input}
            value={foodName}
            onChangeText={setFoodName}
            placeholder="例: にんじん"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>廃棄量</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.inputSmall]}
              value={wasteAmount}
              onChangeText={setWasteAmount}
              placeholder="数量"
              keyboardType="numeric"
            />
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={wasteUnit}
                onValueChange={setWasteUnit}
                style={styles.picker}
              >
                <Picker.Item label="個" value="pieces" />
                <Picker.Item label="%" value="percentage" />
              </Picker>
            </View>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>購入時の認識量</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.inputSmall]}
              value={purchaseAmount}
              onChangeText={setPurchaseAmount}
              placeholder="数量"
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, styles.inputSmall]}
              value={purchaseUnit}
              onChangeText={setPurchaseUnit}
              placeholder="単位"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={saveWasteRecord}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? '保存中...' : '廃棄記録を保存'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.recordsSection}>
        <Text style={styles.recordsTitle}>最近の廃棄記録</Text>
        <FlatList
          data={wasteRecords}
          renderItem={renderWasteRecord}
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
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#f7fafc',
  },
  picker: {
    height: 42,
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
  recordsSection: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
  },
  recordsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 16,
  },
  recordItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 4,
  },
  recordDetail: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 2,
  },
  recordDate: {
    fontSize: 12,
    color: '#718096',
    marginTop: 4,
  },
})