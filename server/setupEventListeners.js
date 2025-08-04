// Helper file to set up event listeners for the UI buttons
export function setupEventListeners() {
  console.log('Setting up event listeners for UI buttons');
  
  // Add event listener for the refresh button
  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      console.log('Refresh button clicked');
      if (window.loadNearbyFlowers) {
        window.loadNearbyFlowers();
        if (window.updateStatusMessage) {
          window.updateStatusMessage('GPS art refreshed');
        }
      } else {
        console.error('loadNearbyFlowers function not available');
      }
    });
    console.log('Refresh button listener added');
  } else {
    console.warn('Refresh button not found in DOM');
  }
  
  // Add event listener for the draw button
  const drawBtn = document.getElementById('draw-btn');
  if (drawBtn) {
    drawBtn.addEventListener('click', () => {
      console.log('Draw button clicked');
      if (window.DrawingManager) {
        window.DrawingManager.showDrawingUI();
        if (window.updateStatusMessage) {
          window.updateStatusMessage('Drawing mode activated');
        }
      } else {
        console.error('DrawingManager not available');
        if (window.updateStatusMessage) {
          window.updateStatusMessage('Drawing feature not available');
        }
      }
    });
    console.log('Draw button listener added');
  } else {
    console.warn('Draw button not found in DOM');
  }
}
