import { useOnboarding } from '@/hooks/useOnboarding';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// app/_layout.tsx で囲まれた Provider から hook を利用
export default function IndexScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const { hasCompleted, isLoading, statusError, retryStatus } = useOnboarding();

  useEffect(() => {
    // データ読み込み中は何もしない
    if (!isFocused || isLoading || statusError || hasCompleted === null) {
      if (isFocused && !isLoading && statusError) SplashScreen.hideAsync();
      return;
    }

    // スプラッシュスクリーンを非表示
    SplashScreen.hideAsync();

    // 状態に応じてリダイレクト
    if (hasCompleted) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(onboarding)');
    }
  }, [isFocused, isLoading, statusError, hasCompleted, router]);

  if (statusError && !isLoading) {
    return (
      <View style={styles.container}>
        <Text accessibilityRole="alert" style={styles.errorText}>
          設定を確認できませんでした。もう一度読み込んでください。
        </Text>
        <TouchableOpacity accessibilityRole="button" style={styles.retryButton} onPress={retryStatus}>
          <Text style={styles.retryText}>再読み込み</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // リダイレクトされるまでの間、ローディング画面を表示
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#156486" accessibilityLabel="設定を確認しています" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  errorText: {
    color: '#20556c',
    textAlign: 'center',
    margin: 24,
  },
  retryButton: {
    backgroundColor: '#156486',
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 48,
    borderRadius: 12,
  },
  retryText: {
    color: '#fff',
    textAlign: 'center',
  },
});
