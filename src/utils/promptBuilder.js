export const promptBuilder = {
  // Build prompts for room type variations
  buildRoomPrompts(roomType, userPreferences = {}) {
    const basePrompts = this.getRoomTypePrompts(roomType);
    
    return basePrompts.map((basePrompt, index) => {
      let prompt = basePrompt;
      
      // Add user preferences
      if (userPreferences.colors?.length > 0) {
        prompt += `, incorporating ${userPreferences.colors.join(' and ')} colors`;
      }
      
      if (userPreferences.lighting) {
        prompt += `, with ${userPreferences.lighting} lighting`;
      }
      
      if (userPreferences.mood) {
        prompt += `, ${userPreferences.mood} atmosphere`;
      }
      
      // Add technical parameters
      prompt += this.getTechnicalPrompt();
      
      return {
        id: `${roomType}-${index + 1}`,
        number: index + 1,
        prompt: prompt,
        roomType: roomType
      };
    });
  },

  // Get base prompts for each room type
  getRoomTypePrompts(roomType) {
    const prompts = {
      'cozy-cabin': [
        'Rustic forest treehouse bedroom with fairy lights twinkling through wooden beams',
        'Mountain lodge bedroom with stone fireplace and panoramic alpine views',
        'Lakeside cabin bedroom with floor-to-ceiling windows overlooking misty waters',
        'Woodland cottage bedroom surrounded by wildflower gardens',
        'Rustic barn loft bedroom with exposed beams and cozy hay seating',
        'Cozy attic bedroom with slanted windows revealing starry night sky',
        'Log cabin bedroom with thick fur rugs and hand-knitted blankets',
        'Forest clearing bedroom with canopy bed under constellation of stars',
        'Cabin porch bedroom with hanging bed and glowing lanterns'
      ],
      'modern-luxury': [
        'Penthouse bedroom with floor-to-ceiling windows and city skyline',
        'Minimalist glass house bedroom floating in serene forest',
        'Rooftop terrace bedroom with white canopy bed under open sky',
        'Infinity pool edge bedroom with floating platform over water',
        'Futuristic pod bedroom with smart glass walls showing aurora',
        'Luxury yacht master suite with wraparound ocean views',
        'Modern cave house bedroom carved into dramatic cliffside',
        'Suspended glass cube bedroom in forest canopy among clouds',
        'Minimalist concrete bedroom with reflecting pool and zen garden'
      ],
      'fantasy-magical': [
        'Fairy garden bedroom with glowing mushrooms and floating petals',
        'Enchanted castle tower bedroom with spiral stairs and moonbeams',
        'Underwater palace bedroom with tropical fish swimming by',
        'Cloud palace bedroom floating among cumulus and rainbows',
        'Mystical library bedroom with towering bookshelves in mist',
        'Dragon lair bedroom with treasure chests and glowing crystals',
        'Elven forest bedroom with luminescent leaves and wind chimes',
        'Wizard tower bedroom with floating candles and spell books',
        'Mermaid grotto bedroom with pearl walls and bioluminescent coral'
      ],
      'tropical-paradise': [
        'Overwater bungalow bedroom with glass floor revealing coral reef',
        'Beach villa bedroom with open walls and ocean breeze',
        'Jungle treehouse bedroom with rope bridges and bird songs',
        'Bamboo pavilion bedroom with flowing curtains and flowers',
        'Coconut grove bedroom with hammocks between palm trees',
        'Volcanic island bedroom with hot springs and tropical gardens',
        'Tiki hut bedroom with thatched roof and Polynesian carvings',
        'Beachfront cave bedroom with rock formations and tide pools',
        'Floating island bedroom surrounded by turquoise lagoon'
      ],
      'vintage-romantic': [
        'Victorian mansion bedroom with four-poster bed and lace curtains',
        'French countryside chateau bedroom with antiques and garden views',
        'English cottage bedroom with floral wallpaper and reading nook',
        'Parisian apartment bedroom with balcony and vintage bottles',
        'Southern plantation bedroom with mosquito nets and magnolia scents',
        'Art Nouveau bedroom with stained glass and curved furniture',
        'Medieval castle bedroom with tapestries and candlelit walls',
        '1920s jazz age bedroom with velvet curtains and art deco',
        'Rose garden conservatory bedroom with climbing vines and dew'
      ],
      'minimalist-zen': [
        'Japanese ryokan bedroom with tatami mats and shoji screens',
        'Meditation retreat bedroom with singing bowls and incense',
        'Scandinavian cabin bedroom with white linens and birch accents',
        'Monastery cell bedroom with simple wood furniture and beads',
        'Desert meditation bedroom with sand dunes and endless horizon',
        'Mountain monastery bedroom with prayer flags and thin air',
        'Zen garden bedroom with raked sand and single bonsai tree',
        'Minimalist loft bedroom with concrete walls and sunlight beam',
        'Floating meditation platform bedroom above tranquil koi pond'
      ]
    };
    
    return prompts[roomType] || prompts['modern-luxury'];
  },

  // Get technical parameters for high-quality generation
  getTechnicalPrompt() {
    return ', high quality bedroom interior design, comfortable bed prominently featured, professional interior photography, detailed textures, Instagram-worthy composition, dreamy inviting atmosphere, cozy relaxing environment, 8k uhd, photorealistic, perfect composition, soft natural lighting';
  },

  // Build custom prompt from user input
  buildCustomPrompt(description, preferences = {}) {
    let prompt = description;
    
    if (preferences.style) {
      prompt = `${preferences.style} style ${prompt}`;
    }
    
    if (preferences.colors?.length > 0) {
      prompt += `, featuring ${preferences.colors.join(', ')} colors`;
    }
    
    if (preferences.lighting) {
      prompt += `, ${preferences.lighting} lighting`;
    }
    
    if (preferences.mood) {
      prompt += `, ${preferences.mood} atmosphere`;
    }
    
    return prompt + this.getTechnicalPrompt();
  },

  // Extract room features from user image analysis
  buildPromptFromImageAnalysis(basePrompt, imageAnalysis) {
    let prompt = basePrompt;
    
    if (imageAnalysis.dominantColors?.length > 0) {
      prompt += `, incorporating ${imageAnalysis.dominantColors.join(' and ')} color tones`;
    }
    
    if (imageAnalysis.lighting) {
      prompt += `, ${imageAnalysis.lighting} lighting atmosphere`;
    }
    
    if (imageAnalysis.style) {
      prompt += `, maintaining ${imageAnalysis.style} aesthetic elements`;
    }
    
    return prompt;
  },

  // Generate negative prompts to avoid unwanted elements
  getNegativePrompt() {
    return 'blurry, low quality, distorted, cluttered, messy, dark, gloomy, scary, disturbing, people, humans, faces, text, watermark, logo, signature, oversaturated, unrealistic colors';
  },

  // Optimize prompt length and quality
  optimizePrompt(prompt, maxLength = 500) {
    // Remove redundant words
    let optimized = prompt
      .replace(/\b(and|with|of|in|on|at)\b/g, ',')
      .replace(/,+/g, ',')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Truncate if too long
    if (optimized.length > maxLength) {
      optimized = optimized.substring(0, maxLength).replace(/,[^,]*$/, '');
    }
    
    return optimized;
  }
};
