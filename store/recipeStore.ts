import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Recipe } from '@/types/recipe';

interface RecipeStore {
  // Current recipe being viewed
  currentRecipe: Recipe | null;
  setCurrentRecipe: (recipe: Recipe) => void;
  clearCurrentRecipe: () => void;

  // Saved recipes
  savedRecipes: Recipe[];
  saveRecipe: (recipe: Recipe) => void;
  removeSavedRecipe: (recipeId: string) => void;
  isRecipeSaved: (recipeId: string) => boolean;
}

// Helper function to generate a unique ID for a recipe
const generateRecipeId = (recipe: Recipe): string => {
  // Create a unique ID based on recipe name and timestamp
  return `${recipe.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`;
};

export const useRecipeStore = create<RecipeStore>(
  persist(
    (set, get) => ({
      // Current recipe state
      currentRecipe: null,
      setCurrentRecipe: (recipe) => set({ currentRecipe: recipe }),
      clearCurrentRecipe: () => set({ currentRecipe: null }),

      // Saved recipes state
      savedRecipes: [],
      saveRecipe: (recipe) => {
        // Add an ID if it doesn't exist
        const recipeToSave = recipe.id ? recipe : { ...recipe, id: generateRecipeId(recipe) };

        // Check if recipe is already saved
        const isAlreadySaved = get().savedRecipes.some(saved => saved.id === recipeToSave.id);

        if (!isAlreadySaved) {
          set(state => ({
            savedRecipes: [...state.savedRecipes, recipeToSave]
          }));
        }
      },
      removeSavedRecipe: (recipeId) => {
        set(state => ({
          savedRecipes: state.savedRecipes.filter(recipe => recipe.id !== recipeId)
        }));
      },
      isRecipeSaved: (recipeId) => {
        return get().savedRecipes.some(recipe => recipe.id === recipeId);
      }
    }),
    {
      name: 'recipe-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the savedRecipes
      partialize: (state) => ({ savedRecipes: state.savedRecipes }),
    }
  )
);