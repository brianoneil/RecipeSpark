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

    // Log configuration on initialization (without sensitive data)
    console.log('🔧 OpenRouter Service Configuration:', {
      appUrl: this.config.appUrl,
      hasApiKey: !!this.config.apiKey
    });
  }

  private async makeRequest(endpoint: string, body: any) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        'HTTP-Referer': this.config.appUrl,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenRouter API error:', {
        endpoint,
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
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