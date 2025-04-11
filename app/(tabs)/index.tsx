import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { ChefHat, ShoppingBag } from 'lucide-react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>RecipeSpark</Text>
      </View>

      <View style={styles.actionButtons}>
        <Link href="/recipe/create?mode=use-what-i-have" asChild>
          <TouchableOpacity style={styles.actionButton}>
            <BlurView intensity={20} style={styles.buttonContent}>
              <ChefHat size={32} color="#000" />
              <Text style={styles.buttonText}>Use What I Have</Text>
              <Text style={styles.buttonSubtext}>Create a recipe with your ingredients</Text>
            </BlurView>
          </TouchableOpacity>
        </Link>

        <Link href="/recipe/create?mode=suggest" asChild>
          <TouchableOpacity style={styles.actionButton}>
            <BlurView intensity={20} style={styles.buttonContent}>
              <ShoppingBag size={32} color="#000" />
              <Text style={styles.buttonText}>Suggest Recipe</Text>
              <Text style={styles.buttonSubtext}>Get recipe suggestions</Text>
            </BlurView>
          </TouchableOpacity>
        </Link>
      </View>

      <Text style={styles.sectionTitle}>Recommended for you</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.recipeScroll}
        contentContainerStyle={styles.recipeScrollContent}>
        {/* Recipe cards will be populated here */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  actionButtons: {
    padding: 20,
    gap: 16,
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonContent: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  buttonSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  recipeScroll: {
    marginTop: 16,
  },
  recipeScrollContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
});