# RecipeSpark

An AI-powered recipe generation app that creates personalized recipes based on your ingredients and preferences.

## Features

- Generate custom recipes based on ingredients you have
- AI-powered image generation for recipes
- Save and organize your favorite recipes
- Intuitive and beautiful user interface

## Getting Started

### Prerequisites

- Node.js (v18 or newer)
- npm or yarn
- Expo CLI
- EAS CLI
- iOS development environment (for iOS builds)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example` with your API keys
4. Start the development server:
   ```
   npm run dev
   ```

## Building for iOS App Store

### Configuration

Before building, make sure to update the following in `app.json`:

1. Update `bundleIdentifier` with your actual bundle ID
2. Update `buildNumber` as needed
3. Set your company name in the bundle ID

In `eas.json`:
1. Update `appleId` with your Apple ID
2. Update `ascAppId` with your App Store Connect App ID
3. Update `appleTeamId` with your Apple Developer Team ID

### Building

To build for iOS:

```
npm run build:ios
```

To build for iOS simulator (for testing):

```
npm run build:ios:simulator
```

### Submitting to App Store

After a successful build:

```
npm run submit:ios
```

## Environment Variables

The app requires the following environment variables:

- `EXPO_PUBLIC_OPENROUTER_API_KEY`: Your OpenRouter API key
- `EXPO_PUBLIC_HUGGINGFACE_API_KEY`: Your Hugging Face API key
- `EXPO_PUBLIC_APP_URL`: Your app's URL (use https://recipespark.app for production)
- `EXPO_PUBLIC_RECIPE_MODEL`: The AI model for recipe generation (e.g., gpt-4)
- `EXPO_PUBLIC_PROMPT_MODEL`: The AI model for prompt creation (e.g., gpt-3.5-turbo)
- `EXPO_PUBLIC_INGREDIENTS_MODEL`: The AI model for ingredient processing (e.g., gpt-3.5-turbo)
- `EXPO_PUBLIC_IMAGE_MODEL`: The AI model for image generation (e.g., huggingface/black-forest-labs/FLUX.1-schnell)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
