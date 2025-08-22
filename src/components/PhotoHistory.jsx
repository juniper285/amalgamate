import React, { useState, useEffect } from 'react';
import { photoHistoryService } from '../services/photoHistoryService';
import ShareModal from './ShareModal';

const PhotoHistory = ({ onBack }) => {
  const [collections, setCollections] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [storageInfo, setStorageInfo] = useState({});

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = () => {
    const savedCollections = photoHistoryService.getAllCollections();
    const info = photoHistoryService.getStorageInfo();
    setCollections(savedCollections);
    setStorageInfo(info);
  };

  const handleDeleteCollection = (collectionId) => {
    if (window.confirm('Are you sure you want to delete this collection?')) {
      photoHistoryService.deleteCollection(collectionId);
      loadCollections();
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all saved collections? This cannot be undone.')) {
      photoHistoryService.clearAll();
      loadCollections();
    }
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const getRoomTypeDisplay = (roomType) => {
    return roomType.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getRoomTypeEmoji = (roomType) => {
    const emojiMap = {
      'cozy-cabin': '🏠',
      'modern-luxury': '✨',
      'fantasy-magical': '🧚‍♀️',
      'tropical-paradise': '🌺',
      'vintage-romantic': '💕',
      'minimalist-zen': '🧘‍♂️'
    };
    return emojiMap[roomType] || '🛏️';
  };

  if (collections.length === 0) {
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Photo History 📚
              </h1>
            </div>
          </div>

          {/* Empty state */}
          <div className="max-w-2xl mx-auto">
            <div className="glass-card rounded-2xl p-12 text-center">
              <div className="text-6xl mb-6">📸</div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">No Saved Collections Yet</h2>
              <p className="text-gray-600 mb-8">
                Start creating bedroom collections and they'll automatically be saved here for you to revisit anytime!
              </p>
              <button
                onClick={onBack}
                className="btn-primary"
              >
                Create Your First Collection
              </button>
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
                Photo History 📚
              </h1>
              <p className="text-gray-600 text-sm">
                {storageInfo.collectionsCount} of 3 collections saved • Auto-saves your most recent collections
              </p>
            </div>
          </div>
          
          {collections.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-red-600 hover:text-red-700 text-sm underline"
            >
              Clear All History
            </button>
          )}
        </div>

        {/* Collections Grid */}
        <div className="grid gap-6">
          {collections.map((collection) => (
            <div key={collection.id} className="glass-card rounded-2xl p-6">
              {/* Collection Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getRoomTypeEmoji(collection.roomType)}</span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {getRoomTypeDisplay(collection.roomType)}
                    </h3>
                    <p className="text-sm text-gray-600">{collection.createdAt}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleDeleteCollection(collection.id)}
                  className="text-red-500 hover:text-red-700 p-1 rounded"
                  title="Delete collection"
                >
                  🗑️
                </button>
              </div>

              {/* Images Grid */}
              <div className="grid grid-cols-3 gap-4">
                {collection.images.map((image) => (
                  <div 
                    key={image.id} 
                    className="relative group cursor-pointer"
                    onClick={() => handleImageClick(image)}
                  >
                    <img
                      src={image.url}
                      alt={`Bedroom option ${image.number}`}
                      className="w-full aspect-square object-cover rounded-xl shadow-sm group-hover:shadow-md transition-shadow duration-200"
                    />
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-sm">
                      {image.number}
                    </div>
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center">
                      <span className="text-white text-sm font-medium">View & Download</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ShareModal
          image={selectedImage}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default PhotoHistory;