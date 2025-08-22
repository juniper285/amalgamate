export const promptRefinementService = {
  // Refine user input into a structured room type prompt
  async refinePrompt(userInput) {
    try {
      const response = await fetch('/api/refine-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput: userInput.trim()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refine prompt');
      }

      const refinedData = await response.json();
      return refinedData;
    } catch (error) {
      console.error('Error refining prompt:', error);
      
      // Fallback: Basic prompt refinement locally
      return this.fallbackRefinement(userInput);
    }
  },

  // Fallback refinement when API is unavailable
  fallbackRefinement(userInput) {
    const cleanedInput = userInput.toLowerCase().trim();
    
    // Extract key themes and concepts
    const concepts = this.extractConcepts(cleanedInput);
    
    // Generate basic structure
    const basePrompt = this.generateBasePrompt(concepts);
    const styleVariations = this.generateStyleVariations(concepts);
    const emoji = this.suggestEmoji(concepts);
    
    return {
      name: this.generateName(concepts),
      description: this.generateDescription(concepts),
      basePrompt,
      styleVariations,
      emoji,
      isRefined: true
    };
  },

  // Extract key concepts from user input
  extractConcepts(input) {
    const themes = {
      nature: ['forest', 'mountain', 'ocean', 'beach', 'garden', 'tree', 'flower', 'nature', 'outdoor'],
      luxury: ['luxury', 'elegant', 'sophisticated', 'premium', 'high-end', 'lavish', 'opulent'],
      cozy: ['cozy', 'warm', 'comfortable', 'snug', 'homey', 'intimate', 'soft'],
      modern: ['modern', 'contemporary', 'sleek', 'minimalist', 'clean', 'geometric'],
      vintage: ['vintage', 'antique', 'classic', 'retro', 'old', 'traditional', 'historical'],
      fantasy: ['magic', 'fantasy', 'fairy', 'mystical', 'enchanted', 'dragon', 'wizard', 'castle'],
      space: ['space', 'cosmic', 'galaxy', 'stars', 'planet', 'universe', 'nebula'],
      industrial: ['industrial', 'concrete', 'metal', 'steel', 'factory', 'warehouse', 'urban'],
      bohemian: ['bohemian', 'boho', 'eclectic', 'artistic', 'colorful', 'creative', 'free-spirit']
    };

    const foundThemes = [];
    const words = input.split(/\s+/);
    
    Object.entries(themes).forEach(([theme, keywords]) => {
      const matches = keywords.filter(keyword => 
        words.some(word => word.includes(keyword) || keyword.includes(word))
      );
      if (matches.length > 0) {
        foundThemes.push({ theme, matches, strength: matches.length });
      }
    });

    // Sort by strength and return top themes
    return foundThemes
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 3)
      .map(t => t.theme);
  },

  // Generate a name based on concepts
  generateName(concepts) {
    const nameTemplates = {
      nature: ['Natural Haven', 'Organic Sanctuary', 'Earth Retreat'],
      luxury: ['Luxury Suite', 'Premium Escape', 'Elite Quarters'],
      cozy: ['Cozy Nook', 'Warm Hideaway', 'Comfort Zone'],
      modern: ['Modern Loft', 'Contemporary Space', 'Sleek Retreat'],
      vintage: ['Vintage Charm', 'Classic Suite', 'Timeless Room'],
      fantasy: ['Fantasy Realm', 'Magical Chamber', 'Enchanted Space'],
      space: ['Cosmic Chamber', 'Stellar Suite', 'Galaxy Room'],
      industrial: ['Industrial Loft', 'Urban Den', 'Metro Suite'],
      bohemian: ['Bohemian Haven', 'Artistic Space', 'Creative Studio']
    };

    if (concepts.length === 0) return 'Custom Room';
    
    const primaryTheme = concepts[0];
    const templates = nameTemplates[primaryTheme] || ['Custom Room'];
    return templates[Math.floor(Math.random() * templates.length)];
  },

  // Generate description based on concepts
  generateDescription(concepts) {
    const descriptions = {
      nature: 'Natural and organic atmosphere',
      luxury: 'Sophisticated and luxurious comfort',
      cozy: 'Warm and intimate setting',
      modern: 'Clean contemporary design',
      vintage: 'Classic timeless elegance',
      fantasy: 'Magical and mystical ambiance',
      space: 'Cosmic and otherworldly vibes',
      industrial: 'Urban industrial aesthetic',
      bohemian: 'Artistic and creative expression'
    };

    if (concepts.length === 0) return 'Unique custom atmosphere';
    
    return descriptions[concepts[0]] || 'Unique custom atmosphere';
  },

  // Generate base prompt
  generateBasePrompt(concepts) {
    const baseTemplates = {
      nature: '(natural room), ((organic materials)), ((earthy style)), ((natural lighting))',
      luxury: '(luxury room), ((premium materials)), ((elegant style)), ((sophisticated lighting))',
      cozy: '(cozy room), ((warm materials)), ((comfortable style)), ((soft lighting))',
      modern: '(modern room), ((sleek materials)), ((contemporary style)), ((clean lighting))',
      vintage: '(vintage room), ((classic materials)), ((traditional style)), ((warm lighting))',
      fantasy: '(fantasy room), ((magical materials)), ((mystical style)), ((enchanted lighting))',
      space: '(cosmic room), ((futuristic materials)), ((space style)), ((stellar lighting))',
      industrial: '(industrial room), ((raw materials)), ((urban style)), ((dramatic lighting))',
      bohemian: '(bohemian room), ((eclectic materials)), ((artistic style)), ((creative lighting))'
    };

    if (concepts.length === 0) {
      return '(custom room), ((unique materials)), ((personal style)), ((ambient lighting))';
    }

    return baseTemplates[concepts[0]] || '(custom room), ((unique materials)), ((personal style)), ((ambient lighting))';
  },

  // Generate style variations
  generateStyleVariations(concepts) {
    const variations = {
      nature: [
        'forest cabin with sunlight filtering through tall pine trees',
        'garden bedroom with flowering vines and butterflies',
        'treehouse bedroom with rope bridges and bird songs'
      ],
      luxury: [
        'penthouse bedroom with panoramic city views',
        'luxury yacht master suite with ocean panorama',
        'five-star hotel suite with marble and gold accents'
      ],
      cozy: [
        'cottage bedroom with crackling fireplace',
        'attic bedroom with slanted windows and warm blankets',
        'cabin bedroom with fur rugs and wooden beams'
      ]
      // Add more as needed...
    };

    if (concepts.length === 0 || !variations[concepts[0]]) {
      return [
        'unique bedroom with personalized atmosphere',
        'custom space with distinctive character',
        'one-of-a-kind room with special ambiance'
      ];
    }

    return variations[concepts[0]];
  },

  // Suggest emoji based on concepts
  suggestEmoji(concepts) {
    const emojiMap = {
      nature: '🌿',
      luxury: '💎',
      cozy: '🏠',
      modern: '🏢',
      vintage: '🕰️',
      fantasy: '🧚‍♀️',
      space: '🌌',
      industrial: '🏭',
      bohemian: '🎨'
    };

    return concepts.length > 0 ? emojiMap[concepts[0]] || '🏠' : '🏠';
  }
};