# 🌐 Deploy Your Game Online - Complete Guide

## 🚀 Quick Start (5 Minutes to Online!)

### Method 1: Render.com (⭐ Recommended - 100% Free)

**Steps:**

1. **Create GitHub Repository** (if you haven't already)

   ```powershell
   cd C:\Users\joyso\Downloads\game\pubg
   git init
   git add .
   git commit -m "Initial commit - 99 Idea Puzzle"
   ```

2. **Push to GitHub**

   - Go to https://github.com/new
   - Create repository named `99-idea-puzzle`
   - Copy the commands shown and run:

   ```powershell
   git remote add origin https://github.com/YOUR-USERNAME/99-idea-puzzle.git
   git branch -M main
   git push -u origin main
   ```

3. **Deploy on Render.com**

   - Go to https://render.com
   - Click **Sign Up** (use GitHub login)
   - Click **New +** → **Web Service**
   - Click **Connect GitHub** and select your repository
   - Render will auto-detect the `render.yaml` config
   - Click **Apply** (or configure manually):
     - **Name**: `99-idea-puzzle`
     - **Environment**: `Node`
     - **Build Command**: `cd Game && npm install`
     - **Start Command**: `cd Game && npm start`
     - **Plan**: `Free`
   - Click **Create Web Service**

4. **Wait for Deployment** (3-5 minutes)

   - Watch the logs as it builds
   - When you see "🚀 Server running", it's ready!
   - Your URL: `https://99-idea-puzzle.onrender.com`

5. **Play Online!**
   - Open the URL in your browser
   - Share the link with friends
   - Create a room and play multiplayer!

---

### Method 2: Railway.app (Free $5 Credit)

**Steps:**

1. **Create GitHub Repository** (same as above if not done)

2. **Deploy on Railway**

   - Go to https://railway.app
   - Click **Login** (use GitHub)
   - Click **New Project** → **Deploy from GitHub repo**
   - Select `99-idea-puzzle` repository
   - Railway auto-detects Node.js and uses the `Procfile`
   - Click **Deploy**

3. **Generate Domain**

   - Go to **Settings** tab
   - Click **Generate Domain**
   - Your URL: `https://99-idea-puzzle.up.railway.app`

4. **Done!** Visit your URL and play

---

### Method 3: Vercel (Alternative - Free)

**Steps:**

1. **Install Vercel CLI**

   ```powershell
   npm install -g vercel
   ```

2. **Deploy**

   ```powershell
   cd C:\Users\joyso\Downloads\game\pubg
   vercel
   ```

3. **Follow Prompts**

   - Login with GitHub
   - Set project settings (accept defaults)
   - Wait for deployment

4. **Your URL**: Vercel will show your live URL

---

## 🎮 Without GitHub (Direct Deploy)

### Using Render (No Git Required)

1. Go to https://render.com
2. Click **New +** → **Web Service**
3. Choose **Public Git Repository** or **Deploy from Docker**
4. Configure manually:
   - **Repository**: Leave blank
   - **Name**: `99-idea-puzzle`
   - **Runtime**: `Node`
   - **Build Command**: `cd Game && npm install`
   - **Start Command**: `cd Game && npm start`
5. Upload your code as ZIP in dashboard

---

## 📋 Pre-Deployment Checklist

Before deploying, make sure:

- ✅ `render.yaml` exists in root folder
- ✅ `Procfile` exists in root folder
- ✅ `.gitignore` exists (don't upload node_modules)
- ✅ `package.json` has correct start script
- ✅ Server listens on `process.env.PORT || 3000`

All these files are already created for you! ✓

---

## 🔧 Troubleshooting

### Issue: Build Failed

**Check logs** for error messages:

- Missing dependencies? Run `npm install` locally first
- Node version? Ensure Node 18+ in `package.json` engines

**Fix:**

```json
"engines": {
  "node": ">=18.0.0"
}
```

### Issue: Server Crashes on Start

**Check:**

1. PORT environment variable: `process.env.PORT || 3000`
2. Correct start command: `cd Game && node server.js`
3. All files uploaded (especially `Game/` folder)

### Issue: Can't Connect to Server

**Check:**

- Server logs show "🚀 Server running"?
- URL is correct (https, not http)?
- Firewall/network issues?

### Issue: Multiplayer Not Working

**Check:**

- WebSocket connections enabled on hosting platform
- CORS settings allow connections
- Socket.IO properly configured

**All platforms mentioned (Render, Railway, Vercel) support WebSockets!**

---

## 💰 Cost Comparison

| Platform    | Free Tier    | Limitations             | Best For         |
| ----------- | ------------ | ----------------------- | ---------------- |
| **Render**  | ✅ Unlimited | Sleeps after 15min idle | Testing & demos  |
| **Railway** | ✅ $5 credit | ~500 hours/month        | Active projects  |
| **Vercel**  | ✅ Yes       | 100GB bandwidth         | Static + API     |
| **Fly.io**  | ✅ Yes       | 3 shared VMs            | Production ready |

**Recommendation**: Start with **Render** (easiest) or **Railway** (best performance).

---

## 🌍 Custom Domain (Optional)

Once deployed, you can add a custom domain:

**Render:**

1. Go to **Settings** → **Custom Domain**
2. Add your domain (e.g., `mygame.com`)
3. Update DNS records as shown

**Railway:**

1. Go to **Settings** → **Domains**
2. Add custom domain
3. Update DNS CNAME record

---

## 📊 Monitor Your Game

### Check Server Status

**Render Dashboard:**

- View real-time logs
- Monitor CPU/memory usage
- See number of active connections

**Railway Dashboard:**

- View deployment logs
- Check metrics
- See active services

### View Logs

**Render:**

```
Dashboard → Your Service → Logs tab
```

**Railway:**

```
Project → Deployments → Click latest → View Logs
```

---

## 🔒 Security Tips (Optional but Recommended)

### 1. Add Rate Limiting

Install package:

```powershell
cd Game
npm install express-rate-limit
```

Add to `server.js`:

```javascript
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use(limiter);
```

### 2. Add CORS Protection

```javascript
const cors = require("cors");
app.use(
  cors({
    origin: "https://yourdomain.com", // or '*' for all
  })
);
```

### 3. Environment Variables

Add secrets in platform dashboard:

- `NODE_ENV=production`
- `MAX_ROOMS=100`
- Any API keys

---

## 🚀 Next Steps After Deployment

1. ✅ **Test the live URL** - Open in browser
2. ✅ **Share with friends** - Test multiplayer
3. ✅ **Monitor performance** - Check logs
4. ✅ **Update APK config** - Use live URL for mobile app
5. ✅ **Share on social media** - Get players!

---

## 📱 Update APK with Live Server

After deploying, update your mobile app:

1. Edit `Game/capacitor.config.json`:

```json
{
  "server": {
    "url": "https://your-live-url.onrender.com",
    "cleartext": false
  }
}
```

2. Rebuild APK:

```powershell
cd Game
npx cap sync android
npx cap open android
# Build APK in Android Studio
```

3. Now your APK connects to live server!

---

## 🎉 You're Live!

Your game is now **online and playable worldwide**! 🌍

**Share your game:**

- Copy the URL: `https://your-app.onrender.com`
- Send to friends
- Post on social media
- Embed in your website

**Performance on free tier:**

- ✅ Handles 10-20 simultaneous players
- ✅ Auto-scales to 50+ on paid plans
- ✅ WebSocket support for real-time gameplay
- ⚠️ May sleep after 15min idle (restarts in ~30s)

---

## Need Help?

**Deployment Issues?**

- Check platform documentation
- View deployment logs
- Verify all config files exist

**Game Not Working?**

- Test locally first: `npm start`
- Check browser console for errors
- Verify Socket.IO connections

**Want Better Performance?**

- Upgrade to paid plan ($7-10/month)
- Use CDN for static assets
- Enable caching

---

**Happy Gaming! 🎮**
