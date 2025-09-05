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
  selectedDate,
}: Props) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [usageDate, setUsageDate] = useState(selectedDate);

  const handleSave = () => {
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      quantity: quantity.trim() || '1個',
      expiryDate: expiryDate || undefined,
      usageDate: usageDate || undefined,
    });

    // フォームをリセット
    setName('');
    setQuantity('');
    setExpiryDate('');
    setUsageDate(selectedDate);
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
});
