import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Toast from '@/components/Toast';
import { Colors } from '@/constants/Colors';
import { WasteDB } from '@/database/db/Wastedb';
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { Home as HomeIcon, MoreHorizontal, Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const navigationItems = [
  { icon: HomeIcon, label: "ホーム" },
  { text: "AI", label: "AI" },
  { icon: MoreHorizontal, label: "メニュー" },
];

const today = new Date();
const month = today.getMonth() + 1;
const day = today.getDate();
const weekDays = ["日", "月", "火", "水", "木", "金", "土"];
const weekDay = weekDays[today.getDay()];

// ホーム画面
export const Screen = () => {
  const params = useLocalSearchParams();
  const [todayWasteCost, setTodayWasteCost] = useState<number>(0);
  const [hasTodayWaste, setHasTodayWaste] = useState<boolean>(false);
  
  // Toast用のstate
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastIcon, setToastIcon] = useState<'check-circle' | null>(null);

  // パラメータからToast表示の判定
  useEffect(() => {
    console.log('Home.tsx params:', params);
    if (params.showToast === 'true' && params.toastMessage) {
      console.log('Toast should show:', params.toastMessage);
      setToastMessage(params.toastMessage as string);
      setToastIcon(params.toastIcon as 'check-circle' | null || null);
      setShowToast(true);
    }
  }, [params]);

  // Toast表示後にパラメータをクリアする処理を分離
  useEffect(() => {
    if (showToast) {
      console.log('Toast is now visible');
      // 少し遅延してからパラメータをクリア
      const timer = setTimeout(() => {
        router.replace('/(tabs)');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // 今日の廃棄データを取得する関数
  const loadTodayWasteData = () => {
    const wasteDB = new WasteDB();
    const todayCost = wasteDB.getTodayTotalCost();
    const todayRecords = wasteDB.getTodayWasteRecords();
    
    setTodayWasteCost(todayCost);
    setHasTodayWaste(todayRecords.length > 0);
  };

  // 金額の桁数に応じてフォントサイズを調整
  const getDynamicFontSize = (cost: number) => {
    const costString = cost.toString();
    if (costString.length <= 3) return 28; // 3桁以下: 28px
    if (costString.length <= 4) return 24; // 4桁: 24px
    if (costString.length <= 5) return 20; // 5桁: 20px
    return 16; // 6桁以上: 16px
  };

  // 画面にフォーカスが当たるたびにデータを更新
  useFocusEffect(
    React.useCallback(() => {
      loadTodayWasteData();
    }, [])
  );

  // 全ての廃棄データを削除
  const handleClearAllWasteData = () => {
    Alert.alert(
      '確認',
      '全ての廃棄データを削除しますか？この操作は取り消せません。',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => {
            const wasteDB = new WasteDB();
            console.log('削除前の廃棄データ:');
            wasteDB.logAllWasteRecords();

            const success = wasteDB.deleteAllWasteRecords();

            if (success) {
              console.log('✅ 全ての廃棄データを正常に削除しました');
              Alert.alert('完了', '全ての廃棄データを削除しました。');
              // 状態を更新
              setTodayWasteCost(0);
              setHasTodayWaste(false);
            } else {
              console.log('❌ 廃棄データの削除に失敗しました');
              Alert.alert('エラー', '廃棄データの削除に失敗しました。');
            }
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {month}月{day}日（{weekDay}）
          </Text>
        </View>

        <TouchableOpacity
          style={styles.cardLarge}
          activeOpacity={0.8}
          onPress={() => router.push('/feedback')}
        >
          <View style={styles.cardContent}>
            {hasTodayWaste ? (
              <>
                <Text style={styles.prefixText}>
                  今日捨ててしまった食材は...
                  <Text 
                    style={[
                      styles.wasteCostText, 
                      { fontSize: getDynamicFontSize(todayWasteCost) }
                    ]} 
                    adjustsFontSizeToFit
                    numberOfLines={1}
                    minimumFontScale={0.7}
                  >
                    約{todayWasteCost}円分
                  </Text>
                </Text>
                <Text style={styles.prefixSmallText}>この「もったいない」を、次に活かそう</Text>
              </>
            ) : (
              <>
                <Text style={styles.cardLargeText}>今日、使いきれなかった食材は{'\n'}ありましたか？</Text>
                <Text style={styles.cardSmallText}>廃棄してしまった食材を記録して、次の買い物に活かしましょう。</Text>
              </>
            )}
            <TouchableOpacity onPress={() => router.push('/feedback')} style={styles.button} activeOpacity={0.8}>
              <Text style={styles.buttonText}>きろくをみる</Text>
            </TouchableOpacity>
            {hasTodayWaste ? (
              <Image
                source={require('@assets/images/eating-pasta.svg')}
                style={styles.watchRecordImage}
                contentFit="contain"
              />
            ) : (
              <Image
                source={require('@assets/images/watch-record.svg')}
                style={styles.watchRecordImage}
                contentFit="contain"
              />
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cardMedium}
          activeOpacity={0.8}
          onPress={() => router.push('/wasteInput')}
        >
          <View style={styles.wasteInputButton}>
            <Trash2 color={Colors.light.primary} size={24} />
            <ThemedText>廃棄入力</ThemedText>
          </View>
        </TouchableOpacity>

        {/* 開発用: 全廃棄データ削除ボタン 開発中に、データを削除したいときにコメントアウトして使ってください */}
        {/* <TouchableOpacity
          style={[styles.cardMedium, { backgroundColor: '#ffebeb' }]}
          activeOpacity={0.8}
          onPress={handleClearAllWasteData}
        >
          <View style={styles.wasteInputButton}>
            <Trash2 color="#ff4444" size={24} />
            <Text style={{ color: '#ff4444', fontSize: 16 }}>全廃棄データ削除</Text>
          </View>
        </TouchableOpacity> */}
      </ScrollView>

      <View style={styles.bottomNav}>
        {navigationItems.map((item, idx) => (
          <TouchableOpacity key={idx} style={styles.navButton} activeOpacity={0.8}>
            {item.icon ? <item.icon color="#fff" size={20} /> : <ThemedText>AI</ThemedText>}
          </TouchableOpacity>
        ))}
      </View>

      {/* Toast メッセージ */}
      {showToast && (
        <Toast
          message={toastMessage}
          visible={showToast}
          icon={toastIcon}
          onHide={() => {
            console.log('Toast onHide called');
            setShowToast(false);
          }}
          backgroundColor={Colors.light.primary}
          duration={3000}
        />
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerButton: {
    position: "absolute",
    top: 24,
    right: 24,
    zIndex: 10,
    width: 41,
    height: 41,
    borderRadius: 20.5,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    paddingTop: 80,
    paddingHorizontal: 24,
    paddingBottom: 120,
    gap: 16,
  },
  badge: {
    width: 198,
    height: 48,
    backgroundColor: Colors.light.primary,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 20,
  },
  cardLarge: {
    height: 400,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.background,
    padding: 16,
  },
  cardContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-around", // space-betweenからspace-aroundに変更して間隔を狭くする
    width: "100%",
    minHeight: 360,
  },
  cardMedium: {
    height: 101,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    backgroundColor: "#fafeff",
    alignItems: "center",
    justifyContent: "center",
  },
  wasteInputButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  actionCard: {
    flex: 1,
    height: 100,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    backgroundColor: "#fafeff",
    alignItems: "center",
    paddingHorizontal: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionTitle: {
    color: Colors.light.primary,
    fontWeight: "600",
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 79,
    backgroundColor: Colors.light.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  navButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  cardLargeText: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.light.primary,
    textAlign: "center",
    lineHeight: 26,
    marginTop: 8,
  },
  cardSmallText: {
    fontSize: 8,
    color: '#B4C5C5',
    textAlign: "center",
    paddingHorizontal: 16,
    lineHeight: 18,
    // backgroundColor: 'red',
  },
  button: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 50,
    marginVertical: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  prefixText: {
    fontSize: 12,
    color: Colors.light.primary,
    textAlign: "center",
    textDecorationLine: 'underline',
    textDecorationColor: Colors.light.primary,
    marginBottom: 8,
  },
  wasteCostText: {
    fontWeight: "800",
    color: Colors.light.accent,
    textDecorationLine: 'underline',
    textDecorationColor: Colors.light.primary,
    textDecorationStyle: 'solid',
  },
  prefixSmallText: {
    fontSize: 12,
    color: Colors.light.primary,
    textAlign: "center",
    marginTop: 4, 
  },
  watchRecordImage: {
    width: 240*0.7,
    height: 210*0.7,
    marginTop: 4,
  },
});