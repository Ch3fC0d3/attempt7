/**
 * Drawing functionality for AR Flowers application
 * Allows users to create and place drawings at GPS coordinates
 */

class DrawingManager {
  constructor() {
    this.isDrawing = false;
    this.canvas = null;
    this.ctx = null;
    this.currentColor = '#000000';
    this.currentSize = 5;
    this.drawingMode = 'pen'; // 'pen' or 'eraser'
    this.drawingData = null;
    this.container = null;
    this.initialized = false;
  }

  /**
   * Initialize the drawing UI and canvas
   */
  initialize() {
    if (this.initialized) return;
    
    // Create container
    this.container = document.createElement('div');
    this.container.className = 'drawing-container';
    document.body.appendChild(this.container);
    
    // Create a wrapper for the canvas
    const canvasWrapper = document.createElement('div');
    canvasWrapper.className = 'canvas-wrapper';
    canvasWrapper.style.flex = '1';
    canvasWrapper.style.display = 'flex';
    canvasWrapper.style.justifyContent = 'center';
    canvasWrapper.style.alignItems = 'center';
    canvasWrapper.style.margin = '10px 0';
    canvasWrapper.style.overflow = 'hidden';
    this.container.appendChild(canvasWrapper);
    
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'drawing-canvas';
    canvasWrapper.appendChild(this.canvas);
    
    // Create toolbar with enhanced visibility
    const toolbar = document.createElement('div');
    toolbar.className = 'drawing-toolbar';
    toolbar.style.backgroundColor = '#333';
    toolbar.style.padding = '12px 15px';
    toolbar.style.borderRadius = '25px';
    toolbar.style.margin = '10px 0';
    toolbar.style.display = 'flex';
    toolbar.style.flexWrap = 'wrap';
    toolbar.style.justifyContent = 'center';
    toolbar.style.alignItems = 'center';
    toolbar.style.width = '90%';
    toolbar.style.maxWidth = '500px';
    toolbar.style.position = 'relative';
    toolbar.style.zIndex = '1001'; // Higher than canvas
    toolbar.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.3)';
    toolbar.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    this.container.insertBefore(toolbar, canvasWrapper); // Place toolbar before canvas
    
