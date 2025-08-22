import { useState, useEffect } from 'react';
import ImageUpload from './components/ImageUpload';
import TypeSelector from './components/TypeSelector';
import OptionsGrid from './components/OptionsGrid';
import ProgressBar from './components/ProgressBar';
import PhotoHistory from './components/PhotoHistory';
import LimitWarningModal from './components/LimitWarningModal';
import CustomPromptCreator from './components/CustomPromptCreator';
import ExampleCarousel from './components/ExampleCarousel';
import { photoHistoryService } from './services/photoHistoryService';
import { customPromptsService } from './services/customPromptsService';

function App() {
  const [currentStep, setCurrentStep] = useState('welcome');
  const [userImage, setUserImage] = useState(null);
  const [selectedType, setSelectedType] = useState('');
  const [generationStrength, setGenerationStrength] = useState(0.6);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [generationProgress, setGenerationProgress] = useState({});
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [pendingGeneration, setPendingGeneration] = useState(null);

  // Save collection when generation is complete
  useEffect(() => {
    if (currentStep === 'results' && generatedImages.length > 0 && selectedType) {
      const userImageUrl = userImage ? URL.createObjectURL(userImage) : null;
      photoHistoryService.saveCollection(selectedType, generatedImages, userImageUrl);
    }
  }, [currentStep, generatedImages, selectedType, userImage]);

  const handleImageUpload = (image) => {
    setUserImage(image);
    setCurrentStep('typeSelection');
  };

  const handleTypeSelect = async (type, strength = 0.6) => {
    // Check if we're at the collection limit
    if (photoHistoryService.isAtMaxLimit()) {
      // Store the generation params and show warning
      setPendingGeneration({ type, strength });
      setShowLimitWarning(true);
      return;
    }
    
    // Proceed with generation directly
    await startGeneration(type, strength);
  };

  const startGeneration = async (type, strength = 0.6) => {
    setSelectedType(type);
    setGenerationStrength(strength);
    setCurrentStep('generating');
    setIsGenerating(true);
    
    try {
      // Initialize progress tracking
      const initialProgress = {};
      for (let i = 1; i <= 3; i++) {
        initialProgress[i] = { status: 'pending', progress: 0 };
      }
      setGenerationProgress(initialProgress);
      
      // Start generation
      await generateImages(type, userImage, strength);
    } catch (error) {
      console.error('Generation failed:', error);
      setIsGenerating(false);
    }
  };

  const handleProceedWithGeneration = async () => {
    setShowLimitWarning(false);
    if (pendingGeneration) {
      await startGeneration(pendingGeneration.type, pendingGeneration.strength);
      setPendingGeneration(null);
    }
  };

  const handleCancelGeneration = () => {
    setShowLimitWarning(false);
    setPendingGeneration(null);
  };

  const getRoomTypeDisplayName = (roomTypeId) => {
    // Check if it's a custom room type
    if (roomTypeId.startsWith('custom-')) {
      const customRoomType = customPromptsService.getCustomPrompt(roomTypeId);
      return customRoomType ? customRoomType.name : 'custom';
    }
    
    // Default room types - convert kebab-case to title case
    return roomTypeId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Example images from public/assets folder
  const exampleImages = [
    {
      src: '/assets/bedroom-option-1-09eb45d2-756f-495f-b5b1-69d281b5e098.jpg',
      alt: 'Example bedroom design 1',
      number: 1,
      caption: 'Cozy bedroom with warm lighting'
    },
    {
      src: '/assets/bedroom-option-2-1fea8d85-42ef-43bd-954e-61c7645280b8.jpg',
      alt: 'Example bedroom design 2', 
      number: 2,
      caption: 'Modern luxury bedroom'
    },
    {
      src: '/assets/bedroom-option-3-4de04b0a-4bac-4c22-acfd-36621740ede0.jpg',
      alt: 'Example bedroom design 3',
      number: 3,
      caption: 'Minimalist zen bedroom'
    },
    {
      src: '/assets/bedroom-option-1-3853a65c-146e-4661-8f92-6104ffaa4bcd.jpg',
      alt: 'Example bedroom design 4',
      number: 1,
      caption: 'Fantasy magical bedroom'
    },
    {
      src: '/assets/bedroom-option-1-404d235a-1998-4685-be3b-870be32451bf.jpg',
      alt: 'Example bedroom design 5',
      number: 1,
      caption: 'Tropical paradise bedroom'
    },
    {
      src: '/assets/bedroom-option-3-f1c09598-89f4-42b9-8a40-85a12a2f5fa4.jpg',
      alt: 'Example bedroom design 6',
      number: 3,
      caption: 'Vintage romantic bedroom'
    },
    {
      src: '/assets/bedroom-option-1-ee480cd8-3868-44c1-ae25-b3e076924d62.jpg',
      alt: 'Example bedroom design 7',
      number: 1,
      caption: 'Dreamy bedroom sanctuary'
    }
  ];

  const generateImages = async (roomType, uploadedImage, strength) => {
    try {
      const formData = new FormData();
      formData.append('roomType', roomType);
      formData.append('generationStrength', strength);
      if (uploadedImage) {
        formData.append('userImage', uploadedImage);
      }

      // Check if this is a custom room type
      if (roomType.startsWith('custom-')) {
        const customRoomType = customPromptsService.getCustomPrompt(roomType);
        if (customRoomType) {
          formData.append('customRoomType', JSON.stringify(customRoomType));
        }
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'progress') {
                setGenerationProgress(prev => ({
                  ...prev,
                  [data.imageNumber]: {
                    status: data.status,
                    progress: data.progress
                  }
                }));
              } else if (data.type === 'complete') {
                setGeneratedImages(prev => [...prev, data.image]);
              } else if (data.type === 'finished') {
                setIsGenerating(false);
                setCurrentStep('results');
                
                // Save will be handled when generatedImages updates via useEffect
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Error generating images:', error);
      setIsGenerating(false);
    }
  };

  const resetApp = () => {
    setCurrentStep('welcome');
    setUserImage(null);
    setSelectedType('');
    setGenerationStrength(0.6);
    setGeneratedImages([]);
    setGenerationProgress({});
    setIsGenerating(false);
  };

  // Special cases: Full layout components
  if (currentStep === 'history') {
    return <PhotoHistory onBack={() => setCurrentStep('welcome')} />;
  }
  
  if (currentStep === 'createCustom') {
    return (
      <CustomPromptCreator 
        onBack={() => setCurrentStep('typeSelection')} 
        onSave={() => setCurrentStep('typeSelection')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Where Would You Sleep Best? 💭
          </h1>
          <p className="text-gray-600 text-lg">
            Transform your room into 3 dreamy bedroom variations for Instagram
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 'welcome' && (
            <div className="glass-card rounded-2xl p-8 text-center">
              <div className="mb-8">
                <div className="text-6xl mb-4">🛏️</div>
                <h2 className="text-2xl font-bold mb-4 text-gray-800">
                  Create Your Dream Bedroom Collection
                </h2>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Upload a room photo (optional) and we'll generate 3 stunning bedroom variations 
                  perfect for your "Where would you sleep best?" Instagram post.
                </p>
              </div>
              
              {/* Example Gallery Preview - moved up and made larger */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-6 text-gray-700 text-center">See What's Possible:</h3>
                <div className="max-w-2xl mx-auto">
                  <ExampleCarousel images={exampleImages} />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 max-w-md mx-auto mb-8">
                <p className="text-sm text-gray-600">
                  📚 <strong>Auto-Save:</strong> Your last 3 collections are automatically saved for easy access
                </p>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={() => setCurrentStep('upload')}
                  className="btn-primary block mx-auto"
                >
                  📸 Upload Room Photo & Start
                </button>
                <button
                  onClick={() => setCurrentStep('typeSelection')}
                  className="btn-secondary block mx-auto"
                >
                  🎨 Start with Blank Canvas
                </button>
                <button
                  onClick={() => setCurrentStep('history')}
                  className="btn-secondary block mx-auto"
                >
                  📚 View Saved Collections
                </button>
              </div>
            </div>
          )}

          {currentStep === 'upload' && (
            <ImageUpload
              onImageUpload={handleImageUpload}
              onSkip={() => setCurrentStep('typeSelection')}
            />
          )}

          {currentStep === 'typeSelection' && (
            <TypeSelector
              onTypeSelect={handleTypeSelect}
              onBack={() => setCurrentStep(userImage ? 'upload' : 'welcome')}
              onCreateCustom={() => setCurrentStep('createCustom')}
            />
          )}

          {currentStep === 'generating' && (
            <div className="glass-card rounded-2xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">
                  Creating Your Dream Bedrooms ✨
                </h2>
                <p className="text-gray-600 mb-6">
                  Generating 3 unique {getRoomTypeDisplayName(selectedType)} bedroom variations...
                </p>
              </div>
              
              <ProgressBar progress={generationProgress} />
              
              {generatedImages.length > 0 && (
                <div className="mt-8">
                  <OptionsGrid 
                    images={generatedImages}
                    isGenerating={true}
                  />
                </div>
              )}
            </div>
          )}

          {currentStep === 'results' && (
            <div className="glass-card rounded-2xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">
                  Your Dream Bedroom Collection 🎉
                </h2>
                <p className="text-gray-600 mb-6">
                  Click any image to download or share individually
                </p>
              </div>
              
              <OptionsGrid 
                images={generatedImages}
                isGenerating={false}
              />
              
              <div className="text-center mt-8 space-x-4">
                <button
                  onClick={resetApp}
                  className="btn-secondary"
                >
                  🔄 Create Another Collection
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Limit Warning Modal */}
      <LimitWarningModal
        isOpen={showLimitWarning}
        onClose={handleCancelGeneration}
        onProceed={handleProceedWithGeneration}
      />
    </div>
  );
}

export default App;
