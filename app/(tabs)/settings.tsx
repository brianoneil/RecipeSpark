import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import BackgroundGradient from '@/components/BackgroundGradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassPanel from '@/components/GlassPanel';
import Header from '@/components/Header';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <BackgroundGradient>
      <View style={styles.container}>
        <Header
          title="Settings"
          subtitle="Customize your experience"
          showIcon={true}
        />

        <View style={{ height: 16 }} />

        <GlassPanel style={styles.content}>
          <Text style={{ color: Colors.textSecondary }}>Settings coming soon</Text>
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