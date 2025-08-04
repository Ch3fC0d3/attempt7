# AR Flowers Deployment Notes

## Project Overview

This project is a location-based AR flower placement application that allows users to place virtual sunflowers at specific GPS coordinates. The flowers are visible to all users who are physically present at those locations (within 20 meters).

## Architecture

The application consists of two main components:

1. **Frontend**: WebXR AR application deployed on GitHub Pages
   - Repository: https://github.com/Ch3fC0d3/attempt7
   - Live URL: https://ch3fc0d3.github.io/attempt7/

2. **Backend**: Node.js/Express server deployed on Render.com
   - Repository: https://github.com/Ch3fC0d3/ar-flowers-server
   - API URL: https://ar-flowers-server.onrender.com/api

## API Endpoints

- `GET /api/flowers` - Get all flowers
- `POST /api/flowers` - Save a new flower
- `GET /api/flowers/nearby?lat=<latitude>&lng=<longitude>&distance=<meters>` - Get flowers near a specific location
- `DELETE /api/flowers` - Delete all flowers (admin only)

## Deployment Instructions

### Frontend (GitHub Pages)

1. Push changes to the GitHub repository
2. GitHub Pages will automatically deploy from the main branch

### Backend (Render.com)

1. Push changes to the ar-flowers-server repository
2. Log in to Render.com
3. Navigate to the ar-flowers-server service
4. Ensure the following settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Click "Manual Deploy" > "Deploy latest commit"

## Troubleshooting

- If you see a "Bad Gateway" error, check the Render.com logs for details
- Common issues include:
  - Incorrect Start Command (should be `npm start`)
  - Missing dependencies in package.json
  - File permission issues with the flowers.json storage file

## Future Improvements

- Add user authentication for flower placement
- Implement flower deletion by creator
- Add more flower types and customization options
- Optimize flower loading for better performance
- Add altitude-based filtering for multi-story buildings
