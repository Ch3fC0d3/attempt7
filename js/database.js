// Flower database that communicates with a backend server for persistent storage
// This allows all users to see the same flowers at the same locations

class FlowerDatabase {
  constructor() {
    this.flowers = [];
    this.serverUrl = 'https://ar-flowers-server.onrender.com/api'; // Deployed server URL
    this.localServerUrl = 'http://localhost:3000/api'; // For local testing
    this.useLocalServer = false; // Using the deployed server
    
    // Use the appropriate server URL based on the environment
    this.apiUrl = this.useLocalServer ? this.localServerUrl : this.serverUrl;
    
    // Load initial flowers
    this.loadFromServer();
  }

  // Save a flower at the current GPS location
  async saveFlower(position, matrixTransform) {
    const flower = {
      id: this.generateId(),
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      timestamp: new Date().toISOString(),
      matrix: Array.from(matrixTransform)
    };
    
    try {
      // Save to server
      const response = await fetch(`${this.apiUrl}/flowers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(flower)
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const savedFlower = await response.json();
      console.log(`[GPS] Saved flower to server at lat: ${savedFlower.latitude}, lng: ${savedFlower.longitude}`);
      
      // Add to local cache
      this.flowers.push(savedFlower);
      
      return savedFlower;
    } catch (error) {
      console.error('[GPS] Failed to save flower to server:', error);
      
      // Fallback to local storage if server is unavailable
      this.saveToLocalStorage(flower);
      this.flowers.push(flower);
      
      return flower;
    }
  }

  // Get all flowers near the current GPS location (within distanceThreshold meters)
  async getNearbyFlowers(position, distanceThreshold = 20) {
    try {
      // Try to get flowers from server first
      const currentLat = position.coords.latitude;
      const currentLng = position.coords.longitude;
      
      const response = await fetch(
        `${this.apiUrl}/flowers/nearby?lat=${currentLat}&lng=${currentLng}&distance=${distanceThreshold}`
      );
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const nearbyFlowers = await response.json();
      console.log(`[GPS] Loaded ${nearbyFlowers.length} nearby flowers from server`);
      
      // Update local cache
      this.flowers = nearbyFlowers;
      
      return nearbyFlowers;
    } catch (error) {
      console.error('[GPS] Failed to get nearby flowers from server:', error);
      console.log('[GPS] Falling back to local calculations');
      
      // Fallback to local calculations if server is unavailable
      const currentLat = position.coords.latitude;
      const currentLng = position.coords.longitude;
      
      return this.flowers.filter(flower => {
        const distance = this.calculateDistance(
          currentLat, currentLng,
          flower.latitude, flower.longitude
        );
        
        const isNearby = distance <= distanceThreshold;
        console.log(`[GPS] Flower distance: ${distance.toFixed(2)}m, visible: ${isNearby}`);
        return isNearby;
      });
    }
  }

  // Load all flowers from the server
  async loadFromServer() {
    try {
      const response = await fetch(`${this.apiUrl}/flowers`);
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      this.flowers = await response.json();
      console.log(`[GPS] Loaded ${this.flowers.length} flowers from server`);
      
      // Backup to local storage
      this.saveToLocalStorage(this.flowers);
      
      return this.flowers;
    } catch (error) {
      console.error('[GPS] Failed to load flowers from server:', error);
      
      // Fallback to local storage
      return this.loadFromLocalStorage();
    }
  }

  // Calculate distance between two GPS coordinates in meters using the Haversine formula
  calculateDistance(lat1, lon1, lat2, lon2) {
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

  // Generate a unique ID for each flower
  generateId() {
    return 'flower_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Save flowers to localStorage as backup
  saveToLocalStorage(flowers) {
    try {
      localStorage.setItem('gpsFlowers', JSON.stringify(flowers || this.flowers));
      console.log(`[GPS] Saved ${(flowers || this.flowers).length} flowers to localStorage (backup)`);
    } catch (e) {
      console.error('[GPS] Failed to save flowers to localStorage:', e);
    }
  }

  // Load flowers from localStorage (fallback)
  loadFromLocalStorage() {
    try {
      const savedFlowers = localStorage.getItem('gpsFlowers');
      if (savedFlowers) {
        this.flowers = JSON.parse(savedFlowers);
        console.log(`[GPS] Loaded ${this.flowers.length} flowers from localStorage (fallback)`);
        return this.flowers;
      }
      return [];
    } catch (e) {
      console.error('[GPS] Failed to load flowers from localStorage:', e);
      this.flowers = [];
      return [];
    }
  }

  // Clear all stored flowers
  async clearAll() {
    try {
      // Clear from server
      const response = await fetch(`${this.apiUrl}/flowers`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      console.log('[GPS] Cleared all flowers from server');
    } catch (error) {
      console.error('[GPS] Failed to clear flowers from server:', error);
    }
    
    // Clear local cache and storage
    this.flowers = [];
    localStorage.removeItem('gpsFlowers');
    console.log('[GPS] Cleared all flowers from local storage');
  }
}

export const flowerDB = new FlowerDatabase();
