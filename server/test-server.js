const express = require('express');
const app = express();
const PORT = 3002;

// Simple route
app.get('/', (req, res) => {
  res.send('Test server running');
});

// Detailed error handling
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:');
  console.error(error);
});

// Start server
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
