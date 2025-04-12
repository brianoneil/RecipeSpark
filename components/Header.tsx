import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  showIcon?: boolean;
  onBackPress?: () => void;
  style?: ViewStyle;
  useGradient?: boolean;
}

/**
 * A consistent header component for use across the app
 */
export default function Header({
  title,
  subtitle,
  showBackButton = false,
  showIcon = true,
  onBackPress,
  style,
  useGradient = true
}: HeaderProps) {
  const insets = useSafeAreaInsets();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const headerContent = (
    <>
      {showBackButton && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <ChevronLeft size={32} color={Colors.text} />
        </TouchableOpacity>
      )}
      <View style={[showBackButton ? styles.titleContainerWithBackButton : styles.titleContainer, showIcon && styles.titleContainerWithIcon]}>
        {showIcon && (
          <Image
            source={require('../assets/images/chef-hat.png')}
            style={styles.icon}
            resizeMode="contain"
          />
        )}
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
    </>
  );

  // Calculate fixed height with safe area adjustment
  const HEADER_BASE_HEIGHT = subtitle ? 130 : 110; // Increased height for larger icon

  const containerStyle = {
    ...styles.container,
    paddingTop: insets.top,
    height: HEADER_BASE_HEIGHT + insets.top, // Fixed height plus safe area
  };

  if (useGradient) {
    return (
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientEnd]}
        style={[containerStyle, style]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {headerContent}
      </LinearGradient>
    );
  }

  return (
    <View style={[containerStyle, style]}>
      {headerContent}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    width: '100%',
    justifyContent: 'flex-end', // Align content to the bottom
    paddingBottom: 16, // Consistent bottom padding
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleContainerWithBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 44, // Increased margin for larger back button
  },
  titleContainerWithIcon: {
    // Additional styling when icon is shown
  },
  textContainer: {
    flexDirection: 'column',
    flex: 1, // Take up remaining space
  },
  icon: {
    width: 60,
    height: 60,
    marginRight: 14,
  },
  title: {
    fontSize: 28, // Slightly smaller to accommodate subtitle
    fontWeight: 'bold',
    color: Colors.text,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    bottom: 28, // Adjusted to align with the larger icon and title
    zIndex: 10,
  },
});
