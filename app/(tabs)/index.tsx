import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native'
import { LineChart, PieChart } from 'react-native-chart-kit'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { WasteRecord } from '@/types/database'

const screenWidth = Dimensions.get('window').width

export default function HomeScreen() {
  const { user } = useAuth()
  const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>([])
  const [totalWaste, setTotalWaste] = useState(0)
  const [wasteByCategory, setWasteByCategory] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return

    // Load waste records from last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data, error } = await supabase
      .from('waste_records')
      .select('*')
      .eq('user_id', user.id)
      .gte('waste_date', thirtyDaysAgo.toISOString())
      .order('waste_date', { ascending: true })

    if (data) {
      setWasteRecords(data)
      
      // Calculate total waste
      const total = data.reduce((sum, record) => sum + record.waste_amount, 0)
      setTotalWaste(total)

      // Group by food category for pie chart
      const categoryMap: { [key: string]: number } = {}
      data.forEach(record => {
        const category = record.food_name
        categoryMap[category] = (categoryMap[category] || 0) + record.waste_amount
      })

      const pieData = Object.entries(categoryMap).map(([name, value], index) => ({
        name,
        value,
        color: `hsl(${index * 60}, 70%, 50%)`,
        legendFontColor: '#2d3748',
        legendFontSize: 12,
      }))

      setWasteByCategory(pieData)
    }
  }

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(66, 153, 225, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(45, 55, 72, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#4299e1',
    },
  }

  // Prepare line chart data (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date.toISOString().split('T')[0]
  })

  const dailyWaste = last7Days.map(date => {
    const dayRecords = wasteRecords.filter(record => 
      record.waste_date.split('T')[0] === date
    )
    return dayRecords.reduce((sum, record) => sum + record.waste_amount, 0)
  })

  const lineData = {
    labels: last7Days.map(date => {
      const d = new Date(date)
      return `${d.getMonth() + 1}/${d.getDate()}`
    }),
    datasets: [
      {
        data: dailyWaste,
        color: (opacity = 1) => `rgba(66, 153, 225, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ダッシュボード</Text>
        <Text style={styles.subtitle}>食品ロス削減の進捗を確認しましょう</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalWaste.toFixed(1)}</Text>
          <Text style={styles.statLabel}>今月の廃棄量</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{wasteRecords.length}</Text>
          <Text style={styles.statLabel}>記録回数</Text>
        </View>
      </View>

      {dailyWaste.some(value => value > 0) && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>過去7日間の廃棄量推移</Text>
          <LineChart
            data={lineData}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
      )}

      {wasteByCategory.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>食材別廃棄量</Text>
          <PieChart
            data={wasteByCategory}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            accessor="value"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        </View>
      )}

      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>💡 今日のヒント</Text>
        <Text style={styles.tipsText}>
          食材を購入する前に冷蔵庫の中身をチェックしましょう。似たような食材がないか確認することで、無駄な購入を防げます。
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 24,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4a5568',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4299e1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#4a5568',
  },
  chartContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  tipsContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 20,
  },
})
