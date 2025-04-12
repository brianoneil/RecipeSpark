import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Keyboard } from 'react-native';
import { Colors } from '@/constants/Colors';
import BackgroundGradient from '@/components/BackgroundGradient';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import GlassPanel from '@/components/GlassPanel';
import { useLocalSearchParams, router } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import { ChefHat, Clock, Users, Utensils, X, Loader as Loader2 } from 'lucide-react-native';
import { useRecipeStore } from '@/store/recipeStore';
import { recipeService, ingredientService } from '@/services';
import type { ParsedIngredient } from '@/services/ingredient';
import ProgressIndicator from '@/components/ProgressIndicator';
import { eventService, AIEvent } from '@/services/events';

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
  errorSection: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 100, 100, 0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 100, 100, 0.3)',
    overflow: 'hidden',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },

  section: {
    margin: 16,
    marginTop: 10,
    padding: 20,
    borderRadius: 16,
    backgroundColor: Colors.glass,
    borderWidth: 1.5,
    borderColor: Colors.borderMedium,
    overflow: 'hidden', // Ensure content doesn't overflow the rounded corners
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
    color: Colors.text,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1.5,
    borderColor: Colors.borderMedium,
    overflow: 'hidden',
    flex: 1,
    width: '100%',
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
    backgroundColor: Colors.glass,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.borderMedium,
    overflow: 'hidden',
  },
  ingredientText: {
    fontSize: 14,
    color: Colors.text,
  },
  servingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  servingButton: {
    backgroundColor: Colors.glass,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.borderMedium,
    overflow: 'hidden',
  },
  servingButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.primary,
  },
  servingCount: {
    fontSize: 18,
    fontWeight: '600',
    minWidth: 100,
    textAlign: 'center',
    color: Colors.text,
  },
  cuisineScroll: {
    flexDirection: 'row',
    marginTop: 8,
  },
  cuisineChip: {
    backgroundColor: Colors.glass,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: Colors.borderMedium,
    overflow: 'hidden',
  },
  cuisineChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  cuisineText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  cuisineTextSelected: {
    color: Colors.text,
  },
  timeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeButton: {
    backgroundColor: Colors.glass,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.borderMedium,
    overflow: 'hidden',
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  createButton: {
    backgroundColor: Colors.primary,
    margin: 16,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  createButtonDisabled: {
    backgroundColor: Colors.textMuted,
  },
  createButtonText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
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
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.2)',
  },
  parsingStatusText: {
    color: Colors.primary,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  manualLink: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 20,
    marginTop: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  manualLinkText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },

});

