import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BackgroundGradientProps {
  children: React.ReactNode;
}

export default function BackgroundGradient({ children }: BackgroundGradientProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          Gradients.backgroundStart,
          Gradients.backgroundMiddle,
          Gradients.backgroundEnd
        ]}
        locations={[0, 0.5, 1]}
        style={styles.gradient}
      />
      <View style={{
        flex: 1,
        // We don't need bottom padding here anymore since it's handled by the tab bar
      }}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background, // Fallback color
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});
