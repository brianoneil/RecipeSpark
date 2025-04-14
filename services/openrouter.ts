import { z } from 'zod';

const API_URL = 'https://openrouter.ai/api/v1';

interface OpenRouterConfig {
  apiKey: string;
  appUrl: string;
}

export class OpenRouterService {
  private config: OpenRouterConfig;

  constructor(config: OpenRouterConfig) {
    this.config = config;

    // Debug environment configuration
    console.log('🔍 OpenRouter Service Debug:', {
      hasApiKey: !!this.config.apiKey,
      apiKeyLength: this.config.apiKey?.length || 0,
      appUrl: this.config.appUrl,
      apiKeyFirstChars: this.config.apiKey ? `${this.config.apiKey.substring(0, 4)}...` : 'none'
    });

    // Log configuration on initialization (without sensitive data)
    console.log('🔧 OpenRouter Service Configuration:', {
      appUrl: this.config.appUrl,
      hasApiKey: !!this.config.apiKey
    });
  }

  private async makeRequest(endpoint: string, body: any) {
    console.log('🌐 Making API request to OpenRouter:', {
      url: `${API_URL}${endpoint}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'HTTP-Referer': this.config.appUrl,
        // Not logging Authorization header for security
      }
    });

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'HTTP-Referer': this.config.appUrl,
        },
        body: JSON.stringify(body),
      });

      console.log('🌐 OpenRouter Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OpenRouter API error details:', {
          endpoint,
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          headers: Object.fromEntries(response.headers.entries())
        });
        throw new Error(`API request failed: ${response.statusText} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log('✅ OpenRouter Response data:', {
        endpoint,
        status: response.status,
        hasChoices: !!responseData.choices,
        hasData: !!responseData.data
      });

      return responseData;
    } catch (error: any) {
      console.error('❌ OpenRouter API call failed:', {
        endpoint,
        error: error?.message || 'Unknown error',
        stack: error?.stack || 'No stack trace available'
      });
      throw error;
    }
  }

  async chat(model: string, messages: any[], temperature = 0.7) {
    console.log('📤 Preparing chat request:', {
      model,
      messageCount: messages.length,
      temperature
    });

    const startTime = performance.now();
    const data = await this.makeRequest('/chat/completions', {
      model,
      messages,
      temperature,
    });
    const endTime = performance.now();

    console.log(`⏱️ Chat request took ${Math.round(endTime - startTime)}ms`);
    console.log('📥 Chat response:', {
      model: data.model,
      promptTokens: data.usage?.prompt_tokens,
      completionTokens: data.usage?.completion_tokens
    });

    return data;
  }

  async generateImage(model: string, prompt: string) {
    console.log('📤 Preparing OpenRouter image generation request:', { model });
    console.log('📸 Image prompt length:', prompt.length);
    console.log('📸 Image prompt preview:', prompt.substring(0, 100) + '...');

    const startTime = performance.now();
    try {
      const data = await this.makeRequest('/images/generate', {
        model,
        prompt,
        n: 1,
        size: '1024x1024',
      });
      const endTime = performance.now();

      console.log(`⏱️ OpenRouter image generation took ${Math.round(endTime - startTime)}ms`);
      console.log('📸 Image URL received:', data.data?.[0]?.url ? 'Yes' : 'No');
      return data.data[0].url;
    } catch (error) {
      console.error('❌ OpenRouter image generation error:', error);
      throw error;
    }
  }
}