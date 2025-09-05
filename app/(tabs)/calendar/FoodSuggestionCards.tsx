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
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.7;

interface Props {
  suggestions: FoodItem[];
  onExpiryAdd: (item: FoodItem) => void;
  onCustomAdd: (item: FoodItem) => void;
}

export default function FoodSuggestionCards({ suggestions, onExpiryAdd, onCustomAdd }: Props) {
  const getDefaultExpiryDate = () => {
    const today = new Date();
    const days = 3; // カテゴリーなしのデフォルト
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
        <Sparkles size={20} color={Colors.light.primary} />
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
            style={styles.suggestionCard}
            activeOpacity={0.7}
          >
            <View style={styles.cardContent}>
              <View style={styles.leftContent}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.quantity}>{item.quantity}</Text>
              </View>
              
              <View style={styles.rightContent}>
                <View style={styles.expiryInfo}>
                  <AlertCircle size={16} color={Colors.light.primary} />
                  <Text style={styles.expiryLabel}>消費期限</Text>
                </View>
                <Text style={styles.expiryDate}>
                  {getDefaultExpiryDate()}
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
                <Calendar size={16} color={Colors.light.primary} />
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
    backgroundColor: '#ffffff',
    borderColor: Colors.light.primary,
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
  expiryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  expiryLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.light.primary,
  },
  expiryDate: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  actionButtons: {
    gap: 8,
  },
  expiryAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
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
    borderColor: Colors.light.primary,
    gap: 6,
  },
  customAddText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.primary,
  },
});
