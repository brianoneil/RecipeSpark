import { z } from 'zod';
import { Recipe, RecipeSchema } from '@/types/recipe';
import { OpenRouterService } from './openrouter';
import { ImageService } from './image';
import { eventService, AIEvent } from './events';

const RequestSchema = z.object({
  ingredients: z.array(z.string()),
  servings: z.string(),
  cuisines: z.array(z.string()),
  maxTime: z.number(),
  hint: z.string(),
  mode: z.enum(['use-what-i-have', 'suggest']),
});

export class RecipeService {
  private openRouter: OpenRouterService;
  private imageService: ImageService;
  private recipeModel: string;

  constructor(
    openRouter: OpenRouterService,
    imageService: ImageService,
    recipeModel: string
  ) {
    this.openRouter = openRouter;
    this.imageService = imageService;
    this.recipeModel = recipeModel;

    // Log model configuration on initialization
    console.log('🔧 Recipe Service Configuration:', {
      recipeModel: this.recipeModel
    });
  }

  private buildSystemPrompt(request: z.infer<typeof RequestSchema>) {
    return `You are a professional chef and recipe creator. Create a recipe that matches these requirements and try to use existing recipes as a starting point:

${request.mode === 'use-what-i-have'
  ? `CRITICAL: You MUST create a recipe that uses ONLY the following ingredients. DO NOT add any other ingredients: ${request.ingredients.join(', ')}`
  : `Create a recipe that PRIMARILY uses these ingredients, but you can suggest additional ones: ${request.ingredients.join(', ')}`
}

Requirements:
- Serve ${request.servings} people
- Maximum preparation and cooking time: ${request.maxTime} minutes
${request.cuisines.length > 0 ? `- Cuisine style: ${request.cuisines.join(', ')}` : ''}
${request.hint ? `- Additional requirements: ${request.hint}` : ''}

${request.mode === 'use-what-i-have'
  ? 'IMPORTANT: The recipe MUST NOT include ANY ingredients that are not in the provided list. This is a strict requirement.'
  : 'You may suggest additional ingredients that complement the provided ones.'
}

The description of the recipe should be a short description of the finished meal not focused on the ingredients alone.

The response MUST be a valid JSON object with the following structure:

{
  "name": "Recipe Name",
  "description": "Brief description of the recipe",
  "recipeIngredient": ["ingredient 1", "ingredient 2", ...],
  "recipeInstructions": [
    {
      "@type": "HowToStep",
      "text": "Step 1 instructions",
      "step": 1
    },
    {
      "@type": "HowToStep",
      "text": "Step 2 instructions",
      "step": 2
    }
  ],
  "ingredients": {
    "used": [
      { "name": "ingredient name", "quantity": 1, "unit": "cup" }
    ],
    "missing": [],
    "suggested": []
  },
  "shoppingList": {
    "items": [
      {
        "name": "ingredient name",
        "requiredQuantity": {
          "amount": 1,
          "unit": "cup"
        },
        "purchaseQuantity": 1,
        "purchaseUnit": "cup"
      }
    ],
    "totalItems": 1
  },
  "recipeCuisine": "${request.cuisines.length > 0 ? request.cuisines[0] : 'International'}"
}

Ensure all required fields are present and properly formatted. Return ONLY the JSON object with no additional text.

IMPORTANT: All numeric fields must use actual numbers, not strings. For example:
- Use quantity: 1 (not "1")
- Use quantity: 0.5 (not "1/2")
- Use amount: 2.5 (not "2.5")

If you must use fractions, convert them to decimal numbers (e.g., 1/2 → 0.5, 1/4 → 0.25, etc.).

NEVER use null for unit fields. Always use an empty string "" instead of null when a unit is not applicable.`;
  }

  async generateRecipe(request: z.infer<typeof RequestSchema>): Promise<Recipe> {
    console.log('🚀 Starting recipe generation:', {
      mode: request.mode,
      ingredientCount: request.ingredients.length,
      cuisines: request.cuisines,
      model: this.recipeModel
    });

    // Validate request
    RequestSchema.parse(request);

    // Emit event for recipe prompt creation
    eventService.emit(AIEvent.RECIPE_PROMPT_START);
    const systemPrompt = this.buildSystemPrompt(request);
    eventService.emit(AIEvent.RECIPE_PROMPT_COMPLETE);

    // Emit event for recipe generation
    eventService.emit(AIEvent.RECIPE_GENERATION_START);
    console.log('📤 Making recipe request with model:', this.recipeModel);
    const response = await this.openRouter.chat(
      this.recipeModel,
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate a recipe based on the given requirements. Make sure the steps are detailed instructions and are atomic and easy to follow. ' }
      ]
    );
    eventService.emit(AIEvent.RECIPE_GENERATION_COMPLETE);

