import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChefHat, ShoppingBag } from 'lucide-react-native';
import { Link } from 'expo-router';
import { Colors } from '@/constants/Colors';
import BackgroundGradient from '@/components/BackgroundGradient';
import GlassPanel from '@/components/GlassPanel';

export default function HomeScreen() {
  return (
    <BackgroundGradient>
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientEnd]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.headerTitle}>Recipe Spark</Text>
        </LinearGradient>

        <View style={styles.actionButtons}>
          <Link href="/recipe/create?mode=use-what-i-have" asChild>
            <TouchableOpacity style={styles.actionButton}>
              <GlassPanel style={styles.buttonContent}>
                <LinearGradient
                  colors={[Colors.primary, Colors.secondary]}
                  style={styles.iconBackground}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <ChefHat size={32} color="#FFF" />
                </LinearGradient>
                <Text style={styles.buttonText}>Use What I Have</Text>
                <Text style={styles.buttonSubtext}>Create a recipe with your ingredients</Text>
              </GlassPanel>
            </TouchableOpacity>
          </Link>

          <Link href="/recipe/create?mode=suggest" asChild>
            <TouchableOpacity style={styles.actionButton}>
              <GlassPanel style={styles.buttonContent}>
                <LinearGradient
                  colors={[Colors.tertiary, Colors.primary]}
                  style={styles.iconBackground}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <ShoppingBag size={32} color="#FFF" />
                </LinearGradient>
                <Text style={styles.buttonText}>Suggest Recipe</Text>
                <Text style={styles.buttonSubtext}>Get recipe suggestions</Text>
              </GlassPanel>
            </TouchableOpacity>
          </Link>
        </View>

        <Text style={styles.sectionTitle}>Recent Recipes</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.recipeScroll}
          contentContainerStyle={styles.recipeScrollContent}>

          <View style={styles.emptyRecipeCard}>
            <GlassPanel style={styles.emptyCardContent}>
              <Text style={styles.emptyCardText}>Create your first recipe to see recommendations</Text>
            </GlassPanel>
          </View>

        </ScrollView>
      </View>
    </BackgroundGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 16, // Increased gap for more space between buttons
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    height: 250, // Set a fixed height for uniform sizing
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: Colors.borderMedium,
  },
  buttonContent: {
    padding: 20, // Increased padding for more space
    alignItems: 'center',
    justifyContent: 'center', // Center content vertically
    flex: 1, // Take up all available space
    borderRadius: 20, // Match the parent's border radius
  },
  iconBackground: {
    width: 64, // Larger icon background
    height: 64, // Larger icon background
    borderRadius: 32, // Adjusted border radius
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 20, // Larger font size
    fontWeight: '600',
    marginTop: 16, // Increased margin
    color: Colors.text,
    textAlign: 'center',
  },
  buttonSubtext: {
    fontSize: 15, // Larger font size
    color: Colors.textSecondary,
    marginTop: 8, // Increased margin
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 30,
    marginLeft: 20,
    color: Colors.text,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  recipeScroll: {
    marginTop: 16,
  },
  recipeScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyRecipeCard: {
    width: 280,
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  emptyCardContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20, // Match the parent's border radius
  },
  emptyCardText: {
    fontSize: 18, // Larger font size
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 10, // Add some horizontal padding
  },
});
