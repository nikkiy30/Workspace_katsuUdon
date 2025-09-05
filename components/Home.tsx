import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from '@/constants/Colors';
import { Image } from "expo-image";
import { router } from "expo-router";
import { Home as HomeIcon, MoreHorizontal, Trash2 } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
            <Text style={styles.cardLargeText}>今日、使いきれなかった食材は{'\n'}ありましたか？</Text>
            <Text style={styles.cardSmallText}>廃棄してしまった食材を記録して、次の買い物に活かしましょう。</Text>
            <TouchableOpacity onPress={() => router.push('/feedback')} style={styles.button} activeOpacity={0.8}>
              <Text style={styles.buttonText}>きろくをみる</Text>
            </TouchableOpacity>
            <Image
              source={require('@assets/images/watch-record.svg')}
              style={styles.watchRecordImage}
              contentFit="contain"
            />
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
      </ScrollView>

      <View style={styles.bottomNav}>
        {navigationItems.map((item, idx) => (
          <TouchableOpacity key={idx} style={styles.navButton} activeOpacity={0.8}>
            {item.icon ? <item.icon color="#fff" size={20} /> : <ThemedText>AI</ThemedText>}
          </TouchableOpacity>
        ))}
      </View>
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
    padding: 20,
  },
  cardContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
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
  watchRecordImage: {
    width: 240*0.8,
    height: 210*0.8,
    marginTop: 10,
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
    marginVertical: 4,
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
});