import React, { useState, useEffect } from 'react';
import { customPromptsService } from '../services/customPromptsService';

const roomTypes = [
  {
    id: 'cozy-cabin',
    name: 'Cozy Cabin',
    emoji: '🏕️',
    description: 'Rustic woodland retreat vibes',
    gradient: 'linear-gradient(135deg, #fbbf24, #f97316)',
    examples: ['🌲 Forest treehouse', '🔥 Mountain lodge', '🏔️ Lakeside cabin']
  },
  {
    id: 'modern-luxury',
    name: 'Modern Luxury',
    emoji: '✨',
    description: 'Sleek contemporary elegance',
    gradient: 'linear-gradient(135deg, #9ca3af, #4b5563)',
    examples: ['🏙️ Penthouse views', '🏠 Glass house', '🌅 Rooftop terrace']
  },
  {
    id: 'fantasy-magical',
    name: 'Fantasy Magical',
    emoji: '🔮',
    description: 'Enchanted dreamlike spaces',
    gradient: 'linear-gradient(135deg, #c084fc, #ec4899)',
    examples: ['🧚‍♀️ Fairy garden', '🏰 Castle tower', '🌙 Moonlit sanctuary']
  },
  {
    id: 'tropical-paradise',
    name: 'Tropical Paradise',
    emoji: '🌴',
    description: 'Beach and island-inspired',
    gradient: 'linear-gradient(135deg, #2dd4bf, #3b82f6)',
    examples: ['🏖️ Beach villa', '🌺 Jungle retreat', '🏝️ Overwater bungalow']
  },
  {
    id: 'vintage-romantic',
    name: 'Vintage Romantic',
    emoji: '🌹',
    description: 'Classic timeless charm',
    gradient: 'linear-gradient(135deg, #fb7185, #ec4899)',
    examples: ['🏛️ Victorian manor', '🌸 Garden cottage', '📚 Library nook']
  },
  {
    id: 'minimalist-zen',
    name: 'Minimalist Zen',
    emoji: '🧘‍♀️',
    description: 'Clean peaceful simplicity',
    gradient: 'linear-gradient(135deg, #4ade80, #14b8a6)',
    examples: ['🎋 Japanese room', '🪨 Meditation space', '💧 Water feature']
  }
];

