const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const FLOWERS_FILE = path.join(__dirname, 'flowers.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());

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

// Save flowers data to file
function saveFlowers() {
  try {
    fs.writeFileSync(FLOWERS_FILE, JSON.stringify(flowers));
    console.log(`Saved ${flowers.length} flowers to storage`);
  } catch (err) {
    console.error('Error saving flowers data:', err);
  }
}

// Routes
app.get('/api/flowers', (req, res) => {
  res.json(flowers);
});

app.post('/api/flowers', (req, res) => {
  const newFlower = req.body;
  
  // Validate flower data
  if (!newFlower.latitude || !newFlower.longitude) {
    return res.status(400).json({ error: 'Missing required flower data' });
  }
  
  // Add ID and timestamp if not provided
  newFlower.id = newFlower.id || `flower_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  newFlower.timestamp = newFlower.timestamp || new Date().toISOString();
  
  flowers.push(newFlower);
  saveFlowers();
  
  res.status(201).json(newFlower);
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
