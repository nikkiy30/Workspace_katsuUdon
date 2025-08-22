import React from "react";
import { View, Image, StyleSheet, Text } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";

export default function Frame() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.mockTop} />
        <ThemedText style={styles.title}>プレビューフレーム</ThemedText>
        <Image
          source={{ uri: "https://c.animaapp.com/Ixjmqztz/img/polygon-3.svg" }}
          style={styles.image}
        />
        <Text style={styles.note}>このコンポーネントは Web の static 出力から簡易移植されています。</Text>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  inner: {
    width: 390,
    height: 844,
    backgroundColor: "#fafeff",
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
  },
  mockTop: {
    width: "100%",
    height: 80,
    backgroundColor: "#156486",
  },
  title: {
    marginTop: 12,
    color: "#101420",
    fontSize: 18,
    fontWeight: "600",
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 16,
  },
  note: {
    marginTop: 8,
    color: "#4a5568",
  },
});
