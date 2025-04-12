import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChefHat, ShoppingBag, Clock, Users } from 'lucide-react-native';
import { Link, router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import BackgroundGradient from '@/components/BackgroundGradient';
import GlassPanel from '@/components/GlassPanel';
import Header from '@/components/Header';
import { useRecipeStore } from '@/store/recipeStore';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&auto=format&fit=crop&q=80';

export default function HomeScreen() {
  // Get saved recipes from the store
  const { savedRecipes, setCurrentRecipe } = useRecipeStore();

  // Handle recipe selection
  const handleRecipePress = (index: number) => {
    setCurrentRecipe(savedRecipes[index]);
    router.push(`/recipe/view`);
  };

  return (
    <BackgroundGradient>
      <View style={styles.container}>
        <Header
          title="Recipe Spark"
          subtitle="AI-powered recipe creation"
          showIcon={true}
        />

        <View style={{ height: 16 }} />

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

          {savedRecipes.length === 0 ? (
            <View style={styles.emptyRecipeCard}>
              <GlassPanel style={styles.emptyCardContent}>
                <Text style={styles.emptyCardText}>Create your first recipe to see recommendations</Text>
              </GlassPanel>
            </View>
          ) : (
            savedRecipes.map((recipe, index) => (
              <TouchableOpacity
                key={recipe.id || index}
                style={styles.recipeCard}
                onPress={() => handleRecipePress(index)}
                activeOpacity={0.8}
              >
                <GlassPanel style={styles.cardContent}>
                  <Image
                    source={{ uri: recipe.image?.[0] || PLACEHOLDER_IMAGE }}
                    style={styles.recipeImage}
                    resizeMode="cover"
                  />
                  <View style={styles.recipeInfo}>
                    <Text style={styles.recipeName} numberOfLines={1}>{recipe.name}</Text>

                    {recipe.recipeCuisine && (
                      <View style={styles.cuisineTag}>
                        <Text style={styles.cuisineText}>{recipe.recipeCuisine}</Text>
                      </View>
                    )}

                    {recipe.description && (
                      <Text style={styles.recipeDescription} numberOfLines={2}>
                        {recipe.description}
                      </Text>
                    )}

                    <View style={styles.recipeMetaInfo}>
                      <Clock size={16} color={Colors.primary} style={styles.metaInfoIcon} />
                      <Text style={styles.metaInfoLabel}>Total Time:</Text>
                      <Text style={styles.metaInfoValue}>{recipe.totalTime || '30'} min</Text>
                    </View>

                    <View style={styles.recipeMetaInfo}>
                      <Users size={16} color={Colors.primary} style={styles.metaInfoIcon} />
                      <Text style={styles.metaInfoLabel}>Servings:</Text>
                      <Text style={styles.metaInfoValue}>{recipe.recipeYield || '2'}</Text>
                    </View>


                  </View>
                </GlassPanel>
              </TouchableOpacity>
            ))
          )}

        </ScrollView>
      </View>
    </BackgroundGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    height: 230, // Reduced height to save vertical space
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
    fontSize: 22,
    fontWeight: '600',
    marginTop: 16, // Reduced from 30 to 16
    marginBottom: 8, // Added bottom margin
    marginLeft: 20,
    color: Colors.text,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  recipeScroll: {
    marginTop: 0, // Removed top margin since we added bottom margin to the title
  },
  recipeScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyRecipeCard: {
    width: 280,
    height: 340, // Adjusted to match recipe cards
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: Colors.borderMedium,
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
  recipeCard: {
    width: 280,
    height: 345, // Further increased height to ensure all content is visible
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: Colors.borderMedium,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  recipeImage: {
    width: '100%',
    height: 145, // Increased height to show more of the image
    backgroundColor: Colors.background,
  },
  recipeInfo: {
    padding: 18,
    paddingBottom: 20, // Extra padding at the bottom
    flex: 1,
    justifyContent: 'flex-start', // Changed to flex-start to avoid stretching
  },
  recipeName: {
    fontSize: 18, // Larger font size
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8, // Increased bottom margin
  },
  recipeDetails: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  detailText: {
    fontSize: 13, // Slightly larger
    color: Colors.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  cuisineTag: {
    backgroundColor: Colors.primary + '20', // 20% opacity
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  cuisineText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  recipeDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 10,
    lineHeight: 20,
  },
  recipeMetaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8, // Increased bottom margin
  },
  metaInfoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginRight: 6,
  },
  metaInfoValue: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  metaInfoIcon: {
    marginRight: 6,
  },
});
