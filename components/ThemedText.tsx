import { Colors } from '@/constants/Colors';
import { StyleSheet, Text, type TextProps } from 'react-native';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'secondary' | 'tertiary';
};

// テーマに応じたテキストコンポーネント
export function ThemedText({
  style,
  lightColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = Colors.light.primary;

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'secondary' ? styles.secondary : undefined,
        type === 'tertiary' ? styles.tertiary : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const getTextColor = (type: ThemedTextProps['type']): string => {
  switch (type) {
    case 'secondary':
      return Colors.light.textSecondary;
    case 'tertiary':
      return Colors.light.textTertiary;
    case 'link':
      return Colors.light.primary;
    default:
      return Colors.light.text;
  }
};

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  secondary: {
    fontSize: 14,
    lineHeight: 20,
  },
  tertiary: {
    fontSize: 12,
    lineHeight: 16,
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
  },
});
