# Quick Deploy Checklist

## ✅ Before Deploying

- [x] All deployment files created (`render.yaml`, `Procfile`, `.gitignore`)
- [x] `package.json` configured with correct start script
- [ ] Code tested locally (run `npm start` in Game folder)
- [ ] GitHub account created (if using GitHub deployment)

## 🚀 Fastest Deploy Method (5 Minutes)

### Step 1: Run Deploy Script

```powershell
cd C:\Users\joyso\Downloads\game\pubg
.\deploy-online.bat
```

This script will:

- Initialize Git repository
- Commit your code
- Help you push to GitHub
- Show deployment options

### Step 2: Deploy on Render.com

1. Go to https://render.com
2. Click **Sign Up** (use GitHub login)
3. Click **New +** → **Web Service**
4. Connect your GitHub repository
5. Click **Apply** (auto-uses `render.yaml`)
6. Wait 3-5 minutes
7. Done! Your URL: `https://99-idea-puzzle.onrender.com`

### Step 3: Share & Play!

- Open your live URL
- Share with friends
- Play multiplayer online!

## 🎯 Alternative: Manual Deploy

If script doesn't work:

```powershell
# 1. Init Git
git init
git add .
git commit -m "Initial commit"

# 2. Create GitHub repo at https://github.com/new

# 3. Push code
git remote add origin https://github.com/YOUR-USERNAME/99-idea-puzzle.git
git branch -M main
git push -u origin main

# 4. Deploy on Render.com (follow Step 2 above)
```

## 📋 Files Created for You

✅ `render.yaml` - Render.com auto-deploy config  
✅ `Procfile` - Railway/Heroku config  
✅ `.gitignore` - Excludes node_modules  
✅ `package.json` - Updated with correct scripts  
✅ `DEPLOY-ONLINE.md` - Complete deployment guide  
✅ `deploy-online.bat` - Automated deploy script

## 🔗 Quick Links

- **Render.com**: https://render.com (Free forever)
- **Railway.app**: https://railway.app (Free $5 credit)
- **Vercel**: https://vercel.com (Free tier)
- **GitHub**: https://github.com/new (Create repo)

## ⚡ After Deployment

### Update Mobile App

If you built an APK, update it with your live server:

```powershell
cd Game
# Edit capacitor.config.json - change server URL to your live URL
npx cap sync android
npx cap open android
# Rebuild APK
```

### Share Your Game

- Copy your live URL
- Share on WhatsApp, Discord, social media
- Friends can play instantly - no installation needed!

## 🆘 Need Help?

**Deployment failing?**

- Check `DEPLOY-ONLINE.md` for troubleshooting
- Verify all files are committed
- Check deployment logs on platform

**Game not loading?**

- Wait for deployment to complete (3-5 min)
- Check server logs for errors
- Try different browser

**Still stuck?**

- Read full guide: `DEPLOY-ONLINE.md`
- Check platform documentation
- Verify Node.js version (18+)

---

**You're just 5 minutes away from playing online! 🎮**
