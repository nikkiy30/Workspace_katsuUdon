import { Colors } from '@/constants/Colors';
import { CheckCircle } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';

interface ToastProps {
  message: string;
  visible: boolean;
  onHide?: () => void;
  duration?: number;
  backgroundColor?: string;
  textColor?: string;
  icon?: 'check-circle' | null;
}

const { width } = Dimensions.get('window');

export const Toast: React.FC<ToastProps> = ({
  message,
  visible,
  onHide,
  duration = 3000,
  backgroundColor = Colors.light.primary,
  textColor = '#FFFFFF',
  icon = null
}) => {
  const [translateY] = useState(() => new Animated.Value(100));
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      let active = true;
      // トーストを表示
      const showing = Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]);
      const hiding = Animated.parallel([
        Animated.timing(translateY, { toValue: 100, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]);
      showing.start();

      // 指定時間後にトーストを非表示
      const timer = setTimeout(() => {
        hiding.start(({ finished }) => {
          if (active && finished) onHide?.();
        });
      }, duration);

      return () => {
        active = false;
        clearTimeout(timer);
        showing.stop();
        hiding.stop();
      };
    }
  }, [visible, message, duration, onHide, translateY, opacity]);

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View
        style={[
          styles.toast,
          {
            backgroundColor,
            transform: [{ translateY }],
            opacity,
            display: visible ? 'flex' : 'none',
          },
        ]}
      >
        <View style={styles.toastContent}>
          {icon === 'check-circle' && (
            <CheckCircle size={20} color={textColor} style={styles.icon} />
          )}
          <Text style={[styles.message, { color: textColor }]}>
            {message}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100, // 底辺から少し上に表示
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  toast: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    maxWidth: width - 40,
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Toast;
