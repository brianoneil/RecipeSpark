// Simple event system for tracking AI operations

type EventCallback = (data?: any) => void;

export enum AIEvent {
  RECIPE_PROMPT_START = 'recipe_prompt_start',
  RECIPE_PROMPT_COMPLETE = 'recipe_prompt_complete',
  RECIPE_GENERATION_START = 'recipe_generation_start',
  RECIPE_GENERATION_COMPLETE = 'recipe_generation_complete',
  IMAGE_PROMPT_START = 'image_prompt_start',
  IMAGE_PROMPT_COMPLETE = 'image_prompt_complete',
  IMAGE_GENERATION_START = 'image_generation_start',
  IMAGE_GENERATION_COMPLETE = 'image_generation_complete',
  ERROR = 'error',
}

class EventService {
  private listeners: Map<AIEvent, EventCallback[]> = new Map();

  subscribe(event: AIEvent, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    this.listeners.get(event)!.push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  emit(event: AIEvent, data?: any): void {
    console.log(`🔔 Event emitted: ${event}`, data ? data : '');
    
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
}

export const eventService = new EventService();
