import { OpenRouterService } from './openrouter';
import { eventService, AIEvent } from './events';

export interface ImageGenerationConfig {
  recipeModel: string;
  promptModel: string;
  imageModel: string;
  huggingFaceApiKey?: string;
}

export class ImageService {
  private openRouter: OpenRouterService;
  private config: ImageGenerationConfig;

  constructor(openRouter: OpenRouterService, config: ImageGenerationConfig) {
    this.openRouter = openRouter;
    this.config = config;

    console.log('🔧 Image Service Configuration:', {
      recipeModel: this.config.recipeModel,
      promptModel: this.config.promptModel,
      imageModel: this.config.imageModel,
      hasHuggingFaceApiKey: !!this.config.huggingFaceApiKey
    });
  }

  /**
   * Generate an image for a recipe
   * @param recipe The recipe to generate an image for
   * @returns A URL or data URL of the generated image
   */
  async generateRecipeImage(recipe: any): Promise<string> {
    console.log('📸 Starting recipe image generation for:', recipe.name);
    console.log('📸 Using recipe model:', this.config.recipeModel);
    console.log('📸 Using image model:', this.config.imageModel);

    // Check if we're using a FLUX model
    const isFluxModel = this.config.imageModel.toLowerCase().includes('flux');

    try {
      // First, generate a detailed image prompt using the recipe model
      console.log('📸 Generating detailed image prompt...');
      eventService.emit(AIEvent.IMAGE_PROMPT_START);
      const imagePrompt = await this.generateImagePrompt(recipe);
      eventService.emit(AIEvent.IMAGE_PROMPT_COMPLETE);

      // Then, use that prompt to generate the image with the image model
      console.log('📸 Generating image with detailed prompt...');
      eventService.emit(AIEvent.IMAGE_GENERATION_START);
      // The IMAGE_GENERATION_COMPLETE event will be emitted in the generateHuggingFaceImage method
      const imageUrl = await this.generateImage(imagePrompt);
      return imageUrl;
    } catch (promptError) {
      console.error('❌ Error in image prompt generation:', promptError);

      // Fallback to a simple prompt if the detailed one fails
      console.log('📸 Using fallback prompt for image generation...');
      eventService.emit(AIEvent.IMAGE_PROMPT_COMPLETE, { usedFallback: true });

      let fallbackPrompt: string;

      if (isFluxModel) {
        // Optimized prompt for FLUX models
        fallbackPrompt = `${recipe.name} with ${recipe.recipeIngredient.slice(0, 3).join(', ')}, ` +
          `${recipe.recipeCuisine || 'delicious'} cuisine, professional food photography, ` +
          `perfect lighting, high quality, styled plating, appetizing, vibrant colors`;
      } else {
        // Standard prompt for other models
        fallbackPrompt = `Depict ${recipe.name}, a ${recipe.recipeCuisine || 'delicious'} dish featuring ${recipe.recipeIngredient.slice(0, 3).join(', ')}.

Style: Professional food photography, overhead shot, natural lighting, styled on a rustic wooden table with complementary props and garnishes. The image should be appetizing and Instagram-worthy.`;
      }

      try {
        console.log('📸 Generating image with fallback prompt...');
        eventService.emit(AIEvent.IMAGE_GENERATION_START, { usedFallback: true });
        // The IMAGE_GENERATION_COMPLETE event will be emitted in the generateHuggingFaceImage method
        const imageUrl = await this.generateImage(fallbackPrompt);
        return imageUrl;
      } catch (fallbackError) {
        console.error('❌ Error in fallback image generation:', fallbackError);

        // If both attempts fail, try one more time with an even simpler prompt
        console.log('📸 Using minimal fallback prompt...');

        const minimalPrompt = isFluxModel
          ? `${recipe.name}, food photography, high quality`
          : `A delicious ${recipe.name} dish, food photography.`;

        try {
          console.log('📸 Final attempt at image generation...');
          eventService.emit(AIEvent.IMAGE_GENERATION_START, { usedMinimalFallback: true });
          // The IMAGE_GENERATION_COMPLETE event will be emitted in the generateHuggingFaceImage method
          const imageUrl = await this.generateImage(minimalPrompt);
          return imageUrl;
        } catch (finalError) {
          console.error('❌ All image generation attempts failed:', finalError);
          eventService.emit(AIEvent.ERROR, { message: 'Failed to generate recipe image after multiple attempts' });
          throw new Error('Failed to generate recipe image after multiple attempts');
        }
      }
    }
  }

