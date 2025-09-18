import { useOnboarding } from '@/hooks/useOnboarding.tsx';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

// app/_layout.tsx で囲まれた Provider から hook を利用
export default function IndexScreen() {
  const router = useRouter();
  const { hasCompleted, isLoading } = useOnboarding();

  useEffect(() => {
    // データ読み込み中は何もしない
    if (isLoading) {
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
  }, [isLoading, hasCompleted, router]);

  // リダイレクトされるまでの間、ローディング画面を表示
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#156486" />
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
});
