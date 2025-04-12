import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Clock, Users, ChefHat, Share2, ArrowLeft, Bookmark } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useRecipeStore } from '@/store/recipeStore';
import { Colors, BlurIntensities } from '@/constants/Colors';
import BackgroundGradient from '@/components/BackgroundGradient';
import { decimalToFraction } from '@/utils/fractions';

// Helper function to capitalize the first letter of each word
const toProperCase = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

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
      <BackgroundGradient>
        <View style={styles.container}>
          <BlurView intensity={BlurIntensities.medium} style={styles.errorContainer}>
            <Text style={styles.errorText}>No recipe found. Please generate a recipe first.</Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              style={styles.backButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <ArrowLeft size={20} color="#FFF" />
              <Text style={styles.backButtonText}>Go Back</Text>
            </LinearGradient>
            </TouchableOpacity>
          </BlurView>
        </View>
      </BackgroundGradient>
    );
  }

  return (
    <BackgroundGradient>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: 16 }}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: currentRecipe.image?.[0] || PLACEHOLDER_IMAGE }}
            style={styles.image}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.5)', Colors.background]}
            style={styles.gradient}
          />
          <TouchableOpacity
            style={styles.backButtonSmall}
            onPress={() => router.back()}
          >
            <BlurView intensity={BlurIntensities.heavy} style={styles.backButtonBlur}>
              <ArrowLeft size={20} color={Colors.text} />
            </BlurView>
          </TouchableOpacity>
          <BlurView intensity={BlurIntensities.medium} style={styles.overlay}>
            <Text style={styles.title}>{currentRecipe.name}</Text>
            {currentRecipe.description && (
              <Text style={styles.description}>{currentRecipe.description}</Text>
            )}
          </BlurView>
        </View>

        <View style={styles.infoContainer}>
          <BlurView intensity={BlurIntensities.light} style={styles.infoItem}>
            <Clock size={24} color={Colors.primary} />
            <Text style={styles.infoText}>{currentRecipe.totalTime.replace('PT', '').replace('M', ' min')}</Text>
          </BlurView>
          <BlurView intensity={BlurIntensities.light} style={styles.infoItem}>
            <Users size={24} color={Colors.primary} />
            <Text style={styles.infoText}>{currentRecipe.recipeYield}</Text>
          </BlurView>
          {currentRecipe.recipeCuisine && (
            <BlurView intensity={BlurIntensities.light} style={styles.infoItem}>
              <ChefHat size={24} color={Colors.primary} />
              <Text style={styles.infoText}>{currentRecipe.recipeCuisine}</Text>
            </BlurView>
          )}
        </View>

        <BlurView intensity={BlurIntensities.medium} style={styles.section}>
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={[styles.sectionTitleGradient, styles.sectionTitleGradientWithMargin]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.sectionHeader}>
              <ChefHat size={24} color={Colors.text} />
              <Text style={styles.sectionTitle}>Ingredients</Text>
            </View>
          </LinearGradient>
          {currentRecipe.shoppingList.items.map((item, index) => {
            // Format the quantity as a fraction if needed
            const formattedQuantity = decimalToFraction(item.requiredQuantity.amount);
            const properName = toProperCase(item.name);
            const properUnit = item.requiredQuantity.unit.toLowerCase();

            return (
              <Text key={index} style={styles.ingredient}>
                • <Text style={styles.ingredientMeasurement}>{formattedQuantity} {properUnit}</Text> - {properName}
                {item.purchaseNote && (
                  <Text style={styles.note}> ({item.purchaseNote})</Text>
                )}
              </Text>
            );
          })}
        </BlurView>

        <BlurView intensity={BlurIntensities.medium} style={styles.section}>
          <LinearGradient
            colors={[Colors.secondary, Colors.primary]}
            style={[styles.sectionTitleGradient, styles.sectionTitleGradientWithMargin]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.sectionHeader}>
              <Clock size={24} color={Colors.text} />
              <Text style={styles.sectionTitle}>Instructions</Text>
            </View>
          </LinearGradient>
          {currentRecipe.recipeInstructions.map((instruction, index) => (
            <View key={index} style={styles.instruction}>
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                style={styles.stepNumberContainer}
              >
                <Text style={styles.stepNumber}>{instruction.step || index + 1}</Text>
              </LinearGradient>
              <View style={styles.stepContent}>
                <Text style={styles.stepText}>{instruction.text}</Text>
                {instruction.timer && (
                  <TouchableOpacity style={styles.timerButton}>
                    <BlurView intensity={BlurIntensities.medium} style={styles.timerButtonContent}>
                      <Clock size={16} color={Colors.primary} />
                      <Text style={styles.timerText}>
                        {instruction.durationMinutes} min
                      </Text>
                    </BlurView>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </BlurView>

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleToggleSave}
          >
            <BlurView intensity={BlurIntensities.medium} style={[styles.actionButtonContent, isSaved && styles.actionButtonActive]}>
              <Bookmark size={24} color={isSaved ? Colors.text : Colors.primary} fill={isSaved ? Colors.text : 'transparent'} />
              <Text style={[styles.actionButtonText, isSaved && styles.actionButtonTextActive]}>
                {isSaved ? 'Saved' : 'Save Recipe'}
              </Text>
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <BlurView intensity={BlurIntensities.medium} style={styles.actionButtonContent}>
              <Share2 size={24} color={Colors.primary} />
              <Text style={styles.actionButtonText}>Share</Text>
            </BlurView>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.startButton}>
          <LinearGradient
            colors={[Colors.primary, Colors.tertiary]}
            style={styles.startButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.startButtonText}>Start Cooking</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
      </View>
    </BackgroundGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Background is handled by the root layout
  },
  scrollView: {
    flex: 1,
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
    backgroundColor: Colors.glass,
    borderTopWidth: 1.5,
    borderColor: Colors.borderMedium,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    marginTop: 10,
  },
  infoItem: {
    alignItems: 'center',
    backgroundColor: Colors.glass,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.borderMedium,
    gap: 8,
    overflow: 'hidden',
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  section: {
    margin: 16,
    borderRadius: 16,
    backgroundColor: Colors.glass,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.borderMedium,
    elevation: 3,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    // paddingTop: 0, // Add padding at the top of the section
    shadowRadius: 4,
  },
  sectionTitleGradient: {
    padding: 16,
    paddingVertical: 12,
  },
  sectionTitleGradientWithMargin: {
    marginBottom: 16, // Add padding below the gradient header
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  ingredient: {
    fontSize: 16,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingBottom: 6,
    // paddingTop: 2,
    color: Colors.text,
  },
  ingredientMeasurement: {
    fontWeight: 'bold',
    color: Colors.text,
  },
  note: {
    fontStyle: 'italic',
    color: Colors.textSecondary,
    fontSize: 14,
  },
  instruction: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingTop: 4, // Add padding at the top of each instruction
    gap: 12,
    alignItems: 'center', // Center items vertically
  },
  stepNumberContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    color: Colors.text,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepText: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text,
  },
  timerButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  timerButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1.5,
    borderColor: Colors.borderMedium,
    gap: 4,
    // Remove overflow: 'hidden' from here as it's already on the parent
  },
  timerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 16,
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: Colors.glass,
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.borderMedium,
    // Remove overflow: 'hidden' from here as it's already on the parent
  },
  actionButtonActive: {
    backgroundColor: Colors.primary,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  actionButtonTextActive: {
    color: Colors.text,
  },
  startButton: {
    margin: 16,
    marginTop: 10,
    marginBottom: 30,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  startButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  startButtonText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  errorContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: Colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.borderMedium,
    overflow: 'hidden',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    margin: 20,
    color: Colors.text,
  },
  backButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
    width: '80%',
  },
  backButtonGradient: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  backButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  backButtonSmall: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  backButtonBlur: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1.5,
    borderColor: Colors.borderMedium,
  },
});