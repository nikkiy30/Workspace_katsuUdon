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
import { CookingPlan } from '@/types/calendar';
import { saveCookingPlan } from '@/services/storageService';
import { Colors } from '@/constants/Colors';


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
   * 入力値の検証
   * @returns 検証結果とエラーメッセージ
   */
  const validateForm = (): { isValid: boolean; errorMessage?: string } => {
    if (!title.trim()) {
      return { isValid: false, errorMessage: '料理名を入力してください' };
    }

    if (time) {
      // 時間の形式をチェック（HH:mm）
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(time)) {
        return { isValid: false, errorMessage: '時間は HH:mm 形式で入力してください（例：14:30）' };
      }
    }

    if (prepTime && (isNaN(Number(prepTime)) || Number(prepTime) < 0)) {
      return { isValid: false, errorMessage: '準備時間は正の数値で入力してください' };
    }

    if (cookTime && (isNaN(Number(cookTime)) || Number(cookTime) < 0)) {
      return { isValid: false, errorMessage: '調理時間は正の数値で入力してください' };
    }

    if (servings && (isNaN(Number(servings)) || Number(servings) < 1)) {
      return { isValid: false, errorMessage: '人数は1以上の数値で入力してください' };
    }

    return { isValid: true };
  };

  /**
   * 保存ボタンが押された時の処理
   */
  const handleSave = async () => {
    try {
      // 入力値の検証
      const validation = validateForm();
      if (!validation.isValid) {
        Alert.alert('入力エラー', validation.errorMessage);
        return;
      }

      setLoading(true);

      // 材料リストから空文字を除外
      const cleanIngredients = ingredients
        .filter(ingredient => ingredient.trim().length > 0)
        .map(ingredient => ingredient.trim());

      // 料理計画オブジェクトを作成
      const newPlan: CookingPlan = {
        id: editingPlan?.id || generateId(),
        title: title.trim(),
        description: description.trim() || undefined,
        date: selectedDate,
        time: time || undefined,
        ingredients: cleanIngredients.length > 0 ? cleanIngredients : undefined,
        category,
        difficulty,
        prepTime: prepTime ? Number(prepTime) : undefined,
        cookTime: cookTime ? Number(cookTime) : undefined,
        servings: servings ? Number(servings) : undefined,
        createdAt: editingPlan?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // データを保存
      await saveCookingPlan(newPlan);

      // 親コンポーネントにコールバック
      onSave(newPlan);

      // モーダルを閉じる
      onClose();

      console.log('料理計画を保存しました:', newPlan.title);
    } catch (error) {
      console.error('保存エラー:', error);
      Alert.alert('エラー', '料理計画の保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  /**
   * ユニークIDを生成
   * @returns 生成されたID文字列
   */
  const generateId = (): string => {
    return `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  /**
   * 材料を追加
   */
  const addIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  /**
   * 材料を削除
   * @param index - 削除する材料のインデックス
   */
  const removeIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients.length > 0 ? newIngredients : ['']);
  };

  /**
   * 材料の内容を更新
   * @param index - 更新する材料のインデックス
   * @param value - 新しい値
   */
  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  /**
   * カテゴリー選択ボタンのレンダリング
   */
  const renderCategoryButton = (cat: CookingPlan['category'], label: string, icon: string) => (
    <TouchableOpacity
      key={cat}
      style={[
        styles.categoryButton,
        category === cat && styles.categoryButtonSelected
      ]}
      onPress={() => setCategory(cat)}
    >
      <Text style={styles.categoryIcon}>{icon}</Text>
      <Text style={[
        styles.categoryText,
        category === cat && styles.categoryTextSelected
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  /**
   * 難易度選択ボタンのレンダリング
   */
  const renderDifficultyButton = (diff: CookingPlan['difficulty'], label: string) => (
    <TouchableOpacity
      key={diff}
      style={[
        styles.difficultyButton,
        difficulty === diff && styles.difficultyButtonSelected
      ]}
      onPress={() => setDifficulty(diff)}
    >
      <Text style={[
        styles.difficultyText,
        difficulty === diff && styles.difficultyTextSelected
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      avoidKeyboard
      style={styles.modal}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.modalContent}>
          {/* ヘッダー */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {editingPlan ? '料理計画を編集' : '新しい料理計画'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
            {/* 料理名 */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>料理名 *</Text>
              <TextInput
                style={styles.textInput}
                value={title}
                onChangeText={setTitle}
                placeholder="例：ハンバーグ"
                maxLength={50}
              />
            </View>

            {/* カテゴリー選択 */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>食事の種類</Text>
              <View style={styles.categoryContainer}>
                {renderCategoryButton('breakfast', '朝食', '🌅')}
                {renderCategoryButton('lunch', '昼食', '☀️')}
                {renderCategoryButton('dinner', '夕食', '🌙')}
                {renderCategoryButton('snack', 'おやつ', '🍪')}
              </View>
            </View>

            {/* 時間 */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>時間</Text>
              <TextInput
                style={styles.textInput}
                value={time}
                onChangeText={setTime}
                placeholder="14:30"
                keyboardType="numeric"
                maxLength={5}
              />
              <Text style={styles.helperText}>24時間形式で入力（例：14:30）</Text>
            </View>

            {/* 説明 */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>説明</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="料理の詳細や特記事項"
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </View>

            {/* 難易度 */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>難易度</Text>
              <View style={styles.difficultyContainer}>
                {renderDifficultyButton('easy', '簡単')}
                {renderDifficultyButton('medium', '普通')}
                {renderDifficultyButton('hard', '難しい')}
              </View>
            </View>

            {/* 準備・調理時間 */}
            <View style={styles.formRow}>
              <View style={styles.formGroupHalf}>
                <Text style={styles.label}>準備時間（分）</Text>
                <TextInput
                  style={styles.textInput}
                  value={prepTime}
                  onChangeText={setPrepTime}
                  placeholder="15"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.formGroupHalf}>
                <Text style={styles.label}>調理時間（分）</Text>
                <TextInput
                  style={styles.textInput}
                  value={cookTime}
                  onChangeText={setCookTime}
                  placeholder="30"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* 人数 */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>人数</Text>
              <TextInput
                style={styles.textInput}
                value={servings}
                onChangeText={setServings}
                placeholder="4"
                keyboardType="numeric"
              />
            </View>

            {/* 材料リスト */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>材料</Text>
              {ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientRow}>
                  <TextInput
                    style={[styles.textInput, styles.ingredientInput]}
                    value={ingredient}
                    onChangeText={(value) => updateIngredient(index, value)}
                    placeholder={`材料 ${index + 1}`}
                    maxLength={50}
                  />
                  {ingredients.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeIngredientButton}
                      onPress={() => removeIngredient(index)}
                    >
                      <Trash2 size={20} color="#ff4444" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <TouchableOpacity style={styles.addIngredientButton} onPress={addIngredient}>
                <Plus size={20} color={Colors.light.primary} />
                <Text style={styles.addIngredientText}>材料を追加</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* 保存ボタン */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              <Save size={20} color="#fff" />
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

/**
 * スタイル定義
 */
const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d4150',
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  formGroupHalf: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d4150',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  categoryButtonSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: '#e8f5f8',
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
  },
  categoryTextSelected: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  difficultyButtonSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: '#e8f5f8',
  },
  difficultyText: {
    fontSize: 14,
    color: '#666',
  },
  difficultyTextSelected: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ingredientInput: {
    flex: 1,
    marginBottom: 0,
  },
  removeIngredientButton: {
    marginLeft: 8,
    padding: 4,
  },
  addIngredientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#156486',
    borderRadius: 8,
    borderStyle: 'dashed',
    gap: 4,
  },
  addIngredientText: {
    color: '#156486',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddPlanModal;
