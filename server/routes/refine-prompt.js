import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { userInput } = req.body;

    if (!userInput || userInput.trim().length === 0) {
      return res.status(400).json({ error: 'User input is required' });
    }

    // AI-powered prompt refinement using a structured approach
    const refinedPrompt = await refinePromptWithAI(userInput.trim());
    
    res.json(refinedPrompt);
  } catch (error) {
    console.error('Error refining prompt:', error);
    res.status(500).json({ error: 'Failed to refine prompt' });
  }
});

async function refinePromptWithAI(userInput) {
  // This is where you could integrate with an AI service like OpenAI, Claude, etc.
  // For now, I'll provide a structured analysis approach
  
  const analysis = analyzeUserInput(userInput);
  
  return {
    name: generateRoomTypeName(analysis),
    description: generateDescription(analysis),
    basePrompt: generateBasePrompt(analysis),
    styleVariations: generateStyleVariations(analysis),
    emoji: selectEmoji(analysis),
    isRefined: true,
    analysis: analysis // Include analysis for debugging
  };
}

function analyzeUserInput(input) {
  const lowerInput = input.toLowerCase();
  
  // Theme detection
  const themes = {
    nature: /\b(forest|mountain|ocean|beach|garden|tree|flower|natural?|outdoor|wilderness|jungle|desert|lake|river)\b/g,
    luxury: /\b(luxury|luxurious|elegant|sophisticated|premium|high-end|lavish|opulent|expensive|fancy|upscale)\b/g,
    cozy: /\b(cozy|cosy|warm|comfortable|snug|homey|intimate|soft|gentle|welcoming|peaceful)\b/g,
    modern: /\b(modern|contemporary|sleek|minimalist|clean|geometric|futuristic|high-tech|smart|digital)\b/g,
    vintage: /\b(vintage|antique|classic|retro|old|traditional|historical|victorian|art\s*deco|rustic)\b/g,
    fantasy: /\b(magic|magical|fantasy|fairy|mystical|enchanted|dragon|wizard|castle|medieval|ethereal|otherworldly)\b/g,
    space: /\b(space|cosmic|galaxy|stars?|planet|universe|nebula|astronaut|spacecraft|alien|celestial)\b/g,
    industrial: /\b(industrial|concrete|metal|steel|factory|warehouse|urban|loft|exposed|raw|brutalist)\b/g,
    bohemian: /\b(bohemian|boho|eclectic|artistic|colorful|creative|free[\-\s]?spirit|hippie|gypsy|nomadic)\b/g,
    underwater: /\b(underwater|ocean|sea|coral|fish|marine|aquatic|submarine|depths|diving)\b/g,
    arctic: /\b(arctic|ice|snow|frozen|glacier|polar|cold|winter|igloo|tundra)\b/g,
    tropical: /\b(tropical|island|palm|coconut|bamboo|tiki|polynesian|caribbean|paradise|exotic)\b/g
  };

  // Detect dominant themes
  const detectedThemes = [];
  Object.entries(themes).forEach(([theme, regex]) => {
    const matches = lowerInput.match(regex);
    if (matches) {
      detectedThemes.push({
        theme,
        strength: matches.length,
        keywords: matches
      });
    }
  });

  // Sort by strength
  detectedThemes.sort((a, b) => b.strength - a.strength);

  // Extract colors if mentioned
  const colors = extractColors(lowerInput);
  
  // Extract mood/atmosphere words
  const moods = extractMoods(lowerInput);

  // Extract architectural elements
  const architecture = extractArchitecture(lowerInput);

  return {
    originalInput: input,
    themes: detectedThemes.slice(0, 3), // Top 3 themes
    colors,
    moods,
    architecture,
    primaryTheme: detectedThemes[0]?.theme || 'custom'
  };
}

function extractColors(input) {
  const colorRegex = /\b(red|blue|green|yellow|purple|pink|orange|black|white|gray|grey|brown|gold|silver|copper|bronze|turquoise|coral|lavender|emerald|ruby|sapphire)\b/g;
  return input.match(colorRegex) || [];
}

function extractMoods(input) {
  const moodRegex = /\b(peaceful|energetic|calming|exciting|mysterious|bright|dark|airy|intimate|spacious|cramped|open|closed|sunny|shadowy|vibrant|muted)\b/g;
  return input.match(moodRegex) || [];
}

function extractArchitecture(input) {
  const archRegex = /\b(cathedral|dome|arched|vaulted|exposed\s+beams|brick|stone|wood|glass|concrete|marble|tile|carpet|hardwood|ceiling|windows|skylight|balcony|terrace)\b/g;
  return input.match(archRegex) || [];
}

