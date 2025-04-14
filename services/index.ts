import { OpenRouterService } from './openrouter';
import { RecipeService } from './recipe';
import { IngredientService } from './ingredient';
import { ImageService } from './image';

// Log environment variables (without sensitive data)
console.log('🔧 Environment Configuration:', {
  hasOpenRouterApiKey: !!process.env.EXPO_PUBLIC_OPENROUTER_API_KEY,
  openRouterKeyLength: process.env.EXPO_PUBLIC_OPENROUTER_API_KEY?.length || 0,
  openRouterKeyFirstChars: process.env.EXPO_PUBLIC_OPENROUTER_API_KEY ? `${process.env.EXPO_PUBLIC_OPENROUTER_API_KEY.substring(0, 4)}...` : 'none',
  hasHuggingFaceApiKey: !!process.env.EXPO_PUBLIC_HUGGINGFACE_API_KEY,
  appUrl: process.env.EXPO_PUBLIC_APP_URL,
  recipeModel: process.env.EXPO_PUBLIC_RECIPE_MODEL,
  promptModel: process.env.EXPO_PUBLIC_PROMPT_MODEL,
  imageModel: process.env.EXPO_PUBLIC_IMAGE_MODEL,
  ingredientsModel: process.env.EXPO_PUBLIC_INGREDIENTS_MODEL,
  // Debug raw values
  rawIngredientsModel: JSON.stringify(process.env.EXPO_PUBLIC_INGREDIENTS_MODEL),
  rawRecipeModel: JSON.stringify(process.env.EXPO_PUBLIC_RECIPE_MODEL)
});

// Create singleton instances
const openRouter = new OpenRouterService({
  apiKey: process.env.EXPO_PUBLIC_OPENROUTER_API_KEY!,
  appUrl: process.env.EXPO_PUBLIC_APP_URL!,
});

export const imageService = new ImageService(openRouter, {
  recipeModel: process.env.EXPO_PUBLIC_RECIPE_MODEL!,
  promptModel: process.env.EXPO_PUBLIC_PROMPT_MODEL || process.env.EXPO_PUBLIC_RECIPE_MODEL!,
  imageModel: process.env.EXPO_PUBLIC_IMAGE_MODEL!,
  huggingFaceApiKey: process.env.EXPO_PUBLIC_HUGGINGFACE_API_KEY,
});

export const recipeService = new RecipeService(
  openRouter,
  imageService,
  process.env.EXPO_PUBLIC_RECIPE_MODEL!
);

export const ingredientService = new IngredientService(
  openRouter,
  process.env.EXPO_PUBLIC_INGREDIENTS_MODEL!
);