    if (!response.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from API');
    }

    const recipeContent = response.choices[0].message.content;
    console.log('📋 Raw recipe content:', recipeContent);

    // Improved JSON parsing with error handling
    let recipeData;
    try {
      // Try multiple approaches to extract valid JSON

      // First, try to extract JSON if it's wrapped in markdown code blocks
      const jsonMatch = recipeContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      let contentToParse = jsonMatch ? jsonMatch[1] : recipeContent;

      // Clean up the content - remove any non-JSON text before or after
      contentToParse = contentToParse.trim();

      // If content starts with { and ends with }, try to extract just that part
      // This handles cases where there might be explanatory text before or after the JSON
      const jsonObjectMatch = contentToParse.match(/\{[\s\S]*\}/);
      if (jsonObjectMatch) {
        contentToParse = jsonObjectMatch[0];
      }

      // Pre-process content to handle fractions before parsing
      const preprocessedContent = contentToParse
        // Escape forward slashes in fractions (like "quantity": 1/2 becomes "quantity": "1/2")
        .replace(/:\s*(\d+)\/(\d+)\s*([,}])/g, (match, numerator, denominator, end) => {
          return `: "${numerator}/${denominator}"${end}`;
        });

      // Try to parse the JSON
      try {
        recipeData = JSON.parse(preprocessedContent);
        console.log('📋 Successfully parsed recipe JSON');
      } catch (initialParseError) {
        // If that fails, try a more aggressive approach
        console.warn('⚠️ Initial JSON parsing failed, trying fallback methods');
        console.log('📋 Problematic content:', preprocessedContent.substring(0, 200) + '...');

        // Try to fix common JSON syntax errors
        const fixedContent = preprocessedContent
          // Fix unquoted property names
          .replace(/([{,])\s*(\w+)\s*:/g, '$1"$2":')
          // Fix single quotes used instead of double quotes
          .replace(/'/g, '"')
          // Fix trailing commas in arrays and objects
          .replace(/,\s*([\]}])/g, '$1')
          // Fix any remaining fractions by quoting them
          .replace(/:\s*(\d+)\/(\d+)\s*([,}])/g, (match, numerator, denominator, end) => {
            return `: "${numerator}/${denominator}"${end}`;
          });