export default function CreateRecipeScreen() {
  const { setCurrentRecipe } = useRecipeStore();
  const params = useLocalSearchParams();
  const mode = params.mode as string || 'default';
  // const insets = useSafeAreaInsets();

  const [ingredients, setIngredients] = useState('');
  const [parsedIngredients, setParsedIngredients] = useState<ParsedIngredient[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [servings, setServings] = useState(4);
  const [maxTime, setMaxTime] = useState(30);
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [recipeHint, setRecipeHint] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState<string | null>(null);

  // Define progress steps
  const progressSteps = [
    { id: 'prompt', label: 'Creating Prompt', status: 'waiting' },
    { id: 'recipe', label: 'Generating Recipe', status: 'waiting' },
    { id: 'image', label: 'Creating Image', status: 'waiting' },
  ] as const;
  const [keyboardPadding, setKeyboardPadding] = useState(0);

  const scrollViewRef = useRef<ScrollView>(null);
  const inputRefs = useRef<{ [key: string]: TextInput }>({});

  const cuisineTypes = [
    'Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese', 'Thai',
    'French', 'Mediterranean', 'American', 'Korean'
  ];

  // Store input refs for later focus
  const storeInputRef = (key: string, ref: TextInput) => {
    inputRefs.current[key] = ref;
  };

  // We now parse ingredients only when the user presses return

  // Focus the ingredients input when the component mounts
  useEffect(() => {
    // Short delay to ensure the ref is set
    const timer = setTimeout(() => {
      if (inputRefs.current.ingredients) {
        inputRefs.current.ingredients.focus();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Handle keyboard events to adjust padding
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (event) => {
        // Add extra padding when the keyboard is shown
        const keyboardHeight = event.endCoordinates.height;
        setKeyboardPadding(keyboardHeight);

        //scroll up by the keyboard height
        // scrollViewRef.current?.scrollTo({ y: keyboardHeight, animated: true });
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        // Reset padding when keyboard is hidden
        setKeyboardPadding(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Subscribe to AI events
  useEffect(() => {
    const listeners = [
      eventService.subscribe(AIEvent.RECIPE_PROMPT_START, () => {
        setCurrentStep('prompt');
        setStatusMessage('Creating recipe prompt...');
      }),
      eventService.subscribe(AIEvent.RECIPE_PROMPT_COMPLETE, () => {
        setStatusMessage('Recipe prompt created');
      }),
      eventService.subscribe(AIEvent.RECIPE_GENERATION_START, () => {
        setCurrentStep('recipe');
        setStatusMessage('Generating recipe...');
      }),
      eventService.subscribe(AIEvent.RECIPE_GENERATION_COMPLETE, () => {
        setStatusMessage('Recipe generated');
      }),
      eventService.subscribe(AIEvent.IMAGE_GENERATION_START, () => {
        setCurrentStep('image');
        setStatusMessage('Generating image...');
      }),
      eventService.subscribe(AIEvent.IMAGE_GENERATION_COMPLETE, () => {
        setStatusMessage('Image generated');
        setIsGenerating(false);
        setCurrentStep(null);
        setStatusMessage('');
      }),
      eventService.subscribe(AIEvent.ERROR, (error: string) => {
        setError(error);
        setIsGenerating(false);
        setCurrentStep(null);
        setStatusMessage('');
      }),
    ];

    return () => {
      listeners.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  const handleCreateRecipe = async () => {
    try {
      setError('');
      setIsGenerating(true);

      const recipe = await recipeService.generateRecipe({
        ingredients: parsedIngredients.map(i => i.name),
        servings: servings.toString(),
        maxTime: maxTime,
        cuisines: selectedCuisine ? [selectedCuisine] : [],
        hint: recipeHint || '',
        mode: mode === 'use-what-i-have' ? 'use-what-i-have' : 'suggest',
      });

      setCurrentRecipe(recipe);
      router.push('/recipe/view');
    } catch (err: any) {
      console.error('Error generating recipe:', err);
      setError(err.message || 'Failed to generate recipe. Please try again.');
      setIsGenerating(false);
    }
  };

  const toggleCuisine = (cuisine: string) => {
    if (selectedCuisine === cuisine) {
      setSelectedCuisine('');
    } else {
      setSelectedCuisine(cuisine);
    }
  };

  // Function to handle adding an ingredient when the user presses return
  const handleAddIngredient = async () => {
    if (ingredients.trim().length === 0) return;

    setIsParsing(true);
    try {
      const parsed = await ingredientService.parseIngredient(ingredients);
      // Add new ingredients to the existing list
      setParsedIngredients(prev => [...prev, ...parsed]);
      // Clear the input field
      setIngredients('');
      // Keep focus on the input with a slight delay to ensure it works after state updates
      setTimeout(() => {
        if (inputRefs.current.ingredients) {
          inputRefs.current.ingredients.focus();
        }
      }, 50);
    } catch (err) {
      console.error('Error parsing ingredients:', err);
    } finally {
      setIsParsing(false);
    }
  };

  const removeIngredient = (index: number) => {
    const newParsedIngredients = [...parsedIngredients];
    newParsedIngredients.splice(index, 1);
    setParsedIngredients(newParsedIngredients);
  };

  // Function to handle Recipe Hint input blur
  const handleRecipeHintBlur = () => {
    // Remove the extra padding when the Recipe Hint input loses focus
    setKeyboardPadding(prev => Math.max(0, prev - 250)); // Remove the extra padding, but don't go below 0
  };

  return (
    <BackgroundGradient>
      <View style={{ flex: 1 }}>
        {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}
          <View style={{ flex: 1 }}>
            <ScrollView
              ref={scrollViewRef}
              style={styles.container}
              scrollEnabled={!isGenerating}
              // keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 20 + keyboardPadding }} // Padding for keyboard
            >
              <Header
                title={mode === 'use-what-i-have' ? 'Create a Recipe' : 'Create a Recipe'}
                subtitle={mode === 'use-what-i-have' ? 'Make a recipe from what you have' : 'Discover new recipe ideas'}
                showBackButton
                showIcon={true}
              />

              <View style={{ height: 16 }} />

              {!isGenerating && error && (
                <GlassPanel style={styles.errorSection}>
                  <Text style={styles.errorText}>{error}</Text>
                </GlassPanel>
              )}

              <GlassPanel style={styles.section}>
                <View style={styles.sectionHeader}>
                  <ChefHat size={24} color={Colors.primary} />
                  <Text style={styles.sectionTitle}>Ingredients</Text>
                </View>
                <View style={styles.inputContainer}>
                  <TextInput
                    ref={(ref) => ref && storeInputRef('ingredients', ref)}
                    style={styles.input}
                    placeholder="Add an ingredient and press return"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={ingredients}
                    onChangeText={setIngredients}
                    onSubmitEditing={handleAddIngredient}
                    returnKeyType="done"
                    editable={!isGenerating}
                    autoFocus={true}
                  />
                  {isParsing && (
                    <View style={styles.parsingIndicator}>
                      <Loader2 size={20} color={Colors.primary} />
                    </View>
                  )}
                </View>

                {isParsing && ingredients.trim().length > 0 && (
                  <View style={styles.parsingStatus}>
                    <Text style={styles.parsingStatusText}>Parsing ingredients...</Text>
                  </View>
                )}

                {parsedIngredients.length > 0 && (
                  <View style={styles.ingredientsList}>
                    {parsedIngredients.map((ingredient, index) => (
                      <View key={index} style={styles.ingredientChip}>
                        <Text style={styles.ingredientText}>{ingredient.name}</Text>
                        <TouchableOpacity onPress={() => removeIngredient(index)}>
                          <X size={16} color={Colors.text} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}


              </GlassPanel>

              <GlassPanel style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Users size={24} color={Colors.primary} />
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
              </GlassPanel>

              <GlassPanel style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Utensils size={24} color={Colors.primary} />
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
              </GlassPanel>

              <GlassPanel style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Clock size={24} color={Colors.primary} />
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
              </GlassPanel>

              <GlassPanel style={styles.section}>
                <Text style={styles.sectionTitle}>Recipe Hints</Text>
                <TextInput
                  ref={(ref) => ref && storeInputRef('recipeHint', ref)}
                  style={[styles.input, styles.multilineInput]}
                  placeholder="Any specific preferences? (optional)"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={recipeHint}
                  onChangeText={setRecipeHint}
                  multiline
                  editable={!isGenerating}
                  onBlur={handleRecipeHintBlur}
                />

              </GlassPanel>

              <TouchableOpacity
                style={[
                  styles.createButton,
                  (parsedIngredients.length === 0 || isGenerating) && styles.createButtonDisabled
                ]}
                onPress={handleCreateRecipe}
                disabled={parsedIngredients.length === 0 || isGenerating}>
                <Text style={styles.createButtonText}>
                  {isGenerating ? 'Creating Recipe...' : 'Create Recipe'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        {/* </TouchableWithoutFeedback> */}
      </View>

      {isGenerating && (
        <ProgressIndicator
          steps={progressSteps.map(step => ({
            ...step,
            status: currentStep === step.id ? 'in-progress' :
                    progressSteps.findIndex(s => s.id === step.id) < progressSteps.findIndex(s => s.id === currentStep) ?
                    'completed' : 'waiting'
          }))}
          currentStepId={currentStep || ''}
          statusMessage={statusMessage}
          error={error}
        />
      )}
    </BackgroundGradient>
  );
}
