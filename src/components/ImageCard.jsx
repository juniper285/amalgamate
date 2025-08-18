import React from 'react';

const ImageCard = ({ image, onClick, isLoading }) => {
  if (isLoading || !image.url) {
    return (
      <div className="option-card loading-skeleton">
        <div className="option-number">
          {image.number}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2" />
            <div className="text-xs opacity-75">Generating...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="option-card group"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
    >
      <img
        src={image.url}
        alt={`Bedroom option ${image.number}: ${image.style}`}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      
      <div className="option-number">
        {image.number}
      </div>
      
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
        <div className="text-center text-white p-4">
          <div className="text-2xl mb-2">👁️</div>
          <div className="text-sm font-medium">View & Share</div>
        </div>
      </div>
      
      {/* Style tag */}
      {image.style && (
        <div className="absolute bottom-2 left-2 right-2">
          <div className="bg-black/70 text-white text-xs px-2 py-1 rounded truncate">
            {image.style}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCard;
