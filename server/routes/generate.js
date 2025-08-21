import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateSleepOptions } from '../services/aiImageService.js';
import { processUserImage } from '../services/imageProcessor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  }
});

// Main generation endpoint
router.post('/', upload.single('userImage'), async (req, res) => {
  try {
    const { roomType, customPrompts, generationStrength } = req.body;
    const userImage = req.file;
    
    // Parse generation strength with default fallback
    const strength = generationStrength ? parseFloat(generationStrength) : 0.6;

    // Validate required fields
    if (!roomType) {
      return res.status(400).json({ error: 'Room type is required' });
    }

    console.log(`🎨 Starting generation for room type: ${roomType}`);
    
    // Set up Server-Sent Events for real-time progress
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Process user image if provided
    let roomFeatures = null;
    if (userImage) {
      console.log('🖼️  Processing user image...');
      try {
        roomFeatures = await processUserImage(userImage.buffer);
        res.write(`data: ${JSON.stringify({ type: 'image_processed', features: roomFeatures })}\n\n`);
      } catch (error) {
        console.error('Image processing failed:', error);
        res.write(`data: ${JSON.stringify({ type: 'warning', message: 'Could not process uploaded image, proceeding without it' })}\n\n`);
      }
    }

    // Generate images with progress updates
    await generateSleepOptions(roomType, roomFeatures, customPrompts, userImage?.buffer, strength, (update) => {
      res.write(`data: ${JSON.stringify(update)}\n\n`);
    });

    // Signal completion
    res.write(`data: ${JSON.stringify({ type: 'finished' })}\n\n`);
    res.end();

  } catch (error) {
    console.error('Generation error:', error);
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Generation failed',
        message: error.message 
      });
    } else {
      res.write(`data: ${JSON.stringify({ 
        type: 'error', 
        message: error.message 
      })}\n\n`);
      res.end();
    }
  }
});

// Get generation status (for polling-based clients)
router.get('/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // This would typically check a database or cache for job status
    // For now, return a placeholder response
    res.json({
      jobId,
      status: 'processing',
      progress: 50,
      completedImages: 4,
      totalImages: 9
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