  /**
   * Generate an image prompt for a recipe
   * @param recipe The recipe to generate a prompt for
   * @returns A detailed prompt for image generation
   */
  private async generateImagePrompt(recipe: any): Promise<string> {
    console.log('📤 Preparing image prompt generation request:', { model: this.config.promptModel });

    // Check if we're using a FLUX model for image generation
    const isFluxModel = this.config.imageModel.toLowerCase().includes('flux');

    const messages = [
      {
        role: 'system',
        content: `You are an expert at creating detailed image prompts for AI image generators.
        Given a recipe, create a vivid, detailed prompt that will result in a beautiful, appetizing
        image of the dish. Focus on the visual aspects, plating, colors, and setting.
        ${isFluxModel ? 'The prompt will be used with the FLUX.1 model which is specialized for food photography.' : ''}`
      },
      {
        role: 'user',
        content: `Create an image prompt for this recipe: ${recipe.name}\n\n` +
          `Cuisine: ${recipe.recipeCuisine || 'International'}\n` +
          `Main ingredients: ${recipe.recipeIngredient.slice(0, 5).join(', ')}\n\n` +
          `${isFluxModel ?
            'Create a prompt for the FLUX.1 model which is specialized for food photography. ' +
            'Focus on describing the prepared meal, plating, and styling. Keep the prompt concise (under 75 words). Make sure the prompt states to not include ingredients that are not in the recipe.' +
            'Do not include any negative prompts or technical parameters.' :
            'The prompt should describe how the finished dish looks, the plating style, background, lighting, etc. ' +
            'Make it detailed enough for an AI image generator to create a beautiful food photograph.' + 
            'Make sure the meal is centered toward the top of the shot and not a closeup'
          }`
      }
    ];

    const startTime = performance.now();
    // Use the promptModel instead of recipeModel for generating image prompts
    const response = await this.openRouter.chat(this.config.promptModel, messages, 0.7);
    const endTime = performance.now();

    console.log(`⏱️ Image prompt generation took ${Math.round(endTime - startTime)}ms`);

    if (!response.choices?.[0]?.message?.content) {
      throw new Error('Failed to generate image prompt');
    }

    let prompt = response.choices[0].message.content.trim();

    // For FLUX models, we want to ensure the prompt is optimized
    if (isFluxModel) {
      // Remove any text that looks like it might be instructions or explanations
      prompt = prompt.replace(/^(Here's|This prompt|I've created|The prompt|For the FLUX).+?:\s*/i, '');

      // Remove quotes if the entire prompt is wrapped in them
      prompt = prompt.replace(/^"(.+)"$/s, '$1');

      // Add some quality boosters for FLUX if they're not already present
      if (!prompt.toLowerCase().includes('professional')) {
        prompt += ', professional food photography';
      }

      if (!prompt.toLowerCase().includes('lighting')) {
        prompt += ', perfect lighting';
      }

      if (!prompt.toLowerCase().includes('high quality') && !prompt.toLowerCase().includes('high-quality')) {
        prompt += ', high quality';
      }
    }

    console.log('📸 Generated image prompt:', prompt);
    return prompt;
  }

  /**
   * Generate an image from a prompt
   * @param prompt The prompt to generate an image from
   * @returns A URL or data URL of the generated image
   */
  private async generateImage(prompt: string): Promise<string> {
    console.log('📤 Preparing image generation request:', { model: this.config.imageModel });
    console.log('📸 Image prompt length:', prompt.length);
    console.log('📸 Image prompt preview:', prompt.substring(0, 100) + '...');

    // Check if we have a Hugging Face API key
    if (this.config.huggingFaceApiKey) {
      // Check if the model is a Hugging Face model (either with or without the prefix)
      const isHuggingFaceModel =
        this.config.imageModel.includes('huggingface/') ||
        this.config.imageModel.includes('/') || // Models with a slash are likely Hugging Face models
        this.config.imageModel.includes('FLUX') || // FLUX models are Hugging Face models
        this.config.imageModel.includes('flux'); // Case insensitive check

      if (isHuggingFaceModel) {
        console.log('📸 Using Hugging Face for image generation');
        // Remove the 'huggingface/' prefix if it exists
        const modelName = this.config.imageModel.replace('huggingface/', '');
        return this.generateHuggingFaceImage(modelName, prompt);
      }
    }

    // Otherwise use OpenRouter
    console.log('📸 Using OpenRouter for image generation');
    return this.openRouter.generateImage(this.config.imageModel, prompt);
  }

