import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { router } from "expo-router";
import { Bell, ChevronRight, Home as HomeIcon, MoreHorizontal } from "lucide-react-native";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

const navigationItems = [
  { icon: HomeIcon, label: "ホーム" },
  { text: "AI", label: "AI" },
  { icon: MoreHorizontal, label: "メニュー" },
];

const actionCards = [
  { title: "AI買い物診断", hasArrow: false, route: '/(tabs)/diagnosis' },
  { title: "廃棄入力", hasArrow: true, route: '/wasteInput' },
];

// ホーム画面
export const Screen = () => {
  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity style={styles.headerButton} activeOpacity={0.8}>
        <Bell color="#fff" size={20} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.badge}>
          <ThemedText type="title" style={styles.badgeText}>
            8/21(木)
          </ThemedText>
        </View>

        <View style={styles.cardLarge}>
          <ThemedText>廃棄量、節約量の成果</ThemedText>
        </View>

        <View style={styles.cardMedium}>
          <ThemedText>カレンダー</ThemedText>
        </View>

        <View style={styles.actionsRow}>
          {actionCards.map((card, i) => (
            <TouchableOpacity 
              key={i} 
              style={styles.actionCard} 
              activeOpacity={0.8}
              onPress={() => router.push(card.route as any)}
            >
              <ThemedText style={styles.actionTitle}>{card.title}</ThemedText>
              {card.hasArrow && <ChevronRight color="#156486" size={18} />}
            </TouchableOpacity>
          ))}
        </View>
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
    backgroundColor: "#fafeff",
  },
  headerButton: {
    position: "absolute",
    top: 24,
    right: 24,
    zIndex: 10,
    width: 41,
    height: 41,
    borderRadius: 20.5,
    backgroundColor: "#156486",
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
    backgroundColor: "#156486",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
  },
  cardLarge: {
    height: 216,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#156486",
    backgroundColor: "#d9d9d9",
    alignItems: "center",
    justifyContent: "center",
  },
  cardMedium: {
    height: 101,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#156486",
    backgroundColor: "#d9d9d9",
    alignItems: "center",
    justifyContent: "center",
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
    borderWidth: 3,
    borderColor: "#156486",
    backgroundColor: "#fafeff",
    alignItems: "center",
    paddingHorizontal: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionTitle: {
    color: "#156486",
    fontWeight: "600",
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 79,
    backgroundColor: "#156486",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  navButton: {
    alignItems: "center",
    justifyContent: "center",
  },
});