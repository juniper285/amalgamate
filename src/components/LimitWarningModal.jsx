import React from 'react';

const LimitWarningModal = ({ isOpen, onClose, onProceed }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-white/20">
        {/* Header */}
        <div className="p-6 pb-4 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2 text-gray-900">
            Storage Limit Reached
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            You already have 3 saved collections (the maximum). Creating a new collection 
            will automatically delete your oldest saved collection to make room.
          </p>
        </div>

        {/* Info box */}
        <div className="mx-6 mb-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
          <p className="text-sm text-gray-700 mb-2">
            <strong>What happens next:</strong>
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Your oldest collection will be permanently deleted</li>
            <li>• The new collection will be saved</li>
            <li>• You'll always have access to your 3 most recent collections</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 space-y-3">
          <button
            onClick={onProceed}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
          >
            Continue & Replace Oldest Collection
          </button>
          
          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default LimitWarningModal;