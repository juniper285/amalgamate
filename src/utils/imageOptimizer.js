export const imageOptimizer = {
  // Resize image to specific dimensions while maintaining aspect ratio
  resizeImage(file, maxWidth = 1024, maxHeight = 1024, quality = 0.9) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = this.calculateDimensions(
          img.width, 
          img.height, 
          maxWidth, 
          maxHeight
        );

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };

      img.src = URL.createObjectURL(file);
    });
  },

  // Convert image to square format (1:1 aspect ratio)
  makeSquare(file, size = 1080, quality = 0.95) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = size;
        canvas.height = size;

        // Calculate crop dimensions to maintain center focus
        const { cropX, cropY, cropWidth, cropHeight } = this.calculateCrop(
          img.width, 
          img.height, 
          size
        );

        ctx.drawImage(
          img, 
          cropX, cropY, cropWidth, cropHeight,
          0, 0, size, size
        );

        canvas.toBlob(resolve, 'image/jpeg', quality);
      };

      img.src = URL.createObjectURL(file);
    });
  },

  // Calculate optimal dimensions maintaining aspect ratio
  calculateDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
    let width = originalWidth;
    let height = originalHeight;

    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    return { width: Math.round(width), height: Math.round(height) };
  },

  // Calculate crop dimensions for square format
  calculateCrop(width, height, targetSize) {
    const aspectRatio = width / height;
    let cropWidth, cropHeight, cropX, cropY;

    if (aspectRatio > 1) {
      // Landscape: crop sides
      cropHeight = height;
      cropWidth = height;
      cropX = (width - cropWidth) / 2;
      cropY = 0;
    } else {
      // Portrait: crop top/bottom
      cropWidth = width;
      cropHeight = width;
      cropX = 0;
      cropY = (height - cropHeight) / 2;
    }

    return { cropX, cropY, cropWidth, cropHeight };
  },

  // Create a preview URL from file
  createPreviewUrl(file) {
    return URL.createObjectURL(file);
  },

  // Clean up preview URL
  revokePreviewUrl(url) {
    URL.revokeObjectURL(url);
  },

  // Validate image file
  validateImage(file, maxSize = 10 * 1024 * 1024) { // 10MB default
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
    }

    if (file.size > maxSize) {
      throw new Error(`File too large. Please upload an image smaller than ${Math.round(maxSize / 1024 / 1024)}MB.`);
    }

    return true;
  },

  // Extract image metadata
  getImageInfo(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          aspectRatio: img.width / img.height,
          megapixels: (img.width * img.height) / 1000000,
          fileSize: file.size,
          type: file.type
        });
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }
};
