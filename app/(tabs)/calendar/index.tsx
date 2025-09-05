import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Plus, ChefHat, CircleAlert as AlertCircle, RotateCcw } from 'lucide-react-native';
import FoodSuggestionCards from './FoodSuggestionCards';
import AddFoodModal from './AddFoodModal';
import UsageDateModal from './UsageDateModal';
import { FoodItem, MarkedDates } from './foodTypes';
import { getFoodItems, saveFoodItem, clearFoodItems, updateFoodItem } from './foodStorage';
import { Colors } from '@/constants/Colors';
import TagActionButton from './TagActionButton';

const { width } = Dimensions.get('window');

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUsageDateModal, setShowUsageDateModal] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<FoodItem | null>(null);
  const [suggestions, setSuggestions] = useState<FoodItem[]>([
    {
      id: '1',
      name: '鶏むね肉',
      quantity: '300g',
    },
    {
      id: '2',
      name: 'ブロッコリー',
      quantity: '1株',
    },
    {
      id: '3',
      name: '牛乳',
      quantity: '1000ml',
    },
    {
      id: '4',
      name: '玉ねぎ',
      quantity: '2個',
    },
    {
      id: '5',
      name: '醤油',
      quantity: '1本',
    },
  ]);

  useEffect(() => {
    loadFoodItems();
  }, []);

  const loadFoodItems = async () => {
    const items = await getFoodItems();
    setFoodItems(items);
    updateMarkedDates(items);
  };

  const updateMarkedDates = (items: FoodItem[]) => {
    const marked: MarkedDates = {};

    items.forEach((item) => {
      // 使用予定日のマーキング
      if (item.usageDate) {
        if (!marked[item.usageDate]) {
          marked[item.usageDate] = { dots: [], marked: true };
        }
        marked[item.usageDate].dots?.push({
          color: Colors.light.primary,
          selectedDotColor: '#ffffff',
        });
      }

      // 消費期限のマーキング
      if (item.expiryDate) {
        const today = new Date().toISOString().split('T')[0];
        const isExpired = item.expiryDate < today;
        const isExpiringSoon =
          new Date(item.expiryDate).getTime() - new Date().getTime() <=
          2 * 24 * 60 * 60 * 1000;

        if (!marked[item.expiryDate]) {
          marked[item.expiryDate] = { dots: [], marked: true };
        }

        marked[item.expiryDate].dots?.push({
          color: isExpired ? '#ef4444' : isExpiringSoon ? '#f59e0b' : '#10b981',
          selectedDotColor: '#ffffff',
        });
      }
    });

    // 選択された日付のハイライト
    if (marked[selectedDate]) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: Colors.light.primary,
      };
    } else {
      marked[selectedDate] = {
        selected: true,
        selectedColor: Colors.light.primary,
        dots: [],
      };
    }

    setMarkedDates(marked);
  };

  const handleAddFood = async (item: Omit<FoodItem, 'id'>) => {
    const newItem: FoodItem = {
      ...item,
      id: Date.now().toString(),
    };

    const updatedItems = [...foodItems, newItem];
    await saveFoodItem(newItem);
    setFoodItems(updatedItems);
    updateMarkedDates(updatedItems);
    setShowAddModal(false);
  };

  const handleExpiryAdd = async (suggestion: FoodItem) => {
    // カテゴリーなし: デフォルトは3日後に設定
    const today = new Date();
    const expiryDays = 3;
    today.setDate(today.getDate() + expiryDays);
    const expiryDate = today.toISOString().split('T')[0];
    
    const itemWithExpiry: FoodItem = {
      ...suggestion,
      expiryDate,
      id: Date.now().toString(),
    };
    
    await handleAddFood(itemWithExpiry);
  };

  const handleCustomAdd = (suggestion: FoodItem) => {
    setSelectedSuggestion(suggestion);
    setShowUsageDateModal(true);
  };

  const handleRemoveSuggestion = (id: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== id));
  };

  const handleUsageDateSave = async (item: FoodItem, usageDate: string, includeExpiry?: boolean, expiryDate?: string) => {
    const itemWithDate: FoodItem = {
      ...item,
      usageDate,
      ...(includeExpiry && expiryDate && { expiryDate }),
      id: Date.now().toString(),
    };
    
    await handleAddFood(itemWithDate);
  };

  const getSelectedDateItems = () => {
    return foodItems.filter(
      (item) =>
        item.usageDate === selectedDate || item.expiryDate === selectedDate
    );
  };

  const getTodaysExpiring = () => {
    const today = new Date().toISOString().split('T')[0];
    return foodItems.filter((item) => {
      if (!item.expiryDate) return false;
      const daysDiff =
        (new Date(item.expiryDate).getTime() - new Date(today).getTime()) /
        (1000 * 60 * 60 * 24);
      return daysDiff <= 2 && daysDiff >= 0;
    });
  };

  const handleRemoveTag = async (
    itemId: string,
    field: 'usageDate' | 'expiryDate'
  ) => {
    try {
      const updates: Partial<FoodItem> =
        field === 'usageDate' ? { usageDate: undefined } : { expiryDate: undefined };
      await updateFoodItem(itemId, updates);
      const updatedItems = foodItems.map((it) =>
        it.id === itemId ? { ...it, ...updates } : it
      );
      setFoodItems(updatedItems);
      updateMarkedDates(updatedItems);
    } catch (e) {
      Alert.alert('削除エラー', '削除に失敗しました。もう一度お試しください。');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <ChefHat size={28} color={Colors.light.primary} />
          <Text style={styles.headerTitle}>食材カレンダー</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={async () => {
              Alert.alert('リセット確認', '登録済みの使用予定・消費期限をすべて削除します。よろしいですか？', [
                { text: 'キャンセル', style: 'cancel' },
                {
                  text: '削除する',
                  style: 'destructive',
                  onPress: async () => {
                    await clearFoodItems();
                    setFoodItems([]);
                    updateMarkedDates([]);
                  },
                },
              ]);
            }}
          >
            <RotateCcw size={20} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 期限間近の食材アラート */}
        {getTodaysExpiring().length > 0 && (
          <View style={styles.alertContainer}>
            <View style={styles.alertHeader}>
              <AlertCircle size={20} color="#f59e0b" />
              <Text style={styles.alertTitle}>
                期限間近の食材（{getTodaysExpiring().length}件）
              </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.alertItems}>
                {getTodaysExpiring().map((item) => (
                  <View key={item.id} style={styles.alertItem}>
                    <Text style={styles.alertItemName}>{item.name}</Text>
                    <Text style={styles.alertItemDate}>{item.expiryDate}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* AI相談履歴サジェスト */}
        <FoodSuggestionCards
          suggestions={suggestions}
          onExpiryAdd={handleExpiryAdd}
          onCustomAdd={handleCustomAdd}
          onRemoveSuggestion={handleRemoveSuggestion}
        />

        {/* カレンダー */}
        <View style={styles.calendarContainer}>
          <Calendar
            current={selectedDate}
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
              updateMarkedDates(foodItems);
            }}
            markingType={'multi-dot'}
            markedDates={markedDates}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#374151',
              selectedDayBackgroundColor: Colors.light.primary,
              selectedDayTextColor: '#ffffff',
              todayTextColor: Colors.light.primary,
              dayTextColor: '#374151',
              textDisabledColor: '#d1d5db',
              dotColor: Colors.light.primary,
              selectedDotColor: '#ffffff',
              arrowColor: Colors.light.primary,
              disabledArrowColor: '#d1d5db',
              monthTextColor: '#111827',
              indicatorColor: Colors.light.primary,
              textDayFontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
              textMonthFontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
              textDayHeaderFontFamily:
                Platform.OS === 'ios' ? 'System' : 'Roboto',
              textDayFontSize: 16,
              textMonthFontSize: 20,
              textDayHeaderFontSize: 14,
            }}
            style={styles.calendar}
          />
        </View>

        {/* 選択日の食材リスト */}
        {getSelectedDateItems().length > 0 && (
          <View style={styles.selectedDateContainer}>
            <Text style={styles.selectedDateTitle}>
              {selectedDate} の食材
            </Text>
            {getSelectedDateItems().map((item) => (
              <View key={item.id} style={styles.foodItemCard}>
                <View style={styles.foodItemInfo}>
                  <Text style={styles.foodItemName}>{item.name}</Text>
                  <Text style={styles.foodItemQuantity}>{item.quantity}</Text>
                </View>
                <View style={styles.foodItemDates}>
                  {item.usageDate === selectedDate && (
                    <>
                      <View style={styles.dateTag}>
                        <Text style={styles.dateTagText}>使用予定</Text>
                      </View>
                      <TagActionButton
                        onPress={() => handleRemoveTag(item.id, 'usageDate')}
                        accessibilityLabel="使用予定を削除"
                        style={styles.tagActionButton}
                      />
                    </>
                  )}
                  {item.expiryDate === selectedDate && (
                    <>
                      <View style={[styles.dateTag, styles.expiryTag]}>
                        <Text style={styles.dateTagText}>消費期限</Text>
                      </View>
                      <TagActionButton
                        onPress={() => handleRemoveTag(item.id, 'expiryDate')}
                        accessibilityLabel="消費期限を削除"
                        style={styles.tagActionButton}
                      />
                    </>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <AddFoodModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddFood}
        selectedDate={selectedDate}
      />
      
      <UsageDateModal
        visible={showUsageDateModal}
        onClose={() => {
          setShowUsageDateModal(false);
          setSelectedSuggestion(null);
        }}
        onSave={handleUsageDateSave}
        selectedItem={selectedSuggestion}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 12,
  },
  resetButton: {
    backgroundColor: '#ef4444',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#ef4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  addButton: {
    backgroundColor: Colors.light.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  content: {
    flex: 1,
  },
  alertContainer: {
    margin: 16,
    backgroundColor: '#fef3cd',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginLeft: 8,
  },
  alertItems: {
    flexDirection: 'row',
  },
  alertItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    minWidth: 120,
  },
  alertItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  alertItemDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  calendarContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  calendar: {
    borderRadius: 16,
    paddingBottom: 16,
  },
  selectedDateContainer: {
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  foodItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  foodItemInfo: {
    flex: 1,
  },
  foodItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  foodItemQuantity: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  foodItemDates: {
    flexDirection: 'row',
  },
  dateTag: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 4,
  },
  expiryTag: {
    backgroundColor: '#f59e0b',
  },
  dateTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
  },
  tagActionButton: {
    marginLeft: 6,
  },
});
