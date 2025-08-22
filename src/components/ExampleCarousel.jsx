import React, { useState, useEffect } from 'react';

const ExampleCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate images every 3 seconds
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  if (!images || images.length === 0) {
    return (
      <div className="relative h-48 bg-gray-200 rounded-xl flex items-center justify-center">
        <p className="text-gray-500">No example images available</p>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Main carousel container */}
      <div className="relative h-48 md:h-56 overflow-hidden rounded-xl shadow-lg">
        <div 
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div key={index} className="w-full h-full flex-shrink-0 relative">
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {/* Image number overlay */}
              <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
                {image.number || index + 1}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              ←
            </button>
            <button
              onClick={goToNext}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              →
            </button>
          </>
        )}

        {/* Progress indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex 
                    ? 'bg-white scale-110' 
                    : 'bg-white/60 hover:bg-white/80'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Caption below carousel */}
      <div className="mt-3 text-center">
        <p className="text-sm text-gray-600">
          Example Results: {currentIndex + 1} of {images.length}
        </p>
      </div>
    </div>
  );
};

export default ExampleCarousel;