    // Add predefined color buttons for better visibility and usability
    const colors = ['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
    
    colors.forEach(color => {
      const colorButton = document.createElement('div');
      colorButton.className = 'drawing-tool';
      colorButton.style.backgroundColor = color;
      colorButton.style.border = color === this.currentColor ? '3px solid white' : '2px solid #555';
      
      colorButton.addEventListener('click', () => {
        this.currentColor = color;
        console.log('Color changed to:', this.currentColor);
        
        // Update active state for all color buttons
        document.querySelectorAll('.drawing-tool').forEach(btn => {
          if (btn.style.backgroundColor) {
            btn.style.border = btn.style.backgroundColor === color ? '3px solid white' : '2px solid #555';
          }
        });
      });
      
      toolbar.appendChild(colorButton);
    });
    
    // Add color picker for custom colors
    const colorPickerWrapper = document.createElement('div');
    colorPickerWrapper.className = 'drawing-tool';
    colorPickerWrapper.style.overflow = 'visible';
    colorPickerWrapper.style.backgroundColor = '#ffffff';
    colorPickerWrapper.style.display = 'flex';
    colorPickerWrapper.style.alignItems = 'center';
    colorPickerWrapper.style.justifyContent = 'center';
    
    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.value = this.currentColor;
    colorPicker.className = 'color-tool';
    colorPicker.style.opacity = '1';
    colorPicker.style.cursor = 'pointer';
    colorPicker.style.width = '30px';
    colorPicker.style.height = '30px';
    colorPicker.style.padding = '0';
    colorPicker.style.border = 'none';
    colorPicker.style.margin = '0';
    colorPicker.addEventListener('input', (e) => {
      this.currentColor = e.target.value;
      console.log('Color changed to:', this.currentColor);
      
      // Update active state for all color buttons
      document.querySelectorAll('.drawing-tool').forEach(btn => {
        if (btn.style.backgroundColor) {
          btn.style.border = '2px solid #555';
        }
      });
      colorPickerWrapper.style.border = '3px solid white';
    });
    
    colorPickerWrapper.appendChild(colorPicker);
    toolbar.appendChild(colorPickerWrapper);
    
    // Add size slider with better styling
    const sizeSliderContainer = document.createElement('div');
    sizeSliderContainer.style.display = 'flex';
    sizeSliderContainer.style.alignItems = 'center';
    sizeSliderContainer.style.margin = '0 10px';
    sizeSliderContainer.style.padding = '5px 10px';
    sizeSliderContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    sizeSliderContainer.style.borderRadius = '15px';
    
    // Add size icon
    const sizeIcon = document.createElement('div');
    sizeIcon.innerHTML = '⚪';
    sizeIcon.style.fontSize = '14px';
    sizeIcon.style.marginRight = '5px';
    sizeSliderContainer.appendChild(sizeIcon);
    
    // Create the slider
    const sizeSlider = document.createElement('input');
    sizeSlider.type = 'range';
    sizeSlider.min = '1';
    sizeSlider.max = '20';
    sizeSlider.value = this.currentSize;
    sizeSlider.className = 'size-slider';
    sizeSlider.style.width = '80px';
    sizeSlider.style.accentColor = '#4CAF50';
    sizeSlider.addEventListener('input', (e) => {
      this.currentSize = parseInt(e.target.value);
      // Update size icon to reflect current size
      sizeIcon.style.fontSize = `${Math.max(10, Math.min(20, this.currentSize))}px`;
    });
    
    sizeSliderContainer.appendChild(sizeSlider);
    toolbar.appendChild(sizeSliderContainer);
    
    // Add pen tool
    const penTool = document.createElement('div');
    penTool.className = 'drawing-tool active';
    penTool.innerHTML = '✏️';
    penTool.addEventListener('click', () => {
      this.drawingMode = 'pen';
      penTool.classList.add('active');
      eraserTool.classList.remove('active');
    });
    toolbar.appendChild(penTool);
    
    // Add eraser tool
    const eraserTool = document.createElement('div');
    eraserTool.className = 'drawing-tool';
    eraserTool.innerHTML = '🧽';
    eraserTool.addEventListener('click', () => {
      this.drawingMode = 'eraser';
      eraserTool.classList.add('active');
      penTool.classList.remove('active');
    });
    toolbar.appendChild(eraserTool);
    
    // Add clear button
    const clearButton = document.createElement('div');
    clearButton.className = 'drawing-tool';
    clearButton.innerHTML = '🗑️';
    clearButton.addEventListener('click', () => {
      this.clearCanvas();
    });
    toolbar.appendChild(clearButton);
    
    // Add action buttons
    const actionButtons = document.createElement('div');
    actionButtons.className = 'action-buttons';
    actionButtons.style.display = 'flex';
    actionButtons.style.justifyContent = 'space-around';
    actionButtons.style.width = '80%';
    actionButtons.style.margin = '10px';
    actionButtons.style.position = 'relative';
    actionButtons.style.zIndex = '1001'; // Higher than canvas
    this.container.appendChild(actionButtons); // Place at the bottom
    
    // Add save button
    const saveButton = document.createElement('button');
    saveButton.className = 'drawing-button';
    saveButton.textContent = 'Save Drawing';
    saveButton.addEventListener('click', () => {
      this.saveDrawing();
    });
    actionButtons.appendChild(saveButton);
    
    // Add cancel button
    const cancelButton = document.createElement('button');
    cancelButton.className = 'drawing-button cancel';
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => {
      this.hideDrawingUI();
    });
    actionButtons.appendChild(cancelButton);
    
    // Initialize canvas context
    this.ctx = this.canvas.getContext('2d');
    
