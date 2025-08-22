const STORAGE_KEY = 'dreamBedroom_customPrompts';
const MAX_CUSTOM_PROMPTS = 5; // Limit custom prompts to prevent storage overflow

export const customPromptsService = {
  // Save a new custom room type
  saveCustomRoomType(roomTypeData) {
    try {
      const customPrompts = this.getAllCustomPrompts();
      
      const newCustomPrompt = {
        id: `custom-${Date.now()}`,
        name: roomTypeData.name,
        description: roomTypeData.description,
        basePrompt: roomTypeData.basePrompt,
        styleVariations: roomTypeData.styleVariations || [],
        emoji: roomTypeData.emoji || '🏠',
        createdAt: new Date().toISOString(),
        isCustom: true
      };
      
      // Add to beginning of array (most recent first)
      customPrompts.unshift(newCustomPrompt);
      
      // Keep only the most recent custom prompts
      const limitedPrompts = customPrompts.slice(0, MAX_CUSTOM_PROMPTS);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedPrompts));
      
      return newCustomPrompt.id;
    } catch (error) {
      console.error('Failed to save custom room type:', error);
      return null;
    }
  },

  // Get all custom room types
  getAllCustomPrompts() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load custom prompts:', error);
      return [];
    }
  },

  // Get a specific custom room type by ID
  getCustomPrompt(id) {
    const customPrompts = this.getAllCustomPrompts();
    return customPrompts.find(prompt => prompt.id === id);
  },

  // Delete a custom room type
  deleteCustomPrompt(id) {
    try {
      const customPrompts = this.getAllCustomPrompts();
      const filtered = customPrompts.filter(prompt => prompt.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Failed to delete custom prompt:', error);
      return false;
    }
  },

  // Update an existing custom room type
  updateCustomPrompt(id, updatedData) {
    try {
      const customPrompts = this.getAllCustomPrompts();
      const index = customPrompts.findIndex(prompt => prompt.id === id);
      
      if (index === -1) return false;
      
      customPrompts[index] = {
        ...customPrompts[index],
        ...updatedData,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customPrompts));
      return true;
    } catch (error) {
      console.error('Failed to update custom prompt:', error);
      return false;
    }
  },

  // Check if at maximum custom prompts
  isAtMaxLimit() {
    return this.getAllCustomPrompts().length >= MAX_CUSTOM_PROMPTS;
  },

  // Get count and limit info
  getPromptInfo() {
    const prompts = this.getAllCustomPrompts();
    return {
      count: prompts.length,
      maxCount: MAX_CUSTOM_PROMPTS,
      isAtLimit: prompts.length >= MAX_CUSTOM_PROMPTS
    };
  },

  // Clear all custom prompts
  clearAll() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Failed to clear custom prompts:', error);
      return false;
    }
  }
};