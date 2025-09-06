import { Tabs } from 'expo-router';
import { BotMessageSquare, CalendarCheck2, House, UserRoundPen } from 'lucide-react-native';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { Colors } from '@/constants/Colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#FFFFFF80',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: Colors.light.primary,
          },
          default: {
            backgroundColor: Colors.light.primary,
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <House size={24} color={color} fontWeight="2px" />,
        }}
      />
      <Tabs.Screen
        name="diagnosis"
        options={{
          title: 'AI',
          tabBarIcon: ({ color }) => <BotMessageSquare size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color }) => <CalendarCheck2 size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <UserRoundPen color={color} />,
        }}
      />
    </Tabs>
  );
}