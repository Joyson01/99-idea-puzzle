# 3 Color Merge Puzzle

A browser puzzle game with an Express and Socket.IO server. Players move colored pieces on a grid and position them beside their targets before using **SET**. The server supports rooms for up to four players and five difficulty settings.

## Run locally

Install Node.js and npm, then:

```bash
git clone https://github.com/Joyson01/99-idea-puzzle.git
cd 99-idea-puzzle/Game
npm install
npm start
```

Open http://localhost:3000. Run commands from `Game/`, where `package.json` lives.

For development with automatic server restarts:

```bash
npm run dev
```

The server reads `PORT` from the process environment and defaults to `3000`. For example, on Linux or macOS:

```bash
PORT=3001 npm start
```

## Repository guide

| Path | Purpose |
| --- | --- |
| [Game/server.js](Game/server.js) | HTTP server, room management, and Socket.IO events |
| [Game/game-logic.js](Game/game-logic.js) | Puzzle generation, movement, and SET rules |
| [Game/public/client.js](Game/public/client.js) | Browser interface and game interactions |
| [Game/public/index.html](Game/public/index.html) | Game screens |
| [Game/public/style.css](Game/public/style.css) | Main styles |
| [RESPONSIVE_QUICK_REFERENCE.md](RESPONSIVE_QUICK_REFERENCE.md) | Existing responsive-layout notes |
| [render.yaml](render.yaml) | Hosting configuration |

## Development notes

Room state is held in memory and is lost when the server restarts. The repository does not currently define an automated test command in `Game/package.json`.

To manually check a change, open separate browser windows, create and join a room, then check movement, SET, scores, and disconnection behavior. Test the different difficulty settings and narrow screen sizes.