  /**
   * Generate an image using the Hugging Face API
   * @param model The Hugging Face model to use
   * @param prompt The prompt to generate an image from
   * @returns A data URL of the generated image
   */
  private async generateHuggingFaceImage(model: string, prompt: string): Promise<string> {
    console.log('📤 Preparing Hugging Face image generation:', { model });
    console.log('📸 Hugging Face API Key length:', this.config.huggingFaceApiKey?.length || 0);
    console.log('📸 Hugging Face API Key first 5 chars:', this.config.huggingFaceApiKey?.substring(0, 5) || 'none');

    const startTime = performance.now();

    try {
      // Prepare the request URL and headers
      const apiUrl = `https://api-inference.huggingface.co/models/${model}`;
      console.log('📸 Hugging Face API URL:', apiUrl);

      const headers = {
        'Authorization': `Bearer ${this.config.huggingFaceApiKey}`,
        'Content-Type': 'application/json'
      };
      console.log('📸 Hugging Face headers set:', Object.keys(headers).join(', '));

      // Prepare the payload based on the model
      let payload: any = { inputs: prompt };

      // Special handling for FLUX models which need specific parameters
      if (model.includes('FLUX') || model.includes('flux')) {
        console.log('📸 Using optimized parameters for FLUX model');

        // Check if it's specifically the FLUX.1-schnell model
        if (model.includes('FLUX.1-schnell')) {
          console.log('📸 Using parameters specific to FLUX.1-schnell model');
          // This model doesn't support negative_prompt parameter
          payload = {
            inputs: prompt,
            parameters: {
              guidance_scale: 7.5,
              num_inference_steps: 30,
              width: 512,
              height: 512
              // No negative_prompt for this model
            }
          };
        } else {
          // For other FLUX models that might support negative_prompt
          payload = {
            inputs: prompt,
            parameters: {
              guidance_scale: 7.5,
              num_inference_steps: 30,
              width: 512,
              height: 512,
              negative_prompt: "low quality, blurry, distorted, deformed, ugly, bad anatomy, watermark, signature, text, logo"
            }
          };
        }
      }

      console.log('📸 Request payload:', JSON.stringify(payload, null, 2));

      // Make the request
      console.log('📸 Sending request to Hugging Face API...');
      try {
        // First attempt with the configured parameters
        let response = await fetch(apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });

        console.log('📸 Hugging Face response status:', response.status);
        console.log('📸 Hugging Face response headers:', Object.fromEntries(response.headers.entries()));

        // If we get a 400 error and it's the FLUX.1-schnell model, try with even simpler parameters
        if (response.status === 400 && model.includes('FLUX.1-schnell')) {
          const errorText = await response.text();
          console.warn('⚠️ Hugging Face API returned 400, trying with simpler parameters:', errorText);

          // Try with the simplest possible payload - just the prompt
          console.log('📸 Retrying with minimal parameters');
          const simplePayload = { inputs: prompt };

          response = await fetch(apiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(simplePayload)
          });

          console.log('📸 Second attempt response status:', response.status);
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Hugging Face API error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          });

          // Check for specific error types
          if (response.status === 401 || response.status === 403) {
            throw new Error('Authentication failed with Hugging Face API. Please check your API key.');
          } else if (response.status === 404) {
            throw new Error(`Model '${model}' not found on Hugging Face.`);
          } else if (response.status === 503) {
            throw new Error('Hugging Face service is currently unavailable. Please try again later.');
          } else {
            throw new Error(`Hugging Face API request failed: ${response.statusText || errorText}`);
          }
        }

        // The response is a binary blob (the image)
        console.log('📸 Getting image blob from response...');
        const blob = await response.blob();
        console.log('📸 Image blob size:', Math.round(blob.size / 1024), 'KB');

        // Convert blob to base64 data URL
        console.log('📸 Converting blob to data URL...');
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            console.log('📸 Data URL generated, length:', result?.length || 0);

            // Make sure we emit the event after the data URL is generated
            console.log('📸 Emitting IMAGE_GENERATION_COMPLETE event');
            eventService.emit(AIEvent.IMAGE_GENERATION_COMPLETE);

            resolve(result);
          };
          reader.onerror = (error) => {
            console.error('❌ Error reading blob:', error);
            reject(error);
          };
          reader.readAsDataURL(blob);
        });
      } catch (fetchError: any) {
        console.error('❌ Fetch error during Hugging Face API call:', fetchError);
        throw new Error(`Network error during Hugging Face API call: ${fetchError.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Hugging Face image generation error:', error);
      throw error;
    } finally {
      const endTime = performance.now();
      console.log(`⏱️ Hugging Face image generation took ${Math.round(endTime - startTime)}ms`);
    }
  }
}
