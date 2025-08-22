import { roomTypes, styleVariations } from '../config/styles.js';

export function buildVariationPrompts(roomType, roomFeatures = null, customPrompts = null, customRoomType = null) {
  let roomTypeData;
  let variations;

  // Check if this is a custom room type
  if (customRoomType) {
    roomTypeData = customRoomType;
    variations = customRoomType.styleVariations || [];
  } else {
    roomTypeData = roomTypes.find(type => type.id === roomType);
    if (!roomTypeData) {
      throw new Error(`Unknown room type: ${roomType}`);
    }
    variations = styleVariations[roomType];
  }

  if (!variations || variations.length < 3) {
    throw new Error(`Insufficient variations for room type: ${roomType}`);
  }

  return variations.slice(0, 3).map((variation, index) => {
    let prompt = `${variation}, ${roomTypeData.basePrompt}`;
    
    // Incorporate user room features if available
    if (roomFeatures) {
      if (roomFeatures.dominantColors && roomFeatures.dominantColors.length > 0) {
        prompt += `, incorporating ${roomFeatures.dominantColors.join(' and ')} color tones`;
      }
      if (roomFeatures.lighting) {
        prompt += `, ${roomFeatures.lighting} lighting atmosphere`;
      }
      if (roomFeatures.style) {
        prompt += `, maintaining ${roomFeatures.style} aesthetic elements`;
      }
    }

    // Add custom prompts if provided
    if (customPrompts) {
      if (customPrompts.colorPalette) {
        prompt += `, ${customPrompts.colorPalette} color scheme`;
      }
      if (customPrompts.mood) {
        prompt += `, ${customPrompts.mood} mood and atmosphere`;
      }
      if (customPrompts.additionalDetails) {
        prompt += `, ${customPrompts.additionalDetails}`;
      }
    }

    // Add technical parameters for optimal results
    prompt += ', high quality bedroom interior design';
    prompt += ', comfortable sleeping area prominently featured';
    prompt += ', professional interior photography lighting';
    prompt += ', detailed textures and materials';
    prompt += ', Instagram-worthy composition';
    prompt += ', dreamy and inviting atmosphere';
    prompt += ', cozy and relaxing environment';
    
    // Technical parameters for image generation
    prompt += ', 8k uhd, photorealistic, architectural photography';
    prompt += ', perfect composition, rule of thirds';
    prompt += ', soft natural lighting, warm color temperature';
    
    // Negative prompts to avoid common issues
    const negativePrompt = 'blurry, low quality, distorted, cluttered, messy, dark, gloomy, scary, disturbing, people, humans, text, watermark';

    return {
      prompt: prompt,
      negativePrompt: negativePrompt,
      number: index + 1,
      style: variation,
      id: `${roomType}-${index + 1}`,
      roomType: roomType
    };
  });
}

export function generateCustomPrompt(baseDescription, userPreferences = {}) {
  let prompt = baseDescription;
  
  // Add style modifiers
  if (userPreferences.style) {
    prompt = `${userPreferences.style} style ${prompt}`;
  }
  
  // Add color preferences
  if (userPreferences.colors && userPreferences.colors.length > 0) {
    prompt += `, featuring ${userPreferences.colors.join(', ')} colors`;
  }
  
  // Add mood
  if (userPreferences.mood) {
    prompt += `, ${userPreferences.mood} atmosphere`;
  }
  
  // Add lighting
  if (userPreferences.lighting) {
    prompt += `, ${userPreferences.lighting} lighting`;
  }
  
  return prompt;
}

export function optimizePromptForModel(prompt, modelType = 'sdxl') {
  switch (modelType) {
    case 'sdxl':
      return `${prompt}, professional photography, high resolution, detailed, masterpiece`;
    case 'midjourney':
      return `${prompt} --ar 1:1 --style raw --quality 2`;
    case 'dalle':
      return prompt; // DALL-E doesn't need special formatting
    default:
      return prompt;
  }
}

// Helper function to ensure variety across all 3 images
export function ensureVariety(prompts) {
  const lightingTypes = ['golden hour', 'natural daylight', 'warm'];
  const viewTypes = ['interior view', 'panoramic view', 'wide angle view'];
  const moodTypes = ['cozy', 'serene', 'luxurious'];
  
  return prompts.map((promptData, index) => {
    // Rotate through different lighting types
    const lighting = lightingTypes[index % lightingTypes.length];
    const view = viewTypes[index % viewTypes.length];
    const mood = moodTypes[index % moodTypes.length];
    
    // Enhance prompt with variety elements
    let enhancedPrompt = promptData.prompt;
    enhancedPrompt += `, ${lighting} lighting`;
    enhancedPrompt += `, ${view}`;
    enhancedPrompt += `, ${mood} ambiance`;
    
    return {
      ...promptData,
      prompt: enhancedPrompt
    };
  });
}