    // Add event listeners
    this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
    this.canvas.addEventListener('mousemove', this.draw.bind(this));
    this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
    this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));
    
    // Touch events
    this.canvas.addEventListener('touchstart', this.handleTouch.bind(this));
    this.canvas.addEventListener('touchmove', this.handleTouch.bind(this));
    this.canvas.addEventListener('touchend', this.stopDrawing.bind(this));
    
    // Resize canvas when window resizes
    window.addEventListener('resize', this.resizeCanvas.bind(this));
    
    this.initialized = true;
    this.resizeCanvas();
  }
  
  /**
   * Show the drawing UI
   */
  showDrawingUI() {
    if (!this.initialized) {
      this.initialize();
    }
    
    // Make sure the container is visible and centered
    this.container.style.display = 'flex';
    this.container.style.alignItems = 'center';
    this.container.style.justifyContent = 'center';
    this.container.classList.add('active');
    
    // Ensure the canvas is properly sized
    this.resizeCanvas();
    this.clearCanvas();
    
    console.log('Drawing UI shown');
  }
  
  /**
   * Hide the drawing UI
   */
  hideDrawingUI() {
    if (this.container) {
      this.container.classList.remove('active');
    }
  }
  
  /**
   * Resize the canvas to match its container
   */
  resizeCanvas() {
    if (!this.canvas) return;
    
    // Get the viewport dimensions
    const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const viewportHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    
    // Calculate canvas size (80% of viewport with max dimensions)
    const canvasWidth = Math.min(viewportWidth * 0.8, 800);
    const canvasHeight = Math.min(viewportHeight * 0.6, 600);
    
    // Set canvas dimensions
    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;
    
    // Update canvas style
    this.canvas.style.width = `${canvasWidth}px`;
    this.canvas.style.height = `${canvasHeight}px`;
    
    // Restore any existing drawing
    if (this.drawingData) {
      const img = new Image();
      img.onload = () => {
        this.ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
      };
      img.src = this.drawingData;
    }
  }
  
  /**
   * Clear the canvas
   */
  clearCanvas() {
    if (!this.ctx) return;
    
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawingData = null;
  }
  
  /**
   * Handle touch events
   */
  handleTouch(e) {
    e.preventDefault();
    
    if (e.type === 'touchstart') {
      this.startDrawing(this.getTouchPos(e));
    } else if (e.type === 'touchmove') {
      this.draw(this.getTouchPos(e));
    }
  }
  
  /**
   * Get touch position
   */
  getTouchPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const touch = e.touches[0];
    
    return {
      clientX: touch.clientX,
      clientY: touch.clientY,
      offsetX: touch.clientX - rect.left,
      offsetY: touch.clientY - rect.top
    };
  }
  
  /**
   * Start drawing
   */
  startDrawing(e) {
    this.isDrawing = true;
    this.ctx.beginPath();
    this.ctx.moveTo(e.offsetX, e.offsetY);
  }
  
  /**
   * Draw on the canvas
   */
  draw(e) {
    if (!this.isDrawing) return;
    
    this.ctx.lineWidth = this.currentSize;
    this.ctx.lineCap = 'round';
    
    if (this.drawingMode === 'pen') {
      this.ctx.strokeStyle = this.currentColor;
    } else {
      this.ctx.strokeStyle = 'white';
    }
    
    this.ctx.lineTo(e.offsetX, e.offsetY);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(e.offsetX, e.offsetY);
  }
  
  /**
   * Stop drawing
   */
  stopDrawing() {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.ctx.closePath();
      this.saveDrawingData();
    }
  }
  
  /**
   * Save the current drawing data as a base64 string
   */
  saveDrawingData() {
    this.drawingData = this.canvas.toDataURL('image/png');
  }
  
  /**
   * Save the drawing and place it in AR
   */
  saveDrawing() {
    if (!this.drawingData) {
      alert('Please draw something first!');
      return;
    }
    
    // Save the drawing data
    this.saveDrawingData();
    
    // Hide the drawing UI
    this.hideDrawingUI();
    
    // Notify that the drawing is ready to be placed
    const event = new CustomEvent('drawingComplete', {
      detail: {
        drawingData: this.drawingData
      }
    });
    document.dispatchEvent(event);
  }
  
  /**
   * Get the current drawing data
   */
  getDrawingData() {
    return this.drawingData;
  }
}

// Export the drawing manager
window.DrawingManager = new DrawingManager();
