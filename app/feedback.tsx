import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { TrendingDown, Beef, Carrot, Milk } from 'lucide-react-native';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-native-markdown-display';

const screenWidth = Dimensions.get('window').width;

// Gemini APIの設定
const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenAI({ apiKey: apiKey });

export default function FeedbackScreen() {
  // ScrollViewのref
  const scrollViewRef = React.useRef<ScrollView>(null);

  // 月次データの配列
  const monthlyData = [
    {
      month: '今月',
      total: 5,
      comparison: '-12% ↓',
      weeklyData: [1, 1, 2, 1],
    },
    {
      month: '先月',
      total: 6,
      comparison: '+8% ↑',
      weeklyData: [2, 1, 2, 1],
    },
    {
      month: '2ヶ月前',
      total: 3,
      comparison: '-5% ↓',
      weeklyData: [1, 1, 1, 0],
    },
  ];

  // サンプルデータ
  const monthlyTotal = monthlyData[0].total; // グラム
  
  // 食材種類別廃棄量データ
  const meatWaste = 500; // 肉類廃棄量（グラム）
  const vegetableWaste = 200; // 野菜廃棄量（グラム）
  const dairyWaste = 150; // 乳製品廃棄量（グラム）
  const otherWaste = 87; // その他廃棄量（グラム）
  
  // AI改善提案の状態
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState<boolean>(false);
  
  // 週次データ（過去4週間）
  const weeklyData = {
    labels: ['第1週', '第2週', '第3週', '第4週'],
    datasets: [
      {
        data: monthlyData[0].weeklyData,
        color: (opacity = 1) => `rgba(21, 100, 134, ${opacity})`,
      }
    ]
  };

  // 食材種類別データ
  const categoryData = {
    labels: ['肉類', '野菜', '乳製品', 'その他'],
    datasets: [
      {
        data: [meatWaste, vegetableWaste, dairyWaste, otherWaste],
        color: (opacity = 1) => `rgba(21, 100, 134, ${opacity})`,
      }
    ]
  };

  const chartConfig = {
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    color: (opacity = 1) => `rgba(21, 100, 134, ${opacity})`,
    strokeWidth: 0,
    barPercentage: 0.7,
    decimalPlaces: 0,
    style: {
      borderRadius: 16,
    },
  };

  const getIconForCategory = (category: string) => {
    switch (category) {
      case '肉類':
        return <Beef size={20} color="#EF4444" />;
      case '野菜':
        return <Carrot size={20} color="#F97316" />;
      case '乳製品':
        return <Milk size={20} color="#3B82F6" />;
      default:
        return <TrendingDown size={20} color="#6B7280" />;
    }
  };

  /**
   * AI改善提案を生成
   */
  const generateAISuggestion = async () => {
    if (!apiKey) {
      console.warn('Gemini APIキーが設定されていません');
      return;
    }

    setIsGeneratingSuggestion(true);
    try {
      const prompt = `
あなたは食品廃棄削減の専門家です。
以下の廃棄データを分析して、具体的で実用的な改善提案を日本語で提供してください。

廃棄データ:
- 今月の廃棄量: ${monthlyTotal}グラム
- 先月比: -12% ↓
- 週次データ: 第1週(180g), 第2週(150g), 第3週(200g), 第4週(157g)
- 食材種類別廃棄量:
  - 肉類: ${meatWaste}g
  - 野菜: ${vegetableWaste}g
  - 乳製品: ${dairyWaste}g
  - その他: ${otherWaste}g

改善提案の要件:
1. データに基づいた具体的な分析
3. 食材別の具体的なアドバイス
4. 前向きで励ましのメッセージ

出力形式:
- 簡潔で分かりやすい文章
- 読みやすい1段落の文章
- 50文字程度
- 箇条書きで書かないでください

回答例:
「今月の廃棄量は前月比12%減少と改善傾向にあります。特に野菜の廃棄が多めなので、購入前の冷蔵庫チェックと使い切りレシピの活用をお勧めします。肉類は適切な保存方法で鮮度を保ち、乳製品は少量パックを選ぶことで無駄を減らせます。小さな改善の積み重ねで、さらに良い結果が期待できます！」
`;

      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: prompt,
      });

      const suggestion = response.text ?? 'AI改善提案の生成に失敗しました。';
      setAiSuggestion(suggestion);
    } catch (error) {
      console.error('AI改善提案生成エラー:', error);
      setAiSuggestion('AI改善提案の生成中にエラーが発生しました。しばらくしてから再度お試しください。');
    } finally {
      setIsGeneratingSuggestion(false);
    }
  };

  /**
   * コンポーネントマウント時の処理
   */
  useEffect(() => {
    generateAISuggestion();
    
    // 最初のスクロール位置を右端（最新の月）に設定
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: false });
      }
    }, 100);
  }, []);

  /**
   * 月次廃棄量カードコンポーネント
   */
  const MonthlyWasteCard = ({ data }: { data: typeof monthlyData[0] }) => {
    const weeklyDataForMonth = {
      labels: ['第1週', '第2週', '第3週', '第4週'],
      datasets: [
        {
          data: data.weeklyData,
          color: (opacity = 1) => `rgba(21, 100, 134, ${opacity})`,
        }
      ]
    };

    return (
      <View style={styles.combinedCard}>
        <View style={styles.totalHeader}>
          <TrendingDown size={24} color="#EF4444" />
          <Text style={styles.totalLabel}>{data.month}の廃棄回数</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalAmount}>{data.total}</Text>
          <View style={styles.totalInfo}>
            <Text style={styles.totalUnit}>回</Text>
            <Text style={styles.totalComparison}>先月比 {data.comparison}</Text>
          </View>
        </View>
        <BarChart
          data={weeklyDataForMonth}
          width={screenWidth - 60}
          height={110}
          chartConfig={chartConfig}
          style={styles.chart}
          showValuesOnTopOfBars={false}
          fromZero={true}
          yAxisLabel=""
          yAxisSuffix=""
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>フィードバック</Text>
          <Text style={styles.headerSubtitle}>今月の廃棄データ</Text>
        </View>

        {/* 月次廃棄量カード（横スクロール可能） */}
        <ScrollView 
          horizontal 
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          ref={scrollViewRef}
          style={styles.cardsScrollView}
          contentContainerStyle={styles.cardsScrollContainer}
        >
          {monthlyData.map((data, index) => (
            <View key={index} style={styles.cardWrapper}>
              <MonthlyWasteCard data={data} />
            </View>
          ))}
        </ScrollView>

        {/* 食材種類別グラフ */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>食材種類別廃棄量</Text>
          
          <View style={styles.categoryList}>
            {['肉類', '野菜', '乳製品', 'その他'].map((category, index) => {
              const amount = categoryData.datasets[0].data[index];
              const maxAmount = Math.max(...categoryData.datasets[0].data);
              const barWidth = (amount / maxAmount) * 100;
              
              return (
              <View key={category} style={styles.categoryItem}>
                <View style={styles.categoryLeft}>
                  <View style={styles.categoryIcon}>
                    {getIconForCategory(category)}
                  </View>
                  <Text style={styles.categoryName}>{category}</Text>
                </View>
                <View style={styles.categoryBarContainer}>
                  <View 
                    style={[
                      styles.categoryBar, 
                      { width: `${barWidth}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.categoryAmount}>{amount}g</Text>
              </View>
              );
            })}
          </View>
        </View>

        {/* 改善提案 */}
        <View style={styles.suggestionCard}>
          <Text style={styles.suggestionTitle}>💡 AI改善提案</Text>
          {isGeneratingSuggestion ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>AIが改善提案を生成中...</Text>
            </View>
          ) : (
            <Markdown style={markdownStyles}>
              {aiSuggestion}
            </Markdown>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  totalCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  combinedCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  totalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 8,
  },
  totalAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1F2937',
    marginRight: 16,
  },
  totalInfo: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  totalUnit: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  totalComparison: {
    fontSize: 12,
    color: '#156486',
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 12,
    marginVertical: 8,
    marginLeft: -8,
  },
  categoryList: {
    marginTop: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
  },
  categoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  categoryBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  categoryBar: {
    height: '100%',
    backgroundColor: '#156486',
    borderRadius: 4,
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    width: 50,
    textAlign: 'right',
  },
  suggestionCard: {
    backgroundColor: '#FEF3C7',
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#156486',
    borderRadius: 6,
  },
  refreshButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#92400E',
    fontStyle: 'italic',
  },
  cardsScrollView: {
    marginBottom: 20,
  },
  cardsScrollContainer: {
    paddingHorizontal: 0,
  },
  cardWrapper: {
    width: screenWidth - 40, // 左右のパディングを考慮
  },
});

// Markdownスタイル
const markdownStyles = {
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: '#92400E',
  },
  heading1: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#92400E',
  },
  heading2: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#92400E',
  },
  paragraph: {
    marginBottom: 8,
    lineHeight: 18,
  },
  strong: {
    fontWeight: '600' as const,
    color: '#92400E',
  },
  list_item: {
    marginBottom: 4,
  },
  bullet_list: {
    marginBottom: 12,
  },
  code_inline: {
    backgroundColor: '#f0f0f0',
    padding: 2,
    borderRadius: 4,
    fontFamily: 'monospace',
  },
};

