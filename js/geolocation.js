// Geolocation service for handling GPS functionality

class GeolocationService {
  constructor() {
    this.currentPosition = null;
    this.watchId = null;
    this.positionListeners = [];
    this.permissionStatus = 'unknown'; // 'unknown', 'granted', 'denied', 'unavailable'
  }

  // Check if geolocation is available in this browser
  isAvailable() {
    return 'geolocation' in navigator;
  }

  // Request permission and get current position
  async requestPermission() {
    if (!this.isAvailable()) {
      console.error('[GPS] Geolocation is not available in this browser');
      this.permissionStatus = 'unavailable';
      return false;
    }

    try {
      // Request permission by getting position once
      await this.getCurrentPosition();
      this.permissionStatus = 'granted';
      return true;
    } catch (error) {
      console.error('[GPS] Error requesting geolocation permission:', error);
      this.permissionStatus = 'denied';
      return false;
    }
  }

  // Get current position as a promise
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!this.isAvailable()) {
        reject(new Error('Geolocation is not available'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.currentPosition = position;
          console.log(`[GPS] Current position: ${position.coords.latitude}, ${position.coords.longitude}`);
          resolve(position);
        },
        (error) => {
          console.error('[GPS] Error getting current position:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  // Start watching position changes
  startWatching() {
    if (!this.isAvailable() || this.watchId !== null) {
      return false;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.currentPosition = position;
        console.log(`[GPS] Position updated: ${position.coords.latitude}, ${position.coords.longitude}`);
        
        // Notify all listeners
        this.positionListeners.forEach(listener => {
          try {
            listener(position);
          } catch (e) {
            console.error('[GPS] Error in position listener:', e);
          }
        });
      },
      (error) => {
        console.error('[GPS] Error watching position:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    return true;
  }

  // Stop watching position
  stopWatching() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      console.log('[GPS] Stopped watching position');
      return true;
    }
    return false;
  }

  // Add a listener for position updates
  addPositionListener(listener) {
    if (typeof listener === 'function') {
      this.positionListeners.push(listener);
      return true;
    }
    return false;
  }

  // Remove a position listener
  removePositionListener(listener) {
    const index = this.positionListeners.indexOf(listener);
    if (index !== -1) {
      this.positionListeners.splice(index, 1);
      return true;
    }
    return false;
  }

  // Get the last known position
  getLastPosition() {
    return this.currentPosition;
  }
}

export const geoService = new GeolocationService();
