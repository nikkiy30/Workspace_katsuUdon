import { AuthScreen } from '@/components/AuthScreen';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function RootLayout() {
  useFrameworkReady();
  const { user, loading } = useAuth();
  const { onboardingCompleted, loading: onboardingLoading } = useOnboarding(user?.id);
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded || loading || onboardingLoading) {
    // Async font loading only occurs in development.
    return null;
  }

  // ユーザーがログインしていない場合は認証画面を表示
  if (!user) {
    return <AuthScreen />;
  }

  // ユーザーがログインしているがオンボーディングが完了していない場合
  if (user && !onboardingCompleted) {
    return (
      <ThemeProvider value={DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(onboarding)" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    );
  }

  // ユーザーがログインしていてオンボーディングも完了している場合
  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
