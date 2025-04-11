import { create } from 'zustand';
import type { Recipe } from '@/types/recipe';

interface RecipeStore {
  currentRecipe: Recipe | null;
  setCurrentRecipe: (recipe: Recipe) => void;
  clearCurrentRecipe: () => void;
}

export const useRecipeStore = create<RecipeStore>((set) => ({
  currentRecipe: null,
  setCurrentRecipe: (recipe) => set({ currentRecipe: recipe }),
  clearCurrentRecipe: () => set({ currentRecipe: null }),
}));