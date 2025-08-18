import React, { useState } from 'react';
import ImageCard from './ImageCard';
import ShareModal from './ShareModal';

const OptionsGrid = ({ images, isGenerating }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  // Create array with placeholders for loading states
  const displayImages = Array.from({ length: 9 }, (_, index) => {
    const imageData = images.find(img => img.number === index + 1);
    return imageData || { number: index + 1, loading: true };
  });

  return (
    <>
      <div className="options-grid">
        {displayImages.map((image, index) => (
          <ImageCard
            key={image.id || `placeholder-${index}`}
            image={image}
            onClick={() => !image.loading && handleImageClick(image)}
            isLoading={image.loading || isGenerating}
          />
        ))}
      </div>

      {!isGenerating && images.length > 0 && (
        <div className="text-center mt-6 space-y-4">
          <p className="text-gray-600">
            💡 Click any image to download or share individually
          </p>
          
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                // Download all images as a zip
                // Implementation would depend on backend support
                console.log('Download all clicked');
              }}
              className="btn-secondary text-sm"
            >
              📦 Download All Images
            </button>
            
            <button
              onClick={() => {
                // Share collection to Instagram
                const text = `Where would you sleep best? 🛏️✨\n\nPick your favorite from these 9 dreamy bedroom options!\n\n#WhereWouldYouSleepBest #BedroomGoals #DreamBedroom`;
                if (navigator.share) {
                  navigator.share({
                    title: 'Where Would You Sleep Best?',
                    text: text,
                  });
                } else {
                  navigator.clipboard.writeText(text);
                  alert('Caption copied to clipboard!');
                }
              }}
              className="btn-primary text-sm"
            >
              📱 Share Collection
            </button>
          </div>
          
          <div className="text-xs text-gray-400 max-w-md mx-auto">
            Perfect for Instagram posts! Each image is optimized as a square (1080x1080) 
            and numbered for easy reference in your story polls.
          </div>
        </div>
      )}

      {selectedImage && (
        <ShareModal
          image={selectedImage}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default OptionsGrid;
