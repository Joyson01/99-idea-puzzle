# 3 Color Merge Puzzle (Multiplayer + Solo)

A modern web-based puzzle game supporting both multiplayer (Socket.IO) and offline single-player mode. Features 5 difficulty levels, an AI hint system, and clean UX.

## Prerequisites

- Node.js v16+ (tested up to v25)
- npm v8+
- Windows PowerShell (default shell) or any terminal

Verify versions:

```powershell
node --version
npm --version
```

## Installation

```powershell
# Navigate to the project folder
cd "C:\Users\joyso\OneDrive\Documents\Coding\Website\Game"

# Install dependencies
npm install
```

## Running

```powershell
# Start the server
npm start

# Optional: run in dev mode with auto-reload
npm run dev
```

The app runs at `http://localhost:3000` by default.

### Change Port

If port 3000 is busy, run on a different port:

```powershell
$env:PORT=3001
npm start
```

## Gameplay

### Single Player

1. Open `http://localhost:3000`
2. Enter your name
3. Select difficulty (Easy → Insane)
4. Click "🎮 Play Solo"
5. Use arrow keys/WASD to move
6. Press `SET` when all balls are adjacent to targets

### Multiplayer

1. Window A: Enter name → Select difficulty → Click "Create Room"
2. Window B: Enter name → Click "Join Room" → Enter 6-char room code
3. Both click "Ready" → Game starts

### Controls

- Arrow keys or `WASD`: Move
- `Space` or `Enter`: SET
- `Hint`: AI suggests next move

## Testing & Verification

```powershell
# Start server
npm start
```

- Open `http://localhost:3000`
- Verify single-player: board renders, moves work, hint shows
- Verify multiplayer: two windows sync, turns alternate, scores update

## Troubleshooting

### Port 3000 in use (EADDRINUSE)

```powershell
# Find processes on 3000
netstat -ano | findstr :3000

# Kill offending PID (example: 6720)
taskkill /PID 6720 /F

# Or switch port
$env:PORT=3001
npm start
```

### Reset stuck Node processes

```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

### No board / solo won’t start

- Make sure the game screen appears after clicking "Play Solo"
- If not, refresh the page (`Ctrl+F5`) and try again

## Project Scripts

- `npm start`: Run production server
- `npm run dev`: Run with `nodemon` auto-reload

## Structure

```
Game/
├─ public/
│  ├─ index.html
│  ├─ style.css
│  ├─ client.js
│  ├─ temp.html
├─ server.js
├─ game-logic.js
├─ package.json
├─ README.md
├─ CHANGELOG.md
├─ CODE_REVIEW.md
├─ TESTING_GUIDE.md
├─ COMPLETE_REVIEW_REPORT.md
```

## Notes

- Single-player runs fully client-side (no sockets required)
- Multiplayer uses Socket.IO for real-time sync
- AI hint system uses A\* with difficulty-based limits

## License

ISC