        try {
          recipeData = JSON.parse(fixedContent);
          console.log('📋 Successfully parsed recipe JSON with fixes');
        } catch (fallbackError) {
          // Try one more approach - manual extraction
          console.warn('⚠️ Standard parsing failed, trying manual extraction');

          try {
            // Extract what looks like valid JSON by finding matching braces
            let braceCount = 0;
            let startIndex = contentToParse.indexOf('{');
            let endIndex = -1;

            for (let i = startIndex; i < contentToParse.length; i++) {
              if (contentToParse[i] === '{') braceCount++;
              if (contentToParse[i] === '}') braceCount--;

              if (braceCount === 0 && startIndex !== -1) {
                endIndex = i + 1;
                break;
              }
            }

            if (startIndex !== -1 && endIndex !== -1) {
              const extractedJson = contentToParse.substring(startIndex, endIndex);
              // Replace fractions again in the extracted JSON
              const fixedExtractedJson = extractedJson.replace(/:\s*(\d+)\/(\d+)\s*([,}])/g, (match, numerator, denominator, end) => {
                const decimal = parseFloat(numerator) / parseFloat(denominator);
                return `: ${decimal}${end}`;
              });

              // Create a minimal valid recipe object as fallback
              recipeData = {
                name: "Recipe",
                recipeIngredient: [],
                recipeInstructions: [],
                ingredients: { used: [] },
                shoppingList: { items: [], totalItems: 0 }
              };

              // Try to parse the extracted JSON
              try {
                const extractedData = JSON.parse(fixedExtractedJson);
                // Merge with our minimal valid object
                recipeData = { ...recipeData, ...extractedData };
                console.log('📋 Successfully parsed recipe JSON with manual extraction');
              } catch (extractionError) {
                console.warn('⚠️ Manual extraction failed, using minimal valid recipe');
              }
            } else {
              // If we can't extract JSON, use a minimal valid recipe object
              recipeData = {
                name: "Recipe",
                recipeIngredient: [],
                recipeInstructions: [],
                ingredients: { used: [] },
                shoppingList: { items: [], totalItems: 0 }
              };
              console.warn('⚠️ Using minimal valid recipe as fallback');
            }
          } catch (extractionError) {
            // If all parsing attempts fail, throw the original error
            console.error('❌ All JSON parsing attempts failed');
            throw initialParseError;
          }
        }
      }
    } catch (parseError) {
      console.error('❌ JSON parsing error:', parseError);
      console.error('❌ Failed content:', recipeContent);
      throw new Error(`Failed to parse recipe JSON: ${parseError.message}`);
    }

    // Add required schema fields and ensure all required fields have default values
    const enrichedRecipeData = {
      // Default values for required fields
      name: 'Recipe',
      recipeIngredient: [],
      recipeInstructions: [],
      ingredients: {
        used: [],
        missing: [],
        suggested: []
      },
      shoppingList: {
        items: [],
        totalItems: 0
      },

      // Spread the actual data from the API response
      ...recipeData,

      // Always override these fields
      '@context': 'https://schema.org',
      '@type': 'Recipe',
      recipeYield: request.servings,
      prepTime: `PT${Math.floor(request.maxTime * 0.4)}M`,
      cookTime: `PT${Math.floor(request.maxTime * 0.6)}M`,
      totalTime: `PT${request.maxTime}M`,
    };

    // If we have ingredients but no recipeIngredient, create it
    if (recipeData.ingredients?.used?.length > 0 && !enrichedRecipeData.recipeIngredient?.length) {
      enrichedRecipeData.recipeIngredient = recipeData.ingredients.used.map(ing =>
        `${ing.quantity || ''} ${ing.unit || ''} ${ing.name}`.trim()
      );
    }

    // If we have recipeIngredient but no ingredients, create it
    if (enrichedRecipeData.recipeIngredient?.length > 0 && !recipeData.ingredients?.used?.length) {
      // Simple parsing of ingredients from strings
      const parsedIngredients = enrichedRecipeData.recipeIngredient.map(ing => {
        const parts = ing.split(' ');
        const quantity = parseFloat(parts[0]) || 1;
        const unit = isNaN(parseFloat(parts[0])) ? '' : (parts[1] || '');
        const name = isNaN(parseFloat(parts[0]))
          ? ing
          : parts.slice(unit ? 2 : 1).join(' ');

        return { name, quantity, unit };
      });

      enrichedRecipeData.ingredients = {
        used: parsedIngredients,
        missing: [],
        suggested: []
      };
    }

    // Convert any string quantities to numbers and ensure units are strings
    if (enrichedRecipeData.ingredients?.used) {
      enrichedRecipeData.ingredients.used = enrichedRecipeData.ingredients.used.map(ing => {
        // If quantity is a string, convert it to a number
        if (typeof ing.quantity === 'string') {
          if (ing.quantity.includes('/')) {
            // Handle fractions
            const [numerator, denominator] = ing.quantity.split('/');
            ing.quantity = parseFloat(numerator) / parseFloat(denominator);
          } else {
            // Handle regular numbers
            ing.quantity = parseFloat(ing.quantity) || 0;
          }
        }

        // Ensure unit is a string, not null
        if (ing.unit === null || ing.unit === undefined) {
          ing.unit = '';
        }

        return ing;
      });
    }

    // Also fix suggested ingredients
    if (enrichedRecipeData.ingredients?.suggested) {
      enrichedRecipeData.ingredients.suggested = enrichedRecipeData.ingredients.suggested.map(ing => {
        // If quantity is a string, convert it to a number
        if (typeof ing.quantity === 'string') {
          if (ing.quantity.includes('/')) {
            // Handle fractions
            const [numerator, denominator] = ing.quantity.split('/');
            ing.quantity = parseFloat(numerator) / parseFloat(denominator);
          } else {
            // Handle regular numbers
            ing.quantity = parseFloat(ing.quantity) || 0;
          }
        }

        // Ensure unit is a string, not null
        if (ing.unit === null || ing.unit === undefined) {
          ing.unit = '';
        }

        return ing;
      });
    }

    // Fix shopping list items if they're strings instead of objects
    if (enrichedRecipeData.shoppingList?.items) {
      if (Array.isArray(enrichedRecipeData.shoppingList.items)) {
        // Check if any items are strings and convert them to objects
        const fixedItems = enrichedRecipeData.shoppingList.items.map(item => {
          if (typeof item === 'string') {
            // Find matching ingredient if possible
            const matchingIngredient = enrichedRecipeData.ingredients?.used?.find(ing =>
              ing.name.toLowerCase().includes(item.toLowerCase()) ||
              item.toLowerCase().includes(ing.name.toLowerCase())
            );

            // Create a proper shopping list item object
            return {
              name: item,
              requiredQuantity: {
                amount: matchingIngredient?.quantity || 1,
                unit: matchingIngredient?.unit || 'item'
              },
              purchaseQuantity: matchingIngredient?.quantity || 1,
              purchaseUnit: matchingIngredient?.unit || 'item'
            };
          } else if (item.requiredQuantity || typeof item.purchaseQuantity === 'string' || item.purchaseUnit === null) {
            // Handle any string quantities in shopping list items
            if (item.requiredQuantity && typeof item.requiredQuantity.amount === 'string') {
              if (item.requiredQuantity.amount.includes('/')) {
                // Handle fractions
                const [numerator, denominator] = item.requiredQuantity.amount.split('/');
                item.requiredQuantity.amount = parseFloat(numerator) / parseFloat(denominator);
              } else {
                // Handle regular numbers
                item.requiredQuantity.amount = parseFloat(item.requiredQuantity.amount) || 0;
              }
            }

            // Ensure requiredQuantity.unit is a string
            if (item.requiredQuantity && (item.requiredQuantity.unit === null || item.requiredQuantity.unit === undefined)) {
              item.requiredQuantity.unit = '';
            }

            if (typeof item.purchaseQuantity === 'string') {
              if (item.purchaseQuantity.includes('/')) {
                // Handle fractions
                const [pNum, pDenom] = item.purchaseQuantity.split('/');
                item.purchaseQuantity = parseFloat(pNum) / parseFloat(pDenom);
              } else {
                // Handle regular numbers
                item.purchaseQuantity = parseFloat(item.purchaseQuantity) || 0;
              }
            }

            // Ensure purchaseUnit is a string
            if (item.purchaseUnit === null || item.purchaseUnit === undefined) {
              item.purchaseUnit = '';
            }

            return item;
          }
          return item;
        });

        enrichedRecipeData.shoppingList.items = fixedItems;
        enrichedRecipeData.shoppingList.totalItems = fixedItems.length;
      }
    } else {
      // Create shopping list from ingredients if missing
      if (enrichedRecipeData.ingredients?.used?.length) {
        const shoppingItems = enrichedRecipeData.ingredients.used.map(ing => {
          // Ensure unit is a string
          const unit = ing.unit === null || ing.unit === undefined ? '' : ing.unit;

          return {
            name: ing.name,
            requiredQuantity: {
              amount: ing.quantity || 1,
              unit: unit || 'item'
            },
            purchaseQuantity: ing.quantity || 1,
            purchaseUnit: unit || 'item'
          };
        });

        enrichedRecipeData.shoppingList = {
          items: shoppingItems,
          totalItems: shoppingItems.length
        };
      }
    }

    console.log('📋 Enriched recipe data:', {
      name: enrichedRecipeData.name,
      ingredients: enrichedRecipeData.recipeIngredient?.length || 0,
      instructions: enrichedRecipeData.recipeInstructions?.length || 0,
      hasIngredientObjects: !!enrichedRecipeData.ingredients?.used?.length,
      hasShoppingList: !!enrichedRecipeData.shoppingList?.items?.length
    });

    // Validate recipe data
    let recipe;
    try {
      recipe = RecipeSchema.parse(enrichedRecipeData);
      console.log('✅ Recipe schema validation passed');
    } catch (validationError) {
      console.error('❌ Recipe validation error:', validationError);

      // Create a more helpful error message
      let errorMessage = 'Recipe validation failed:';

      if (validationError.errors) {
        // Format Zod validation errors
        const errors = validationError.errors.map(err =>
          `Field '${err.path.join('.')}' ${err.message} (received ${err.received})`
        );
        errorMessage += '\n' + errors.join('\n');

        // Log detailed error information
        console.error('❌ Validation errors:', JSON.stringify(validationError.errors, null, 2));
      } else {
        errorMessage += ' ' + validationError.message;
      }

      throw new Error(errorMessage);
    }

    // Generate image for the recipe
    try {
      console.log('📸 Generating image for recipe...');
      const imageUrl = await this.imageService.generateRecipeImage(recipe);
      if (imageUrl) {
        recipe.image = [imageUrl];
      }
    } catch (error) {
      console.error('❌ Failed to generate recipe image:', error);
    }

    return recipe;
  }


}