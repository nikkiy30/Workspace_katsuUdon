import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { WasteDB } from '@/database/db/Wastedb';
import { GoogleGenAI } from '@google/genai';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';

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

// Gemini APIの設定
const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenAI({ apiKey: apiKey });

export default function WasteScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
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
      label: '購入量',
      placeholder: '例)1000g',
      value: '',
    },
  ]);

  const [notes, setNotes] = useState('');

  const handleNotesFocus = () => {
    // 備考フィールドにフォーカスした時、適切な位置までスクロール
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100); // キーボードが表示される時間を考慮
  };

  const updateInputField = (id: string, value: string) => {
    setInputFields(prev =>
      prev.map(field =>
        field.id === id ? { ...field, value } : field
      )
    );
  };

  const generateAISuggestion = async (foodName: string, throwAmount: string, buyAmount: string): Promise<number> => {
    if (!apiKey) {
      console.warn('Gemini APIキーが設定されていません');
      return 0;
    }

    try {
      const prompt = `以下の情報をもとに廃棄コストを計算してください（出力は数字だけにしてください）。\n\n廃棄する食品: ${foodName}\n廃棄量: ${throwAmount}\n購入量・金額: ${buyAmount}\n例：100円なら100とだけ答えてください。`;

      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: prompt,
      });

      const suggestion = response.text ?? '0';
      // AIの応答から数値を抽出して整数に変換
      const numericValue = parseInt(suggestion.replace(/[^\d]/g, ''), 10);
      return isNaN(numericValue) ? 0 : numericValue;
    } catch (error) {
      console.error('AI改善提案生成エラー:', error);
      return 0;
    }
  };

  // useEffectの修正（非同期処理を内部で実行）
  useEffect(() => {
    const initializeData = async () => {
      // 必要に応じて初期化処理をここに記述
      console.log('WasteScreen initialized');
    };
    
    initializeData();
  }, []);

  const handleSave = async () => {
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

      // geminiでcostを計算させる（整数で取得）
      const cost = await generateAISuggestion(foodName, throwAmount, buyAmount);

      const wasteRecord = {
        food_name: foodName.trim(),
        throw_amount: throwAmount.trim(),
        buy_amount: buyAmount.trim(),
        cost: cost,
        created_at: new Date().toISOString(),
      };

      // 廃棄記録を保存
      wasteDB.addWasteRecord(wasteRecord);
      
      console.log('Redirecting to home with toast params');
      // Alertを削除し、直接Home画面にリダイレクト（Toastメッセージのパラメータ付き）
      router.replace({
        pathname: '/(tabs)',
        params: { showToast: 'true', toastIcon: 'check-circle', toastMessage: '廃棄を記録しました' }
      });
    } catch (error) {
      console.error('廃棄記録保存エラー:', error);
      Alert.alert('エラー', '保存に失敗しました');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="dark" />
      
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic"
        >
          <ThemedView style={styles.content}>
            {/* Header */}
            <ThemedView style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <ArrowLeft size={24} color={Colors.light.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <ThemedText style={styles.saveButtonText}>保存する  ＞ </ThemedText>
              </TouchableOpacity>
              
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
                onFocus={handleNotesFocus}
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
    paddingBottom: 200, // タッチパッド分の余白を追加
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
    fontWeight: '400',
    color: Colors.light.text,
    fontSize: 20,
  },
  headerLines: {
    width: 19,
    height: 58,
  },
  headerLine: {
    width: 19,
    height: 31,
    backgroundColor: Colors.light.primary,
    marginBottom: 27,
  },
  inputContainer: {
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  inputLabel: {
    color: Colors.light.text,
    fontSize: 15,
    marginBottom: 8,
    fontWeight: '400',
  },
  textInput: {
    width: '100%',
    height: 56,
    backgroundColor: '#fafeff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#101420',
  },
  notesContainer: {
    marginTop: 40, // より大きなマージンを追加
    marginBottom: 100, // 下部にも余白を追加
    backgroundColor: 'transparent',
  },
  notesLabel: {
    color: Colors.light.text,
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
    borderWidth: 1,
    borderColor: Colors.light.primary,
    padding: 12,
    fontSize: 15,
    color: '#101420',
  },
});
