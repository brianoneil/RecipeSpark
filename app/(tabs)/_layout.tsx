import { Tabs } from 'expo-router';
import { Home, Book, Settings, BookmarkIcon } from 'lucide-react-native';
import { Colors, BlurIntensities } from '@/constants/Colors';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: Colors.glassDark,
          borderTopWidth: 0,
          elevation: 0,
          height: 60 + insets.bottom, // Add safe area bottom inset to height
          paddingBottom: 10 + insets.bottom, // Add safe area bottom inset to padding
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarItemStyle: {
          paddingBottom: insets.bottom > 0 ? 5 : 0, // Add some padding if there's a safe area
        },
        tabBarBackground: () => (
          <BlurView intensity={BlurIntensities.medium} style={{ flex: 1 }} />
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ size, color }) => <BookmarkIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="pantry"
        options={{
          title: 'Pantry',
          tabBarIcon: ({ size, color }) => <Book size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}