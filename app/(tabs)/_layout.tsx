import { Tabs } from 'expo-router';
import { BotMessageSquare, CalendarCheck2, House, UserRoundPen } from 'lucide-react-native';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { DatabaseSchema } from '@/database/schema';

export default function TabLayout() {
  // データベース初期化
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        const schema = new DatabaseSchema();
        
        //! テーブル全削除（デバッグ用）
        // 一時的：既存テーブルを削除してから再作成
        // console.log('データベースをリセット中...');
        // schema.dropAllTables();
        // console.log('データベース初期化完了');
        
        schema.createTables();
      } catch (error) {
        console.error('データベース初期化エラー:', error);
      }
    };

    initializeDatabase();
  }, []);
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'ホーム',
          tabBarIcon: ({ color }) => <House size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="diagnosis"
        options={{
          title: 'AI相談',
          tabBarIcon: ({ color }) => <BotMessageSquare size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: '記録',
          tabBarIcon: ({ color }) => <CalendarCheck2 size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'プロフィール',
          tabBarIcon: ({ color }) => <UserRoundPen size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
