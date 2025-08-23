import { Redirect } from 'expo-router';

export default function OnboardingIndex() {
  // オンボーディングの最初の画面にリダイレクト
  return <Redirect href="/(onboarding)/welcome" />;
}