function generateRoomTypeName(analysis) {
  const { primaryTheme, themes } = analysis;
  
  const nameTemplates = {
    nature: ['Natural Sanctuary', 'Organic Haven', 'Earth Retreat', 'Wilderness Lodge'],
    luxury: ['Luxury Sanctuary', 'Premium Suite', 'Elite Quarters', 'Opulent Chamber'],
    cozy: ['Cozy Haven', 'Warm Hideaway', 'Comfort Nook', 'Snug Retreat'],
    modern: ['Modern Loft', 'Contemporary Suite', 'Sleek Chamber', 'Minimalist Space'],
    vintage: ['Vintage Charm', 'Classic Manor', 'Timeless Suite', 'Heritage Room'],
    fantasy: ['Fantasy Realm', 'Magical Chamber', 'Enchanted Quarters', 'Mystical Haven'],
    space: ['Cosmic Chamber', 'Stellar Suite', 'Galaxy Room', 'Celestial Space'],
    industrial: ['Industrial Loft', 'Urban Den', 'Metro Suite', 'Raw Space'],
    bohemian: ['Bohemian Haven', 'Artistic Loft', 'Creative Studio', 'Eclectic Space'],
    underwater: ['Underwater Sanctuary', 'Ocean Depths', 'Aquatic Chamber', 'Marine Haven'],
    arctic: ['Arctic Lodge', 'Ice Palace', 'Frozen Sanctuary', 'Polar Retreat'],
    tropical: ['Tropical Paradise', 'Island Retreat', 'Palm Haven', 'Exotic Sanctuary']
  };

  const templates = nameTemplates[primaryTheme] || ['Custom Room', 'Unique Space', 'Personal Sanctuary'];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateDescription(analysis) {
  const { primaryTheme, moods } = analysis;
  
  const baseDescriptions = {
    nature: 'Natural and organic atmosphere',
    luxury: 'Sophisticated and luxurious comfort',
    cozy: 'Warm and intimate setting',
    modern: 'Clean contemporary design',
    vintage: 'Classic timeless elegance',
    fantasy: 'Magical and mystical ambiance',
    space: 'Cosmic and otherworldly vibes',
    industrial: 'Urban industrial aesthetic',
    bohemian: 'Artistic and creative expression',
    underwater: 'Serene aquatic environment',
    arctic: 'Cool pristine atmosphere',
    tropical: 'Warm island paradise vibes'
  };

  let description = baseDescriptions[primaryTheme] || 'Unique custom atmosphere';
  
  if (moods.length > 0) {
    description += ` with ${moods.slice(0, 2).join(' and ')} vibes`;
  }
  
  return description;
}

function generateBasePrompt(analysis) {
  const { primaryTheme, colors, architecture } = analysis;
  
  const basePrompts = {
    nature: '(natural room), ((organic materials)), ((earthy textures)), ((natural lighting)), ((woodland atmosphere))',
    luxury: '(luxury room), ((premium materials)), ((elegant finishes)), ((sophisticated lighting)), ((opulent atmosphere))',
    cozy: '(cozy room), ((warm materials)), ((soft textures)), ((gentle lighting)), ((intimate atmosphere))',
    modern: '(modern room), ((sleek materials)), ((clean lines)), ((contemporary lighting)), ((minimalist atmosphere))',
    vintage: '(vintage room), ((antique materials)), ((ornate details)), ((warm lighting)), ((classic atmosphere))',
    fantasy: '(fantasy room), ((magical materials)), ((mystical elements)), ((ethereal lighting)), ((enchanted atmosphere))',
    space: '(space room), ((futuristic materials)), ((cosmic elements)), ((stellar lighting)), ((otherworldly atmosphere))',
    industrial: '(industrial room), ((raw materials)), ((exposed elements)), ((dramatic lighting)), ((urban atmosphere))',
    bohemian: '(bohemian room), ((eclectic materials)), ((artistic elements)), ((warm lighting)), ((creative atmosphere))',
    underwater: '(underwater room), ((aquatic materials)), ((fluid elements)), ((blue lighting)), ((marine atmosphere))',
    arctic: '(arctic room), ((ice materials)), ((crystalline elements)), ((cool lighting)), ((frozen atmosphere))',
    tropical: '(tropical room), ((bamboo materials)), ((natural elements)), ((warm lighting)), ((paradise atmosphere))'
  };

  let prompt = basePrompts[primaryTheme] || '(custom room), ((unique materials)), ((personal style)), ((ambient lighting))';
  
  // Add color modifiers if specified
  if (colors.length > 0) {
    const colorString = colors.slice(0, 2).join(' and ');
    prompt += `, ((${colorString} colors))`;
  }
  
  return prompt;
}

function generateStyleVariations(analysis) {
  const { primaryTheme, originalInput } = analysis;
  
  const variations = {
    nature: [
      'forest cabin with sunlight filtering through tall pine trees',
      'garden bedroom with flowering vines climbing the walls',
      'treehouse bedroom with rope bridges and chirping birds',
      'mountain lodge bedroom with stone fireplace and panoramic views',
      'jungle bedroom with exotic plants and morning mist'
    ],
    luxury: [
      'penthouse bedroom with floor-to-ceiling windows and city skyline',
      'luxury yacht master suite with ocean panorama',
      'five-star hotel suite with marble finishes and gold accents',
      'private villa bedroom with infinity pool views',
      'executive suite with leather furniture and crystal chandeliers'
    ],
    cozy: [
      'cottage bedroom with stone fireplace and handmade quilts',
      'attic bedroom with slanted windows and fairy lights',
      'cabin bedroom with fur rugs and exposed wooden beams',
      'reading nook bedroom with built-in bookshelves',
      'farmhouse bedroom with vintage furniture and floral patterns'
    ],
    underwater: [
      'submarine bedroom with porthole windows showing marine life',
      'underwater palace bedroom with coral reef gardens',
      'deep sea bedroom with bioluminescent creatures',
      'mermaid grotto bedroom with pearl decorations',
      'aquarium bedroom with schools of tropical fish'
    ]
  };

  const defaultVariations = [
    `custom bedroom inspired by ${originalInput}`,
    `unique space reflecting personal style and preferences`,
    `one-of-a-kind room with distinctive character and atmosphere`
  ];

  return variations[primaryTheme] || defaultVariations;
}

function selectEmoji(analysis) {
  const { primaryTheme } = analysis;
  
  const emojiMap = {
    nature: '🌿',
    luxury: '💎',
    cozy: '🏠',
    modern: '🏢',
    vintage: '🕰️',
    fantasy: '🧚‍♀️',
    space: '🌌',
    industrial: '🏭',
    bohemian: '🎨',
    underwater: '🐠',
    arctic: '❄️',
    tropical: '🌺'
  };

  return emojiMap[primaryTheme] || '🏠';
}

export default router;