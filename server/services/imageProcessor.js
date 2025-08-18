import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const PROCESSED_DIR = path.join(UPLOADS_DIR, 'processed');

// Ensure directories exist
await fs.mkdir(UPLOADS_DIR, { recursive: true });
await fs.mkdir(PROCESSED_DIR, { recursive: true });

export async function processSquareImage(imageUrl, number, styleDescription) {
  try {
    console.log(`🔄 Processing image ${number} to square format...`);

    // Download the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`);
    }
    
    const imageBuffer = Buffer.from(await response.arrayBuffer());
    
    // Process image to 1080x1080 square
    const processedBuffer = await sharp(imageBuffer)
      .resize(1080, 1080, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({
        quality: 95,
        progressive: true
      })
      .toBuffer();

    // Add number overlay
    const finalBuffer = await addNumberOverlay(processedBuffer, number);
    
    // Save processed image
    const filename = `bedroom-option-${number}-${uuidv4()}.jpg`;
    const filepath = path.join(PROCESSED_DIR, filename);
    
    await fs.writeFile(filepath, finalBuffer);
    
    // Generate URLs
    const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
    const imageUrl_processed = `${baseUrl}/uploads/processed/${filename}`;
    
    console.log(`✅ Processed image ${number} saved as ${filename}`);
    
    return {
      id: `option-${number}`,
      number: number,
      url: imageUrl_processed,
      style: styleDescription,
      downloadUrl: imageUrl_processed,
      shareUrl: imageUrl_processed,
      filename: filename,
      filepath: filepath
    };

  } catch (error) {
    console.error(`❌ Failed to process image ${number}:`, error);
    throw error;
  }
}

export async function addNumberOverlay(imageBuffer, number) {
  try {
    // Create number overlay
    const overlaySize = 64;
    const padding = 16;
    
    const numberOverlay = Buffer.from(
      `<svg width="${overlaySize}" height="${overlaySize}">
        <circle cx="${overlaySize/2}" cy="${overlaySize/2}" r="${overlaySize/2 - 2}" 
                fill="rgba(0,0,0,0.8)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
        <text x="${overlaySize/2}" y="${overlaySize/2 + 6}" 
              text-anchor="middle" font-family="Arial, sans-serif" 
              font-size="28" font-weight="bold" fill="white">${number}</text>
      </svg>`
    );

    // Composite the number overlay onto the image
    const result = await sharp(imageBuffer)
      .composite([
        {
          input: numberOverlay,
          top: padding,
          left: padding
        }
      ])
      .jpeg({ quality: 95 })
      .toBuffer();

    return result;
    
  } catch (error) {
    console.error('Error adding number overlay:', error);
    return imageBuffer; // Return original if overlay fails
  }
}

export async function processUserImage(imageBuffer) {
  try {
    console.log('🔍 Analyzing user uploaded image...');
    
    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();
    console.log(`📏 Image dimensions: ${metadata.width}x${metadata.height}, format: ${metadata.format}`);
    
    // Basic image analysis
    const analysis = await analyzeImageColors(imageBuffer);
    
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      dominantColors: analysis.dominantColors,
      brightness: analysis.brightness,
      lighting: analysis.lighting,
      style: analysis.style
    };
    
  } catch (error) {
    console.error('Error processing user image:', error);
    throw error;
  }
}

async function analyzeImageColors(imageBuffer) {
  try {
    // Get image statistics
    const { dominant } = await sharp(imageBuffer)
      .resize(100, 100)
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    // Simple color analysis (this could be enhanced with more sophisticated color detection)
    const stats = await sharp(imageBuffer).stats();
    
    // Determine dominant colors based on channel means
    const dominantColors = [];
    const rMean = stats.channels[0].mean;
    const gMean = stats.channels[1].mean;
    const bMean = stats.channels[2].mean;
    
    if (rMean > gMean && rMean > bMean) {
      dominantColors.push('warm red');
    } else if (gMean > rMean && gMean > bMean) {
      dominantColors.push('natural green');
    } else if (bMean > rMean && bMean > gMean) {
      dominantColors.push('cool blue');
    }
    
    // Determine brightness level
    const avgBrightness = (rMean + gMean + bMean) / 3;
    let brightness, lighting;
    
    if (avgBrightness < 85) {
      brightness = 'dark';
      lighting = 'moody ambient';
    } else if (avgBrightness < 170) {
      brightness = 'medium';
      lighting = 'balanced natural';
    } else {
      brightness = 'bright';
      lighting = 'bright airy';
    }
    
    // Basic style detection based on color distribution
    let style = 'contemporary';
    if (gMean > rMean + 20) {
      style = 'natural organic';
    } else if (Math.abs(rMean - gMean) < 10 && Math.abs(gMean - bMean) < 10) {
      style = 'minimalist neutral';
    }
    
    return {
      dominantColors,
      brightness,
      lighting,
      style
    };
    
  } catch (error) {
    console.error('Error analyzing image colors:', error);
    return {
      dominantColors: ['neutral'],
      brightness: 'medium',
      lighting: 'natural',
      style: 'contemporary'
    };
  }
}

// Helper function to create thumbnail versions
export async function createThumbnail(imageBuffer, size = 300) {
  return await sharp(imageBuffer)
    .resize(size, size, {
      fit: 'cover',
      position: 'center'
    })
    .jpeg({ quality: 80 })
    .toBuffer();
}

// Clean up old processed images (call periodically)
export async function cleanupOldImages(maxAgeHours = 24) {
  try {
    const files = await fs.readdir(PROCESSED_DIR);
    const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);
    
    let deletedCount = 0;
    for (const file of files) {
      const filepath = path.join(PROCESSED_DIR, file);
      const stats = await fs.stat(filepath);
      
      if (stats.mtime.getTime() < cutoffTime) {
        await fs.unlink(filepath);
        deletedCount++;
      }
    }
    
    if (deletedCount > 0) {
      console.log(`🧹 Cleaned up ${deletedCount} old processed images`);
    }
    
  } catch (error) {
    console.error('Error cleaning up old images:', error);
  }
}
