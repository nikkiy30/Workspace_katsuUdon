import { Stack } from 'expo-router'

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, 
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen 
        name="edit" 
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'プロフィール編集',
          headerBackTitle: 'キャンセル',
        }}
      />
    </Stack>
  )
}
