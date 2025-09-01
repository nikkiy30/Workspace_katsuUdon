import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { WasteDB } from '@/database/db/Wastedb';
import { WasteRecordInput } from '@/database/types';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft } from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity
} from 'react-native';

interface InputField {
  id: string;
  label: string;
  placeholder: string;
  value: string;
}

export default function WasteScreen() {
  const [inputFields, setInputFields] = useState<InputField[]>([
    {
      id: 'food-item',
      label: '廃棄する食品',
      placeholder: '例)鶏むね肉',
      value: '',
    },
    {
      id: 'disposal-amount',
      label: '廃棄量',
      placeholder: '例)100g',
      value: '',
    },
    {
      id: 'purchase-amount',
      label: '購入量、金額',
      placeholder: '例)300g',
      value: '',
    },
  ]);

  const [notes, setNotes] = useState('');

  const updateInputField = (id: string, value: string) => {
    setInputFields(prev =>
      prev.map(field =>
        field.id === id ? { ...field, value } : field
      )
    );
  };

  const handleSave = () => {
    // 入力値を取得
    const foodName = inputFields.find(field => field.id === 'food-item')?.value || '';
    const throwAmount = inputFields.find(field => field.id === 'disposal-amount')?.value || '';
    const buyAmount = inputFields.find(field => field.id === 'purchase-amount')?.value || '';

    // バリデーション
    if (!foodName.trim()) {
      Alert.alert('エラー', '廃棄する食品名を入力してください');
      return;
    }
    if (!throwAmount.trim()) {
      Alert.alert('エラー', '廃棄量を入力してください');
      return;
    }
    if (!buyAmount.trim()) {
      Alert.alert('エラー', '購入量・金額を入力してください');
      return;
    }

    try {
      const wasteDB = new WasteDB();
      const wasteRecord: WasteRecordInput = {
        food_name: foodName.trim(),
        throw_amount: throwAmount.trim(),
        buy_amount: buyAmount.trim(),
        created_at: new Date().toISOString(),
      };

      //! ここで記録する
      wasteDB.addWasteRecord(wasteRecord);
      
      // wasteDB.logLatestWasteRecord;
      Alert.alert('保存完了', '廃棄記録を保存しました', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('廃棄記録保存エラー:', error);
      Alert.alert('エラー', '保存に失敗しました');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#fafeff" />
      
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <ThemedView style={styles.content}>
            {/* Header */}
            <ThemedView style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <ArrowLeft size={24} color="#156486" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <ThemedText style={styles.saveButtonText}>保存する</ThemedText>
              </TouchableOpacity>
              {/* 
              TODO: 右矢印を作りたい
              <View style={styles.headerLines}>
                <View style={styles.headerLine} />
                <View style={styles.headerLine} />
              </View> */}
            </ThemedView>

            {/* Input Fields */}
            {inputFields.map((field, index) => (
              <ThemedView key={field.id} style={[styles.inputContainer, { marginTop: index === 0 ? 40 : 20 }]}>
                <ThemedText style={styles.inputLabel}>{field.label}</ThemedText>
                <TextInput
                  style={styles.textInput}
                  placeholder={field.placeholder}
                  placeholderTextColor="#10142066"
                  value={field.value}
                  onChangeText={(text) => updateInputField(field.id, text)}
                />
              </ThemedView>
            ))}

            {/* Notes Section */}
            <ThemedView style={styles.notesContainer}>
              <ThemedText style={styles.notesLabel}>備考</ThemedText>
              <TextInput
                style={styles.notesInput}
                placeholder=""
                placeholderTextColor="#10142066"
                multiline
                numberOfLines={8}
                textAlignVertical="top"
                value={notes}
                onChangeText={setNotes}
              />
            </ThemedView>
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 14,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: 8,
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  saveButtonText: {
    fontWeight: '600',
    color: '#156486',
    fontSize: 20,
  },
  headerLines: {
    width: 19,
    height: 58,
  },
  headerLine: {
    width: 19,
    height: 31,
    backgroundColor: '#156486',
    marginBottom: 27,
  },
  inputContainer: {
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  inputLabel: {
    color: '#156486',
    fontSize: 15,
    marginBottom: 8,
    fontWeight: '400',
  },
  textInput: {
    width: '100%',
    height: 56,
    backgroundColor: '#1564861a',
    borderRadius: 5,
    borderWidth: 3,
    borderColor: '#156486',
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#101420',
  },
  notesContainer: {
    marginTop: 20,
    backgroundColor: 'transparent',
  },
  notesLabel: {
    color: '#15648659',
    fontSize: 15,
    marginBottom: 8,
    marginLeft: 12,
    fontWeight: '400',
  },
  notesInput: {
    width: '100%',
    height: 194,
    backgroundColor: '#fafeff',
    borderRadius: 5,
    borderWidth: 3,
    borderColor: '#156486',
    padding: 12,
    fontSize: 15,
    color: '#101420',
  },
});
