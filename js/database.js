// Simple in-memory database for storing flower locations
// In a production app, this would be replaced with a server-side database

class FlowerDatabase {
  constructor() {
    this.flowers = [];
    this.loadFromLocalStorage();
  }

  // Save a flower at the current GPS location
  saveFlower(position, matrixTransform) {
    const flower = {
      id: this.generateId(),
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      timestamp: new Date().toISOString(),
      matrix: Array.from(matrixTransform)
    };
    
    this.flowers.push(flower);
    this.saveToLocalStorage();
    console.log(`[GPS] Saved flower at lat: ${flower.latitude}, lng: ${flower.longitude}`);
    return flower;
  }

  // Get all flowers near the current GPS location (within distanceThreshold meters)
  getNearbyFlowers(position, distanceThreshold = 20) {
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

  // Save flowers to localStorage for persistence
  saveToLocalStorage() {
    try {
      localStorage.setItem('gpsFlowers', JSON.stringify(this.flowers));
      console.log(`[GPS] Saved ${this.flowers.length} flowers to localStorage`);
    } catch (e) {
      console.error('[GPS] Failed to save flowers to localStorage:', e);
    }
  }

  // Load flowers from localStorage
  loadFromLocalStorage() {
    try {
      const savedFlowers = localStorage.getItem('gpsFlowers');
      if (savedFlowers) {
        this.flowers = JSON.parse(savedFlowers);
        console.log(`[GPS] Loaded ${this.flowers.length} flowers from localStorage`);
      }
    } catch (e) {
      console.error('[GPS] Failed to load flowers from localStorage:', e);
      this.flowers = [];
    }
  }

  // Clear all stored flowers
  clearAll() {
    this.flowers = [];
    localStorage.removeItem('gpsFlowers');
    console.log('[GPS] Cleared all flowers');
  }
}

export const flowerDB = new FlowerDatabase();
