# Deploy Server for APK Multiplayer

## Why Deploy the Server?

Your Android APK needs a running server for multiplayer features. You can't run the Node.js server on Android devices, so you need to deploy it to a cloud platform.

## Recommended Platforms (Easiest to Hardest)

### 1. Render.com (⭐ Recommended - Free Tier Available)

**Steps:**

1. Create account at https://render.com
2. Click **New** → **Web Service**
3. Connect your GitHub repo (or upload code)
4. Configure:
   - **Name**: `color-merge-puzzle-server`
   - **Environment**: `Node`
   - **Build Command**: `cd Game && npm install`
   - **Start Command**: `cd Game && npm start`
   - **Environment Variables**:
     - `PORT` = `10000` (Render default)
5. Click **Create Web Service**
6. Wait 5-10 minutes for deployment
7. Your server URL: `https://color-merge-puzzle-server.onrender.com`

**Update APK Config:**

```json
{
  "server": {
    "url": "https://color-merge-puzzle-server.onrender.com",
    "cleartext": false
  }
}
```

**Note**: Free tier spins down after inactivity (30s to restart on first request)

---

### 2. Railway.app (Free $5 Credit)

**Steps:**

1. Create account at https://railway.app
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repo
4. Configure:
   - **Root Directory**: `/Game`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Railway auto-detects Node.js
6. Click **Deploy**
7. Go to **Settings** → **Generate Domain**
8. Your server URL: `https://your-app.up.railway.app`

**Update APK Config:**

```json
{
  "server": {
    "url": "https://your-app.up.railway.app",
    "cleartext": false
  }
}
```

---

### 3. Heroku (Paid - $5/month minimum)

**Steps:**

1. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
2. Login: `heroku login`
3. In Game folder:

```powershell
cd Game
git init
heroku create color-merge-puzzle
git add .
git commit -m "Initial commit"
git push heroku main
```

4. Server URL: `https://color-merge-puzzle.herokuapp.com`

---

### 4. Self-Hosted VPS (Advanced)

If you have a VPS (DigitalOcean, Linode, AWS EC2):

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Clone/upload your code
cd /var/www
git clone your-repo
cd Game
npm install

# Start with PM2
pm2 start server.js --name "puzzle-server"
pm2 startup
pm2 save

# Setup Nginx reverse proxy
sudo apt install nginx
# Configure nginx to proxy port 3000
```

---

## Quick Deploy with GitHub Actions (Automated)

Create `.github/workflows/deploy.yml` in your repo:

```yaml
name: Deploy to Render

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        run: |
          curl -X POST https://api.render.com/deploy/srv-YOUR_SERVICE_ID
```

---

## Testing Your Deployed Server

1. Open browser: `https://your-server-url.com`
2. You should see the game menu
3. Test creating a room
4. Test multiplayer with two browser tabs

---

## Update APK After Deployment

1. Edit `Game/capacitor.config.json`:

```json
{
  "server": {
    "url": "https://your-deployed-server.com",
    "cleartext": false
  }
}
```

2. Sync and rebuild:

```powershell
cd Game
npx cap sync android
npx cap open android
# Build APK in Android Studio
```

---

## Free vs Paid Hosting Comparison

| Platform    | Free Tier    | Limitations                 | Best For        |
| ----------- | ------------ | --------------------------- | --------------- |
| **Render**  | ✅ Yes       | Spins down after 15min idle | Testing, demos  |
| **Railway** | ✅ $5 credit | ~500 hours/month free       | Small projects  |
| **Fly.io**  | ✅ Yes       | 3 shared VMs                | Active projects |
| **Heroku**  | ❌ No        | $5/month minimum            | Production      |
| **VPS**     | ❌ No        | From $5/month               | Full control    |

---

## Environment Variables for Production

Add these to your hosting platform:

```env
PORT=3000                    # Auto-set by most platforms
NODE_ENV=production
MAX_PLAYERS=4
CORS_ORIGIN=*                # Or your specific domain
```

---

## Troubleshooting Deployed Server

### Error: Server not responding

- Check server logs on hosting platform
- Verify server is actually running
- Check if PORT environment variable is set

### Error: WebSocket connection failed

- Ensure hosting platform supports WebSockets
- Render, Railway, Heroku all support Socket.IO
- Check firewall/security group settings on VPS

### Error: CORS issues

- Add CORS middleware in `server.js`:

```javascript
const cors = require("cors");
app.use(cors());
```

### Error: App crashes on startup

- Check Node.js version matches (use 18.x)
- Verify all dependencies in `package.json`
- Check start command in hosting config

---

## Cost Estimate

**Free Options (Sufficient for testing):**

- Render: Free (with sleep after inactivity)
- Railway: Free $5 credit (~500 hours)
- Fly.io: Free tier (3 VMs)

**Paid Options (24/7 uptime):**

- Heroku: $5/month (Eco dyno)
- Railway: $5/month (~500GB bandwidth)
- DigitalOcean: $6/month (basic droplet)
- AWS Lightsail: $5/month

**Recommendation**: Start with Render's free tier for testing, upgrade to Railway ($5/month) for production.

---

## Next Steps

1. ✅ Deploy server to chosen platform
2. ✅ Get your server URL
3. ✅ Update `capacitor.config.json`
4. ✅ Rebuild APK
5. ✅ Test multiplayer on phone!

Need help deploying? Check the platform's documentation or ask for assistance!
