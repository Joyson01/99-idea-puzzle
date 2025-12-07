// ============================================================================
// MULTIPLAYER REALTIME RACE MODE GAME SERVER
// ============================================================================

const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");
const GameLogic = require("./game-logic");

// Server Config
const CONFIG = {
  PORT: process.env.PORT || 3000,
  MAX_PLAYERS: 4,
  ROOM_CODE_LENGTH: 6,
  VALID_DIFFICULTY: ["easy", "medium", "hard", "veryhard", "insane"],
  DEFAULT_DIFFICULTY: "medium",
};

// Express + Socket.io
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Static folder
app.use(express.static(path.join(__dirname, "public")));

const rooms = new Map();

// ============================================================================
// GAME ROOM CLASS (RACE MODE)
// ============================================================================

/**
 * Represents a multiplayer game room with race mode support
 * @class GameRoom
 */
class GameRoom {
  /**
   * Creates a new game room
   * @param {string} roomId - Unique 6-character room identifier
   * @param {string} difficulty - Game difficulty level (easy, medium, hard, veryhard, insane)
   * @param {string|null} hostId - Socket ID of the room host
   */
  constructor(roomId, difficulty, hostId = null) {
    this.roomId = roomId;
    this.difficulty = difficulty;
    this.players = [];
    this.playerBoards = {}; // Every player has independent board
    this.finishOrder = []; // Ranking list
    this.started = false;
    this.currentTurn = 0;
    this.gameState = null; // Shared gameState for compatibility with client
    this.host = hostId; // Initialize host ID to prevent undefined
    this.timerInterval = null; // Timer for race mode
    this.startedAt = null; // Timestamp when game started
  }

  /**
   * Adds a player to the game room
   * @param {string} id - Socket ID of the player
   * @param {string} name - Display name of the player
   * @returns {boolean} True if player was added, false if room is full
   */
  addPlayer(id, name) {
    if (this.players.length >= CONFIG.MAX_PLAYERS) return false;
    this.players.push({ id, name, rank: null, ready: false, score: 0 });
    return true;
  }

  /**
   * Removes a player from the game room and reassigns host if necessary
   * @param {string} id - Socket ID of the player to remove
   * @returns {boolean} True if room should be deleted (no players left), false otherwise
   */
  removePlayer(id) {
    this.players = this.players.filter((p) => p.id !== id);
    delete this.playerBoards[id];

    // If removed player was host, assign new host
    if (this.host === id && this.players.length > 0) {
      this.host = this.players[0].id;
      console.log(`[removePlayer] New host assigned: ${this.host}`);
    }

    if (this.players.length === 0) return true;
    return false;
  }

