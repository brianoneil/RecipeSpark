import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useRecipeStore } from '@/store/recipeStore';
import { Clock, Users, ChefHat, Trash2, BookmarkIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Colors, BlurIntensities, Gradients } from '@/constants/Colors';
import BackgroundGradient from '@/components/BackgroundGradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import GlassPanel from '@/components/GlassPanel';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&auto=format&fit=crop&q=80';

export default function SavedRecipesScreen() {
  const { savedRecipes, removeSavedRecipe, setCurrentRecipe } = useRecipeStore();
  const [isEditing, setIsEditing] = useState(false);
  const insets = useSafeAreaInsets();

  const handleViewRecipe = (recipeIndex: number) => {
    // Set the current recipe and navigate to the view screen
    setCurrentRecipe(savedRecipes[recipeIndex]);
    router.push('/recipe/view');
  };

  const handleRemoveRecipe = (recipeId: string) => {
    removeSavedRecipe(recipeId);
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  if (savedRecipes.length === 0) {
    return (
      <BackgroundGradient>
        <View style={styles.container}>
          <Header
            title="Saved Recipes"
            subtitle="Your favorite dishes"
            showIcon={true}
          />

          <View style={styles.emptyContainer}>
            <GlassPanel style={styles.emptyContent}>
            <BookmarkIcon size={60} color={Colors.textMuted} />
            <Text style={styles.emptyText}>You haven't saved any recipes yet.</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/')}>
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                style={styles.createButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.createButtonText}>Create a Recipe</Text>
              </LinearGradient>
            </TouchableOpacity>
          </GlassPanel>
        </View>
        </View>
      </BackgroundGradient>
    );
  }

  return (
    <BackgroundGradient>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Header
            title="Saved Recipes"
            subtitle="Your favorite dishes"
            showIcon={true}
            style={styles.header}
          />
          <TouchableOpacity
            style={styles.editButtonContainer}
            onPress={toggleEditMode}
          >
            <GlassPanel style={styles.editButtonBlur}>
              <Text style={styles.editButton}>{isEditing ? 'Done' : 'Edit'}</Text>
            </GlassPanel>
          </TouchableOpacity>
        </View>

        <FlatList
          data={savedRecipes}
          keyExtractor={(item) => item.id || item.name}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.recipeCard}
              onPress={() => handleViewRecipe(index)}
              disabled={isEditing}
              activeOpacity={0.8}
            >
              <GlassPanel style={styles.cardContent}>
                <Image
                  source={{ uri: item.image?.[0] || PLACEHOLDER_IMAGE }}
                  style={styles.recipeImage}
                />
                <View style={styles.recipeInfo}>
                <Text style={styles.recipeName}>{item.name}</Text>

                <View style={styles.recipeDetails}>
                  <View style={styles.detailItem}>
                    <Clock size={16} color={Colors.primary} />
                    <Text style={styles.detailText}>{item.totalTime.replace('PT', '').replace('M', ' min')}</Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Users size={16} color={Colors.primary} />
                    <Text style={styles.detailText}>{item.recipeYield}</Text>
                  </View>

                  {item.recipeCuisine && (
                    <View style={styles.detailItem}>
                      <ChefHat size={16} color={Colors.primary} />
                      <Text style={styles.detailText}>{item.recipeCuisine}</Text>
                    </View>
                  )}
                </View>
              </View>

              {isEditing && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => item.id && handleRemoveRecipe(item.id)}
                >
                  <LinearGradient
                    colors={['rgba(255,59,48,0.7)', 'rgba(255,59,48,0.9)']}
                    style={styles.deleteButtonGradient}
                  >
                    <Trash2 size={20} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </GlassPanel>
          </TouchableOpacity>
        )}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </BackgroundGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Background is handled by the root layout
  },
  headerContainer: {
    position: 'relative',
    zIndex: 10,
    marginBottom: 16, // Add some space below the header
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  editButtonContainer: {
    position: 'absolute',
    right: 20,
    bottom: 16, // Match the header's paddingBottom
    zIndex: 20,
    overflow: 'hidden',
    borderRadius: 20,
  },
  editButtonBlur: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  editButton: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 100, // Extra space for tab bar
  },
  recipeCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: Colors.glass,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  recipeImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  recipeInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  recipeName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    color: Colors.text,
  },
  recipeDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  deleteButton: {
    justifyContent: 'center',
    padding: 10,
  },
  deleteButtonGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyContent: {
    width: '90%',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: Colors.glass,
    borderWidth: 1.5,
    borderColor: Colors.borderMedium,
    overflow: 'hidden',
  },
  emptyText: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginVertical: 20,
  },
  createButton: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    elevation: 3,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  createButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  createButtonText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
});
