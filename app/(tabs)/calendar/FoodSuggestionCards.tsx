import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  LayoutAnimation,
  UIManager,
  Animated,
} from 'react-native';
import { Calendar, Sparkles, Clock, CircleAlert as AlertCircle } from 'lucide-react-native';
import { FoodItem } from './foodTypes';
import { Colors } from '@/constants/Colors';
import TagActionButton from './TagActionButton';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.7;

interface Props {
  suggestions: FoodItem[];
  onExpiryAdd: (item: FoodItem) => void;
  onCustomAdd: (item: FoodItem) => void;
  onRemoveSuggestion?: (id: string) => void;
}

export default function FoodSuggestionCards({ suggestions, onExpiryAdd, onCustomAdd, onRemoveSuggestion }: Props) {
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

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const Card = ({ item }: { item: FoodItem }) => {
    const opacity = useRef(new Animated.Value(1)).current;
    const scale = useRef(new Animated.Value(1)).current;
    const widthAnim = useRef(new Animated.Value(cardWidth)).current;
    const marginAnim = useRef(new Animated.Value(12)).current;

    const handleDelete = () => {
      // 自身はフェード＆縮小 → 完了後にリストから削除し、残りのカードはレイアウトアニメーションで左詰め
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.85,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(widthAnim, {
          toValue: 0,
          duration: 260,
          useNativeDriver: false,
        }),
        Animated.timing(marginAnim, {
          toValue: 0,
          duration: 260,
          useNativeDriver: false,
        }),
      ]).start(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        onRemoveSuggestion && onRemoveSuggestion(item.id);
      });
    };

    return (
      <Animated.View style={[styles.cardWrapper, { width: widthAnim, marginRight: marginAnim }]}> 
        <Animated.View style={[styles.suggestionCard, { opacity, transform: [{ scale }] }]}> 
          <View style={styles.cardContent}>
            <View style={styles.leftContent}>
              <Text style={styles.itemName}>
                {item.name}
                <Text style={styles.quantity}> ({item.quantity})</Text>
              </Text>
              <Text style={styles.expiryInline}>
                期限: {item.expiryDate
                  ? new Date(item.expiryDate).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
                  : getDefaultExpiryDate()}
              </Text>
            </View>
          </View>

          {onRemoveSuggestion && (
            <TagActionButton
              onPress={handleDelete}
              accessibilityLabel="サジェストを削除"
              style={styles.deleteButton}
            />
          )}

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
        </Animated.View>
      </Animated.View>
    );
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
          <Card key={item.id} item={item} />
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
    color: '#20556C',
    marginLeft: 8,
  },
  scrollView: {
    paddingLeft: 16,
  },
  scrollContent: {
    paddingRight: 16,
  },
  cardWrapper: {
    width: cardWidth,
    marginRight: 12,
  },
  suggestionCard: {
    width: cardWidth,
    maxWidth: 280,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    backgroundColor: '#ffffff',
    borderColor: Colors.light.primary,
    position: 'relative',
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
  itemName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#20556C',
    marginBottom: 4,
  },
  quantity: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ABC5D0',
    marginBottom: 8,
  },
  expiryInline: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ABC5D0',
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
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
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
