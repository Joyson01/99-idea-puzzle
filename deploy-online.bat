@echo off
echo ========================================
echo 99 Idea Puzzle - Deploy to Web
echo ========================================
echo.

REM Check if git is initialized
if not exist ".git" (
    echo [1/5] Initializing Git repository...
    git init
    git add .
    git commit -m "Initial commit - 99 Idea Puzzle"
    echo Git repository created!
    echo.
) else (
    echo Git repository already exists.
    echo.
)

echo [2/5] Checking for uncommitted changes...
git add .
git status
echo.

set /p commit_msg="Enter commit message (or press Enter for default): "
if "%commit_msg%"=="" set commit_msg="Update game files"

echo.
echo [3/5] Committing changes...
git commit -m "%commit_msg%"
echo.

echo [4/5] Ready to deploy!
echo.
echo ========================================
echo DEPLOYMENT OPTIONS:
echo ========================================
echo.
echo 1. Render.com (Recommended - Free Forever)
echo    - Go to: https://render.com
echo    - Sign up with GitHub
echo    - Click "New +" → "Web Service"
echo    - Connect this repository
echo    - Click "Apply" (auto-detects render.yaml)
echo    - Wait 3-5 minutes for deployment
echo.
echo 2. Railway.app (Free $5 Credit)
echo    - Go to: https://railway.app
echo    - Sign up with GitHub
echo    - Click "New Project" → "Deploy from GitHub repo"
echo    - Select this repository
echo    - Click "Deploy"
echo.
echo 3. Vercel (Alternative - Free)
echo    - Install: npm install -g vercel
echo    - Run: vercel
echo    - Follow prompts
echo.
echo ========================================
echo.

echo [5/5] Push to GitHub?
echo.
echo If you haven't created a GitHub repository yet:
echo 1. Go to https://github.com/new
echo 2. Create repository named: 99-idea-puzzle
echo 3. Copy the commands shown (or continue below)
echo.

set /p push_choice="Do you want to push to GitHub now? (y/n): "

if /i "%push_choice%"=="y" (
    echo.
    set /p github_url="Enter your GitHub repository URL: "
    
    echo.
    echo Adding remote origin...
    git remote remove origin 2>nul
    git remote add origin !github_url!
    
    echo.
    echo Pushing to GitHub...
    git branch -M main
    git push -u origin main
    
    echo.
    echo ========================================
    echo SUCCESS!
    echo ========================================
    echo.
    echo Your code is now on GitHub!
    echo.
    echo Next: Deploy using one of the options above.
    echo See DEPLOY-ONLINE.md for detailed instructions.
) else (
    echo.
    echo Skipping GitHub push.
    echo.
    echo To push later, run:
    echo   git remote add origin YOUR_GITHUB_URL
    echo   git branch -M main
    echo   git push -u origin main
)

echo.
echo ========================================
echo DEPLOYMENT CHECKLIST:
echo ========================================
echo [x] render.yaml created
echo [x] Procfile created
echo [x] .gitignore created
echo [x] package.json updated
echo [x] Git repository ready
echo.
echo Next Steps:
echo 1. Push to GitHub (if not done)
echo 2. Deploy on Render.com or Railway.app
echo 3. Wait 3-5 minutes
echo 4. Share your game URL with friends!
echo.
echo See DEPLOY-ONLINE.md for complete guide.
echo.
pause
