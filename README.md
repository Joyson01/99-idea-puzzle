# 99 Idea Puzzle - Multiplayer Game 🎮

A real-time multiplayer puzzle game where players race to solve color-matching challenges!

## 🎯 Features

- 🎮 **Single Player Mode** - Practice offline
- 👥 **Multiplayer Mode** - Play with 2-4 players in real-time
- 🧩 **5 Difficulty Levels** - Easy to Insane (5x5 to 13x13 boards)
- 🤖 **AI Hints** - Get smart suggestions using A\* pathfinding
- 🏆 **Race Mode** - Compete for fastest completion
- 📱 **Mobile Friendly** - Works on phones and tablets via browser

## 🚀 Quick Start

### Play Online (Recommended)

Visit the live game: `https://your-deployed-url.com`

### Run Locally

```powershell
cd Game
npm install
npm start
```

Open browser: `http://localhost:3000`

## 🌐 Deploy Your Own Server

### Option 1: Render.com (Free)

1. Push code to GitHub
2. Connect repository on [render.com](https://render.com)
3. Deploy automatically using `render.yaml`

### Option 2: Railway.app

1. Push code to GitHub
2. Connect repository on [railway.app](https://railway.app)
3. Deploy with one click

See [DEPLOY-ONLINE.md](DEPLOY-ONLINE.md) for complete instructions.

## 🎮 How to Play

1. **Create or Join Room** - Get a 6-character room code
2. **Select Difficulty** - Choose from Easy to Insane
3. **Move Colored Balls** - Use arrow keys or buttons
4. **Match with Targets** - Position balls adjacent to matching colors
5. **Press SET** - When all balls are next to targets
6. **Race to Win** - Complete puzzles faster than opponents!

## 🛠️ Tech Stack

- **Backend**: Node.js + Express
- **Real-time**: Socket.IO
- **Frontend**: Vanilla JavaScript
- **AI**: A\* Pathfinding Algorithm

## 📂 Project Structure

```
pubg/
├── Game/
│   ├── server.js           # Game server
│   ├── game-logic.js       # Puzzle logic
│   ├── public/
│   │   ├── index.html      # Game UI
│   │   ├── client.js       # Client logic
│   │   └── style.css       # Styles
│   └── package.json
├── render.yaml             # Render deployment
├── Procfile               # Railway/Heroku config
└── DEPLOY-ONLINE.md       # Deployment guide
```

## 🔧 Configuration

### Server Port

Default: `3000`  
Production: Uses `process.env.PORT`

### Game Settings

Edit `Game/server.js`:

```javascript
const CONFIG = {
  PORT: process.env.PORT || 3000,
  MAX_PLAYERS: 4,
  VALID_DIFFICULTY: ["easy", "medium", "hard", "veryhard", "insane"],
};
```

## 📖 Documentation

- [Deployment Guide](DEPLOY-ONLINE.md) - Deploy to cloud
- [Quick Deploy Checklist](DEPLOY-CHECKLIST.md) - Fast deployment steps
- [Copilot Instructions](.github/copilot-instructions.md) - Development guide

## 🐛 Troubleshooting

### Server won't start

- Check if port 3000 is available
- Run `npm install` to install dependencies
- Check Node.js version (requires 18+)

### Multiplayer not connecting

- Ensure server is running
- Check firewall settings
- Verify Socket.IO connections in console

## 🤝 Contributing

This is a personal project, but feel free to:

- Fork the repository
- Make improvements
- Share your version!

## 📝 License

ISC License - Free to use and modify

## 🎉 Credits

Developed with ❤️ using AI assistance

---

**Ready to play?** 🎮

👉 [Play Online](https://your-deployed-url.com)  
👉 [Deploy Your Own](DEPLOY-ONLINE.md)  
👉 [Quick Setup Guide](DEPLOY-CHECKLIST.md)
