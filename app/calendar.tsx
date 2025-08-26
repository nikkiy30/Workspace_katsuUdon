/**
 * メインのカレンダー画面
 * 初心者向け：カレンダー表示と基本操作の実装
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Plus, ChefHat, Clock, Users } from 'lucide-react-native';
import { Stack } from 'expo-router';
import { CookingPlan, CalendarMarkings } from '@/types/calendar';
import { loadCookingPlans } from '@/services/storageService';
import { formatDate, getTodayString, formatTime12Hour } from '@/utils/dateUtils';
import AddPlanModal from '@/components/AddPlanModal';
import { SafeAreaView } from 'react-native-safe-area-context';


/**
 * カレンダー画面
 * 料理計画を視覚的に表示し、日付選択機能を提供
 */
export default function CalendarScreen() {
  // ステート管理：初心者向け解説
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString()); // 選択された日付
  const [cookingPlans, setCookingPlans] = useState<CookingPlan[]>([]); // 料理計画データ
  const [calendarMarkings, setCalendarMarkings] = useState<CalendarMarkings>({}); // カレンダーマーク
  const [selectedDatePlans, setSelectedDatePlans] = useState<CookingPlan[]>([]); // 選択日の計画
  const [loading, setLoading] = useState<boolean>(true); // ローディング状態
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false); // モーダルの表示状態
  const [editingPlan, setEditingPlan] = useState<CookingPlan | undefined>(undefined); // 編集対象の計画

  /**
   * コンポーネントがマウントされた時の初期化処理
   */
  useEffect(() => {
    loadInitialData();
  }, []);

  /**
   * 選択された日付が変更された時の処理
   */
  useEffect(() => {
    updateSelectedDatePlans();
  }, [selectedDate, cookingPlans]);

  /**
   * 初期データの読み込み
   */
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const plans = await loadCookingPlans();
      setCookingPlans(plans);
      generateCalendarMarkings(plans);
      console.log(`${plans.length}件の料理計画を読み込みました`);
    } catch (error) {
      console.error('初期データの読み込みに失敗:', error);
      Alert.alert('エラー', 'データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  /**
   * カレンダーのマーキング情報を生成
   * @param plans - 料理計画の配列
   */
  const generateCalendarMarkings = (plans: CookingPlan[]) => {
    const markings: CalendarMarkings = {};
    const today = getTodayString();

    // 今日の日付をマーク
    markings[today] = {
      selected: selectedDate === today,
      selectedColor: '#156486',
      marked: false,
    };

    // 料理計画がある日付をマーク
    plans.forEach(plan => {
      const dateKey = plan.date;
      if (markings[dateKey]) {
        // 既存のマークに追加
        markings[dateKey] = {
          ...markings[dateKey],
          marked: true,
          dotColor: getCategoryColor(plan.category),
        };
      } else {
        // 新しいマークを作成
        markings[dateKey] = {
          selected: selectedDate === dateKey,
          selectedColor: selectedDate === dateKey ? '#156486' : undefined,
          marked: true,
          dotColor: getCategoryColor(plan.category),
        };
      }
    });

    setCalendarMarkings(markings);
  };

  /**
   * 料理カテゴリーに応じた色を取得
   * @param category - 料理カテゴリー
   * @returns 対応する色
   */
  const getCategoryColor = (category: CookingPlan['category']): string => {
    const colors = {
      breakfast: '#FF9800', // オレンジ（朝食）
      lunch: '#2196F3',     // 青（昼食）
      dinner: '#9C27B0',    // 紫（夕食）
      snack: '#4CAF50',     // 緑（おやつ）
    };
    return colors[category] || '#757575';
  };

  /**
   * 選択された日付の料理計画を更新
   */
  const updateSelectedDatePlans = () => {
    const plansForDate = cookingPlans.filter(plan => plan.date === selectedDate);
    setSelectedDatePlans(plansForDate.sort((a, b) => {
      // 時間がある場合は時間順、ない場合はカテゴリ順でソート
      if (a.time && b.time) {
        return a.time.localeCompare(b.time);
      }
      if (a.time) return -1;
      if (b.time) return 1;
      return a.category.localeCompare(b.category);
    }));
  };

  /**
   * 日付が選択された時の処理
   * @param day - 選択された日付情報
   */
  const handleDateSelect = (day: any) => {
    const dateString = day.dateString;
    setSelectedDate(dateString);
    console.log(`日付が選択されました: ${dateString}`);
  };

  /**
   * 料理計画項目のレンダリング
   * @param plan - 料理計画
   */
  const renderPlanItem = (plan: CookingPlan) => {
    const categoryIcons = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snack: '🍪',
    };

    return (
      <TouchableOpacity
        key={plan.id}
        style={[styles.planItem, { borderLeftColor: getCategoryColor(plan.category) }]}
        onPress={() => handlePlanPress(plan)}
      >
        <View style={styles.planHeader}>
          <Text style={styles.planCategory}>
            {categoryIcons[plan.category]} {plan.category}
          </Text>
          {plan.time && (
            <View style={styles.timeContainer}>
              <Clock size={16} color="#666" />
              <Text style={styles.planTime}>{formatTime12Hour(plan.time)}</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.planTitle}>{plan.title}</Text>
        
        {plan.description && (
          <Text style={styles.planDescription} numberOfLines={2}>
            {plan.description}
          </Text>
        )}

        <View style={styles.planDetails}>
          {plan.prepTime && (
            <View style={styles.detailItem}>
              <ChefHat size={14} color="#666" />
              <Text style={styles.detailText}>{plan.prepTime}分</Text>
            </View>
          )}
          {plan.servings && (
            <View style={styles.detailItem}>
              <Users size={14} color="#666" />
              <Text style={styles.detailText}>{plan.servings}人分</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  /**
   * 料理計画項目がタップされた時の処理
   * @param plan - タップされた料理計画
   */
  const handlePlanPress = (plan: CookingPlan) => {
    Alert.alert(
      plan.title,
      plan.description || '詳細情報はありません',
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: '編集', onPress: () => handleEditPlan(plan) },
      ]
    );
  };

  /**
   * 料理計画の編集を開始
   * @param plan - 編集する料理計画
   */
  const handleEditPlan = (plan: CookingPlan) => {
    setEditingPlan(plan);
    setIsModalVisible(true);
  };

  /**
   * 料理計画が保存された時の処理
   * @param plan - 保存された料理計画
   */
  const handlePlanSaved = async (plan: CookingPlan) => {
    try {
      // 料理計画リストを更新
      const updatedPlans = await loadCookingPlans();
      setCookingPlans(updatedPlans);
      
      // カレンダーのマーキングを更新
      generateCalendarMarkings(updatedPlans);
      
      // 選択日の計画を更新
      updateSelectedDatePlans();
      
      console.log('料理計画が更新されました:', plan.title);
    } catch (error) {
      console.error('料理計画の更新に失敗:', error);
      Alert.alert('エラー', '料理計画の更新に失敗しました');
    }
  };

  /**
   * モーダルを閉じる処理
   */
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingPlan(undefined);
  };

  /**
   * 新規計画追加ボタンがタップされた時の処理
   */
  const handleAddPlan = () => {
    setEditingPlan(undefined);
    setIsModalVisible(true);
  };

  // ローディング中の表示
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>カレンダーを読み込み中...</Text>
      </View>
    );
  }

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <Stack.Screen options={{ title: "カレンダー" }} />
        <ScrollView style={styles.container}>
            {/* カレンダー表示部分 */}
            <View style={styles.calendarContainer}>
            <Calendar
                current={selectedDate}
                onDayPress={handleDateSelect}
                markedDates={calendarMarkings}
                monthFormat={'yyyy年 MM月'}
                theme={{
                backgroundColor: '#ffffff',
                calendarBackground: '#ffffff',
                textSectionTitleColor: '#b6c1cd',
                            selectedDayBackgroundColor: '#156486',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#156486',
                dayTextColor: '#2d4150',
                textDisabledColor: '#d9e1e8',
                dotColor: '#156486',
                selectedDotColor: '#ffffff',
                arrowColor: '#156486',
                disabledArrowColor: '#d9e1e8',
                monthTextColor: '#2d4150',
                indicatorColor: '#156486',
                textDayFontWeight: '300',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '300',
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 13
                }}
            />
            </View>

            {/* 選択された日付の情報表示 */}
            <View style={styles.selectedDateContainer}>
            <View style={styles.selectedDateHeader}>
                <Text style={styles.selectedDateText}>
                {formatDate(selectedDate, 'M月d日 (eee)')}の予定
                </Text>
                <TouchableOpacity style={styles.addButton} onPress={handleAddPlan}>
                <Plus size={20} color="#fff" />
                <Text style={styles.addButtonText}>追加</Text>
                </TouchableOpacity>
            </View>

            {/* 選択日の料理計画一覧 */}
            {selectedDatePlans.length > 0 ? (
                <View style={styles.plansContainer}>
                {selectedDatePlans.map(renderPlanItem)}
                </View>
            ) : (
                <View style={styles.noPlansContainer}>
                <Text style={styles.noPlansText}>この日の料理計画はありません</Text>
                <TouchableOpacity style={styles.addPlanButton} onPress={handleAddPlan}>
                    <ChefHat size={24} color="#156486" />
                    <Text style={styles.addPlanText}>料理計画を追加</Text>
                </TouchableOpacity>
                </View>
            )}
            </View>
        </ScrollView>

        {/* 料理計画追加・編集モーダル */}
        <AddPlanModal
            isVisible={isModalVisible}
            onClose={handleCloseModal}
            onSave={handlePlanSaved}
            selectedDate={selectedDate}
            editingPlan={editingPlan}
        />
      </SafeAreaView>
    </>
  );
}

/**
 * スタイル定義
 * 初心者向け：各要素の見た目を定義
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  selectedDateContainer: {
    margin: 16,
  },
  selectedDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d4150',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#156486',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 4,
    fontWeight: '600',
  },
  plansContainer: {
    gap: 12,
  },
  planItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  planTime: {
    fontSize: 12,
    color: '#666',
  },
  planTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d4150',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  planDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
  },
  noPlansContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  noPlansText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  addPlanButton: {
    alignItems: 'center',
    gap: 8,
  },
  addPlanText: {
    fontSize: 14,
    color: '#156486',
    fontWeight: '600',
  },
});
