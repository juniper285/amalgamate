import { SogniClient } from '@sogni-ai/sogni-client';
import { buildVariationPrompts } from './promptService.js';
import { processSquareImage } from './imageProcessor.js';
import 'dotenv/config';
import { v4 as uuidv4 } from 'uuid';

// Initialize Sogni client only if API key is provided
let sogni = null;

async function initializeSogniClient() {
  try {
    console.log('Attempting to create SogniClient instance...');

    const sogni = await SogniClient.createInstance({
      appId: process.env.APP_ID,
      network: 'relaxed',
      restEndpoint: process.env.REST_ENDPOINT,
      socketEndpoint: process.env.SOCKET_ENDPOINT,
    });

    console.log('Sogni API client initialized successfully.');

    // Attach event listeners
    sogni.apiClient.on('connected', () => {
      console.log('Connected to Sogni API');
    });

    sogni.apiClient.on('disconnected', ({ code, reason }) => {
      console.error('Disconnected from Sogni API', code, reason);
      console.log('Restarting process in 5 seconds...');
      setTimeout(() => process.exit(1), 5000);
    });

    // Attempt to login
    console.log(process.env.APP_ID, process.env.SOGNI_USERNAME, process.env.SOGNI_PASSWORD);
    await sogni.account.login(process.env.SOGNI_USERNAME, process.env.SOGNI_PASSWORD);

    return sogni;
  } catch (error) {
    console.error('Error initializing Sogni API client:', error);
    console.error('Exiting in 5 seconds...');
    setTimeout(() => process.exit(1), 5000);
    throw error;
  }
}

(async () => {
  sogni = await initializeSogniClient();
})();

export async function generateSleepOptions(roomType, roomFeatures = null, customPrompts = null, progressCallback) {
  try {
    console.log(`🎨 Generating 9 images for room type: ${roomType}`);
    
    // Build all 9 prompts
    const prompts = buildVariationPrompts(roomType, roomFeatures, customPrompts);
    console.log(`📝 Built ${prompts.length} prompts`);

    const results = [];
    const batchSize = 3; // Generate 3 images at a time to manage API limits

    for (let i = 0; i < prompts.length; i += batchSize) {
      const batch = prompts.slice(i, i + batchSize);
      
      // Generate batch concurrently
      const batchPromises = batch.map(async (promptData, batchIndex) => {
        const imageNumber = i + batchIndex + 1;
        
        try {
          // Update progress to "generating"
          progressCallback({
            type: 'progress',
            imageNumber,
            status: 'generating',
            progress: 0
          });

          console.log(`🖼️  Generating image ${imageNumber}: ${promptData.style}`);

          // Generate image using Sogni
          const imageUrl = await generateWithSogni(promptData.prompt, imageNumber, progressCallback);
          
          // Process to square format with number overlay
          const processedImage = await processSquareImage(imageUrl, imageNumber, promptData.style);
          
          // Update progress to complete
          progressCallback({
            type: 'progress',
            imageNumber,
            status: 'complete',
            progress: 100
          });

          // Send completed image
          progressCallback({
            type: 'complete',
            image: {
              id: promptData.id,
              number: imageNumber,
              url: processedImage.url,
              style: promptData.style,
              downloadUrl: processedImage.downloadUrl,
              shareUrl: processedImage.shareUrl
            }
          });

          return processedImage;
          
        } catch (error) {
          console.error(`❌ Failed to generate image ${imageNumber}:`, error);
          
          progressCallback({
            type: 'progress',
            imageNumber,
            status: 'error',
            progress: 0,
            error: error.message
          });
          
          // Return placeholder or retry logic could go here
          throw error;
        }
      });

      // Wait for current batch to complete before starting next batch
      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // Small delay between batches to be respectful to API
        if (i + batchSize < prompts.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`❌ Batch ${Math.floor(i / batchSize) + 1} failed:`, error);
        // Continue with next batch even if some images fail
      }
    }

    console.log(`✅ Generation complete: ${results.length}/9 images successful`);
    return results;

  } catch (error) {
    console.error('❌ Generation failed:', error);
    throw error;
  }
}

async function generateWithSogni(prompt, imageNumber, progressCallback) {
  try {
    // Check if Sogni client is available
    if (!sogni) {
      console.log(`🎭 Mock generating image ${imageNumber} (no API key)`);
      // Return a demo/placeholder image for development
      return await generateMockImage(prompt, imageNumber, progressCallback);
    }

    // Create generation request
    const response = await sogni.generateImage({
      prompt: prompt,
      width: 1080,
      height: 1080,
      steps: 30,
      guidance: 7.5,
      seed: Math.floor(Math.random() * 1000000),
      model: 'sdxl' // or your preferred model
    });

    // Poll for completion (Sogni-specific implementation)
    const imageUrl = await pollForCompletion(response.id, imageNumber, progressCallback);
    
    return imageUrl;
    
  } catch (error) {
    console.error(`Sogni generation error for image ${imageNumber}:`, error);
    // Fallback to mock generation if Sogni fails
    return await generateMockImage(prompt, imageNumber, progressCallback);
  }
}

// Mock image generation for development/demo purposes
async function generateMockImage(prompt, imageNumber, progressCallback) {
  console.log(`🎭 Generating mock image ${imageNumber}: ${prompt.substring(0, 50)}...`);
  
  // Simulate generation progress
  const progressSteps = [20, 40, 60, 80, 100];
  for (const progress of progressSteps) {
    progressCallback({
      type: 'progress',
      imageNumber,
      status: 'generating',
      progress
    });
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Return a placeholder image URL (you can replace this with actual placeholder images)
  const placeholderSize = 1080;
  const placeholderUrl = `https://via.placeholder.com/${placeholderSize}x${placeholderSize}/6366f1/ffffff?text=Bedroom+${imageNumber}`;
  
  return placeholderUrl;
}

async function pollForCompletion(jobId, imageNumber, progressCallback, maxAttempts = 60) {
  // Only run polling if sogni client is available
  if (!sogni) {
    throw new Error('Sogni client not available');
  }

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const status = await sogni.getGenerationStatus(jobId);
      
      if (status.status === 'completed' && status.imageUrl) {
        return status.imageUrl;
      } else if (status.status === 'failed') {
        throw new Error(status.error || 'Generation failed');
      } else if (status.status === 'processing') {
        // Update progress based on estimated completion
        const estimatedProgress = Math.min(90, (attempt / maxAttempts) * 100);
        progressCallback({
          type: 'progress',
          imageNumber,
          status: 'generating',
          progress: Math.floor(estimatedProgress)
        });
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      if (attempt === maxAttempts - 1) {
        throw error;
      }
      // Continue polling on temporary errors
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  throw new Error('Generation timeout - image took too long to complete');
}

// Alternative implementation using Replicate (uncomment if you prefer)
/*
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
});

async function generateWithReplicate(prompt, imageNumber, progressCallback) {
  try {
    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: prompt,
          width: 1080,
          height: 1080,
          num_outputs: 1,
          scheduler: "K_EULER",
          num_inference_steps: 30,
          guidance_scale: 7.5,
          prompt_strength: 0.8,
          seed: Math.floor(Math.random() * 1000000)
        }
      }
    );

    return Array.isArray(output) ? output[0] : output;
    
  } catch (error) {
    console.error(`Replicate generation error for image ${imageNumber}:`, error);
    throw new Error(`Failed to generate image ${imageNumber}: ${error.message}`);
  }
}
*/
