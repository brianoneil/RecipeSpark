import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { useRecipeStore } from '@/store/recipeStore';
import { Clock, Users, ChefHat, Trash2 } from 'lucide-react-native';
import { useState } from 'react';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&auto=format&fit=crop&q=80';

export default function SavedRecipesScreen() {
  const { savedRecipes, removeSavedRecipe, setCurrentRecipe } = useRecipeStore();
  const [isEditing, setIsEditing] = useState(false);

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
      <View style={styles.container}>
        <Text style={styles.title}>Saved Recipes</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>You haven't saved any recipes yet.</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/')}>
            <Text style={styles.createButtonText}>Create a Recipe</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved Recipes</Text>
        <TouchableOpacity onPress={toggleEditMode}>
          <Text style={styles.editButton}>{isEditing ? 'Done' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={savedRecipes}
        keyExtractor={(item) => item.id || item.name}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.recipeCard}
            onPress={() => handleViewRecipe(index)}
            disabled={isEditing}
          >
            <BlurView intensity={20} style={styles.cardContent}>
              <Image
                source={{ uri: item.image?.[0] || PLACEHOLDER_IMAGE }}
                style={styles.recipeImage}
              />
              <View style={styles.recipeInfo}>
                <Text style={styles.recipeName}>{item.name}</Text>
                
                <View style={styles.recipeDetails}>
                  <View style={styles.detailItem}>
                    <Clock size={16} color="#666" />
                    <Text style={styles.detailText}>{item.totalTime.replace('PT', '').replace('M', ' min')}</Text>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <Users size={16} color="#666" />
                    <Text style={styles.detailText}>{item.recipeYield}</Text>
                  </View>
                  
                  {item.recipeCuisine && (
                    <View style={styles.detailItem}>
                      <ChefHat size={16} color="#666" />
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
                  <Trash2 size={20} color="#ff3b30" />
                </TouchableOpacity>
              )}
            </BlurView>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  editButton: {
    fontSize: 18,
    color: '#4a90e2',
    fontWeight: '500',
  },
  listContent: {
    padding: 10,
  },
  recipeCard: {
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 16,
  },
  recipeImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  recipeInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  recipeName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  recipeDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    justifyContent: 'center',
    padding: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    width: '80%',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
