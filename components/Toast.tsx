import { Colors } from '@/constants/Colors';
import { CheckCircle } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
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
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log('Toast useEffect:', visible, message);
    if (visible) {
      console.log('Showing toast animation');
      // トーストを表示
      Animated.parallel([
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
      ]).start(() => {
        console.log('Toast animation completed');
      });

      // 指定時間後にトーストを非表示
      const timer = setTimeout(() => {
        console.log('Hiding toast after duration');
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    console.log('Hiding toast');
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      console.log('Toast hidden');
      if (onHide) {
        onHide();
      }
    });
  };

  console.log('Toast render:', visible, message);

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
