import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { Calendar, Sparkles, Clock, CircleAlert as AlertCircle } from 'lucide-react-native';
import { FoodItem } from './foodTypes';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.7;

interface Props {
  suggestions: FoodItem[];
  onExpiryAdd: (item: FoodItem) => void;
  onCustomAdd: (item: FoodItem) => void;
}

export default function FoodSuggestionCards({ suggestions, onExpiryAdd, onCustomAdd }: Props) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case '肉類':
        return '#fef2f2';
      case '野菜':
        return '#f0fdf4';
      case '乳製品':
        return '#eff6ff';
      case '調味料':
        return '#f5f3ff';
      default:
        return '#f9fafb';
    }
  };

  const getCategoryBorderColor = (category: string) => {
    switch (category) {
      case '肉類':
        return '#fecaca';
      case '野菜':
        return '#bbf7d0';
      case '乳製品':
        return '#bfdbfe';
      case '調味料':
        return '#ddd6fe';
      default:
        return '#e5e7eb';
    }
  };

  const getDefaultExpiryDate = (category: string) => {
    const today = new Date();
    let days = 3; // デフォルト
    
    switch (category) {
      case '肉類':
        days = 2;
        break;
      case '野菜':
        days = 5;
        break;
      case '乳製品':
        days = 7;
        break;
      case '調味料':
        days = 365;
        break;
    }
    
    const expiryDate = new Date(today);
    expiryDate.setDate(today.getDate() + days);
    return expiryDate.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Sparkles size={20} color="#3b82f6" />
        <Text style={styles.title}>AI相談履歴からのサジェスト</Text>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {suggestions.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.suggestionCard,
              {
                backgroundColor: getCategoryColor(item.category),
                borderColor: getCategoryBorderColor(item.category),
              },
            ]}
            activeOpacity={0.7}
          >
            <View style={styles.cardContent}>
              <View style={styles.leftContent}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.quantity}>{item.quantity}</Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
              </View>
              
              <View style={styles.rightContent}>
                <View style={styles.expiryInfo}>
                  <AlertCircle size={16} color="#f59e0b" />
                  <Text style={styles.expiryLabel}>目安期限</Text>
                </View>
                <Text style={styles.expiryDate}>
                  {getDefaultExpiryDate(item.category)}
                </Text>
              </View>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.expiryAddButton}
                onPress={() => onExpiryAdd(item)}
                activeOpacity={0.8}
              >
                <AlertCircle size={16} color="#ffffff" />
                <Text style={styles.expiryAddText}>消費期限を追加</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.customAddButton}
                onPress={() => onCustomAdd(item)}
                activeOpacity={0.8}
              >
                <Calendar size={16} color="#3b82f6" />
                <Text style={styles.customAddText}>使用予定を追加</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  scrollView: {
    paddingLeft: 16,
  },
  scrollContent: {
    paddingRight: 16,
  },
  suggestionCard: {
    width: cardWidth,
    maxWidth: 280,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
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
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  leftContent: {
    flex: 1,
  },
  rightContent: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  quantity: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },
  expiryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  expiryLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#f59e0b',
  },
  expiryDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
  },
  actionButtons: {
    gap: 8,
  },
  expiryAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#f59e0b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  expiryAddText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  customAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#3b82f6',
    gap: 6,
  },
  customAddText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3b82f6',
  },
});