  /**
   * Starts the game by creating puzzles and initializing race timer
   * Creates both shared gameState and per-player boards for race mode
   */
  startGame() {
    this.started = true;
    this.finishOrder = [];

    // Create a shared puzzle (compatibility with client expectations)
    this.gameState = GameLogic.createPuzzle(7, 3, this.difficulty);

    // Also create per-player boards (legacy/race mode) but keep shared gameState
    for (let p of this.players) {
      // Deep clone shared gameState so each player has their own board object
      this.playerBoards[p.id] = JSON.parse(JSON.stringify(this.gameState));
    }
    // Start global timer for race mode
    this.startedAt = Date.now();
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      io.to(this.roomId).emit("timer", {
        elapsed: Date.now() - this.startedAt,
      });
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      delete this.timerInterval;
    }
    delete this.startedAt;
  }

  setPlayerReady(id, ready) {
    const player = this.players.find((p) => p.id === id);
    if (player) player.ready = !!ready;
  }

  allPlayersReady(minPlayers = 2) {
    return (
      this.players.length >= minPlayers && this.players.every((p) => p.ready)
    );
  }

  getCurrentPlayer() {
    if (this.players.length === 0) return null;
    return this.players[this.currentTurn % this.players.length];
  }

  nextTurn() {
    this.currentTurn++;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generates a random 6-character alphanumeric room code
 * @returns {string} Uppercase 6-character room code
 */
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Sanitizes player name by trimming whitespace and limiting length
 * @param {string} name - Raw player name input
 * @returns {string} Sanitized name (max 20 characters)
 */
function sanitizeName(name) {
  return name.trim().substring(0, 20);
}

// ============================================================================
// SOCKET EVENTS
// ============================================================================
io.on("connection", (socket) => {
  console.log("Player Connected:", socket.id);

  // ---------------- CREATE ROOM ----------------
  socket.on("createRoom", ({ playerName, difficulty }) => {
    playerName = sanitizeName(playerName);

    const roomId = generateRoomCode();
    const diff = CONFIG.VALID_DIFFICULTY.includes(difficulty)
      ? difficulty
      : CONFIG.DEFAULT_DIFFICULTY;

    // Create room with host ID to prevent undefined host
    let room = new GameRoom(roomId, diff, socket.id);
    room.addPlayer(socket.id, playerName);
    rooms.set(roomId, room);

    socket.join(roomId);

    console.log(
      `[createRoom] Created room ${roomId} with host=${room.host} for player=${playerName}`
    );

    socket.emit("roomCreated", {
      roomId,
      players: room.players,
      difficulty: diff,
      hostId: room.host,
    });

    console.log(`Room Created: ${roomId} by ${playerName}`);
  });

  // ---------------- JOIN ROOM ----------------
  socket.on("joinRoom", ({ roomId, playerName }) => {
    try {
      // Validate inputs
      if (!roomId || !playerName) {
        socket.emit("error", { message: "Invalid room code or player name" });
        return;
      }

      playerName = sanitizeName(playerName);
      roomId = roomId.trim().toUpperCase();

      const room = rooms.get(roomId);

      if (!room) {
        socket.emit("error", { message: "Room Not Found!" });
        return;
      }

      if (!room.addPlayer(socket.id, playerName)) {
        socket.emit("error", { message: "Room Full" });
        return;
      }

      socket.join(roomId);

      io.to(roomId).emit("playersUpdate", {
        players: room.players,
        hostId: room.host,
      });

      socket.emit("roomJoined", {
        roomId,
        players: room.players,
        difficulty: room.difficulty,
        hostId: room.host,
      });

      // If the game already started, send the joining player their current board and leaderboard
      if (room.started) {
        const board = room.playerBoards[socket.id];
        if (board) socket.emit("boardUpdate", { playerId: socket.id, board });
        socket.emit("leaderboardUpdate", { players: room.players });
        if (room.startedAt)
          socket.emit("timer", { elapsed: Date.now() - room.startedAt });
      }

      console.log(`${playerName} joined ${roomId}`);
    } catch (error) {
      console.error("[joinRoom] Error:", error);
      socket.emit("error", { message: "Failed to join room" });
    }
  });

  // ---------------- READY TO START ----------------
  // Backward-compatible: allow host to force-start
  socket.on("startGame", ({ roomId }) => {
    try {
      if (!roomId) {
        socket.emit("error", { message: "Room ID is required" });
        return;
      }

      const room = rooms.get(roomId);
      if (!room) {
        console.error(`[startGame] Room not found: ${roomId}`);
        socket.emit("error", { message: "Room not found" });
        return;
      }

      // Validate host
      if (!room.host) {
        console.error(`[startGame] Room ${roomId} has no host assigned`);
        socket.emit("error", { message: "Room has no host" });
        return;
      }

      // Only host can start the game
      console.log(
        `[startGame] Attempting to start from socket=${socket.id}, room.host=${room.host}`
      );
      if (socket.id !== room.host) {
        console.error(
          `[startGame] socket.id ${socket.id} is not the host ${room.host}`
        );
        socket.emit("error", { message: "Only the host can start the game" });
        return;
      }

      // Validate players
      if (room.players.length === 0) {
        socket.emit("error", { message: "No players in room" });
        return;
      }

      console.log(
        `[startGame] Host ${socket.id} starting game in room ${roomId}`
      );
      room.startGame();

      // Emit in client-friendly format and indicate race mode
      io.to(roomId).emit("gameStart", {
        gameState: room.gameState,
        currentPlayer: room.getCurrentPlayer(),
        raceMode: true,
      });

      // Send initial per-player boards to each connected player
      for (let p of room.players) {
        const board = room.playerBoards[p.id];
        if (board) {
          // Broadcast each player's initial board to the room with playerId
          io.to(roomId).emit("boardUpdate", { playerId: p.id, board });
        }
      }

      console.log(`Game Started in Room ${roomId}`);
    } catch (error) {
      console.error("[startGame] Error:", error);
      socket.emit("error", { message: "Failed to start game" });
    }
  });

  // Player toggles ready state; when all ready, server starts the game
  socket.on("playerReady", ({ roomId }) => {
    try {
      if (!roomId) {
        socket.emit("error", { message: "Room ID is required" });
        return;
      }

      const room = rooms.get(roomId);
      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }

      room.setPlayerReady(socket.id, true);
      io.to(roomId).emit("playersUpdate", {
        players: room.players,
        hostId: room.host,
      });

      if (room.allPlayersReady()) {
        // Notify room that all players are ready and that the host can start
        io.to(roomId).emit("allPlayersReady", { hostId: room.host });
        console.log(
          `All players ready in ${roomId} — waiting for host to start`
        );
      }
    } catch (error) {
      console.error("[playerReady] Error:", error);
      socket.emit("error", { message: "Failed to set ready status" });
    }
  });

  // Client may request current players list
  socket.on("getPlayers", ({ roomId }) => {
    try {
      if (!roomId) return;

      const room = rooms.get(roomId);
      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }

      socket.emit("playersUpdate", {
        players: room.players,
        hostId: room.host,
      });
    } catch (error) {
      console.error("[getPlayers] Error:", error);
    }
  });

  // ---------------- MOVEMENT ----------------
  socket.on("makeMove", ({ roomId, dr, dc }) => {
    try {
      const room = rooms.get(roomId);
      if (!room || !room.started) return;

      const board = room.playerBoards[socket.id];
      if (!board) return;

      const result = GameLogic.moveAll(board, dr, dc);
      board.blobs = result.blobs;

      // Broadcast this player's updated board to everyone in the room
      io.to(roomId).emit("boardUpdate", { playerId: socket.id, board });
    } catch (error) {
      console.error("[makeMove] Error:", error);
    }
  });

  // ---------------- SET ENTRY (SOLUTION) ----------------
  socket.on("setEntry", ({ roomId }) => {
    try {
      const room = rooms.get(roomId);
      if (!room || !room.started) return;

      const board = room.playerBoards[socket.id];
      if (!board) {
        socket.emit("error", { message: "Board not found" });
        return;
      }

      const result = GameLogic.setEntry(board);

      if (result.success) {
        if (!room.finishOrder.includes(socket.id)) {
          room.finishOrder.push(socket.id);

          let rank = room.finishOrder.length;

          let player = room.players.find((p) => p.id === socket.id);
          if (player) {
            player.rank = rank;
            player.finishTime = room.startedAt
              ? Date.now() - room.startedAt
              : 0;
            const scoreByRank = [0, 100, 70, 50, 30];
            player.score = (player.score || 0) + (scoreByRank[rank] || 10);
          }

          socket.emit("youFinished", { rank });

          io.to(roomId).emit("leaderboardUpdate", {
            players: room.players.map((p) => ({
              id: p.id,
              name: p.name,
              score: p.score || 0,
              rank: p.rank || null,
              finishTime: p.finishTime || null,
            })),
          });

          console.log(`Player ${player.name} finished Rank ${rank}`);

          if (room.finishOrder.length === room.players.length) {
            room.stopTimer();
            io.to(roomId).emit("gameEnded", {
              message: "All players finished!",
            });
          }
        }
      } else {
        socket.emit("error", { message: "Not Solved Yet!" });
      }
    } catch (error) {
      console.error("[setEntry] Error:", error);
      socket.emit("error", { message: "Failed to complete puzzle" });
    }
  });

  // ---------------- DISCONNECT ----------------
  socket.on("disconnect", () => {
    try {
      console.log("Player Disconnected:", socket.id);

      rooms.forEach((room, roomId) => {
        if (room.players.some((p) => p.id === socket.id)) {
          const wasHost = room.host === socket.id;
          const deleteRoom = room.removePlayer(socket.id);

          if (deleteRoom) {
            if (room.timerInterval) room.stopTimer();
            rooms.delete(roomId);
            console.log(`Room Deleted: ${roomId}`);
          } else {
            // Notify remaining players about updated player list and potentially new host
            io.to(roomId).emit("playersUpdate", {
              players: room.players,
              hostId: room.host,
            });

            if (wasHost && room.players.length > 0) {
              // Notify room that host has changed
              const newHostName =
                room.players.find((p) => p.id === room.host)?.name || "Unknown";
              io.to(roomId).emit("hostChanged", {
                newHostId: room.host,
                newHostName,
              });
              console.log(
                `[disconnect] Host changed in room ${roomId} to ${room.host} (${newHostName})`
              );
            }
          }
        }
      });
    } catch (error) {
      console.error("[disconnect] Error:", error);
    }
  });
});

// ============================================================================
// START SERVER
// ============================================================================
server.listen(CONFIG.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${CONFIG.PORT}`);
});
