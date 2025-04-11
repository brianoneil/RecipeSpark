import { z } from 'zod';

// Define the ingredient schema
export const IngredientSchema = z.object({
  name: z.string(),
  quantity: z.number(),
  unit: z.string(),
  note: z.string().optional(),
});

// Define the shopping list item schema
export const ShoppingListItemSchema = z.object({
  name: z.string(),
  requiredQuantity: z.object({
    amount: z.number(),
    unit: z.string(),
  }),
  purchaseQuantity: z.number(),
  purchaseUnit: z.string(),
  purchaseNote: z.string().optional(),
});

// Define the recipe instruction schema
export const RecipeInstructionSchema = z.object({
  '@type': z.literal('HowToStep'),
  text: z.string(),
  name: z.string().optional(),
  url: z.string().url().optional(),
  durationMinutes: z.number().optional(),
  timer: z.boolean().optional(),
  step: z.number().optional(),
});

// Define the nutrition schema
export const NutritionSchema = z.object({
  '@type': z.literal('NutritionInformation'),
  calories: z.string().optional(),
  proteinContent: z.string().optional(),
  carbohydrateContent: z.string().optional(),
  fatContent: z.string().optional(),
  fiberContent: z.string().optional(),
});

// Define the complete recipe schema
export const RecipeSchema = z.object({
  '@context': z.literal('https://schema.org'),
  '@type': z.literal('Recipe'),
  name: z.string(),
  description: z.string().optional(),
  image: z.array(z.string().url()).optional(),
  recipeCuisine: z.string().optional(),
  recipeCategory: z.string().optional(),
  keywords: z.string().optional(),
  recipeYield: z.string(),
  prepTime: z.string(),
  cookTime: z.string(),
  totalTime: z.string(),
  recipeIngredient: z.array(z.string()),
  ingredients: z.object({
    used: z.array(IngredientSchema),
    missing: z.array(IngredientSchema).optional(),
    suggested: z.array(IngredientSchema).optional(),
  }),
  shoppingList: z.object({
    items: z.array(ShoppingListItemSchema),
    totalItems: z.number(),
  }),
  recipeInstructions: z.array(RecipeInstructionSchema),
  nutrition: NutritionSchema.optional(),
  userFeedback: z.object({
    liked: z.boolean().optional(),
    notes: z.string().optional(),
  }).optional(),
  diet: z.array(z.string()).optional(),
});

export type Recipe = z.infer<typeof RecipeSchema>;
export type Ingredient = z.infer<typeof IngredientSchema>;
export type ShoppingListItem = z.infer<typeof ShoppingListItemSchema>;
export type RecipeInstruction = z.infer<typeof RecipeInstructionSchema>;
export type Nutrition = z.infer<typeof NutritionSchema>;