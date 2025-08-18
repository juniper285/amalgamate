import express from 'express';
import { roomTypes, styleVariations } from '../config/styles.js';

const router = express.Router();

// Get all available room types and styles
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        roomTypes,
        styleVariations,
        totalVariations: Object.values(styleVariations).reduce((total, variations) => total + variations.length, 0)
      }
    });
  } catch (error) {
    console.error('Error fetching styles:', error);
    res.status(500).json({ 
      error: 'Failed to fetch styles',
      message: error.message 
    });
  }
});

// Get specific room type details
router.get('/:roomType', (req, res) => {
  try {
    const { roomType } = req.params;
    
    const roomTypeData = roomTypes.find(type => type.id === roomType);
    if (!roomTypeData) {
      return res.status(404).json({ error: 'Room type not found' });
    }

    const variations = styleVariations[roomType] || [];
    
    res.json({
      success: true,
      data: {
        roomType: roomTypeData,
        variations,
        totalVariations: variations.length
      }
    });
  } catch (error) {
    console.error('Error fetching room type:', error);
    res.status(500).json({ 
      error: 'Failed to fetch room type',
      message: error.message 
    });
  }
});

// Get random style combinations for inspiration
router.get('/inspiration/random', (req, res) => {
  try {
    const { count = 3 } = req.query;
    const inspirations = [];

    for (let i = 0; i < Math.min(count, 6); i++) {
      const randomRoomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
      const variations = styleVariations[randomRoomType.id] || [];
      const randomVariation = variations[Math.floor(Math.random() * variations.length)];
      
      inspirations.push({
        roomType: randomRoomType,
        variation: randomVariation,
        combinedPrompt: `${randomVariation}, ${randomRoomType.basePrompt}`
      });
    }

    res.json({
      success: true,
      data: {
        inspirations,
        generated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating inspiration:', error);
    res.status(500).json({ 
      error: 'Failed to generate inspiration',
      message: error.message 
    });
  }
});

export default router;
