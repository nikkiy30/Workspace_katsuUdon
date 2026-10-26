import { Colors } from '@/constants/Colors';
import { WasteDB } from '@/database/db/Wastedb';
import type { MonthlyCard } from '@/utils/wasteSummary';
import { aggregateWasteForCards, buildRecentMonthlyCards, formatDateTime, safeParseDate, toYMKey } from '@/utils/wasteSummary';
import { GoogleGenAI } from '@google/genai';
// import { TrendingDown } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import Markdown from 'react-native-markdown-display';

const screenWidth = Dimensions.get('window').width;

// Gemini APIの設定
const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenAI({ apiKey: apiKey });

export default function FeedbackScreen() {
  // ScrollViewのref
  const scrollViewRef = React.useRef<ScrollView>(null);

  // One read-only snapshot supplies both the cards and the selected-month list.
  const [snapshot] = useState(() => {
    try {
      const db = new WasteDB();
      return { records: db.getWasteRecords(), currentMonthWaste: db.getCurrentMonthWasteRecords() };
    } catch (error) {
      console.error('廃棄記録の読み込みエラー:', error);
      return { records: [], currentMonthWaste: [] };
    }
  });
  const [cards] = useState(() => buildRecentMonthlyCards(new Date()));
  const monthlyData = useMemo(() => aggregateWasteForCards(cards, snapshot.records), [cards, snapshot]);

  // スライド中の選択カード（右端が今月で初期化）
  const [selectedCardIndex, setSelectedCardIndex] = useState(() => monthlyData.length - 1);
  const selectedMonthKey = monthlyData[selectedCardIndex]?.key;
  const selectedMonthLabel = monthlyData[selectedCardIndex]?.label ?? '今月';

  // カードスクロール完了時に表示中のインデックスを更新
  const onCardsMomentumEnd = (e: any) => {
    const pageWidth = screenWidth - 40; // 各カード幅
    const x = e?.nativeEvent?.contentOffset?.x ?? 0;
    const idx = Math.max(0, Math.min(monthlyData.length - 1, Math.round(x / pageWidth)));
    if (idx !== selectedCardIndex) setSelectedCardIndex(idx);
  };

  const monthlyWasteItems = useMemo(() => snapshot.records
    .filter(record => {
      const date = safeParseDate(record.created_at);
      return date ? toYMKey(date) === selectedMonthKey : false;
    })
    .sort((a, b) => (safeParseDate(b.created_at)?.getTime() ?? 0) - (safeParseDate(a.created_at)?.getTime() ?? 0))
    .map(record => ({
      id: record.id,
      name: record.food_name,
      amount: record.throw_amount,
      date: formatDateTime(safeParseDate(record.created_at)!),
    })), [snapshot, selectedMonthKey]);

  // AI改善提案の状態
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState<boolean>(!!apiKey);
  
  // 週次データ（グラフ用）は各カード内で生成



  const chartConfig = {
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    color: (opacity = 1) => `rgba(21, 100, 134, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(32, 85, 108, ${opacity})`,
    strokeWidth: 0,
    barPercentage: 0.7,
    decimalPlaces: 0,
    style: {
      borderRadius: 16,
    },
  };



  /**
   * AI改善提案を生成
   */
  useEffect(() => {
    if (!apiKey || monthlyData.length === 0) return;
    let active = true;
    const currentCard = monthlyData[monthlyData.length - 1];
    const monthlyTotal = currentCard?.total ?? 0;
    const w = currentCard?.weeklyData ?? [0, 0, 0, 0];
    const comparisonText = currentCard?.comparison ?? '—';
    const currentMonthWaste = snapshot.currentMonthWaste;
    const wasteBreakdown = currentMonthWaste.length > 0
      ? currentMonthWaste.map(r => `  - ${r.food_name}: ${r.throw_amount}`).join('\n')
      : '  - 今月は廃棄記録がありません';
      const prompt = `
あなたは食品廃棄削減の専門家です。
以下の廃棄データを分析して、具体的で実用的な改善提案を日本語で提供してください。

廃棄データ:
- 今月の廃棄回数: ${monthlyTotal}回
- 前月比: ${comparisonText}
- 週次データ: 第1週(${w[0]}回), 第2週(${w[1]}回), 第3週(${w[2]}回), 第4週(${w[3]}回)
- 廃棄物の内訳:
${wasteBreakdown}

【出力要件】

- 廃棄データに基づいてユーザーが廃棄をしないためにできる行動を具体的に提案してください．

【要望】

- 簡潔で分かりやすい文章
- 読みやすい1段落の文章
- 100文字程度
- 箇条書きで書かないでください

`;
// 回答例:
// 「今月の廃棄量は前月比12%減少と改善傾向にあります。特に野菜の廃棄が多めなので、購入前の冷蔵庫チェックと使い切りレシピの活用をお勧めします。肉類は適切な保存方法で鮮度を保ち、乳製品は少量パックを選ぶことで無駄を減らせます。小さな改善の積み重ねで、さらに良い結果が期待できます！」

    genAI.models.generateContent({ model: 'gemini-2.5-flash-lite', contents: prompt })
      .then(response => {
        if (active) setAiSuggestion(response.text ?? 'AI改善提案の生成に失敗しました。');
      })
      .catch(error => {
        console.error('AI改善提案生成エラー:', error);
        if (active) setAiSuggestion('AI改善提案の生成中にエラーが発生しました。しばらくしてから再度お試しください。');
      })
      .finally(() => { if (active) setIsGeneratingSuggestion(false); });
    return () => { active = false; };
  }, [monthlyData, snapshot]);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  /**
   * 月次廃棄量カードコンポーネント
   */
  const MonthlyWasteCard = ({ data }: { data: MonthlyCard }) => {
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
          <Text style={styles.totalLabel}>{data.label}の廃棄回数</Text>
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
          width={screenWidth - 75}
          height={164}
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
          <View style={styles.badge}>
            <Text style={styles.badgeText}>廃棄記録</Text>
          </View>
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
          onMomentumScrollEnd={onCardsMomentumEnd}
        >
          {monthlyData.map((data, index) => (
            <View key={index} style={styles.cardWrapper}>
              <MonthlyWasteCard data={data} />
            </View>
          ))}
        </ScrollView>

        {/* 選択月の廃棄一覧 */}
        <View style={styles.wasteListCard}>
          <Text style={styles.wasteListTitle}>{selectedMonthLabel}の廃棄一覧</Text>
          
          <View style={styles.wasteList}>
            {monthlyWasteItems.map((item, index) => (
              <View key={index} style={styles.wasteItem}>
                <View style={styles.wasteItemHeader}>
                  <Text style={styles.wasteItemName}>{item.name}</Text>
                  <Text style={styles.wasteItemAmount}>{item.amount}</Text>
                </View>
                <Text style={styles.wasteItemDate}>{item.date}</Text>
              </View>
            ))}
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
  badge: {
    width: 198,
    height: 48,
    backgroundColor: Colors.light.primary,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 20,
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
    color: '#20556C',
    marginLeft: 8,
  },
  totalAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#20556C',
    marginRight: 16,
  },
  totalInfo: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  totalUnit: {
    fontSize: 16,
    color: '#20556C',
    marginBottom: 4,
  },
  totalComparison: {
    fontSize: 12,
    color: Colors.light.primary,
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
    marginLeft: -10,
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
    backgroundColor: Colors.light.primary,
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
    backgroundColor: '#E6F5FB',
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#BBEBFF',
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#20556C',
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#20556C',
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
    color: '#20556C',
    fontStyle: 'italic',
  },
  cardsScrollView: {
    marginBottom: 0,
  },
  cardsScrollContainer: {
    paddingHorizontal: 0,
  },
  cardWrapper: {
    width: screenWidth - 40, // 左右のパディングを考慮
  },
  wasteListCard: {
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
  wasteListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#20556C',
    marginBottom: 16,
    textAlign: 'center',
  },
  wasteList: {
    gap: 12,
  },
  wasteItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 12,
  },
  wasteItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  wasteItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#20556C',
    flex: 1,
  },
  wasteItemAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#20556C',
  },
  wasteItemDate: {
    fontSize: 12,
    color: '#ABC5D0',
  },
});

// Markdownスタイル
const markdownStyles = {
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: '#20556C',
  },
  heading1: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#20556C',
  },
  heading2: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#20556C',
  },
  paragraph: {
    marginBottom: 8,
    lineHeight: 18,
  },
  strong: {
    fontWeight: '600' as const,
    color: '#20556C',
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
