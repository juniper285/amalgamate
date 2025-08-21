import { useState } from 'react';
import ImageUpload from './components/ImageUpload';
import TypeSelector from './components/TypeSelector';
import OptionsGrid from './components/OptionsGrid';
import ProgressBar from './components/ProgressBar';

function App() {
  const [currentStep, setCurrentStep] = useState('welcome');
  const [userImage, setUserImage] = useState(null);
  const [selectedType, setSelectedType] = useState('');
  const [generationStrength, setGenerationStrength] = useState(0.6);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [generationProgress, setGenerationProgress] = useState({});

  const handleImageUpload = (image) => {
    setUserImage(image);
    setCurrentStep('typeSelection');
  };

  const handleTypeSelect = async (type, strength = 0.6) => {
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

  const generateImages = async (roomType, uploadedImage, strength) => {
    try {
      const formData = new FormData();
      formData.append('roomType', roomType);
      formData.append('generationStrength', strength);
      if (uploadedImage) {
        formData.append('userImage', uploadedImage);
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
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                  Upload a room photo (optional) and we'll generate 3 stunning bedroom variations 
                  perfect for your "Where would you sleep best?" Instagram post.
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
              </div>

              {/* Example Gallery Preview */}
              <div className="mt-12">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Example Results:</h3>
                <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto opacity-60">
                  {[1, 2, 3].map(num => (
                    <div key={num} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                      {num}
                    </div>
                  ))}
                </div>
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
            />
          )}

          {currentStep === 'generating' && (
            <div className="glass-card rounded-2xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">
                  Creating Your Dream Bedrooms ✨
                </h2>
                <p className="text-gray-600 mb-6">
                  Generating 3 unique {selectedType.replace('-', ' ')} bedroom variations...
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
    </div>
  );
}

export default App;
