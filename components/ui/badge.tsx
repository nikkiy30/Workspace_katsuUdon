import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";

export interface BadgeProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export function Badge({ children, style, variant = "default" }: BadgeProps) {
  const bg =
    variant === "secondary"
      ? "#edf2f7"
      : variant === "destructive"
      ? "#fee2e2"
      : "transparent";

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
});
