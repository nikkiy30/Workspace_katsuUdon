import { OnboardingProvider } from '@/hooks/useOnboarding'
import { Stack } from 'expo-router'

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack 
        screenOptions={{ 
          headerShown: false,
          gestureEnabled: false, 
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="question1" />
        <Stack.Screen name="question2" />
        <Stack.Screen name="question3" />
        <Stack.Screen name="complete" />
      </Stack>
    </OnboardingProvider>
  )
}
