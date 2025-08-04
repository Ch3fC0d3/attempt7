# Deploying AR Flowers Server to Render.com

This guide will help you deploy the AR Flowers backend server to Render.com for free.

## Prerequisites

- A GitHub account
- Your AR Flowers project pushed to a GitHub repository

## Deployment Steps

1. **Sign up for Render**
   - Go to [render.com](https://render.com) and sign up for a free account
   - You can sign up using your GitHub account for easier integration

2. **Create a New Web Service**
   - From your Render dashboard, click "New" and select "Web Service"
   - Connect your GitHub repository or select "Deploy from public Git repository" and enter your repository URL

3. **Configure Your Web Service**
   - Name: `ar-flowers-server` (or any name you prefer)
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Select the Free plan

4. **Advanced Settings (Optional)**
   - You can set environment variables if needed, but the default setup should work fine

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your application
   - This process may take a few minutes

6. **Get Your Service URL**
   - Once deployed, Render will provide a URL for your service (e.g., `https://ar-flowers-server.onrender.com`)
   - This is the URL you'll use in your frontend application

## Update Your Frontend

After deployment, update your frontend code to use the deployed server:

1. Open `js/database.js`
2. Update the `serverUrl` variable:
   ```javascript
   this.serverUrl = 'https://your-render-url.onrender.com/api'; // Replace with your actual Render URL
   this.useLocalServer = false; // Switch to the deployed server
   ```

3. Commit and push these changes to your GitHub Pages repository

## Testing

- Visit your Render URL directly in a browser to verify the server is running
- Test your AR application with multiple devices to confirm flowers are shared between users

## Troubleshooting

- If your server isn't working, check the Render logs for errors
- Make sure CORS is properly configured to allow requests from your frontend domain
- Verify that your frontend is using the correct server URL

## Limitations

- The free tier of Render will "spin down" after 15 minutes of inactivity
- The first request after inactivity may take a few seconds to respond
- This is normal for free tier services and shouldn't affect functionality once the server is active
