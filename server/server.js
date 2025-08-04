const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const FLOWERS_FILE = path.join(__dirname, 'flowers.json');
const DRAWINGS_FILE = path.join(__dirname, 'drawings.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '..')));

// Initialize flowers data
let flowers = [];
try {
  if (fs.existsSync(FLOWERS_FILE)) {
    const data = fs.readFileSync(FLOWERS_FILE, 'utf8');
    flowers = JSON.parse(data);
    console.log(`Loaded ${flowers.length} flowers from storage`);
  } else {
    // Create empty file if it doesn't exist
    fs.writeFileSync(FLOWERS_FILE, JSON.stringify(flowers));
    console.log('Created new flowers storage file');
  }
} catch (err) {
  console.error('Error loading flowers data:', err);
}

// Initialize drawings data
let drawings = [];
try {
  if (fs.existsSync(DRAWINGS_FILE)) {
    const data = fs.readFileSync(DRAWINGS_FILE, 'utf8');
    drawings = JSON.parse(data);
    console.log(`Loaded ${drawings.length} drawings from storage`);
  } else {
    // Create empty file if it doesn't exist
    fs.writeFileSync(DRAWINGS_FILE, JSON.stringify(drawings));
    console.log('Created new drawings storage file');
  }
} catch (err) {
  console.error('Error loading drawings data:', err);
}

// Save flowers data to file
function saveFlowers() {
  try {
    fs.writeFileSync(FLOWERS_FILE, JSON.stringify(flowers));
    console.log(`Saved ${flowers.length} flowers to storage`);
  } catch (err) {
    console.error('Error saving flowers data:', err);
  }
}

// Save drawings data to file
function saveDrawings() {
  try {
    fs.writeFileSync(DRAWINGS_FILE, JSON.stringify(drawings));
    console.log(`Saved ${drawings.length} drawings to storage`);
  } catch (err) {
    console.error('Error saving drawings data:', err);
  }
}

// Routes
app.get('/api/flowers', (req, res) => {
  res.json(flowers);
});

app.post('/api/flowers', (req, res) => {
  const newArt = req.body;
  
  // Validate art data
  if (!newArt.latitude || !newArt.longitude) {
    return res.status(400).json({ error: 'Missing required location data' });
  }
  
  // Add ID and timestamp if not provided
  newArt.id = newArt.id || `art_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  newArt.timestamp = newArt.timestamp || new Date().toISOString();
  
  // Set default audience and validate creatorId
  newArt.audience = newArt.audience || 'public';
  if (!newArt.creatorId) {
    return res.status(400).json({ error: 'Missing creatorId' });
  }
  
  // Set default art type if not provided
  newArt.artType = newArt.artType || 'flower';
  newArt.artData = newArt.artData || {};
  
  flowers.push(newArt);
  saveFlowers();
  
  console.log(`Art saved: ${newArt.artType} at ${newArt.latitude}, ${newArt.longitude}`);
  res.status(201).json(newArt);
});

// Get flowers near a specific location
app.get('/api/flowers/nearby', (req, res) => {
  const { lat, lng, distance = 20 } = req.query;
  
  if (!lat || !lng) {
    return res.status(400).json({ error: 'Missing latitude or longitude' });
  }
  
  const nearbyFlowers = flowers.filter(flower => {
    const flowerDistance = calculateDistance(
      parseFloat(lat), 
      parseFloat(lng), 
      flower.latitude, 
      flower.longitude
    );
    return flowerDistance <= parseFloat(distance);
  });
  
  res.json(nearbyFlowers);
});

// Delete all flowers (for admin purposes)
app.delete('/api/flowers', (req, res) => {
  flowers = [];
  saveFlowers();
  res.json({ message: 'All flowers deleted' });
});

// Drawing routes
app.post('/api/drawings', (req, res) => {
  const newDrawing = req.body;
  if (!newDrawing.latitude || !newDrawing.longitude || !newDrawing.imageData) {
    return res.status(400).json({ error: 'Missing required drawing data' });
  }
  newDrawing.id = `drawing_${Date.now()}`;
  drawings.push(newDrawing);
  saveDrawings();
  res.status(201).json(newDrawing);
});

app.get('/api/drawings/nearby', (req, res) => {
  const { lat, lng, distance = 20 } = req.query;
  if (!lat || !lng) {
    return res.status(400).json({ error: 'Missing latitude or longitude' });
  }
  const nearbyDrawings = drawings.filter(drawing => {
    const drawingDistance = calculateDistance(parseFloat(lat), parseFloat(lng), drawing.latitude, drawing.longitude);
    return drawingDistance <= parseFloat(distance);
  });
  res.json(nearbyDrawings);
});

app.delete('/api/drawings', (req, res) => {
  drawings = [];
  saveDrawings();
  res.json({ message: 'All drawings deleted' });
});

// Calculate distance between two GPS coordinates in meters using the Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Server URL: ' + (process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`));
});
