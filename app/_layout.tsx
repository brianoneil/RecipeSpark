import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients } from '@/constants/Colors';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    // Debug environment variables at app startup
    console.log('🔧 App Environment Check:', {
      EXPO_PUBLIC_OPENROUTER_API_KEY: process.env.EXPO_PUBLIC_OPENROUTER_API_KEY ? 'Set' : 'Not set',
      EXPO_PUBLIC_INGREDIENTS_MODEL: process.env.EXPO_PUBLIC_INGREDIENTS_MODEL,
      EXPO_PUBLIC_RECIPE_MODEL: process.env.EXPO_PUBLIC_RECIPE_MODEL,
      rawIngredientsModel: JSON.stringify(process.env.EXPO_PUBLIC_INGREDIENTS_MODEL),
      envKeys: Object.keys(process.env).filter(key => key.startsWith('EXPO_PUBLIC_'))
    });
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[
          Gradients.backgroundStart,
          Gradients.backgroundMiddle,
          Gradients.backgroundEnd
        ]}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        }}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </View>
  );
}
