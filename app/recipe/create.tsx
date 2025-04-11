import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import { ChefHat, Clock, Users, Utensils, X, Loader as Loader2 } from 'lucide-react-native';
import type { Recipe } from '@/types/recipe';
import { z } from 'zod';
import { useRecipeStore } from '@/store/recipeStore';
import { recipeService, ingredientService } from '@/services';
import type { ParsedIngredient } from '@/services/ingredient';

const RequestSchema = z.object({
  ingredients: z.array(z.string()),
  servings: z.string(),
  cuisines: z.array(z.string()),
  maxTime: z.number(),
  hint: z.string(),
  mode: z.enum(['use-what-i-have', 'suggest']),
});

export default function CreateRecipeScreen() {
  const { setCurrentRecipe } = useRecipeStore();
  const params = useLocalSearchParams();
  const mode = params.mode as 'use-what-i-have' | 'suggest';
  
  const [ingredients, setIngredients] = useState<ParsedIngredient[]>([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [servings, setServings] = useState(4);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [maxTime, setMaxTime] = useState(30);
  const [recipeHint, setRecipeHint] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isParsingIngredient, setIsParsingIngredient] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const cuisineTypes = [
    'Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese', 
    'Thai', 'French', 'Mediterranean', 'American', 'Korean'
  ];

  const addIngredient = async () => {
    if (newIngredient.trim()) {
      setIsParsingIngredient(true);
      try {
        const parsedIngredients = await ingredientService.parseIngredient(newIngredient.trim());
        if (parsedIngredients.length > 0) {
          setIngredients(prev => [...prev, ...parsedIngredients]);
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
    setSelectedCuisines(prev => 
      prev.includes(cuisine)
        ? prev.filter(c => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const handleCreateRecipe = async () => {
    console.log('🚀 Starting recipe creation process');
    
    try {
      setIsGenerating(true);
      setError(null);
      setStatusMessage('Preparing recipe request...');
      
      const recipeRequest = {
        ingredients: ingredients.map(ing => ing.name),
        servings: servings.toString(),
        cuisines: selectedCuisines,
        maxTime,
        hint: recipeHint,
        mode,
      };

      const recipe = await recipeService.generateRecipe(recipeRequest);
      
      setStatusMessage('Recipe generated! Redirecting...');
      setCurrentRecipe(recipe);
      router.push('/recipe/view');
    } catch (error) {
      console.error('❌ Recipe creation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate recipe. Please try again.');
    } finally {
      setIsGenerating(false);
      setStatusMessage(null);
    }
  };

  const isCreateEnabled = ingredients.length > 0 && !isGenerating;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {mode === 'use-what-i-have' ? 'Create with Your Ingredients' : 'Get Recipe Suggestions'}
        </Text>
      </View>

      {error && (
        <BlurView intensity={20} style={styles.errorSection}>
          <Text style={styles.errorText}>{error}</Text>
        </BlurView>
      )}

      {statusMessage && (
        <BlurView intensity={20} style={styles.statusSection}>
          <Text style={styles.statusText}>{statusMessage}</Text>
        </BlurView>
      )}

      <BlurView intensity={20} style={styles.section}>
        <View style={styles.sectionHeader}>
          <ChefHat size={24} color="#000" />
          <Text style={styles.sectionTitle}>Ingredients</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newIngredient}
            onChangeText={setNewIngredient}
            onSubmitEditing={addIngredient}
            placeholder="Add an ingredient (e.g., '2 cups flour')..."
            returnKeyType="done"
            editable={!isParsingIngredient}
          />
          {isParsingIngredient && (
            <View style={styles.parsingIndicator}>
              <Loader2 size={20} color="#000" />
            </View>
          )}
        </View>
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
                selectedCuisines.includes(cuisine) && styles.cuisineChipSelected
              ]}
              onPress={() => toggleCuisine(cuisine)}>
              <Text style={[
                styles.cuisineText,
                selectedCuisines.includes(cuisine) && styles.cuisineTextSelected
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
        <Text style={styles.sectionTitle}>Recipe Hint</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={recipeHint}
          onChangeText={setRecipeHint}
          placeholder="Add any special requests or preferences..."
          multiline
          numberOfLines={3}
        />
      </BlurView>

      <TouchableOpacity 
        style={[styles.createButton, !isCreateEnabled && styles.createButtonDisabled]}
        disabled={!isCreateEnabled}
        onPress={handleCreateRecipe}>
        {isGenerating ? (
          <View style={styles.loadingContainer}>
            <Loader2 size={24} color="#fff" style={styles.spinner} />
            <Text style={styles.createButtonText}>Creating Recipe...</Text>
          </View>
        ) : (
          <Text style={styles.createButtonText}>Create Recipe</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
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
  statusSection: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(100, 100, 255, 0.3)',
  },
  statusText: {
    color: '#000080',
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  spinner: {
    transform: [{ rotate: '360deg' }],
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
});