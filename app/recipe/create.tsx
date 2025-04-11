import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, router } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import { ChefHat, Clock, Users, Utensils, X, Loader as Loader2 } from 'lucide-react-native';
import { useRecipeStore } from '@/store/recipeStore';
import { recipeService, ingredientService } from '@/services';
import type { ParsedIngredient } from '@/services/ingredient';
import ProgressIndicator, { ProgressStep } from '@/components/ProgressIndicator';
import { eventService, AIEvent } from '@/services/events';

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
  errorSection: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 100, 100, 0.3)',
  },
  errorText: {
    color: '#800000',
    fontSize: 16,
    textAlign: 'center',
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
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: '#000000',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  ingredientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  ingredientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 8,
  },
  ingredientText: {
    fontSize: 14,
  },
  servingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  servingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  servingButtonText: {
    fontSize: 24,
    fontWeight: '600',
  },
  servingCount: {
    fontSize: 18,
    fontWeight: '600',
    minWidth: 100,
    textAlign: 'center',
  },
  cuisineScroll: {
    flexDirection: 'row',
    marginTop: 8,
  },
  cuisineChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  cuisineChipSelected: {
    backgroundColor: '#000',
  },
  cuisineText: {
    fontSize: 14,
    color: '#000',
  },
  cuisineTextSelected: {
    color: '#fff',
  },
  timeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#000',
    margin: 20,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#666',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  parsingIndicator: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  parsingStatus: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  parsingStatusText: {
    color: '#4a90e2',
    fontSize: 14,
    textAlign: 'center',
  },
  manualLink: {
    backgroundColor: '#4a90e2',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 20,
    marginTop: 10,
    alignItems: 'center',
  },
  manualLinkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  doneButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#4a90e2',
    borderRadius: 8,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default function CreateRecipeScreen() {
  const { setCurrentRecipe } = useRecipeStore();
  const params = useLocalSearchParams();
  const mode = params.mode as 'use-what-i-have' | 'suggest';

  // No need for navigation ref anymore

  const [ingredients, setIngredients] = useState<ParsedIngredient[]>([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [servings, setServings] = useState(4);
  const [selectedCuisine, setSelectedCuisine] = useState<string>('');
  const [maxTime, setMaxTime] = useState(30);
  const [recipeHint, setRecipeHint] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isParsingIngredient, setIsParsingIngredient] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('ingredients');
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardPadding, setKeyboardPadding] = useState(0);
  // We'll use a more general approach with refs and measurements
  const inputRefs = useRef<{[key: string]: any}>({});

  // Define the steps for the recipe creation process - simplified for user understanding
  const progressSteps: ProgressStep[] = [
    { id: 'ingredients', label: 'Ingredients', status: 'completed' },
    { id: 'recipe-generation', label: 'Creating Recipe', status: 'waiting' },
    { id: 'image-generation', label: 'Adding Image', status: 'waiting' },
  ];

  // Update the steps based on the current step
  const updatedSteps = progressSteps.map(step => {
    let status: 'waiting' | 'in-progress' | 'completed' | 'error' = 'waiting';

    if (step.id === currentStep) {
      status = error ? 'error' : 'in-progress';
    } else if (progressSteps.findIndex(s => s.id === step.id) < progressSteps.findIndex(s => s.id === currentStep)) {
      status = 'completed';
    }

    return {
      ...step,
      status
    };
  });

  const cuisineTypes = [
    'Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese',
    'Thai', 'French', 'Mediterranean', 'American', 'Korean'
  ];

  const addIngredient = async () => {
    if (newIngredient.trim()) {
      setIsParsingIngredient(true);
      setStatusMessage(`Parsing ingredient: ${newIngredient.trim()}`);
      try {
        const parsedIngredients = await ingredientService.parseIngredient(newIngredient.trim());
        if (parsedIngredients.length > 0) {
          setIngredients(prev => [...prev, ...parsedIngredients]);
          setStatusMessage(`Added: ${parsedIngredients.map(ing => ing.name).join(', ')}`);
          // Clear status message after a short delay
          setTimeout(() => setStatusMessage(null), 1500);
        }
      } catch (error) {
        console.error('Failed to parse ingredients:', error);
        setError('Failed to parse ingredients. Please try again.');
        setTimeout(() => setError(null), 3000);
      } finally {
        setIsParsingIngredient(false);
        setNewIngredient('');
      }
    }
  };

  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisine(prev => prev === cuisine ? '' : cuisine);
  };

  // Set up keyboard event listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      // Get the height of the keyboard
      const keyboardHeight = e.endCoordinates.height;
      // Set padding to just enough to ensure visibility
      setKeyboardPadding(keyboardHeight + 10);

      // The scrolling will be handled by the input focus handlers
      // No need to scroll here
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      // Reset all padding when keyboard hides
      setKeyboardPadding(0);
    });

    // Clean up listeners
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Set up event listeners for AI operations
  useEffect(() => {
    // Set up event listeners - simplified for better user experience
    const listeners = [
      // Combine prompt and generation events into a single 'Creating Recipe' step
      eventService.subscribe(AIEvent.RECIPE_PROMPT_START, () => {
        setCurrentStep('recipe-generation');
        setStatusMessage('Creating your personalized recipe...');
      }),

      eventService.subscribe(AIEvent.RECIPE_GENERATION_START, () => {
        setCurrentStep('recipe-generation');
        setStatusMessage('Creating your personalized recipe...');
      }),

      eventService.subscribe(AIEvent.RECIPE_GENERATION_COMPLETE, () => {
        setStatusMessage('Recipe created! Adding an image...');
      }),

      // Combine image prompt and generation into a single 'Adding Image' step
      eventService.subscribe(AIEvent.IMAGE_PROMPT_START, () => {
        setCurrentStep('image-generation');
        setStatusMessage('Adding a beautiful image to your recipe...');
      }),

      eventService.subscribe(AIEvent.IMAGE_GENERATION_START, () => {
        setCurrentStep('image-generation');
        setStatusMessage('Adding a beautiful image to your recipe...');
      }),

      // Handle completion and navigation
      eventService.subscribe(AIEvent.IMAGE_GENERATION_COMPLETE, () => {
        console.log('💬 IMAGE_GENERATION_COMPLETE event received, preparing to redirect...');
        setStatusMessage('Recipe complete! Opening recipe...');

        // Redirect immediately
        setIsGenerating(false);
        router.push('/recipe/view');
      }),

      eventService.subscribe(AIEvent.ERROR, (data) => {
        setError(data?.message || 'An error occurred during recipe creation');
      })
    ];

    // Clean up listeners on unmount
    return () => {
      listeners.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  const handleCreateRecipe = async () => {
    console.log('🚀 Starting recipe creation process');

    try {
      setIsGenerating(true);
      setError(null);

      const recipeRequest = {
        ingredients: ingredients.map(ing => ing.name),
        servings: servings.toString(),
        cuisines: selectedCuisine ? [selectedCuisine] : [],
        maxTime,
        hint: recipeHint,
        mode,
      };

      // Call the recipe service to generate the recipe
      // The events will be emitted by the service and handled by our listeners
      const recipe = await recipeService.generateRecipe(recipeRequest);

      // Store the recipe in the store so it's available when we redirect
      setCurrentRecipe(recipe);

      // The redirection will be handled by the IMAGE_GENERATION_COMPLETE event listener

      // Add a simple safety timeout in case the image generation takes too long
      setTimeout(() => {
        if (isGenerating) {
          console.log('⚠️ Safety timeout triggered - redirecting to view');
          setIsGenerating(false);
          router.push('/recipe/view');
        }
      }, 15000); // 15 seconds safety timeout

    } catch (error) {
      console.error('❌ Recipe creation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate recipe. Please try again.');
      setIsGenerating(false);
    }
  };

  const isCreateEnabled = ingredients.length > 0 && !isGenerating;

  // Store input refs for later use
  const storeInputRef = (inputName: string, inputRef: any) => {
    if (inputRef) {
      inputRefs.current[inputName] = inputRef;
    }
  };

  // Function to handle Recipe Hint input focus specifically
  const handleRecipeHintFocus = () => {
    // Use a simpler approach - just add extra padding at the bottom when the Recipe Hint is focused
    setKeyboardPadding(prev => prev + 250); // Add extra padding to ensure visibility

    // Scroll to the Recipe Hint input after a short delay
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Function to handle Recipe Hint input blur
  const handleRecipeHintBlur = () => {
    // Remove the extra padding when the Recipe Hint input loses focus
    setKeyboardPadding(prev => Math.max(0, prev - 250)); // Remove the extra padding, but don't go below 0
  };

  return (
    <View style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.container}
            scrollEnabled={!isGenerating}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 20 + keyboardPadding }} // Minimal base padding plus keyboard height
          >
            <View style={styles.header}>
          <Text style={styles.title}>
            {mode === 'use-what-i-have' ? 'Create with Your Ingredients' : 'Get Recipe Suggestions'}
          </Text>
        </View>

      {!isGenerating && error && (
        <BlurView intensity={20} style={styles.errorSection}>
          <Text style={styles.errorText}>{error}</Text>
        </BlurView>
      )}

      <BlurView intensity={20} style={styles.section}>
        <View style={styles.sectionHeader}>
          <ChefHat size={24} color="#000" />
          <Text style={styles.sectionTitle}>Ingredients</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            ref={(ref) => ref && storeInputRef('ingredients', ref)}
            style={styles.input}
            value={newIngredient}
            onChangeText={setNewIngredient}
            onSubmitEditing={addIngredient}
            placeholder="Add an ingredient (e.g., 'Chicken, Garlic, Tomato')..."
            placeholderTextColor="#666666"
            returnKeyType="done"
            editable={!isParsingIngredient}
          />
          {isParsingIngredient && (
            <View style={styles.parsingIndicator}>
              <Loader2 size={20} color="#000" />
            </View>
          )}
        </View>

        {isParsingIngredient && statusMessage && (
          <View style={styles.parsingStatus}>
            <Text style={styles.parsingStatusText}>{statusMessage}</Text>
          </View>
        )}

        <View style={styles.ingredientsList}>
          {ingredients.map(ingredient => (
            <View key={ingredient.id} style={styles.ingredientChip}>
              <Text style={styles.ingredientText}>
                {ingredient.quantity && ingredient.unit
                  ? `${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`
                  : ingredient.name}
              </Text>
              <TouchableOpacity onPress={() => removeIngredient(ingredient.id)}>
                <X size={16} color="#666" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </BlurView>

      <BlurView intensity={20} style={styles.section}>
        <View style={styles.sectionHeader}>
          <Users size={24} color="#000" />
          <Text style={styles.sectionTitle}>Serving Size</Text>
        </View>
        <View style={styles.servingControls}>
          <TouchableOpacity
            style={styles.servingButton}
            onPress={() => setServings(prev => Math.max(1, prev - 1))}>
            <Text style={styles.servingButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.servingCount}>{servings} people</Text>
          <TouchableOpacity
            style={styles.servingButton}
            onPress={() => setServings(prev => prev + 1)}>
            <Text style={styles.servingButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </BlurView>

      <BlurView intensity={20} style={styles.section}>
        <View style={styles.sectionHeader}>
          <Utensils size={24} color="#000" />
          <Text style={styles.sectionTitle}>Cuisine Type</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.cuisineScroll}>
          {cuisineTypes.map(cuisine => (
            <TouchableOpacity
              key={cuisine}
              style={[
                styles.cuisineChip,
                selectedCuisine === cuisine && styles.cuisineChipSelected
              ]}
              onPress={() => toggleCuisine(cuisine)}>
              <Text style={[
                styles.cuisineText,
                selectedCuisine === cuisine && styles.cuisineTextSelected
              ]}>{cuisine}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </BlurView>

      <BlurView intensity={20} style={styles.section}>
        <View style={styles.sectionHeader}>
          <Clock size={24} color="#000" />
          <Text style={styles.sectionTitle}>Maximum Time</Text>
        </View>
        <View style={styles.timeControls}>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setMaxTime(prev => Math.max(15, prev - 15))}>
            <Text style={styles.timeButtonText}>-15 min</Text>
          </TouchableOpacity>
          <Text style={styles.timeValue}>{maxTime} minutes</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setMaxTime(prev => prev + 15)}>
            <Text style={styles.timeButtonText}>+15 min</Text>
          </TouchableOpacity>
        </View>
      </BlurView>

      <BlurView intensity={20} style={styles.section}>
        <Text style={styles.sectionTitle}>Recipe Hints</Text>
        <TextInput
          ref={(ref) => ref && storeInputRef('recipeHint', ref)}
          style={[styles.input, styles.multilineInput]}
          value={recipeHint}
          onChangeText={setRecipeHint}
          placeholder="Try things like: Cook on the grill, I like spicy, etc."
          placeholderTextColor="#666666"
          multiline
          numberOfLines={3}
          returnKeyType="done"
          onFocus={handleRecipeHintFocus}
          onBlur={handleRecipeHintBlur}
        />
      </BlurView>

      {!isGenerating && (
        <TouchableOpacity
          style={[styles.createButton, !isCreateEnabled && styles.createButtonDisabled]}
          disabled={!isCreateEnabled}
          onPress={handleCreateRecipe}>
          <Text style={styles.createButtonText}>Create Recipe</Text>
        </TouchableOpacity>
      )}
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>

        {isGenerating && (
          <ProgressIndicator
            steps={updatedSteps}
            currentStepId={currentStep}
            statusMessage={statusMessage}
            error={error}
          />
        )}
      </View>
  );
}
