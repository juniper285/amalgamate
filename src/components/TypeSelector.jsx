import React, { useState } from 'react';

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

const TypeSelector = ({ onTypeSelect, onBack }) => {
  const [selectedType, setSelectedType] = useState('');
  const [hoveredType, setHoveredType] = useState('');

  const handleTypeClick = (typeId) => {
    setSelectedType(typeId);
    setTimeout(() => {
      onTypeSelect(typeId);
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
      </div>

      {/* Custom Option */}
      <div className="glass-card rounded-xl p-4 mb-8 opacity-50">
        <div className="text-center">
          <div className="text-2xl mb-2">🎨</div>
          <h3 className="font-bold text-gray-700">Custom Style</h3>
          <p className="text-sm text-gray-500">Coming soon - describe your own style</p>
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
