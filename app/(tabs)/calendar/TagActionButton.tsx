import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';


interface Props {
  onPress: () => void;
  accessibilityLabel?: string;
  color?: string; // 背景色（未指定なら白）
  size?: number;  // ボタンの直径
  iconSize?: number; // アイコンサイズ
  style?: ViewStyle;
}

export default function TagActionButton({
  onPress,
  accessibilityLabel,
  color = '#ffffff',
  size = 24,
  iconSize = 14,
  style,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.button,
        {
          backgroundColor: color,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
      activeOpacity={0.7}
    >
      <Trash2 size={iconSize} color={Colors.light.primary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
