import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import { X, Check, Calendar, Clock, Plus } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Localization from 'expo-localization';
import { FoodItem } from './foodTypes';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (item: Omit<FoodItem, 'id'>) => void;
  selectedDate: string;
}

export default function AddFoodModal({
  visible,
  onClose,
  onSave,
  selectedDate: initialSelectedDate,
}: Props) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [usageDate, setUsageDate] = useState(initialSelectedDate);

  // --- UsageDateModalのロジックに合わせた状態と関数を追加 ---
  const [selectedDate, setSelectedDate] = useState('');
  const [showUsageDatePicker, setShowUsageDatePicker] = useState(false);
  const [usagePickerDate, setUsagePickerDate] = useState<Date>(new Date());
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [usageAmountInput, setUsageAmountInput] = useState('');
  const [selectedUsages, setSelectedUsages] = useState<Record<string, string>>({});

  const formatLocalYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const addUsageDate = (date: string) => {
    if (!selectedDates.includes(date)) {
      setSelectedDates([...selectedDates, date].sort());
      if (usageAmountInput.trim()) {
        setSelectedUsages(prev => ({ ...prev, [date]: usageAmountInput.trim() }));
      }
      setUsageAmountInput('');
      // 単一保存用の既存usageDateにも最後に追加した日付を反映
      setUsageDate(date);
    }
  };

  const removeUsageDate = (date: string) => {
    setSelectedDates(prev => prev.filter(d => d !== date));
    setSelectedUsages(prev => {
      const next = { ...prev } as Record<string, string>;
      delete next[date];
      return next;
    });
    // もし削除した日付が使用中usageDateなら、他があれば最新に差し替え
    setUsageDate(prev => (prev === date ? (selectedDates.filter(d => d !== date).slice(-1)[0] || '') : prev));
  };

  const handleAddCustomDate = () => {
    if (selectedDate) {
      addUsageDate(selectedDate);
      setSelectedDate('');
    }
  };

  const deviceLocale = Localization.getLocales()[0]?.languageTag || 'ja-JP';

  const handleUsageDateChange = (_event: any, picked?: Date) => {
    const current = picked || usagePickerDate;
    setShowUsageDatePicker(Platform.OS === 'ios');
    setUsagePickerDate(current);
    setSelectedDate(formatLocalYMD(current));
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    // 複数選択されている場合は、各日付に対して保存（UsageDateModal同様、使用量も保存）
    if (selectedDates.length > 0) {
      for (let i = 0; i < selectedDates.length; i++) {
        const date = selectedDates[i];
        const usageAmount = selectedUsages[date];
        // 最初の1件にのみ消費期限を付与（重複登録回避）
        // onSaveは親でID付与&保存
        // eslint-disable-next-line no-await-in-loop
        await Promise.resolve(
          onSave({
            name: name.trim(),
            quantity: quantity.trim() || '1個',
            usageDate: date,
            ...(i === 0 && expiryDate ? { expiryDate } : {}),
            ...(usageAmount ? { usageAmount } : {}),
          })
        );
      }
    } else {
      // 単一保存（必要ならusageDateも付与）
      await Promise.resolve(
        onSave({
          name: name.trim(),
          quantity: quantity.trim() || '1個',
          expiryDate: expiryDate || undefined,
          usageDate: usageDate || undefined,
          // 単一入力時の使用量は未確定のため付与しない
        })
      );
    }

    // フォームをリセット
    setName('');
    setQuantity('');
    setExpiryDate('');
    setUsageDate(initialSelectedDate);
    setSelectedDates([]);
    setSelectedUsages({});
    setSelectedDate('');
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#6b7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>食材を追加</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Check size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 食材名入力 */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>食材名 *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="例：鶏むね肉"
              value={name}
              onChangeText={setName}
              autoFocus
            />
          </View>

          {/* 数量入力 */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>数量</Text>
            <TextInput
              style={styles.textInput}
              placeholder="例：300g, 1パック, 2個"
              value={quantity}
              onChangeText={setQuantity}
            />
          </View>

          {/* カテゴリーは使用しないため省略 */}

          {/* 使用予定日（UsageDateModalのUIを流用） */}
          {/* カスタム日付選択 */}
          <View style={styles.customDateSection}>
            <Text style={styles.sectionTitle}>カスタム日付</Text>
            <Text style={styles.sectionSubtitle}>
              特定の日付を指定したい場合
            </Text>
            
          <View style={styles.customDateContainer}>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowUsageDatePicker((prev) => !prev)}
            >
              <Calendar size={20} color={Colors.light.primary} />
              <Text style={styles.datePickerText}>
                {selectedDate ? 
                  new Date(selectedDate).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }) : 
                  '日付を選択'
                }
              </Text>
            </TouchableOpacity>

              {showUsageDatePicker && (
                 <DateTimePicker
                 value={usagePickerDate}
                 mode="date"
                 display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                 onChange={handleUsageDateChange}
                 themeVariant="light"
                 style={Platform.OS === 'ios' ? styles.datePickerIOS : {}}
                 locale={deviceLocale.startsWith('ja') ? 'ja' : 'ja-JP'}
               />
              )}
              
            {/* 使用量入力 */}
            <View style={{ marginTop: 12 }}>
              <Text style={styles.sectionSubtitle}>この日の使用量（例: 200g, 1個 など）</Text>
              <TextInput
                placeholder="使用量を入力"
                value={usageAmountInput}
                onChangeText={setUsageAmountInput}
                style={styles.amountInput}
              />
            </View>

            {selectedDate && (
              <TouchableOpacity
                style={styles.addDateButton}
                onPress={handleAddCustomDate}
              >
                <Plus size={20} color="#ffffff" />
                <Text style={styles.addDateText}>追加</Text>
              </TouchableOpacity>
            )}
          </View>
          </View>

           {/* 選択された使用予定日一覧 */}
          {selectedDates.length > 0 && (
            <View style={styles.selectedDatesSection}>
              <Text style={styles.sectionTitle}>選択された使用予定日</Text>
              <View style={styles.selectedDatesList}>
                {selectedDates.map((date) => (
                  <View key={date} style={styles.selectedDateItem}>
                    <Text style={styles.selectedDateText}>
                      {new Date(date).toLocaleDateString('ja-JP', {
                        month: 'short',
                        day: 'numeric',
                      })}
                      {selectedUsages[date] ? ` ・ 使用量: ${selectedUsages[date]}` : ''}
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeUsageDate(date)}
                      style={styles.removeDateButton}
                    >
                      <X size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

        </ScrollView>
      </View>
    </Modal>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#374151',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dateSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  dateInputContainer: {
    marginBottom: 16,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  dateInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#374151',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  presetSection: {
    marginBottom: 24,
  },
  presetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  presetButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetButton: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  presetButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.primary,
  },
  // --- UsageDateModalから流用 ---
  customDateSection: {
    marginBottom: 24,
  },
  customDateContainer: {
    gap: 16,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  datePickerText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  addDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  addDateText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  amountInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#374151',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  datePickerIOS: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginTop: 8,
  },
  selectedDatesSection: {
    marginBottom: 24,
  },
  selectedDatesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedDateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  selectedDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
    marginRight: 6,
  },
  removeDateButton: {
    padding: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
});
