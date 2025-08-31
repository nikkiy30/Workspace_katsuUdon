/**
 * 料理計画追加・編集モーダル
 * 初心者向け：フォーム作成と入力値管理の実装
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import Modal from 'react-native-modal';
import { X, Save, Plus, Trash2 } from 'lucide-react-native';
import { CookingPlan } from './types';
import { saveCookingPlan } from './storage';


// モーダルのProps型定義
interface AddPlanModalProps {
  isVisible: boolean; // モーダルの表示状態
  onClose: () => void; // モーダルを閉じる関数
  onSave: (plan: CookingPlan) => void; // 保存時のコールバック
  selectedDate: string; // 選択されている日付
  editingPlan?: CookingPlan; // 編集対象の計画（新規作成の場合はundefined）
}

/**
 * 料理計画の追加・編集モーダルコンポーネント
 */
const AddPlanModal: React.FC<AddPlanModalProps> = ({
  isVisible,
  onClose,
  onSave,
  selectedDate,
  editingPlan
}) => {
  // フォームの入力値を管理するステート
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [category, setCategory] = useState<CookingPlan['category']>('dinner');
  const [difficulty, setDifficulty] = useState<CookingPlan['difficulty']>('easy');
  const [prepTime, setPrepTime] = useState<string>('');
  const [cookTime, setCookTime] = useState<string>('');
  const [servings, setServings] = useState<string>('');
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * モーダルが開かれた時の初期化処理
   */
  useEffect(() => {
    if (isVisible) {
      if (editingPlan) {
        // 編集モードの場合、既存データを設定
        initializeWithExistingPlan(editingPlan);
      } else {
        // 新規作成の場合、フォームをリセット
        resetForm();
      }
    }
  }, [isVisible, editingPlan]);

  /**
   * 既存の料理計画データでフォームを初期化
   * @param plan - 編集する料理計画
   */
  const initializeWithExistingPlan = (plan: CookingPlan) => {
    setTitle(plan.title);
    setDescription(plan.description || '');
    setTime(plan.time || '');
    setCategory(plan.category);
    setDifficulty(plan.difficulty);
    setPrepTime(plan.prepTime?.toString() || '');
    setCookTime(plan.cookTime?.toString() || '');
    setServings(plan.servings?.toString() || '');
    setIngredients(plan.ingredients && plan.ingredients.length > 0 ? plan.ingredients : ['']);
  };

  /**
   * フォームをリセット
   */
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTime('');
    setCategory('dinner');
    setDifficulty('easy');
    setPrepTime('');
    setCookTime('');
    setServings('');
    setIngredients(['']);
  };

  /**
   * 材料の追加
   */
  const addIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  /**
   * 材料の削除
   * @param index - 削除する材料のインデックス
   */
  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      const newIngredients = ingredients.filter((_, i) => i !== index);
      setIngredients(newIngredients);
    }
  };

  /**
   * 材料の更新
   * @param index - 更新する材料のインデックス
   * @param value - 新しい値
   */
  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  /**
   * フォームの保存処理
   */
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('エラー', '料理名を入力してください');
      return;
    }

    try {
      setLoading(true);

      const newPlan: CookingPlan = {
        id: editingPlan?.id || `plan_${Date.now()}`,
        title: title.trim(),
        description: description.trim() || undefined,
        date: selectedDate,
        time: time.trim() || undefined,
        category,
        difficulty,
        prepTime: prepTime ? parseInt(prepTime, 10) : undefined,
        cookTime: cookTime ? parseInt(cookTime, 10) : undefined,
        servings: servings ? parseInt(servings, 10) : undefined,
        ingredients: ingredients.filter(ing => ing.trim()),
        createdAt: editingPlan?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveCookingPlan(newPlan);
      onSave(newPlan);
      onClose();
      resetForm();
    } catch (error) {
      console.error('料理計画の保存に失敗:', error);
      Alert.alert('エラー', '保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  /**
   * モーダルを閉じる
   */
  const handleClose = () => {
    if (loading) return; // 保存中は閉じられない
    onClose();
    resetForm();
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={handleClose}
      onBackButtonPress={handleClose}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.container}>
          {/* ヘッダー */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {editingPlan ? '料理計画を編集' : '新しい料理計画'}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* 基本情報 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>基本情報</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>料理名 *</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="例：カレーライス"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>詳細説明</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="料理の詳細やメモを入力"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>時間</Text>
                <TextInput
                  style={styles.input}
                  value={time}
                  onChangeText={setTime}
                  placeholder="例：18:00"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* カテゴリと難易度 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>分類</Text>
              
              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>食事の種類</Text>
                  <View style={styles.pickerContainer}>
                    <TouchableOpacity
                      style={[
                        styles.categoryButton,
                        category === 'breakfast' && styles.categoryButtonActive
                      ]}
                      onPress={() => setCategory('breakfast')}
                    >
                      <Text style={[
                        styles.categoryButtonText,
                        category === 'breakfast' && styles.categoryButtonTextActive
                      ]}>
                        朝食
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.categoryButton,
                        category === 'lunch' && styles.categoryButtonActive
                      ]}
                      onPress={() => setCategory('lunch')}
                    >
                      <Text style={[
                        styles.categoryButtonText,
                        category === 'lunch' && styles.categoryButtonTextActive
                      ]}>
                        昼食
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.categoryButton,
                        category === 'dinner' && styles.categoryButtonActive
                      ]}
                      onPress={() => setCategory('dinner')}
                    >
                      <Text style={[
                        styles.categoryButtonText,
                        category === 'dinner' && styles.categoryButtonTextActive
                      ]}>
                        夕食
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.categoryButton,
                        category === 'snack' && styles.categoryButtonActive
                      ]}
                      onPress={() => setCategory('snack')}
                    >
                      <Text style={[
                        styles.categoryButtonText,
                        category === 'snack' && styles.categoryButtonTextActive
                      ]}>
                        おやつ
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>難易度</Text>
                  <View style={styles.pickerContainer}>
                    <TouchableOpacity
                      style={[
                        styles.difficultyButton,
                        difficulty === 'easy' && styles.difficultyButtonActive
                      ]}
                      onPress={() => setDifficulty('easy')}
                    >
                      <Text style={[
                        styles.difficultyButtonText,
                        difficulty === 'easy' && styles.difficultyButtonTextActive
                      ]}>
                        簡単
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.difficultyButton,
                        difficulty === 'medium' && styles.difficultyButtonActive
                      ]}
                      onPress={() => setDifficulty('medium')}
                    >
                      <Text style={[
                        styles.difficultyButtonText,
                        difficulty === 'medium' && styles.difficultyButtonTextActive
                      ]}>
                        普通
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.difficultyButton,
                        difficulty === 'hard' && styles.difficultyButtonActive
                      ]}
                      onPress={() => setDifficulty('hard')}
                    >
                      <Text style={[
                        styles.difficultyButtonText,
                        difficulty === 'hard' && styles.difficultyButtonTextActive
                      ]}>
                        難しい
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* 時間と人数 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>時間と人数</Text>
              
              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>準備時間（分）</Text>
                  <TextInput
                    style={styles.input}
                    value={prepTime}
                    onChangeText={setPrepTime}
                    placeholder="15"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>調理時間（分）</Text>
                  <TextInput
                    style={styles.input}
                    value={cookTime}
                    onChangeText={setCookTime}
                    placeholder="30"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>人数分</Text>
                <TextInput
                  style={styles.input}
                  value={servings}
                  onChangeText={setServings}
                  placeholder="4"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* 材料 */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>材料</Text>
                <TouchableOpacity onPress={addIngredient} style={styles.addButton}>
                  <Plus size={20} color="#156486" />
                </TouchableOpacity>
              </View>
              
              {ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientRow}>
                  <TextInput
                    style={[styles.input, styles.ingredientInput]}
                    value={ingredient}
                    onChangeText={(value) => updateIngredient(index, value)}
                    placeholder={`材料${index + 1}`}
                    placeholderTextColor="#9CA3AF"
                  />
                  {ingredients.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeIngredient(index)}
                      style={styles.removeButton}
                    >
                      <Trash2 size={20} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>

          {/* フッター */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              <Save size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>
                {loading ? '保存中...' : '保存'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  categoryButtonActive: {
    backgroundColor: '#156486',
    borderColor: '#156486',
  },
  categoryButtonText: {
    fontSize: 12,
    color: '#6B7280',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  difficultyButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  difficultyButtonActive: {
    backgroundColor: '#156486',
    borderColor: '#156486',
  },
  difficultyButtonText: {
    fontSize: 12,
    color: '#6B7280',
  },
  difficultyButtonTextActive: {
    color: '#FFFFFF',
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  ingredientInput: {
    flex: 1,
  },
  removeButton: {
    padding: 8,
  },
  addButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#156486',
    borderRadius: 6,
    backgroundColor: '#1564861a',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#156486',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AddPlanModal;
