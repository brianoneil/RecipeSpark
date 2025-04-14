import { OpenRouterService } from './openrouter';

export interface ParsedIngredient {
  id: string;
  name: string;
  quantity?: string;
  unit?: string;
}

export class IngredientService {
  private openRouter: OpenRouterService;
  private model: string;

  constructor(openRouter: OpenRouterService, model: string) {
    this.openRouter = openRouter;
    this.model = model;
    
    // Debug logging
    console.log('🔧 IngredientService initialized:', {
      model: this.model,
      modelType: typeof this.model,
      modelLength: this.model?.length || 0
    });
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private splitIngredients(text: string): string[] {
    // Split by commas, but keep quantities together (e.g., "1,000" shouldn't be split)
    return text
      .split(/,(?![0-9])/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }

  async parseIngredient(text: string): Promise<ParsedIngredient[]> {
    console.log('🔍 Starting ingredient parsing:', { text });
    
    // Split the input text into individual ingredients
    const ingredients = this.splitIngredients(text);
    console.log('📝 Split ingredients:', ingredients);

    if (ingredients.length === 1 && !ingredients[0].includes(' ')) {
      console.log('📝 Simple single ingredient, no parsing needed:', { text });
      return [{
        id: this.generateId(),
        name: ingredients[0].trim()
      }];
    }

    console.log('🤖 Using AI to parse complex ingredients');
    console.log('📋 Using model:', this.model);
    
    try {
      const response = await this.openRouter.chat(
        this.model,
        [
          {
            role: 'system',
            content: `You are a helpful assistant that parses ingredient text into structured data. 
            Given one or more ingredient descriptions, extract the name, quantity, and unit if present for each ingredient.
            Respond with ONLY a JSON array of objects in this format:
            [
              {
                "name": "ingredient name",
                "quantity": "numeric amount or null",
                "unit": "measurement unit or null"
              }
            ]`
          },
          {
            role: 'user',
            content: ingredients.join('\n')
          }
        ],
        0.2
      );

      if (!response.choices?.[0]?.message?.content) {
        throw new Error('Invalid response from API');
      }

      const parsed = JSON.parse(response.choices[0].message.content);
      
      if (!Array.isArray(parsed)) {
        throw new Error('Invalid response format: expected array');
      }

      const results = parsed.map(item => ({
        id: this.generateId(),
        name: item.name,
        quantity: item.quantity,
        unit: item.unit
      }));

      console.log('✨ Final parsed ingredients:', results);
      return results;
    } catch (error) {
      console.error('❌ Ingredient parsing error:', error);
      
      // Fallback to simple parsing
      console.log('⚠️ Falling back to simple ingredient parsing');
      return ingredients.map(ing => ({
        id: this.generateId(),
        name: ing.trim()
      }));
    }
  }
}