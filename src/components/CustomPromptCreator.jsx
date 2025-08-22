import React, { useState } from 'react';
import { customPromptsService } from '../services/customPromptsService';
import { promptRefinementService } from '../services/promptRefinementService';

const CustomPromptCreator = ({ onBack, onSave }) => {
  const [currentStep, setCurrentStep] = useState('input'); // input, preview, saved
  const [userInput, setUserInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [refinedPrompt, setRefinedPrompt] = useState(null);
  const [customPrompt, setCustomPrompt] = useState({
    name: '',
    description: '',
    basePrompt: '',
    styleVariations: [],
    emoji: '🏠'
  });

  const handleRefinePrompt = async () => {
    if (!userInput.trim()) {
      alert('Please enter a description of your dream bedroom first!');
      return;
    }

    setIsRefining(true);
    try {
      const refined = await promptRefinementService.refinePrompt(userInput);
      setRefinedPrompt(refined);
      setCustomPrompt(refined);
      setCurrentStep('preview');
    } catch (error) {
      console.error('Failed to refine prompt:', error);
      alert('Failed to refine prompt. Please try again.');
    } finally {
      setIsRefining(false);
    }
  };

  const handleEditField = (field, value) => {
    setCustomPrompt(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditVariation = (index, value) => {
    const newVariations = [...customPrompt.styleVariations];
    newVariations[index] = value;
    setCustomPrompt(prev => ({
      ...prev,
      styleVariations: newVariations
    }));
  };

  const handleAddVariation = () => {
    if (customPrompt.styleVariations.length < 9) {
      setCustomPrompt(prev => ({
        ...prev,
        styleVariations: [...prev.styleVariations, 'New style variation...']
      }));
    }
  };

  const handleRemoveVariation = (index) => {
    setCustomPrompt(prev => ({
      ...prev,
      styleVariations: prev.styleVariations.filter((_, i) => i !== index)
    }));
  };

  const handleSaveCustomPrompt = () => {
    // Validate required fields
    if (!customPrompt.name.trim() || !customPrompt.description.trim()) {
      alert('Please fill in the name and description fields.');
      return;
    }

    // Check limit
    const promptInfo = customPromptsService.getPromptInfo();
    if (promptInfo.isAtLimit) {
      if (!window.confirm(`You already have ${promptInfo.maxCount} custom prompts. Creating this will delete your oldest custom prompt. Continue?`)) {
        return;
      }
    }

    // Save the custom prompt
    const savedId = customPromptsService.saveCustomRoomType(customPrompt);
    if (savedId) {
      setCurrentStep('saved');
      onSave?.(savedId);
    } else {
      alert('Failed to save custom prompt. Please try again.');
    }
  };

  const handleStartOver = () => {
    setCurrentStep('input');
    setUserInput('');
    setRefinedPrompt(null);
    setCustomPrompt({
      name: '',
      description: '',
      basePrompt: '',
      styleVariations: [],
      emoji: '🏠'
    });
  };

  if (currentStep === 'saved') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="glass-card rounded-2xl p-8 text-center">
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                Custom Room Type Created!
              </h2>
              <p className="text-gray-600 mb-8">
                Your custom "{customPrompt.name}" room type has been saved and is ready to use for generating bedroom collections.
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={() => onBack()}
                  className="btn-primary block mx-auto"
                >
                  Start Generating with Custom Type
                </button>
                <button
                  onClick={handleStartOver}
                  className="btn-secondary block mx-auto"
                >
                  Create Another Custom Type
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="bg-white/80 hover:bg-white text-gray-700 px-4 py-2 rounded-lg font-medium border border-gray-200 transition-all duration-200 flex items-center gap-2"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Create Custom Room Type 🎨
              </h1>
              <p className="text-gray-600 text-sm">
                Design your own unique bedroom style with AI assistance
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {currentStep === 'input' && (
            <div className="glass-card rounded-2xl p-8">
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">
                  Describe Your Dream Bedroom
                </h2>
                <p className="text-gray-600">
                  Tell us about the atmosphere, style, materials, or inspiration for your custom bedroom type. 
                  Our AI will help structure it into a professional room type.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What's your vision? *
                </label>
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Example: A cyberpunk bedroom with neon lights, holographic displays, rain-soaked windows overlooking a futuristic city, dark metal furniture, and glowing purple accents..."
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  maxLength={500}
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  {userInput.length}/500 characters
                </div>
              </div>

              {/* Examples */}
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-3 text-gray-700">💡 Need inspiration?</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    "Cyberpunk bedroom with neon lights and holographic displays",
                    "Underwater coral palace with bioluminescent creatures",
                    "Steampunk Victorian room with brass gears and mechanical elements",
                    "Space station bedroom with cosmic views and floating furniture"
                  ].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setUserInput(example)}
                      className="text-left p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-all duration-200 text-sm"
                    >
                      "{example}"
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={handleRefinePrompt}
                  disabled={isRefining || !userInput.trim()}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRefining ? '🤖 AI is crafting your room type...' : '🪄 Create with AI'}
                </button>
              </div>
            </div>
          )}

          {currentStep === 'preview' && (
            <div className="space-y-6">
              {/* Preview Card */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">{customPrompt.emoji}</span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Preview & Customize</h2>
                    <p className="text-sm text-gray-600">Review and edit your AI-generated room type</p>
                  </div>
                </div>

                {/* Editable Fields */}
                <div className="grid gap-6">
                  {/* Name and Emoji */}
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Room Type Name *</label>
                      <input
                        type="text"
                        value={customPrompt.name}
                        onChange={(e) => handleEditField('name', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g., Cyberpunk Chamber"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Emoji</label>
                      <input
                        type="text"
                        value={customPrompt.emoji}
                        onChange={(e) => handleEditField('emoji', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-center text-xl"
                        maxLength={2}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea
                      value={customPrompt.description}
                      onChange={(e) => handleEditField('description', e.target.value)}
                      className="w-full h-20 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                      placeholder="Brief description of the room style..."
                    />
                  </div>

                  {/* Base Prompt */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Base Prompt (Advanced)
                      <span className="text-xs text-gray-500 ml-2">Technical prompt for AI generation</span>
                    </label>
                    <textarea
                      value={customPrompt.basePrompt}
                      onChange={(e) => handleEditField('basePrompt', e.target.value)}
                      className="w-full h-20 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm"
                      placeholder="(custom room), ((unique materials)), ((personal style))..."
                    />
                  </div>

                  {/* Style Variations */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Style Variations ({customPrompt.styleVariations.length}/9)
                      </label>
                      {customPrompt.styleVariations.length < 9 && (
                        <button
                          onClick={handleAddVariation}
                          className="text-purple-600 hover:text-purple-700 text-sm"
                        >
                          + Add Variation
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {customPrompt.styleVariations.map((variation, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <textarea
                            value={variation}
                            onChange={(e) => handleEditVariation(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none text-sm"
                            rows={2}
                            placeholder={`Style variation ${index + 1}...`}
                          />
                          <button
                            onClick={() => handleRemoveVariation(index)}
                            className="flex-shrink-0 text-red-500 hover:text-red-700 px-2"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setCurrentStep('input')}
                    className="btn-secondary"
                  >
                    ← Back to Edit
                  </button>
                  <button
                    onClick={handleSaveCustomPrompt}
                    className="btn-primary"
                  >
                    💾 Save Custom Room Type
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomPromptCreator;