# 🚀 Deployment Guide for 99 Idea Puzzle

## Option 1: Deploy to Render.com (Recommended - Free)

### Steps:

1. **Sign up** at [render.com](https://render.com)
2. **Connect your GitHub repository**

   - Go to Dashboard → New → Web Service
   - Select "Build and deploy from a Git repository"
   - Connect your GitHub account
   - Select the `99-idea-puzzle` repository

3. **Configure deployment**

   - Name: `color-merge-puzzle`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Free

4. **Environment Variables**

   - Add if needed (currently none required for basic setup)

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy when you push to GitHub

### Your Live URL will be:

```
https://color-merge-puzzle.onrender.com
```

---

## Option 2: Deploy to Railway.app

### Steps:

1. **Sign up** at [railway.app](https://railway.app)
2. **Create a new project**

   - Click "New Project" → "Deploy from GitHub repo"
   - Authorize and select `99-idea-puzzle`

3. **Configure**

   - Railway auto-detects Node.js
   - Add PORT environment variable: `3000`

4. **Deploy**
   - Click "Deploy" and Railway handles the rest

---

## Option 3: Deploy to Vercel (Alternative)

### Note:

Vercel is better for serverless. For Socket.IO multiplayer, use Render or Railway.

---

## After Deployment

### Update Game Configuration:

If your game has hardcoded localhost references, update them:

```javascript
// In client.js, change:
const socket = io(); // This will auto-connect to current domain

// Or explicitly set:
const socket = io("https://your-domain.onrender.com");
```

### Testing:

1. Visit your deployed URL
2. Test single-player mode
3. Open 2 browser windows and test multiplayer
4. Verify all features work (moves, hints, scoring)

---

## Database (If Needed Later)

If you want to add a leaderboard/persistence:

- **Render**: Includes free PostgreSQL databases
- **Railway**: Includes free MongoDB options

---

## Troubleshooting

### Socket.IO Connection Issues:

```javascript
// Update client.js to handle different environments:
const socket = io({
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});
```

### Port Issues:

- The server automatically uses PORT environment variable
- Make sure `server.js` reads: `const PORT = process.env.PORT || 3000;`

### Logs:

- Check deployment logs in your hosting dashboard for errors

---

## Quick Start with Render

**Fastest Way (3 clicks):**

1. Push your code to GitHub (✅ Already done)
2. Go to [render.com/dashboard](https://dashboard.render.com)
3. New → Web Service → Connect GitHub → Select repo
4. Done! Live in 2-3 minutes

Your site will be available at: `https://color-merge-puzzle.onrender.com`
