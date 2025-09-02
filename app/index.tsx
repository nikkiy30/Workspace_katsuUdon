import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    // 常にオンボーディング画面から始まる
    router.replace('/(onboarding)');
  }, [router]);

  // ローディング中は読み込み画面を表示
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
