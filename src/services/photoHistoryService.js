const STORAGE_KEY = 'dreamBedroom_photoHistory';
const MAX_COLLECTIONS = 3; // Keep only the last 3 collections

export const photoHistoryService = {
  // Save a new collection of generated images
  saveCollection(roomType, images, userImageUrl = null) {
    try {
      const collections = this.getAllCollections();
      
      const newCollection = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        roomType,
        userImageUrl,
        images: images.map(img => ({
          id: img.id,
          number: img.number,
          url: img.url,
          downloadUrl: img.downloadUrl,
          style: img.style
        })),
        createdAt: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      
      // Add to beginning of array (most recent first)
      collections.unshift(newCollection);
      
      // Keep only the most recent collections to prevent storage overflow
      const limitedCollections = collections.slice(0, MAX_COLLECTIONS);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedCollections));
      
      return newCollection.id;
    } catch (error) {
      console.error('Failed to save collection to localStorage:', error);
      return null;
    }
  },

  // Get all saved collections
  getAllCollections() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load collections from localStorage:', error);
      return [];
    }
  },

  // Get a specific collection by ID
  getCollection(id) {
    const collections = this.getAllCollections();
    return collections.find(collection => collection.id === id);
  },

  // Delete a specific collection
  deleteCollection(id) {
    try {
      const collections = this.getAllCollections();
      const filtered = collections.filter(collection => collection.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Failed to delete collection:', error);
      return false;
    }
  },

  // Clear all saved collections
  clearAll() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Failed to clear all collections:', error);
      return false;
    }
  },

  // Check if collections are at maximum limit
  isAtMaxLimit() {
    return this.getAllCollections().length >= MAX_COLLECTIONS;
  },

  // Get collections count
  getCollectionsCount() {
    return this.getAllCollections().length;
  },

  // Get maximum collections allowed
  getMaxCollections() {
    return MAX_COLLECTIONS;
  },

  // Get storage usage info
  getStorageInfo() {
    try {
      const collections = this.getAllCollections();
      const storageSize = new Blob([localStorage.getItem(STORAGE_KEY) || '']).size;
      const maxSize = 5 * 1024 * 1024; // Approximate 5MB limit
      
      return {
        collectionsCount: collections.length,
        storageSize,
        maxSize,
        usagePercentage: Math.round((storageSize / maxSize) * 100)
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return {
        collectionsCount: 0,
        storageSize: 0,
        maxSize: 5 * 1024 * 1024,
        usagePercentage: 0
      };
    }
  }
};