import { Colors } from '@/constants/Colors';
import { View, type ViewProps } from 'react-native';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  type?: 'default' | 'secondary' | 'sub' | 'card';
};

// テーマに応じたビューコンポーネント
export function ThemedView({ 
  style, 
  lightColor, 
  type = 'default',
  ...otherProps 
}: ThemedViewProps) {
  const backgroundColor = lightColor || getBackgroundColor(type);

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}

const getBackgroundColor = (type: ThemedViewProps['type']): string => {
  switch (type) {
    case 'secondary':
      return Colors.light.background;
    case 'sub':
      return Colors.light.sub;
    case 'card':
      return Colors.light.base;
    default:
      return Colors.light.background;
  }
};
