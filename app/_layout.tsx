import { OnboardingProvider } from '@/hooks/useOnboarding';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { DatabaseSchema } from '@/database/schema';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // データベース初期化を最初に実行
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        const schema = new DatabaseSchema();
        schema.createTables();
        // console.log('データベース初期化完了');
        // schema.createTablesWithDummyData();
        // console.log('ダミーデータ挿入完了');

      } catch (error) {
        console.error('データベース初期化エラー:', error);
      }
    };

    initializeDatabase();
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <OnboardingProvider>
      <ThemeProvider value={DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </OnboardingProvider>
  );
}
