import React, { useRef, useState } from 'react';

const ImageUpload = ({ onImageUpload, onSkip, onBack }) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    // For mobile camera capture
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onImageUpload(selectedFile);
    }
  };

  const clearImage = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="glass-card rounded-2xl p-8">
      {/* Back button */}
      {onBack && (
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            ← Back to Home
          </button>
        </div>
      )}
      
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">
          Upload Your Room Photo (Optional)
        </h2>
        <p className="text-gray-600">
          Help us understand your space better for more personalized results
        </p>
      </div>

      {!preview ? (
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            dragActive 
              ? 'border-purple-400 bg-purple-50' 
              : 'border-gray-300 hover:border-purple-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="text-6xl">📷</div>
            <div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drop your room image here
              </p>
              <p className="text-gray-500 text-sm">
                or click to browse files
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary"
              >
                📁 Browse Files
              </button>
              <button
                onClick={handleCameraCapture}
                className="btn-secondary"
              >
                📸 Use Camera
              </button>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <img
              src={preview}
              alt="Room preview"
              className="max-w-full max-h-64 rounded-xl shadow-lg"
            />
            <button
              onClick={clearImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              ×
            </button>
          </div>
          
          <div className="space-x-4">
            <button
              onClick={handleUpload}
              className="btn-primary"
            >
              ✨ Use This Photo
            </button>
            <button
              onClick={clearImage}
              className="btn-secondary"
            >
              🔄 Choose Different Photo
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <button
          onClick={onSkip}
          className="text-gray-500 hover:text-gray-700 underline"
        >
          Skip - Start with blank canvas instead →
        </button>
      </div>

      <div className="mt-6 text-xs text-gray-400 text-center">
        <p>💡 Tip: Room photos with good lighting work best</p>
        <p>Supported formats: JPG, PNG, WebP (max 10MB)</p>
      </div>
    </div>
  );
};

export default ImageUpload;
