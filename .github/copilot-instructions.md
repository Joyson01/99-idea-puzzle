# Copilot Instructions for 3 Color Merge Puzzle

## Project Overview
**3 Color Merge Puzzle** is a multiplayer web-based puzzle game (Socket.IO + Express) with optional single-player mode. Players move colored balls on a grid and align them with targets. Features 5 difficulty levels (Easy 5x5 → Insane 13x13), AI hint system, and turn-based multiplayer.

## Architecture

### Dual-Mode Design
- **Single-Player**: Runs entirely client-side (no Socket.IO), game logic in `GameLogic` class
- **Multiplayer**: Server manages game rooms, Socket.IO syncs state, turn-based play (2-4 players per room)

### Key Files & Responsibilities
| File | Purpose |
|------|---------|
| `Game/server.js` | Express server, Socket.IO events, GameRoom class (room state, players, turns) |
| `Game/game-logic.js` | Shared puzzle logic (move validation, board generation, collision detection) |
| `Game/public/client.js` | UI, Socket.IO listeners, AI hint system (A* search), keyboard/button controls |
| `Game/public/index.html` | Menu, lobby, game screens (screens show/hide with `.active` class) |
| `Game/public/style.css` | Grid rendering, responsive layout for 5x5 to 13x13 boards |

## Data Flow

### Multiplayer Round
1. **Room Creation**: `createRoom` event → generates 6-char code, stores in `rooms` Map
2. **Player Joins**: `joinRoom` event validates room exists & has space, adds to `GameRoom.players`
3. **Game Start**: When `allPlayersReady()` → `gameStart` emitted with initial `gameState`
4. **Move Sequence**: Active player emits `makeMove(dr, dc)` → validated on server → broadcasted as `gameUpdate`
5. **Turn Transition**: Player emits `setEntry` → checks all balls adjacent to targets → new round or next player

### Critical Pattern: Turn Management
- `GameRoom.currentTurn` is array index mod `players.length`
- **Validation**: Server verifies `socket.id === getCurrentPlayer().id` before allowing moves
- Always broadcast state changes to entire room with `io.to(roomId).emit()`

## Game Logic Details

### Puzzle Generation (`GameLogic.createPuzzle`)
- Difficulty → board size & ball count (difficulty settings in both `server.js` CONFIG & `game-logic.js`)
- **Must maintain**: Minimum Manhattan distance between start & target per difficulty
- Retry logic: If 100 attempts fail, decrement ball counter and retry

### Movement (`GameLogic.moveAll`)
- All balls move simultaneously in same direction (dr, dc ∈ {-1, 0, 1})
- **Collision rules**: Stops at boundaries, won't enter another blob's position, special logic for target positions
- Returns `{ blobs: [...], moved: boolean }` to track if any blob actually moved

### Set Condition (`GameLogic.setEntry`)
- **Success**: All blobs must be **adjacent (Manhattan distance = 1)** to their targets
- Sets `king: true` on successful blobs, starts new round

## Common Workflows

### Adding a Feature
1. **Server-side**: Add Socket.IO event in `server.js` → emit to room
2. **Client-side**: Add listener in `client.js` → update UI or `gameState`
3. **Game logic**: If affects movement/collision, modify `GameLogic` methods

### Debugging Multiplayer Issues
- Check room exists: `rooms.get(roomId)` returns undefined?
- Verify turn ownership: Console log `socket.id` vs `currentPlayer.id`
- Board sync: Both clients should receive same `gameState` in `gameUpdate` event
- Use `console.log` in server Socket.IO handlers (prefix with room/player for tracing)

### AI Hint System
- Located in `client.js`: `generateHint()` uses A* search with difficulty-based limits
- `maxDepth`, `maxTime`, `maxNodes` in `DIFFICULTY_INFO` control search scope
- Hint returns next move direction or "No solution found"

## Key Conventions & Patterns

### Room Code Generation
- 6-character alphanumeric, uppercase: `Math.random().toString(36).substring(...)`
- Used as Map key in `rooms` object (validate length on join)

### Player Validation
- Sanitize names: `substring(0, 20)` max length, trim whitespace
- Socket ID = player ID (auto-assigned by Socket.IO)

### Screen Navigation
- Screens managed with CSS class `.active` (only one active at a time)
- Elements: `menu-screen`, `lobby-screen`, `game-screen`
- Toggle with `element.classList.add/remove('active')`

### Difficulty Scaling
- Always check `DIFFICULTY_SETTINGS[difficulty]` before using hardcoded sizes
- Config mirrors between `server.js` and `game-logic.js` — **keep in sync**

## Testing Checklist
- Single-player: Board renders, moves work, hint displays, SET succeeds when adjacent
- Multiplayer (2 windows): Room codes work, players sync, only current player can move, scores update
- Edge cases: Full room rejection, invalid room code, player disconnect mid-game
- Port conflicts: Use `$env:PORT=3001; npm start` if 3000 busy

## Port & Environment
- Default: `http://localhost:3000` (configurable via `$env:PORT`)
- Dev mode: `npm run dev` uses nodemon for auto-reload (requires `nodemon` dev dependency)
- Production: `npm start` runs `node Game/server.js`
