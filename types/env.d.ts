declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_OPENROUTER_API_KEY: string;
      EXPO_PUBLIC_HUGGINGFACE_API_KEY?: string;
      EXPO_PUBLIC_APP_URL: string;
      EXPO_PUBLIC_RECIPE_MODEL: string;
      EXPO_PUBLIC_IMAGE_MODEL: string;
      EXPO_PUBLIC_INGREDIENTS_MODEL: string;
    }
  }
}

export {};