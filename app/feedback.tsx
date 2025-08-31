import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { TrendingDown, Beef, Carrot, Milk } from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;

export default function FeedbackScreen() {
  // サンプルデータ
  const monthlyTotal = 687; // グラム
  
  // 週次データ（過去4週間）
  const weeklyData = {
    labels: ['第1週', '第2週', '第3週', '第4週'],
    datasets: [
      {
        data: [180, 150, 200, 157],
        color: (opacity = 1) => `rgba(21, 100, 134, ${opacity})`,
      }
    ]
  };

  // 食材種類別データ
  const categoryData = {
    labels: ['肉類', '野菜', '乳製品', 'その他'],
    datasets: [
      {
        data: [500, 200, 150, 87],
        color: (opacity = 1) => `rgba(21, 100, 134, ${opacity})`,
      }
    ]
  };

  const chartConfig = {
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    color: (opacity = 1) => `rgba(21, 100, 134, ${opacity})`,
    strokeWidth: 2,
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

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>フィードバック</Text>
          <Text style={styles.headerSubtitle}>今月の廃棄データ</Text>
        </View>

        {/* 今月の累計廃棄量 */}
        <View style={styles.combinedCard}>
          <View style={styles.totalHeader}>
            <TrendingDown size={24} color="#EF4444" />
            <Text style={styles.totalLabel}>今月の廃棄量</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalAmount}>{monthlyTotal}</Text>
            <View style={styles.totalInfo}>
              <Text style={styles.totalUnit}>グラム</Text>
              <Text style={styles.totalComparison}>先月比 -12% ↓</Text>
            </View>
          </View>
          <BarChart
            data={weeklyData}
            width={screenWidth - 60}
            height={160}
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars={true}
            fromZero={true}
            yAxisLabel=""
            yAxisSuffix=""
          />
        </View>

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
          <Text style={styles.suggestionTitle}>💡 改善提案</Text>
          <Text style={styles.suggestionText}>
            野菜の廃棄が多めです。購入前に冷蔵庫をチェックし、必要な分だけ購入することを心がけましょう。
          </Text>
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
});

