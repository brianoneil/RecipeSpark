import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { Clock, Users, ChefHat, ShoppingBag, Heart, Share2 } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useRecipeStore } from '@/store/recipeStore';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&auto=format&fit=crop&q=80';

export default function RecipeViewScreen() {
  const { currentRecipe, saveRecipe, removeSavedRecipe, isRecipeSaved } = useRecipeStore();
  const [isSaved, setIsSaved] = useState(false);

  // Check if the current recipe is saved
  useEffect(() => {
    if (currentRecipe?.id) {
      setIsSaved(isRecipeSaved(currentRecipe.id));
    }
  }, [currentRecipe, isRecipeSaved]);

  // Handle toggling save state
  const handleToggleSave = () => {
    if (!currentRecipe) return;

    if (isSaved && currentRecipe.id) {
      removeSavedRecipe(currentRecipe.id);
      setIsSaved(false);
      Alert.alert('Recipe Removed', 'Recipe has been removed from your saved recipes.');
    } else {
      saveRecipe(currentRecipe);
      setIsSaved(true);
      Alert.alert('Recipe Saved', 'Recipe has been saved to your collection!');
    }
  };

  // Handle sharing the recipe
  const handleShare = () => {
    Alert.alert('Coming Soon', 'Sharing functionality will be available in a future update.');
  };

  if (!currentRecipe) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No recipe found. Please generate a recipe first.</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: currentRecipe.image?.[0] || PLACEHOLDER_IMAGE }}
          style={styles.image}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(255,255,255,0.8)']}
          style={styles.gradient}
        />
        <BlurView intensity={50} style={styles.overlay}>
          <Text style={styles.title}>{currentRecipe.name}</Text>
          {currentRecipe.description && (
            <Text style={styles.description}>{currentRecipe.description}</Text>
          )}
        </BlurView>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Clock size={24} color="#000" />
          <Text style={styles.infoText}>{currentRecipe.totalTime}</Text>
        </View>
        <View style={styles.infoItem}>
          <Users size={24} color="#000" />
          <Text style={styles.infoText}>{currentRecipe.recipeYield}</Text>
        </View>
        {currentRecipe.recipeCuisine && (
          <View style={styles.infoItem}>
            <ChefHat size={24} color="#000" />
            <Text style={styles.infoText}>{currentRecipe.recipeCuisine}</Text>
          </View>
        )}
      </View>

      <BlurView intensity={20} style={styles.section}>
        <Text style={styles.sectionTitle}>Ingredients</Text>
        {currentRecipe.recipeIngredient.map((ingredient, index) => (
          <Text key={index} style={styles.ingredient}>• {ingredient}</Text>
        ))}
      </BlurView>

      {currentRecipe.shoppingList.items.length > 0 && (
        <BlurView intensity={20} style={styles.section}>
          <View style={styles.sectionHeader}>
            <ShoppingBag size={24} color="#000" />
            <Text style={styles.sectionTitle}>Shopping List</Text>
          </View>
          {currentRecipe.shoppingList.items.map((item, index) => (
            <Text key={index} style={styles.ingredient}>
              • {item.purchaseQuantity} {item.purchaseUnit} {item.name}
              {item.purchaseNote && (
                <Text style={styles.note}> ({item.purchaseNote})</Text>
              )}
            </Text>
          ))}
        </BlurView>
      )}

      <BlurView intensity={20} style={styles.section}>
        <Text style={styles.sectionTitle}>Instructions</Text>
        {currentRecipe.recipeInstructions.map((instruction, index) => (
          <View key={index} style={styles.instruction}>
            <Text style={styles.stepNumber}>{instruction.step || index + 1}</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepText}>{instruction.text}</Text>
              {instruction.timer && (
                <TouchableOpacity style={styles.timerButton}>
                  <Clock size={16} color="#000" />
                  <Text style={styles.timerText}>
                    {instruction.durationMinutes} min
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </BlurView>

      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, isSaved && styles.actionButtonActive]}
          onPress={handleToggleSave}
        >
          <Heart size={24} color={isSaved ? '#fff' : '#000'} fill={isSaved ? '#fff' : 'transparent'} />
          <Text style={[styles.actionButtonText, isSaved && styles.actionButtonTextActive]}>
            {isSaved ? 'Saved' : 'Save Recipe'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Share2 size={24} color="#000" />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.startButton}>
        <Text style={styles.startButtonText}>Start Cooking</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  imageContainer: {
    height: 550, // Increased from 450 to show even more of the image
    position: 'relative',
    overflow: 'hidden', // Ensure image stays within container
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%', // Reduced from 70% to show more of the image clearly
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 25, // Add more padding at the top for better spacing
    backgroundColor: 'rgba(255, 255, 255, 0.4)', // More transparent to see more of the image
  },
  title: {
    fontSize: 32, // Increased size for better visibility
    fontWeight: 'bold',
    color: '#000',
    textShadowColor: 'rgba(255, 255, 255, 1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    marginBottom: 4, // Add some space between title and description
  },
  description: {
    fontSize: 16,
    color: '#222', // Even darker color for better contrast
    marginTop: 8,
    textShadowColor: 'rgba(255, 255, 255, 1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    lineHeight: 22, // Improve readability with better line height
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  infoItem: {
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#000',
  },
  section: {
    margin: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  ingredient: {
    fontSize: 16,
    marginBottom: 8,
  },
  note: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
  },
  instruction: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    backgroundColor: '#000',
    color: '#fff',
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  stepContent: {
    flex: 1,
  },
  stepText: {
    fontSize: 16,
    lineHeight: 24,
  },
  timerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
    gap: 4,
  },
  timerText: {
    fontSize: 14,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 20,
    marginBottom: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 12,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 5,
    gap: 8,
  },
  actionButtonActive: {
    backgroundColor: '#000',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  actionButtonTextActive: {
    color: '#fff',
  },
  startButton: {
    backgroundColor: '#000',
    margin: 20,
    marginTop: 10,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  backButton: {
    backgroundColor: '#000',
    margin: 20,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});