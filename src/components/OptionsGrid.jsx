import React, { useState } from 'react';
import ImageCard from './ImageCard';
import ShareModal from './ShareModal';

const OptionsGrid = ({ images, isGenerating }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handleDownloadAll = async () => {
    if (images.length === 0) return;
    
    try {
      setDownloadingAll(true);
      
      for (const image of images) {
        // Fetch the image from the provided URL
        const response = await fetch(image.downloadUrl || image.url);
        if (!response.ok) {
          console.error(`Failed to fetch image ${image.number}:`, response.statusText);
          continue;
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        // Create a temporary anchor element to trigger the download
        const a = document.createElement('a');
        a.href = url;
        a.download = `bedroom-option-${image.number}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Revoke the object URL to free memory
        window.URL.revokeObjectURL(url);
        
        // Small delay between downloads to avoid overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (error) {
      console.error('Download all failed:', error);
      alert('Download failed for some images. Please try again.');
    } finally {
      setDownloadingAll(false);
    }
  };

  // Create array with placeholders for loading states
  const displayImages = Array.from({ length: 3 }, (_, index) => {
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
              onClick={handleDownloadAll}
              className="btn-secondary text-sm"
              disabled={downloadingAll}
            >
              {downloadingAll ? '⏳ Downloading...' : '📦 Download All Images'}
            </button>
            
            <button
              onClick={() => {
                // Share collection to Instagram
                const text = `Where would you sleep best? 🛏️✨\n\nPick your favorite from these 3 dreamy bedroom options!\n\n#WhereWouldYouSleepBest #BedroomGoals #DreamBedroom`;
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
