import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/Colors';

interface GlassPanelProps {
  children: React.ReactNode;
  style?: ViewStyle;
  type?: 'default' | 'light' | 'dark';
}

/**
 * A custom glass-like panel component that isn't affected by light/dark mode
 */
export default function GlassPanel({ children, style, type = 'default' }: GlassPanelProps) {
  // Choose the background color based on the type - using very light, transparent colors for a glass effect
  const backgroundColor =
    type === 'light' ? 'rgba(255, 255, 255, 0.15)' : // Very light, transparent white
    type === 'dark' ? 'rgba(40, 40, 50, 0.4)' :      // Darker option if needed
    'rgba(180, 180, 190, 0.25)';                    // Default - very light, transparent glass

  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      {/* Add a subtle inner highlight at the top */}
      <View style={styles.innerHighlight} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0.5, // Thinner border for a more subtle effect
    borderColor: 'rgba(255, 255, 255, 0.2)', // Slightly brighter border for a glass-like highlight
    // Add a subtle shadow for depth
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative', // For positioning the inner highlight
  },

  innerHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1, // Very thin line
    backgroundColor: 'rgba(255, 255, 255, 0.25)', // Subtle white highlight
    zIndex: 1, // Ensure it's above the background but below the content
  },
});
