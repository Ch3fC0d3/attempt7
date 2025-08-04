const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

// Detailed error handling
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:');
  console.error(error);
});

const app = express();
const PORT = 3003;
const FLOWERS_FILE = path.join(__dirname, 'flowers.json');
const DRAWINGS_FILE = path.join(__dirname, 'drawings.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '..')));

// Simple test route
app.get('/test', (req, res) => {
  res.send('Debug server running successfully');
});

// Initialize flowers data
let flowers = [];
try {
  console.log('Checking for flowers file at:', FLOWERS_FILE);
  
  if (fs.existsSync(FLOWERS_FILE)) {
    console.log('Flowers file exists, reading...');
    const data = fs.readFileSync(FLOWERS_FILE, 'utf8');
    console.log('Flowers file read, parsing JSON...');
    flowers = JSON.parse(data);
    console.log(`Successfully loaded ${flowers.length} flowers from storage`);
  } else {
    console.log('Flowers file does not exist, creating...');
    // Create empty file if it doesn't exist
    fs.writeFileSync(FLOWERS_FILE, JSON.stringify(flowers));
    console.log('Created new flowers storage file');
  }
} catch (err) {
  console.error('Error with flowers data:', err);
}

// Initialize drawings data
let drawings = [];
try {
  console.log('Checking for drawings file at:', DRAWINGS_FILE);
  
  if (fs.existsSync(DRAWINGS_FILE)) {
    console.log('Drawings file exists, reading...');
    const data = fs.readFileSync(DRAWINGS_FILE, 'utf8');
    console.log('Drawings file read, parsing JSON...');
    drawings = JSON.parse(data);
    console.log(`Successfully loaded ${drawings.length} drawings from storage`);
  } else {
    console.log('Drawings file does not exist, creating...');
    // Create empty file if it doesn't exist
    fs.writeFileSync(DRAWINGS_FILE, JSON.stringify(drawings));
    console.log('Created new drawings storage file');
  }
} catch (err) {
  console.error('Error with drawings data:', err);
}

// Start server with better error handling
const server = app.listen(PORT, () => {
  console.log(`Debug server running on port ${PORT}`);
  console.log('Debug server URL: http://localhost:' + PORT);
}).on('error', (err) => {
  console.error('Server startup error:', err);
});
