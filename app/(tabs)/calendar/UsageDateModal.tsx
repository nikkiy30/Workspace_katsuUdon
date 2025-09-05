import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  Dimensions,
  Switch,
  TouchableWithoutFeedback,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { X, Check, Calendar, Clock, Zap, Plus, CircleAlert as AlertCircle } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Localization from 'expo-localization';
import { FoodItem } from './foodTypes';
import { Colors } from '@/constants/Colors';

const { width, height } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (
    item: FoodItem,
    usageDate: string,
    includeExpiry?: boolean,
    expiryDate?: string,
    usageAmount?: string,
  ) => void | Promise<void>;
  selectedItem: FoodItem | null;
}

export default function UsageDateModal({
  visible,
  onClose,
  onSave,
  selectedItem,
}: Props) {
  const [selectedDate, setSelectedDate] = useState('');
  const [showUsageDatePicker, setShowUsageDatePicker] = useState(false);
  const [usagePickerDate, setUsagePickerDate] = useState<Date>(new Date());
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [includeExpiry, setIncludeExpiry] = useState(true);
  const [expiryDate, setExpiryDate] = useState('');
  const [usageAmountInput, setUsageAmountInput] = useState('');
  const [selectedUsages, setSelectedUsages] = useState<Record<string, string>>({});

  // ローカルタイムゾーンで YYYY-MM-DD を生成（toISOStringはUTCになるため日付ズレが発生）
  const formatLocalYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const getDefaultExpiryDate = () => {
    const today = new Date();
    const days = 3; // カテゴリーなしのデフォルト
    const expiry = new Date(today);
    expiry.setDate(today.getDate() + days);
    return formatLocalYMD(expiry);
  };

  React.useEffect(() => {
    if (selectedItem && visible) {
      setExpiryDate(getDefaultExpiryDate());
    }
  }, [selectedItem, visible]);

  const getQuickDateOptions = () => {
    const today = new Date();
    const options = [
      { label: '今日', days: 0, icon: Zap, color: '#ef4444' },
      { label: '明日', days: 1, icon: Clock, color: '#f59e0b' },
      { label: '3日後', days: 3, icon: Calendar, color: Colors.light.primary },
      { label: '1週間後', days: 7, icon: Calendar, color: '#10b981' },
    ];

    return options.map((option) => {
      const date = new Date(today);
      date.setDate(today.getDate() + option.days);
      return {
        ...option,
        date: formatLocalYMD(date),
        displayDate: date.toLocaleDateString('ja-JP', {
          month: 'short',
          day: 'numeric',
        }),
      };
    });
  };

  const addUsageDate = (date: string) => {
    if (!selectedDates.includes(date)) {
      setSelectedDates([...selectedDates, date].sort());
      if (usageAmountInput.trim()) {
        setSelectedUsages(prev => ({ ...prev, [date]: usageAmountInput.trim() }));
      }
      setUsageAmountInput('');
    }
  };

  const removeUsageDate = (date: string) => {
    setSelectedDates(selectedDates.filter(d => d !== date));
  };

  const handleQuickSelect = (date: string) => {
    addUsageDate(date);
  };

  const handleSaveAll = async () => {
    if (!selectedItem) return;
    // 順次保存して競合を回避
    for (let i = 0; i < selectedDates.length; i++) {
      const date = selectedDates[i];
      const usageAmount = selectedUsages[date];
      // 最初の1件のみ消費期限を付与
      // 以降は使用予定のみ追加
      // includeExpiryがOFFなら全て使用予定のみ
      // expiryDateは初期表示時に既定値が入っている
      // selectedItem自体は不変
      // onSaveは親側でAsyncStorageに追記
      // 連続保存に備えawaitで逐次化
      // eslint-disable-next-line no-await-in-loop
      await onSave(
        selectedItem,
        date,
        includeExpiry && i === 0,
        includeExpiry ? expiryDate : undefined,
        usageAmount
      );
    }

    // リセット
    setSelectedDates([]);
    setSelectedDate('');
    setIncludeExpiry(true);
    setSelectedUsages({});
    onClose();
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

  if (!selectedItem) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#6b7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>使用予定を追加</Text>
          <TouchableOpacity 
            onPress={handleSaveAll}
            style={[
              styles.saveButton,
              selectedDates.length === 0 && styles.saveButtonDisabled
            ]}
            disabled={selectedDates.length === 0}
          >
            <Check size={24} color={selectedDates.length > 0 ? "#ffffff" : "#9ca3af"} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
          style={{ flex: 1 }}
        >
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
          {/* 選択された食材の表示 */}
          <View style={styles.selectedItemCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemName}>{selectedItem.name}</Text>
              <Text style={styles.itemQuantity}>{selectedItem.quantity}</Text>
            </View>
            {(includeExpiry || selectedItem.expiryDate) && (
              <Text style={styles.itemExpiry}>
                消費期限: {new Date((selectedItem.expiryDate || expiryDate) as string).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            )}
            {/* カテゴリーは使用しないため非表示 */}
          </View>

         

          {/* クイック選択オプション */}
          {/* <View style={styles.quickSelectSection}>
            <Text style={styles.sectionTitle}>クイック選択</Text>
            <Text style={styles.sectionSubtitle}>
              よく使われる日程から選択してください
            </Text>
            
            <View style={styles.quickOptionsGrid}>
              {getQuickDateOptions().map((option) => {
                const IconComponent = option.icon;
                return (
                  <TouchableOpacity
                    key={option.label}
                    style={[
                      styles.quickOption,
                      { borderColor: option.color },
                    ]}
                    onPress={() => handleQuickSelect(option.date)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.iconContainer, { backgroundColor: `${option.color}15` }]}>
                      <IconComponent size={24} color={option.color} />
                    </View>
                    <Text style={styles.optionLabel}>{option.label}</Text>
                    <Text style={styles.optionDate}>{option.displayDate}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View> */}



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

                    {/* 消費期限も追加するオプション */}
                    <View style={styles.expirySection}>
            <View style={styles.expiryHeader}>
              <View style={styles.expiryTitleContainer}>
                <AlertCircle size={20} color="#f59e0b" />
                <Text style={styles.sectionTitle}>消費期限も追加する</Text>
              </View>
              <Switch
                value={includeExpiry}
                onValueChange={setIncludeExpiry}
                trackColor={{ false: '#e5e7eb', true: '#bfdbfe' }}
                thumbColor={includeExpiry ? Colors.light.primary : '#9ca3af'}
              />
            </View>
            
            {/* includeExpiry 選択時でも詳細な日付表示は行わない */}
          </View>

          {/* 使用例・ヒント */}
          {/* <View style={styles.hintSection}>
            <Text style={styles.hintTitle}>💡 使い方のヒント</Text>
            <Text style={styles.hintText}>
              • 「今日」：すぐに使う予定の食材
            </Text>
            <Text style={styles.hintText}>
              • 「明日」：明日の料理で使用予定
            </Text>
            <Text style={styles.hintText}>
              • 「3日後」：週末の料理で使用予定
            </Text>
            <Text style={styles.hintText}>
              • 「1週間後」：計画的な料理で使用予定
            </Text>
          </View> */}
        </ScrollView>
        </KeyboardAvoidingView>
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
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  selectedItemCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  itemQuantity: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  itemExpiry: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
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
  quickSelectSection: {
    marginBottom: 32,
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
  quickOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickOption: {
    width: (width - 64) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  optionDate: {
    fontSize: 14,
    color: '#6b7280',
  },
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
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  pickerCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  expirySection: {
    backgroundColor: '#fef3cd',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  expiryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  expiryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expiryDateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  expiryDateLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    flex: 1,
  },
  changeExpiryButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  changeExpiryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  hintSection: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
  },
  hintTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 12,
  },
  hintText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
    marginBottom: 4,
  },
});
