import React, { useState } from 'react';

const ShareModal = ({ image, onClose }) => {
  const [downloadingHD, setDownloadingHD] = useState(false);

  const handleDownload = async (quality = 'standard') => {
    try {
      if (quality === 'hd') {
        setDownloadingHD(true);
      }

      const response = await fetch(image.downloadUrl || image.url);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bedroom-option-${image.number}${quality === 'hd' ? '-hd' : ''}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="glass-card rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            ×
          </button>
          
          <div className="p-6">
            <div className="relative mb-6">
              <img
                src={image.url}
                alt={`Bedroom option ${image.number}`}
                className="w-full rounded-xl"
              />
              <div className="absolute top-4 left-4 option-number text-lg">
                {image.number}
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2 text-gray-800">
                Bedroom Option {image.number}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {image.style}
              </p>
              
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p className="font-medium text-gray-700 mb-1">Suggested Caption:</p>
                <p className="text-gray-600 italic">
                  "Option {image.number}: Where would you sleep best? 🛏️✨"
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleDownload('standard')}
                  className="btn-secondary text-sm"
                >
                  📥 Download Standard
                </button>
                <button
                  onClick={() => handleDownload('hd')}
                  className="btn-secondary text-sm"
                  disabled={downloadingHD}
                >
                  {downloadingHD ? '⏳ Downloading...' : '📥 Download HD'}
                </button>
              </div>
              
              <button
                onClick={handleShare}
                className="btn-primary w-full"
              >
                📱 Share to Social Media
              </button>
              
              <button
                onClick={handleCopyCaption}
                className="w-full text-gray-600 hover:text-gray-800 underline text-sm"
              >
                📝 Copy Caption Only
              </button>
            </div>
            
            <div className="mt-6 text-xs text-gray-400 text-center space-y-1">
              <p>Image: 1080x1080px • Perfect for Instagram</p>
              <p>💡 Post this image with polling stickers for engagement</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
