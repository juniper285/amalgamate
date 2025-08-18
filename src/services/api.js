// API service for frontend
export const api = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',

  async generateImages(formData) {
    const response = await fetch(`${this.baseURL}/api/generate`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Generation failed: ${response.statusText}`);
    }

    return response; // Return the response for streaming
  },

  async getStyles() {
    const response = await fetch(`${this.baseURL}/api/styles`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch styles: ${response.statusText}`);
    }
    
    return response.json();
  },

  async getRoomType(roomType) {
    const response = await fetch(`${this.baseURL}/api/styles/${roomType}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch room type: ${response.statusText}`);
    }
    
    return response.json();
  },

  async getInspiration(count = 3) {
    const response = await fetch(`${this.baseURL}/api/styles/inspiration/random?count=${count}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch inspiration: ${response.statusText}`);
    }
    
    return response.json();
  },

  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/api/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
};
