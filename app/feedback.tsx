import { Colors } from '@/constants/Colors';
import { WasteDB } from '@/database/db/Wastedb';
import type { WasteRecord } from '@/database/types';
import { GoogleGenAI } from '@google/genai';
// import { TrendingDown } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
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

  // 月次カードデータ型
  type MonthlyCard = {
    key: string; // 'YYYY-MM'
    label: string; // 例: '9月'
    total: number; // 月の廃棄回数
    comparison: string; // 先月比表示（暫定で '—'）
    weeklyData: number[]; // 第1〜4週
  };

  

  // 今月の廃棄一覧（DBから取得）
  type WasteListItem = { id: number; name: string; amount: string; date: string };
  const [monthlyWasteItems, setMonthlyWasteItems] = useState<WasteListItem[]>([]);

  // 月次カードデータ（右端が今月）
  const [monthlyData, setMonthlyData] = useState<MonthlyCard[]>([]);

  // YYYY-MM キー
  const toYMKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

  // 直近3ヶ月を左→右＝古い→新しい（右端が今月）で生成
  const buildRecentMonthlyCards = (baseDate = new Date()): MonthlyCard[] => {
    const cards: MonthlyCard[] = [];
    for (let i = 2; i >= 0; i--) {
      const dt = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
      const month = dt.getMonth() + 1;
      cards.push({
        key: toYMKey(dt),
        label: `${month}月`,
        total: 0,
        comparison: '—',
        weeklyData: [0, 0, 0, 0],
      });
    }
    return cards;
  };

  // 初期化：現在時刻から月カードを生成
  useEffect(() => {
    setMonthlyData(buildRecentMonthlyCards(new Date()));
  }, []);

  // スライド中の選択カード（右端が今月で初期化）
  const [selectedCardIndex, setSelectedCardIndex] = useState<number>(0);
  const selectedMonthKey = monthlyData[selectedCardIndex]?.key;
  const selectedMonthLabel = monthlyData[selectedCardIndex]?.label ?? '今月';

  // カードスクロール完了時に表示中のインデックスを更新
  const onCardsMomentumEnd = (e: any) => {
    const pageWidth = screenWidth - 40; // 各カード幅
    const x = e?.nativeEvent?.contentOffset?.x ?? 0;
    const idx = Math.max(0, Math.min(monthlyData.length - 1, Math.round(x / pageWidth)));
    if (idx !== selectedCardIndex) setSelectedCardIndex(idx);
  };

  // waste_records から実データを集計してカードに反映
  useEffect(() => {
    if (monthlyData.length === 0) return;

    try {
      const wasteDB = new WasteDB();
      const records = wasteDB.getWasteRecords();

      const updated = aggregateWasteForCards(monthlyData, records);

      // 変化がない場合は set をスキップ
      const changed = hasCardsChanged(monthlyData, updated);
      if (changed) {
        setMonthlyData(updated);
      }
    } catch (e) {
      console.error('waste_records 集計エラー:', e);
    }
  }, [monthlyData.length]);

  // 選択中の月の廃棄一覧をDBから取得して表示用に整形
  useEffect(() => {
    if (!selectedMonthKey) return;
    try {
      const wasteDB = new WasteDB();
      const records = wasteDB.getWasteRecords();

      const items: WasteListItem[] = records
        .filter(r => {
          const d = safeParseDate(r.created_at);
          return d ? toYMKey(d) === selectedMonthKey : false;
        })
        .sort((a, b) => {
          const ta = safeParseDate(a.created_at)?.getTime() ?? 0;
          const tb = safeParseDate(b.created_at)?.getTime() ?? 0;
          return tb - ta; // 新しい順
        })
        .map(r => ({
          id: r.id,
          name: r.food_name,
          amount: r.throw_amount,
          date: formatDateTime(safeParseDate(r.created_at)!),
        }));

      setMonthlyWasteItems(items);
    } catch (e) {
      console.error('今月の廃棄一覧取得エラー:', e);
      setMonthlyWasteItems([]);
    }
  }, [selectedMonthKey]);

  // レコードをカードへ集計
  const aggregateWasteForCards = (cards: MonthlyCard[], records: WasteRecord[]): MonthlyCard[] => {
    const next = cards.map(c => ({ ...c, total: 0, weeklyData: [0, 0, 0, 0], comparison: '—' }));

    const cardIndexByKey = new Map(next.map((c, i) => [c.key, i] as const));

    for (const r of records) {
      const d = safeParseDate(r.created_at);
      if (!d) continue;
      const key = toYMKey(d);
      const idx = cardIndexByKey.get(key);
      if (idx === undefined) continue; // 表示対象外の月はスキップ

      const day = d.getDate();
      const weekIdx = Math.min(3, Math.floor((day - 1) / 7)); // 1-7,8-14,15-21,22-
      next[idx].total += 1;
      next[idx].weeklyData[weekIdx] += 1;
    }

    // 先月比を計算（左→右 = 古い→新しい）
    for (let i = 1; i < next.length; i++) {
      const prev = next[i - 1].total;
      const curr = next[i].total;
      if (prev > 0) {
        const diff = ((curr - prev) / prev) * 100;
        const sign = diff === 0 ? '' : diff > 0 ? '+' : '';
        const arrow = diff > 0 ? '↑' : diff < 0 ? '↓' : '';
        next[i].comparison = `${sign}${Math.round(diff)}% ${arrow}`.trim();
      } else if (prev === 0 && curr > 0) {
        next[i].comparison = '+∞% ↑';
      } else {
        next[i].comparison = '—';
      }
    }

    return next;
  };

  // 日付安全パース
  const safeParseDate = (v: string): Date | null => {
    if (!v) return null;
    // ISO想定。もしスペース区切りの場合は 'YYYY-MM-DD HH:MM:SS' を ISO 風に補正
    const normalized = v.includes('T') ? v : v.replace(' ', 'T');
    const d = new Date(normalized);
    return isNaN(d.getTime()) ? null : d;
  };

  // 日時表示フォーマット: YYYY-MM-DD HH:mm
  const formatDateTime = (d: Date): string => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
  };

  // 配列比較（total / weeklyData / comparison のみ比較）
  const hasCardsChanged = (a: MonthlyCard[], b: MonthlyCard[]) => {
    if (a.length !== b.length) return true;
    for (let i = 0; i < a.length; i++) {
      if (a[i].total !== b[i].total) return true;
      if (a[i].comparison !== b[i].comparison) return true;
      for (let j = 0; j < 4; j++) {
        if ((a[i].weeklyData[j] ?? 0) !== (b[i].weeklyData[j] ?? 0)) return true;
      }
    }
    return false;
  };

  
  // AI改善提案の状態
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState<boolean>(false);
  
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
  const generateAISuggestion = async () => {
    if (!apiKey) {
      console.warn('Gemini APIキーが設定されていません');
      return;
    }

    setIsGeneratingSuggestion(true);
    try {
      const currentCard = monthlyData[monthlyData.length - 1];
      const monthlyTotal = currentCard?.total ?? 0;
      const w = currentCard?.weeklyData ?? [0, 0, 0, 0];
      const prompt = `
あなたは食品廃棄削減の専門家です。
以下の廃棄データを分析して、具体的で実用的な改善提案を日本語で提供してください。

廃棄データ:
- 今月の廃棄回数: ${monthlyTotal}回
- 先月比: -12% ↓
- 週次データ: 第1週(${w[0]}回), 第2週(${w[1]}回), 第3週(${w[2]}回), 第4週(${w[3]}回)
- 廃棄物の内訳:
  - 鶏むね肉: 200g
  - ブロッコリー: 150g
  - 牛乳: 500ml
  - トマト: 100g
  - 玉ねぎ: 80g
  - パン: 6枚

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

  // 月次データが準備できたら提案生成＆右端（今月）へスクロール
  useEffect(() => {
    if (monthlyData.length === 0) return;
    generateAISuggestion();
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: false });
      }
    }, 100);
    setSelectedCardIndex(monthlyData.length - 1);
  }, [monthlyData]);

  // // 画面にフォーカスが当たるたびにデータを更新
  // useFocusEffect(
  //   React.useCallback(() => {
  //     if (monthlyData.length === 0) {
  //       setMonthlyData(buildRecentMonthlyCards(new Date()));
  //     }
      
  //     // 廃棄データを再集計
  //     try {
  //       const wasteDB = new WasteDB();
  //       const records = wasteDB.getWasteRecords();
  //       const updated = aggregateWasteForCards(monthlyData, records);
  //       setMonthlyData(updated);
  //     } catch (e) {
  //       console.error('フィードバック画面データ更新エラー:', e);
  //     }
  //   }, [])
  // );

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
    marginBottom: 20,
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
