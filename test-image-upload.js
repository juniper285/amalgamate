#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';

// Simple test script to verify image-to-image generation works
async function testImageUpload() {
  try {
    console.log('🧪 Testing image-to-image generation...');
    
    // Create a simple test image (you can replace this with a real image path)
    const testImagePath = './test-bedroom.jpg'; // Replace with actual image path if available
    
    if (!fs.existsSync(testImagePath)) {
      console.log('⚠️  No test image found at', testImagePath);
      console.log('📝 To test with a real image:');
      console.log('   1. Place a bedroom image at ./test-bedroom.jpg');
      console.log('   2. Run this script again');
      console.log('   3. Or test manually by uploading through the web interface');
      return;
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('roomType', 'cozy-cabin');
    formData.append('userImage', fs.createReadStream(testImagePath));
    
    console.log('📤 Sending request to generate endpoint...');
    
    // Send request to generate endpoint
    const response = await fetch('http://localhost:3001/api/generate', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    console.log('📥 Receiving Server-Sent Events...');
    
    // Process Server-Sent Events
    const reader = response.body;
    let buffer = '';
    
    reader.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      
      // Process complete lines
      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i].trim();
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            console.log('📊 Progress:', data);
            
            if (data.type === 'complete') {
              console.log(`✅ Image ${data.image.number} completed:`, data.image.url);
            } else if (data.type === 'finished') {
              console.log('🎉 All images generated successfully!');
            }
          } catch (e) {
            // Ignore parsing errors for non-JSON lines
          }
        }
      }
      
      // Keep the last incomplete line in buffer
      buffer = lines[lines.length - 1];
    });
    
    reader.on('end', () => {
      console.log('✅ Stream ended');
    });
    
    reader.on('error', (error) => {
      console.error('❌ Stream error:', error);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Only run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testImageUpload();
}

export { testImageUpload };