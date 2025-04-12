import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import BackgroundGradient from '@/components/BackgroundGradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassPanel from '@/components/GlassPanel';

export default function PantryScreen() {
  const insets = useSafeAreaInsets();

  return (
    <BackgroundGradient>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Pantry</Text>
        </View>

        <GlassPanel style={styles.content}>
          <Text style={{ color: Colors.textSecondary }}>Pantry management coming soon</Text>
        </GlassPanel>
      </View>
    </BackgroundGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Background is handled by the root layout
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  content: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    padding: 20,
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
});