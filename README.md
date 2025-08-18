# 🛏️ Where Would You Sleep Best? - AI Bedroom Generator

Transform your room photos into 9 dreamy bedroom variations perfect for Instagram's "Where would you sleep best?" content format.

![App Preview](docs/preview.gif)

## ✨ Features

- **9 Unique Variations**: Generate 9 different styled bedroom options in a 3x3 grid
- **6 Room Types**: Choose from Cozy Cabin, Modern Luxury, Fantasy Magical, Tropical Paradise, Vintage Romantic, or Minimalist Zen
- **Optional Photo Upload**: Upload your room photo for personalized results or start with a blank canvas
- **Instagram-Optimized**: All images are generated as perfect 1080x1080 squares with numbered overlays
- **Individual Sharing**: Download and share each option separately with suggested captions
- **Real-time Progress**: Watch your images generate with live progress updates
- **Mobile-Friendly**: Responsive design optimized for mobile creation and sharing

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Sogni AI API key (or Replicate/Stability AI)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/amalgamate.git
   cd amalgamate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```env
   SOGNI_API_KEY=your_sogni_api_key_here
   VITE_API_URL=http://localhost:3001
   PORT=3001
   BASE_URL=http://localhost:3001
   ```

4. **Start the development servers**
   
   **Terminal 1 - Backend:**
   ```bash
   npm run server:dev
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:5173
   ```

## 🎨 How It Works

### User Flow
1. **Welcome Screen**: Choose to upload a room photo or start with blank canvas
2. **Image Upload** (Optional): Drag & drop, browse files, or use camera capture
3. **Style Selection**: Pick from 6 room type categories 
4. **Generation**: Watch 9 unique bedroom variations generate in real-time
5. **Results**: Browse 3x3 grid, click any image to download/share individually

### AI Generation Process
1. **Image Analysis**: Extract colors, lighting, and style from uploaded photos
2. **Prompt Building**: Create 9 unique prompts based on selected room type and user preferences
3. **Batch Generation**: Generate images in batches of 3 to manage API limits
4. **Processing**: Convert all images to 1080x1080 squares with number overlays
5. **Delivery**: Serve processed images with download and sharing options

## 🏗️ Architecture

### Frontend (React + Vite)
```
src/
├── components/
│   ├── ImageUpload.jsx      # Photo upload with camera support
│   ├── TypeSelector.jsx     # 6 room type selection grid  
│   ├── ProgressBar.jsx      # Real-time generation progress
│   ├── OptionsGrid.jsx      # 3x3 results grid
│   ├── ImageCard.jsx        # Individual image with number overlay
│   └── ShareModal.jsx       # Download/share individual images
├── services/
│   └── api.js               # Backend API communication
├── utils/
│   ├── imageOptimizer.js    # Client-side image processing
│   └── promptBuilder.js     # Prompt construction helpers
└── styles/
    └── index.css           # Tailwind + custom styles
```

### Backend (Node.js + Express)
```
server/
├── routes/
│   ├── generate.js         # Main generation endpoint with SSE
│   └── styles.js           # Style presets and inspiration
├── services/
│   ├── aiImageService.js   # Sogni AI integration
│   ├── promptService.js    # Prompt engineering logic
│   └── imageProcessor.js   # Sharp-based image processing
├── config/
│   └── styles.js           # Room types & style variations data
└── index.js               # Express server setup
```

## 🔧 API Endpoints

### POST /api/generate
Generate 9 bedroom variations with real-time progress updates via Server-Sent Events.

**Request:**
```javascript
// FormData with:
{
  "roomType": "cozy-cabin",           // Required
  "userImage": File,                  // Optional uploaded image
  "customPrompts": {                  // Optional customization
    "colorPalette": "warm earth tones",
    "mood": "romantic",
    "additionalDetails": "fairy lights"
  }
}
```

**Response (SSE Stream):**
```javascript
data: {"type":"progress","imageNumber":1,"status":"generating","progress":45}
data: {"type":"complete","image":{"id":"cozy-cabin-1","number":1,"url":"...", "style":"..."}}
data: {"type":"finished"}
```

### GET /api/styles
Get all available room types and style variations.

### GET /api/styles/:roomType  
Get specific room type details and variations.

### GET /api/styles/inspiration/random
Get random style combinations for inspiration.

## 📱 Instagram Integration

### Perfect Format
- **1080x1080 pixels**: Instagram's preferred square format
- **Numbered overlays**: Easy reference for story polls and engagement
- **High quality JPEG**: Optimized for social media compression

### Suggested Usage
1. **Grid Post**: Share all 9 images as a carousel post
2. **Story Polls**: Use individual numbered images for "Which would you choose?" polls  
3. **Engagement**: Ask followers to comment their favorite number
4. **User-Generated Content**: Encourage followers to create their own versions

### Ready-Made Captions
```
Option [X]: Where would you sleep best? 🛏️✨

[Style description]

#WhereWouldYouSleepBest #BedroomGoals #DreamBedroom #InteriorDesign #CozyVibes
```

---

**Made with ❤️ for content creators and bedroom dreamers everywhere**