const TypeSelector = ({ onTypeSelect, onBack, onCreateCustom }) => {
  const [selectedType, setSelectedType] = useState('');
  const [hoveredType, setHoveredType] = useState('');
  const [generationStrength, setGenerationStrength] = useState(0.6);
  const [customPrompts, setCustomPrompts] = useState([]);

  useEffect(() => {
    // Load custom prompts on component mount
    const loadCustomPrompts = () => {
      const customs = customPromptsService.getAllCustomPrompts();
      setCustomPrompts(customs);
    };
    
    loadCustomPrompts();
    
    // Listen for custom prompt changes (if needed)
    const handleStorageChange = () => {
      loadCustomPrompts();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleTypeClick = (typeId) => {
    setSelectedType(typeId);
    setTimeout(() => {
      // Map slider value (0-1) to constrained range (0.2-0.8), inverted
      // Lower slider = higher strength (more creative), Higher slider = lower strength (more similar)
      const constrainedStrength = 0.8 - (generationStrength * 0.6);
      onTypeSelect(typeId, constrainedStrength);
    }, 300); // Small delay for visual feedback
  };

  return (
    <div className="glass-card rounded-2xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">
          Choose Your Dream Bedroom Style
        </h2>
        <p className="text-gray-600">
          We'll generate 3 unique variations in your selected style
        </p>
      </div>

            {/* Generation Strength Settings */}
      <div className="glass-card rounded-xl p-6 mb-8 border-2 border-purple-200">
        <div className="mb-4">
          <h3 className="font-bold text-lg text-gray-800 mb-2 flex items-center">
            ⚡ Generation Strength
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Control how creative or similar to your original image the results will be
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500 w-20">Similar</span>
            <div className="flex-1 relative">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={generationStrength}
                onChange={(e) => setGenerationStrength(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div 
                className="absolute top-1/2 left-0 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg pointer-events-none transform -translate-y-1/2"
                style={{ width: `${generationStrength * 100}%` }}
              />
            </div>
            <span className="text-sm text-gray-500 w-20">Creative</span>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 px-2">
            <span>Stays close to original</span>
            <span>More imaginative</span>
          </div>
          
          {/* Strength description */}
          <div className="bg-blue-50 rounded-lg p-3 text-sm">
            {generationStrength < 0.3 ? (
              <span className="text-blue-700">
                🎯 <strong>Conservative:</strong> Results will closely match your original image's style and layout
              </span>
            ) : generationStrength < 0.7 ? (
              <span className="text-purple-700">
                🎨 <strong>Balanced:</strong> Good mix of creativity while keeping some original elements
              </span>
            ) : (
              <span className="text-pink-700">
                ✨ <strong>Creative:</strong> Highly imaginative results that may differ significantly from the original
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {roomTypes.map((type) => (
          <div
            key={type.id}
            className={`relative p-6 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
              selectedType === type.id
                ? 'ring-4 ring-purple-400 shadow-xl'
                : hoveredType === type.id
                ? 'shadow-lg'
                : 'hover:shadow-md'
            }`}
            style={{
              background: selectedType === type.id || hoveredType === type.id
                ? type.gradient
                : 'rgba(255, 255, 255, 0.9)'
            }}
            onClick={() => handleTypeClick(type.id)}
            onMouseEnter={() => setHoveredType(type.id)}
            onMouseLeave={() => setHoveredType('')}
          >
            <div className="text-center">
              <div className="text-4xl mb-3">{type.emoji}</div>
              <h3 className={`font-bold text-lg mb-2 ${
                selectedType === type.id || hoveredType === type.id
                  ? 'text-white'
                  : 'text-gray-800'
              }`}>
                {type.name}
              </h3>
              <p className={`text-sm mb-4 ${
                selectedType === type.id || hoveredType === type.id
                  ? 'text-white/90'
                  : 'text-gray-600'
              }`}>
                {type.description}
              </p>
              
              <div className="space-y-1">
                {type.examples.map((example, idx) => (
                  <div 
                    key={idx}
                    className={`text-xs px-2 py-1 rounded-full ${
                      selectedType === type.id || hoveredType === type.id
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {example}
                  </div>
                ))}
              </div>
            </div>
            
            {selectedType === type.id && (
              <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-black/20">
                <div className="bg-white rounded-full p-2">
                  <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Custom Prompts */}
        {customPrompts.map((customType) => (
          <div
            key={customType.id}
            className={`relative p-6 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 border-2 border-dashed border-purple-300 ${
              selectedType === customType.id
                ? 'ring-4 ring-purple-400 shadow-xl bg-gradient-to-br from-purple-100 to-pink-100'
                : hoveredType === customType.id
                ? 'shadow-lg bg-gradient-to-br from-purple-50 to-pink-50'
                : 'hover:shadow-md bg-white/90'
            }`}
            onClick={() => handleTypeClick(customType.id)}
            onMouseEnter={() => setHoveredType(customType.id)}
            onMouseLeave={() => setHoveredType('')}
          >
            <div className="text-center">
              <div className="text-4xl mb-3">{customType.emoji}</div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <h3 className={`font-bold text-lg ${
                  selectedType === customType.id || hoveredType === customType.id
                    ? 'text-purple-800'
                    : 'text-gray-800'
                }`}>
                  {customType.name}
                </h3>
                <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full">
                  Custom
                </span>
              </div>
              <p className={`text-sm mb-4 ${
                selectedType === customType.id || hoveredType === customType.id
                  ? 'text-purple-700'
                  : 'text-gray-600'
              }`}>
                {customType.description}
              </p>
              
              <div className="space-y-1">
                {customType.styleVariations.slice(0, 3).map((variation, idx) => (
                  <div 
                    key={idx}
                    className={`text-xs px-2 py-1 rounded-full ${
                      selectedType === customType.id || hoveredType === customType.id
                        ? 'bg-purple-200 text-purple-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {variation.length > 30 ? `${variation.substring(0, 30)}...` : variation}
                  </div>
                ))}
              </div>
            </div>
            
            {selectedType === customType.id && (
              <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-purple-500/20">
                <div className="bg-white rounded-full p-2">
                  <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Create Custom Prompt Button */}
        <div
          className="relative p-6 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 border-2 border-dashed border-gray-300 hover:border-purple-400 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-purple-50 hover:to-pink-50 flex flex-col items-center justify-center min-h-[200px]"
          onClick={onCreateCustom}
        >
          <div className="text-center">
            <div className="text-4xl mb-3">➕</div>
            <h3 className="font-bold text-lg mb-2 text-gray-700">
              Create Custom Type
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Design your own unique bedroom style with AI assistance
            </p>
            <div className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              🤖 AI Powered
            </div>
          </div>
        </div>
      </div>




      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-gray-700 underline"
        >
          ← Back
        </button>
        
        <div className="text-sm text-gray-500">
          Next: Generate 3 unique bedrooms ✨
        </div>
      </div>
    </div>
  );
};

export default TypeSelector;
