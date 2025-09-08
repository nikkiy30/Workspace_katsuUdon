import { Stack } from 'expo-router'

export default function DiagnosisLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // ヘッダーを非表示にしてタブバーのみ表示
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="ai-chat" />
    </Stack>
  )
}
