import React, { useState } from 'react';

const ShareModal = ({ image, onClose }) => {
  const [downloadingHD, setDownloadingHD] = useState(false);

  const handleDownload = async (quality = 'standard') => {
    try {
      if (quality === 'hd') {
        setDownloadingHD(true);
      }

      // Fetch the image from the provided URL
      const response = await fetch(image.downloadUrl || image.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element to trigger the download
      const a = document.createElement('a');
      a.href = url;
      a.download = `bedroom-option-${image.number}${quality === 'hd' ? '-hd' : ''}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Revoke the object URL to free memory
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    } finally {
      setDownloadingHD(false);
    }
  };

  const handleShare = async () => {
    const shareText = `Option ${image.number}: Where would you sleep best? 🛏️✨\n\n${image.style}\n\n#WhereWouldYouSleepBest #BedroomGoals #DreamBedroom`;
    
    if (navigator.share && navigator.canShare) {
      try {
        const response = await fetch(image.url);
        const blob = await response.blob();
        const file = new File([blob], `bedroom-option-${image.number}.jpg`, { type: 'image/jpeg' });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Bedroom Option ${image.number}`,
            text: shareText,
            files: [file]
          });
          return;
        }
      } catch (error) {
        console.log('Native sharing with image failed, falling back to text');
      }
      
      // Fallback to text sharing
      try {
        await navigator.share({
          title: `Bedroom Option ${image.number}`,
          text: shareText,
          url: window.location.href
        });
      } catch (error) {
        // If sharing fails, copy to clipboard
        navigator.clipboard.writeText(shareText);
        alert('Share text copied to clipboard!');
      }
    } else {
      // Fallback: copy text to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Share text copied to clipboard! You can paste it when sharing the image.');
      } catch (error) {
        console.error('Clipboard access failed');
      }
    }
  };

  const handleCopyCaption = () => {
    const caption = `Option ${image.number}: Where would you sleep best? 🛏️✨\n\n${image.style}\n\n#WhereWouldYouSleepBest #BedroomGoals #DreamBedroom`;
    navigator.clipboard.writeText(caption);
    alert('Caption copied to clipboard!');
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-in fade-in duration-300" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl transform animate-in slide-in-from-bottom-8 duration-300 border border-white/20" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close button */}
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-black/10 hover:bg-black/20 text-gray-700 rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200 hover:scale-110"
          >
            ×
          </button>
        </div>

        {/* Main content - horizontal layout */}
        <div className="flex flex-col md:flex-row p-6 gap-6">
          {/* Image section */}
          <div className="flex-shrink-0">
            <div className="relative">
              <img
                src={image.url}
                alt={`Bedroom option ${image.number}`}
                className="w-72 h-72 object-cover rounded-2xl shadow-lg"
              />
              <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
                {image.number}
              </div>
            </div>
          </div>
          
          {/* Content and actions section */}
          <div className="flex-1 flex flex-col justify-between min-h-72">
            <div>
              {/* Title */}
              <h3 className="text-2xl font-bold mb-3 text-gray-900">
                Bedroom Option {image.number}
              </h3>
              
              {/* Style description */}
              {image.style && (
                <p className="text-gray-600 mb-6">
                  {image.style}
                </p>
              )}
              
              {/* Info box */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6">
                <p className="font-medium text-gray-700 mb-2">Perfect for Instagram</p>
                <p className="text-sm text-gray-600">1080x1080px • Add polling stickers for maximum engagement</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleDownload('standard')}
                  className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-medium hover:from-gray-200 hover:to-gray-300 transition-all duration-200 text-sm flex items-center justify-center gap-1"
                >
                  📥 Standard
                </button>
                <button
                  onClick={() => handleDownload('hd')}
                  className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-medium hover:from-gray-200 hover:to-gray-300 transition-all duration-200 text-sm flex items-center justify-center gap-1"
                  disabled={downloadingHD}
                >
                  {downloadingHD ? '⏳ Downloading...' : '📥 HD'}
                </button>
              </div>
              
              <button
                onClick={handleShare}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
              >
                📱 Share to Social Media
              </button>
              
              <button
                onClick={handleCopyCaption}
                className="w-full text-gray-500 hover:text-gray-700 text-sm py-2 transition-colors duration-200"
              >
                📝 Copy Caption Only
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
