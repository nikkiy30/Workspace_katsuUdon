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
import { X, Check, Calendar, Clock } from 'lucide-react-native';
import { FoodItem } from './foodTypes';

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
  selectedDate,
}: Props) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [usageDate, setUsageDate] = useState(selectedDate);
  const [selectedCategory, setSelectedCategory] = useState('野菜');

  const categories = ['野菜', '肉類', '乳製品', '調味料', 'その他'];

  const handleSave = () => {
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      quantity: quantity.trim() || '1個',
      expiryDate: expiryDate || undefined,
      usageDate: usageDate || undefined,
      category: selectedCategory,
    });

    // フォームをリセット
    setName('');
    setQuantity('');
    setExpiryDate('');
    setUsageDate(selectedDate);
    setSelectedCategory('野菜');
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

          {/* カテゴリー選択 */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>カテゴリー</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      selectedCategory === category && styles.selectedCategory,
                      {
                        borderColor:
                          selectedCategory === category
                            ? getCategoryColor(category)
                            : '#e5e7eb',
                      },
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        selectedCategory === category && {
                          color: getCategoryColor(category),
                        },
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* 統合日付設定セクション */}
          <View style={styles.dateSection}>
            <Text style={styles.sectionHeader}>日付設定</Text>
            <Text style={styles.sectionSubtext}>
              使用計画と消費期限を同時に設定できます
            </Text>

            {/* 使用予定日 */}
            <View style={styles.dateInputContainer}>
              <View style={styles.dateHeader}>
                <Clock size={20} color="#3b82f6" />
                <Text style={styles.dateLabel}>使用予定日</Text>
              </View>
              <TextInput
                style={styles.dateInput}
                placeholder="YYYY-MM-DD"
                value={usageDate}
                onChangeText={setUsageDate}
              />
            </View>

            {/* 消費期限 */}
            <View style={styles.dateInputContainer}>
              <View style={styles.dateHeader}>
                <Calendar size={20} color="#f59e0b" />
                <Text style={styles.dateLabel}>消費期限</Text>
              </View>
              <TextInput
                style={styles.dateInput}
                placeholder="YYYY-MM-DD"
                value={expiryDate}
                onChangeText={setExpiryDate}
              />
            </View>
          </View>

          {/* プリセット期限ボタン */}
          <View style={styles.presetSection}>
            <Text style={styles.presetTitle}>期限プリセット</Text>
            <View style={styles.presetButtons}>
              {[
                { label: '今日', days: 0 },
                { label: '明日', days: 1 },
                { label: '3日後', days: 3 },
                { label: '1週間', days: 7 },
              ].map((preset) => (
                <TouchableOpacity
                  key={preset.label}
                  style={styles.presetButton}
                  onPress={() => {
                    const date = new Date();
                    date.setDate(date.getDate() + preset.days);
                    setExpiryDate(date.toISOString().split('T')[0]);
                  }}
                >
                  <Text style={styles.presetButtonText}>{preset.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case '肉類':
      return '#ef4444';
    case '野菜':
      return '#10b981';
    case '乳製品':
      return '#3b82f6';
    case '調味料':
      return '#8b5cf6';
    default:
      return '#6b7280';
  }
};

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
    backgroundColor: '#3b82f6',
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
  categoryContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    marginRight: 8,
    backgroundColor: '#ffffff',
  },
  selectedCategory: {
    backgroundColor: '#f8fafc',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
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
    color: '#3b82f6',
  },
});

