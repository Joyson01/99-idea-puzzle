// ============================================================================
// CLIENT-SIDE MULTIPLAYER GAME
// ============================================================================

// Configuration Constants
const CONFIG = {
  SOCKET_RECONNECTION_DELAY: 1000,
  SOCKET_RECONNECTION_ATTEMPTS: 5,
  HINT_DISPLAY_TIME: 7000,
  NOTIFICATION_DISPLAY_TIME: 3000,
  AI_COMPUTE_DELAY: 50,
  DEFAULT_DIFFICULTY: "medium",
};

const DIFFICULTY_INFO = {
  easy: {
    text: "Easy: 5x5 board, 2 balls - Perfect for beginners!",
    maxDepth: 25,
    maxTime: 2000,
    maxNodes: 10000,
  },
  medium: {
    text: "Medium: 7x7 board, 3 balls - Balanced challenge",
    maxDepth: 25,
    maxTime: 2000,
    maxNodes: 10000,
  },
  hard: {
    text: "Hard: 9x9 board, 4 balls - Expert mode!",
    maxDepth: 30,
    maxTime: 3000,
    maxNodes: 15000,
  },
  veryhard: {
    text: "Very Hard: 11x11 board, 5 balls - Master challenge!",
    maxDepth: 35,
    maxTime: 4000,
    maxNodes: 20000,
  },
  insane: {
    text: "Insane: 13x13 board, 6 balls - Ultimate nightmare!",
    maxDepth: 35,
    maxTime: 4000,
    maxNodes: 20000,
  },
};

// Socket.IO Connection
const socket = io({
  reconnection: true,
  reconnectionDelay: CONFIG.SOCKET_RECONNECTION_DELAY,
  reconnectionAttempts: CONFIG.SOCKET_RECONNECTION_ATTEMPTS,
});

// Game State Variables
let currentRoomId = null;
let currentPlayerId = null;
let gameState = null;
let isMyTurn = false;
let selectedDifficulty = CONFIG.DEFAULT_DIFFICULTY;
let currentPlayers = [];
let isSinglePlayer = false;
let singlePlayerScore = 0;
let singlePlayerMoves = 0;
let isRaceMode = false;
let isHost = false; // whether current player is room host
let playerBoards = {}; // map playerId -> board
let hostId = null; // track current host ID

// DOM elements
const menuScreen = document.getElementById("menu-screen");
const lobbyScreen = document.getElementById("lobby-screen");
const gameScreen = document.getElementById("game-screen");

const playerNameInput = document.getElementById("player-name");
const createRoomBtn = document.getElementById("create-room-btn");
const joinRoomBtn = document.getElementById("join-room-btn");
const joinRoomContainer = document.getElementById("join-room-container");
const roomIdInput = document.getElementById("room-id-input");
const joinRoomSubmit = document.getElementById("join-room-submit");
const cancelJoinBtn = document.getElementById("cancel-join-btn");

const roomCodeDisplay = document.getElementById("room-code");
const copyCodeBtn = document.getElementById("copy-code-btn");
const playersList = document.getElementById("players-list");
const playerCount = document.getElementById("player-count");
const readyBtn = document.getElementById("ready-btn");
const startBtn = document.getElementById("start-btn");
const leaveRoomBtn = document.getElementById("leave-room-btn");
const waitingMessage = document.getElementById("waiting-message");
const hostCanStartMessage = document.getElementById("host-can-start-message");

const board = document.getElementById("board");
const currentTurnDisplay = document.getElementById("current-turn");
const scoresList = document.getElementById("scores-list");
const btnUp = document.getElementById("btn-up");
const btnDown = document.getElementById("btn-down");
const btnLeft = document.getElementById("btn-left");
const btnRight = document.getElementById("btn-right");
const setBtn = document.getElementById("set-btn");
const newRoundBtn = document.getElementById("new-round-btn");
const hintBtn = document.getElementById("hint-btn");
const hintMessage = document.getElementById("hint-message");

const notification = document.getElementById("notification");
const leaderboardModal = document.getElementById("leaderboard-modal");
const leaderboardList = document.getElementById("leaderboard-list");
const leaderboardClose = document.getElementById("leaderboard-close");
const leaderboardCloseBtn = document.getElementById("leaderboard-close-btn");

// Difficulty selection
const difficultyBtns = document.querySelectorAll(".btn-difficulty");
const difficultyInfo = document.getElementById("difficulty-info");

// Single player elements
const playSoloBtn = document.getElementById("play-solo-btn");
const soloStats = document.getElementById("solo-stats");
const soloScoreDisplay = document.getElementById("solo-score");
const soloMovesDisplay = document.getElementById("solo-moves");
const multiplayerTip = document.getElementById("multiplayer-tip");
const soloTip = document.getElementById("solo-tip");
const quitSoloBtn = document.getElementById("quit-solo-btn");

// Screen management
function showScreen(screen) {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  screen.classList.add("active");
}

// ============================================================================
// UI MANAGEMENT - NOTIFICATIONS
// ============================================================================
let notificationTimeout = null;

function showNotification(message, type = "info") {
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }

  notification.textContent = message;
  notification.className = `notification ${type} show`;

  notificationTimeout = setTimeout(() => {
    notification.classList.remove("show");
  }, CONFIG.NOTIFICATION_DISPLAY_TIME);
}

// ============================================================================
// EVENT LISTENERS - DIFFICULTY SELECTION
// ============================================================================
difficultyBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    difficultyBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedDifficulty = btn.dataset.difficulty;

    const difficultyData = DIFFICULTY_INFO[selectedDifficulty];
    if (difficultyData) {
      difficultyInfo.textContent = difficultyData.text;
    }
  });
});

// ============================================================================
// HELPER FUNCTIONS - INPUT VALIDATION
// ============================================================================
/**
 * Validates player name input from the menu screen
 * @returns {string|null} Sanitized player name or null if invalid
 */
function validatePlayerName() {
  const name = playerNameInput.value.trim();
  if (!name || name.length === 0) {
    showNotification("Please enter your name", "error");
    return null;
  }
  if (name.length < 2) {
    showNotification("Name must be at least 2 characters", "error");
    return null;
  }
  return name;
}

/**
 * Validates and sanitizes room code input
 * @param {string} code - Raw room code from user input
 * @returns {string|null} Sanitized 6-character room code or null if invalid
 */
function validateRoomCode(code) {
  const sanitized = code
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  if (sanitized.length !== 6) {
    showNotification("Room code must be 6 characters", "error");
    return null;
  }
  return sanitized;
}

// ============================================================================
// SINGLE PLAYER MODE
// ============================================================================
function startSinglePlayerGame() {
  isSinglePlayer = true;
  isMyTurn = true;
  singlePlayerScore = 0;
  singlePlayerMoves = 0;
  isRaceMode = false; // Ensure race mode is off for solo

  // Create local game state using game logic
  gameState = createLocalPuzzle(selectedDifficulty);

  // Update UI for single player
  if (soloStats) soloStats.style.display = "flex";
  currentTurnDisplay.textContent = "Single Player Mode";
  currentTurnDisplay.className = "your-turn";

  // Hide multiplayer elements
  const leftSidebar = document.querySelector(".left-sidebar");
  if (leftSidebar) leftSidebar.style.display = "none";
  if (multiplayerTip) multiplayerTip.style.display = "none";
  if (soloTip) soloTip.style.display = "list-item";

  // Enable controls
  const controls = [btnUp, btnDown, btnLeft, btnRight, setBtn, hintBtn];
  controls.forEach((btn) => (btn.disabled = false));

  // Show quit button for single player
  if (quitSoloBtn) quitSoloBtn.style.display = "inline-block";

  // Hide new round button in solo mode
  if (newRoundBtn) newRoundBtn.style.display = "none";

  // Update stats display
  updateSoloStats();

  // Show game screen
  showScreen(gameScreen);

  // Render board
  renderBoard();

  showNotification("Single Player Game Started!", "success");
}

function updateSoloStats() {
  if (soloScoreDisplay) {
    soloScoreDisplay.textContent = `Score: ${singlePlayerScore}`;
  }
  if (soloMovesDisplay) {
    soloMovesDisplay.textContent = `Moves: ${singlePlayerMoves}`;
  }
}

function createLocalPuzzle(difficulty) {
  const COLORS = ["red", "yellow", "cyan"];
  const DIFFICULTY_SETTINGS = {
    easy: { size: 5, balls: 2, minDistance: 2 },
    medium: { size: 7, balls: 3, minDistance: 3 },
    hard: { size: 9, balls: 4, minDistance: 4 },
    veryhard: { size: 11, balls: 5, minDistance: 5 },
    insane: { size: 13, balls: 6, minDistance: 6 },
  };

  const settings =
    DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS.medium;
  const actualSize = settings.size;
  const actualBalls = settings.balls;
  const minDistance = settings.minDistance;

  const blobs = [];
  const used = new Set();

  const randomCell = () => {
    let r, c, id;
    do {
      r = Math.floor(Math.random() * actualSize);
      c = Math.floor(Math.random() * actualSize);
      id = `${r}-${c}`;
    } while (used.has(id));
    used.add(id);
    return [r, c];
  };

  const distance = (p1, p2) => {
    return Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1]);
  };

  for (let i = 0; i < actualBalls; i++) {
    const color = COLORS[i % COLORS.length];
    let start, target;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      start = randomCell();
      target = randomCell();
      attempts++;
    } while (distance(start, target) < minDistance && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      used.delete(`${start[0]}-${start[1]}`);
      used.delete(`${target[0]}-${target[1]}`);
      i--;
      continue;
    }

    blobs.push({
      color,
      pos: start,
      target: target,
      king: false,
    });
  }

  return {
    size: actualSize,
    blobs,
    colors: COLORS,
    difficulty,
  };
}

function makeLocalMove(dr, dc) {
  const { size, blobs } = gameState;
  const newPos = [];
  let anyMoved = false;

  for (let i = 0; i < blobs.length; i++) {
    const blob = blobs[i];
    const [r, c] = blob.pos;
    let nr = r + dr;
    let nc = c + dc;

    if (nr < 0 || nr >= size || nc < 0 || nc >= size) {
      newPos.push([r, c]);
      continue;
    }

    const isTarget = blobs.some(
      (b) => b.target[0] === nr && b.target[1] === nc
    );
    if (isTarget) {
      const allAligned = blobs.every((b) => {
        const [br, bc] = b.pos;
        const br2 = br + dr;
        const bc2 = bc + dc;
        return br2 === b.target[0] && bc2 === b.target[1];
      });

      if (!allAligned) {
        newPos.push([r, c]);
        continue;
      }
    }

    const collision = blobs.some((b) => b.pos[0] === nr && b.pos[1] === nc);
    if (collision) {
      newPos.push([r, c]);
      continue;
    }

    newPos.push([nr, nc]);
    if (nr !== r || nc !== c) {
      anyMoved = true;
    }
  }

  gameState.blobs = blobs.map((b, i) => ({ ...b, pos: newPos[i] }));

  if (anyMoved) {
    singlePlayerMoves++;
    updateSoloStats();
  }

  return anyMoved;
}

function tryLocalSet() {
  const { blobs } = gameState;

  const allAligned = blobs.every((b) => {
    const [r, c] = b.pos;
    const [tr, tc] = b.target;
    return Math.abs(r - tr) + Math.abs(c - tc) === 1;
  });

  if (!allAligned) {
    showNotification("All balls must be next to their targets!", "error");
    return false;
  }

  gameState.blobs = blobs.map((b) => ({
    ...b,
    pos: b.target,
    king: true,
  }));

  singlePlayerScore += 100;
  updateSoloStats();
  renderBoard();

  showNotification("🎉 Puzzle Solved! Starting new round...", "success");

  setTimeout(() => {
    gameState = createLocalPuzzle(selectedDifficulty);
    singlePlayerMoves = 0;
    updateSoloStats();
    renderBoard();
  }, 2000);

  return true;
}

// ============================================================================
// EVENT LISTENERS - MENU SCREEN
// ============================================================================
playSoloBtn.addEventListener("click", () => {
  startSinglePlayerGame();
});

// Quit Solo button handler
quitSoloBtn.addEventListener("click", () => {
  isSinglePlayer = false;
  gameState = null;
  singlePlayerScore = 0;
  singlePlayerMoves = 0;
  isMyTurn = false;

  // Hide single-player UI elements
  if (soloStats) soloStats.style.display = "none";
  if (quitSoloBtn) quitSoloBtn.style.display = "none";
  if (soloTip) soloTip.style.display = "none";

  // Hide hint message
  if (hintMessage) hintMessage.classList.add("hidden");
  removeHighlight();

  // Show multiplayer elements
  const leftSidebar = document.querySelector(".left-sidebar");
  if (leftSidebar) leftSidebar.style.display = "flex";
  if (multiplayerTip) multiplayerTip.style.display = "list-item";

  // Reset controls
  const controls = [btnUp, btnDown, btnLeft, btnRight, setBtn, hintBtn];
  controls.forEach((btn) => (btn.disabled = false));

  showScreen(menuScreen);
  showNotification("Exited solo mode", "info");
});

createRoomBtn.addEventListener("click", () => {
  const playerName = validatePlayerName();
  if (!playerName) return;

  isSinglePlayer = false;
  socket.emit("createRoom", { playerName, difficulty: selectedDifficulty });
});

joinRoomBtn.addEventListener("click", () => {
  const playerName = validatePlayerName();
  if (!playerName) return;

  joinRoomContainer.classList.remove("hidden");
  roomIdInput.focus();
});

cancelJoinBtn.addEventListener("click", () => {
  joinRoomContainer.classList.add("hidden");
  roomIdInput.value = "";
});

joinRoomSubmit.addEventListener("click", () => {
  const playerName = validatePlayerName();
  if (!playerName) return;

  const roomId = validateRoomCode(roomIdInput.value);
  if (!roomId) return;

  socket.emit("joinRoom", { roomId, playerName });
});

// Add Enter key support for inputs
playerNameInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") createRoomBtn.click();
});

roomIdInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") joinRoomSubmit.click();
});

// Lobby screen handlers
copyCodeBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(currentRoomId);
  showNotification("Room code copied!", "success");
});

readyBtn.addEventListener("click", () => {
  socket.emit("playerReady", { roomId: currentRoomId });
  readyBtn.disabled = true;
  readyBtn.textContent = "Ready ✓";
  waitingMessage.classList.remove("hidden");
});

leaveRoomBtn.addEventListener("click", () => {
  socket.disconnect();
  socket.connect();
  currentRoomId = null;
  showScreen(menuScreen);
  joinRoomContainer.classList.add("hidden");
  readyBtn.disabled = false;
  readyBtn.textContent = "Ready";
  waitingMessage.classList.add("hidden");
});

// ============================================================================
// GAME CONTROLS
// ============================================================================
btnUp.addEventListener("click", () => makeMove(-1, 0));
btnDown.addEventListener("click", () => makeMove(1, 0));
btnLeft.addEventListener("click", () => makeMove(0, -1));
btnRight.addEventListener("click", () => makeMove(0, 1));

setBtn.addEventListener("click", () => {
  if (!isMyTurn && !isRaceMode) {
    showNotification("Not your turn!", "error");
    return;
  }

  if (isSinglePlayer) {
    tryLocalSet();
  } else {
    socket.emit("setEntry", { roomId: currentRoomId });
  }
});

newRoundBtn.addEventListener("click", () => {
  if (isSinglePlayer) {
    gameState = createLocalPuzzle(selectedDifficulty);
    singlePlayerMoves = 0;
    updateSoloStats();
    renderBoard();
    showNotification("New round started!", "success");
  } else {
    socket.emit("newRound", { roomId: currentRoomId });
  }
});

hintBtn.addEventListener("click", () => {
  if (!isMyTurn && !isRaceMode) {
    showNotification("Not your turn!", "error");
    return;
  }
  showHint();
});

/**
 * Handles ball movement in specified direction (single/multiplayer)
 * @param {number} dr - Row delta (-1, 0, or 1)
 * @param {number} dc - Column delta (-1, 0, or 1)
 */
function makeMove(dr, dc) {
  if (!isMyTurn && !isRaceMode) {
    showNotification("Not your turn!", "error");
    return;
  }

  if (isSinglePlayer) {
    const moved = makeLocalMove(dr, dc);
    if (moved) {
      // Hide hint message when move is made
      hintMessage.classList.add("hidden");
      removeHighlight();
      if (hintTimeout) clearTimeout(hintTimeout);

      renderBoard();
    }
  } else {
    socket.emit("makeMove", { roomId: currentRoomId, dr, dc });
  }
}

// Keyboard controls
document.addEventListener("keydown", (e) => {
  if (gameScreen.classList.contains("active") && (isMyTurn || isRaceMode)) {
    switch (e.key) {
      case "ArrowUp":
      case "w":
      case "W":
        e.preventDefault();
        makeMove(-1, 0);
        break;
      case "ArrowDown":
      case "s":
      case "S":
        e.preventDefault();
        makeMove(1, 0);
        break;
      case "ArrowLeft":
      case "a":
      case "A":
        e.preventDefault();
        makeMove(0, -1);
        break;
      case "ArrowRight":
      case "d":
      case "D":
        e.preventDefault();
        makeMove(0, 1);
        break;
      case " ":
      case "Enter":
        e.preventDefault();
        setBtn.click();
        break;
    }
  }
});

// ============================================================================
// SOCKET EVENT HANDLERS
// ============================================================================
// Host notification: all players are ready
socket.on("allPlayersReady", ({ hostId: receivedHostId }) => {
  try {
    hostId = receivedHostId;
    isHost = hostId === currentPlayerId;
    console.log(
      `[allPlayersReady] hostId=${hostId}, currentPlayerId=${currentPlayerId}, isHost=${isHost}`
    );

    if (isHost) {
      console.log("[allPlayersReady] I am the host — showing start button");
      hostCanStartMessage.classList.remove("hidden");
      startBtn.style.display = "inline-block";
      waitingMessage.classList.add("hidden");
      showNotification("All players ready — you can start the game", "info");
    } else {
      console.log("[allPlayersReady] I am NOT the host — waiting");
      hostCanStartMessage.classList.add("hidden");
      startBtn.style.display = "none";
      waitingMessage.classList.remove("hidden");
      showNotification("All players ready — waiting for host to start", "info");
    }
  } catch (err) {
    console.error("Error handling allPlayersReady:", err);
  }
});

startBtn.addEventListener("click", () => {
  console.log(
    `[startBtn click] isHost=${isHost}, currentPlayerId=${currentPlayerId}`
  );
  if (!isHost) {
    console.error("[startBtn] Not host — aborting");
    showNotification("Only the host can start the game", "error");
    return;
  }
  console.log(`[startBtn] Emitting startGame for roomId=${currentRoomId}`);
  socket.emit("startGame", { roomId: currentRoomId });
  hostCanStartMessage.classList.add("hidden");
  waitingMessage.classList.add("hidden");
});

socket.on("connect", () => {
  try {
    currentPlayerId = socket.id;
    isHost = false; // Reset host status on new connection
    console.log("✅ Connected to server");
  } catch (error) {
    console.error("Error in connect handler:", error);
  }
});

socket.on("disconnect", (reason) => {
  try {
    console.log("❌ Disconnected:", reason);
    if (reason === "io server disconnect") {
      socket.connect();
    }
  } catch (error) {
    console.error("Error in disconnect handler:", error);
  }
});

socket.on("connect_error", (error) => {
  try {
    console.error("⚠️ Connection error:", error);
    showNotification("Connection error. Retrying...", "error");
  } catch (err) {
    console.error("Error in connect_error handler:", err);
  }
});

socket.on("roomCreated", ({ roomId, players, hostId: receivedHostId }) => {
  try {
    currentRoomId = roomId;
    currentPlayers = players;
    hostId = receivedHostId || currentPlayerId;
    roomCodeDisplay.textContent = roomId;
    updatePlayersList(players);
    showScreen(lobbyScreen);
    showNotification("Room created successfully!", "success");
    isHost = hostId === currentPlayerId;
    startBtn.style.display = isHost ? "inline-block" : "none";
  } catch (error) {
    console.error("Error in roomCreated handler:", error);
    showNotification("Error creating room", "error");
  }
});

socket.on("roomJoined", ({ roomId, players, hostId: receivedHostId }) => {
  try {
    currentRoomId = roomId;
    currentPlayers = players;
    hostId = receivedHostId;
    roomCodeDisplay.textContent = roomId;
    updatePlayersList(players);
    showScreen(lobbyScreen);
    showNotification("Joined room successfully!", "success");
    joinRoomContainer.classList.add("hidden");
    roomIdInput.value = "";
    isHost = hostId === currentPlayerId;
    startBtn.style.display = isHost ? "inline-block" : "none";
  } catch (error) {
    console.error("Error in roomJoined handler:", error);
    showNotification("Error joining room", "error");
  }
});

socket.on("playerJoined", ({ players }) => {
  try {
    currentPlayers = players;
    updatePlayersList(players);
    showNotification("A player joined the room", "info");
  } catch (error) {
    console.error("Error in playerJoined handler:", error);
  }
});

socket.on("playerLeft", ({ players }) => {
  try {
    currentPlayers = players;
    updatePlayersList(players);
    showNotification("A player left the room", "info");
  } catch (error) {
    console.error("Error in playerLeft handler:", error);
  }
});

socket.on("playersUpdate", (payload) => {
  try {
    const players =
      payload && payload.players ? payload.players : payload || [];
    const receivedHostId = payload && payload.hostId ? payload.hostId : null;

    currentPlayers = players;

    // Update host only if provided
    if (receivedHostId !== null) {
      hostId = receivedHostId;
    }

    updatePlayersList(players);
    updateScores(players);

    // Am I the host?
    isHost = hostId === currentPlayerId;
    if (isHost && lobbyScreen.classList.contains("active")) {
      startBtn.style.display = "inline-block";
    } else if (!gameScreen.classList.contains("active")) {
      startBtn.style.display = "none";
    }
  } catch (error) {
    console.error("Error in playersUpdate handler:", error);
  }
});

socket.on("gameStart", (payload) => {
  try {
    // Backward-compatible: payload may include raceMode flag from server
    const { gameState: newGameState, currentPlayer, raceMode } = payload || {};
    gameState = newGameState;
    currentStateHash = null; // Reset hint cache
    cachedSolution = null;
    isRaceMode = !!raceMode;

    // In race mode the server will send per-player `boardUpdate` events
    showScreen(gameScreen);
    renderBoard();

    if (isRaceMode) {
      // Enable real-time controls
      const controls = [btnUp, btnDown, btnLeft, btnRight, setBtn, hintBtn];
      controls.forEach((btn) => (btn.disabled = false));
      currentTurnDisplay.textContent = "Real-time Race";
      showNotification("Race started! Play simultaneously!", "success");
    } else {
      updateTurnIndicator(currentPlayer);
      socket.emit("getPlayers", { roomId: currentRoomId });
      showNotification("Game started!", "success");
    }
  } catch (error) {
    console.error("Error in gameStart handler:", error);
    showNotification("Error starting game", "error");
  }
});

// Receive per-player board updates (race mode): replace local gameState and render
socket.on("boardUpdate", (payload) => {
  try {
    // payload may be either a board object (legacy) or { playerId, board }
    let playerId = null;
    let board = null;

    if (payload && payload.playerId && payload.board) {
      playerId = payload.playerId;
      board = payload.board;
    } else if (payload && payload.blobs) {
      // legacy: direct board object — assume it's the local player's board
      board = payload;
      playerId = currentPlayerId;
    } else {
      console.warn("Unknown boardUpdate payload:", payload);
      return;
    }

    // store per-player board
    if (playerId) playerBoards[playerId] = board;

    // If this update is for the current client, use it as authoritative local state
    if (playerId === currentPlayerId) {
      gameState = board;
      currentStateHash = null;
      cachedSolution = null;
      renderBoard();
    }
  } catch (err) {
    console.error("Error handling boardUpdate:", err);
  }
});

// Leaderboard updates when players finish — update side list and modal
socket.on("leaderboardUpdate", (payload) => {
  try {
    const list =
      (payload && (payload.players || payload.results)) || payload || [];

    // Update side scores list
    scoresList.innerHTML = "";
    list.forEach((r) => {
      const div = document.createElement("div");
      div.className = "score-item";
      const name = r.name || r.id || "Player";
      const rank = r.rank != null ? `Rank ${r.rank}` : "-";
      div.innerHTML = `<span class=\"player-name\">${name}</span> <span class=\"player-score\">${rank}</span>`;
      scoresList.appendChild(div);
    });

    // Populate leaderboard modal list
    leaderboardList.innerHTML = "";
    let anyRank = false;
    list.forEach((p) => {
      const item = document.createElement("div");
      item.className =
        "leaderboard-item" + (p.id === currentPlayerId ? " you" : "");
      const name = p.name || p.id || "Player";
      const rankText = p.rank != null ? `#${p.rank}` : "-";
      const time =
        p.finishTime != null ? ` (${Math.round(p.finishTime / 1000)}s)` : "";
      if (p.rank != null) anyRank = true;
      item.innerHTML = `<strong>${rankText}</strong> <span class=\"player-name\">${name}</span> <span class=\"player-time\">${time}</span>`;
      leaderboardList.appendChild(item);
    });

    // Auto-open modal when first rank appears
    if (anyRank && leaderboardModal.classList.contains("hidden")) {
      leaderboardModal.classList.remove("hidden");
    }

    showNotification("Leaderboard updated", "info");
  } catch (err) {
    console.error("Error handling leaderboardUpdate:", err);
  }
});

leaderboardClose.addEventListener("click", () => {
  leaderboardModal.classList.add("hidden");
});

leaderboardCloseBtn.addEventListener("click", () => {
  leaderboardModal.classList.add("hidden");
});

socket.on("youFinished", ({ rank }) => {
  try {
    showNotification(`You finished! Rank ${rank}`, "success");
    // Disable controls for this player after finishing
    const controls = [btnUp, btnDown, btnLeft, btnRight, setBtn, hintBtn];
    controls.forEach((b) => (b.disabled = true));
  } catch (err) {
    console.error("Error handling youFinished:", err);
  }
});

socket.on("gameUpdate", ({ gameState: newGameState }) => {
  try {
    gameState = newGameState;
    currentStateHash = null; // Reset hint cache after move
    cachedSolution = null;

    // Hide hint message when move is made
    hintMessage.classList.add("hidden");
    removeHighlight();
    if (hintTimeout) clearTimeout(hintTimeout);

    renderBoard();
  } catch (error) {
    console.error("Error in gameUpdate handler:", error);
  }
});

socket.on(
  "roundComplete",
  ({ players, gameState: newGameState, currentPlayer }) => {
    try {
      gameState = newGameState;
      currentPlayers = players;
      currentStateHash = null; // Reset hint cache
      cachedSolution = null;
      renderBoard();
      updateScores(players);
      updateTurnIndicator(currentPlayer);
      showNotification("Round completed! 🎉", "success");
    } catch (error) {
      console.error("Error in roundComplete handler:", error);
    }
  }
);

socket.on("gameEnded", ({ message }) => {
  try {
    showNotification(message, "error");
    setTimeout(() => {
      showScreen(lobbyScreen);
    }, 2000);
  } catch (error) {
    console.error("Error in gameEnded handler:", error);
  }
});

// Global race timer updates
socket.on("timer", ({ elapsed }) => {
  try {
    if (!isRaceMode) return;
    currentTurnDisplay.textContent = `Race • ${Math.round(elapsed / 1000)}s`;
  } catch (err) {
    console.error("Error handling timer event:", err);
  }
});

socket.on("hostChanged", ({ newHostId, newHostName }) => {
  try {
    hostId = newHostId;
    isHost = hostId === currentPlayerId;

    if (isHost) {
      showNotification(`You are now the host!`, "success");
      if (lobbyScreen.classList.contains("active")) {
        startBtn.style.display = "inline-block";
      }
    } else {
      showNotification(`${newHostName} is now the host`, "info");
      startBtn.style.display = "none";
    }
  } catch (error) {
    console.error("Error in hostChanged handler:", error);
  }
});

socket.on("error", ({ message }) => {
  try {
    showNotification(message, "error");
  } catch (error) {
    console.error("Error in error handler:", error);
  }
});

// ============================================================================
// HELPER FUNCTIONS - UI UPDATES
// ============================================================================
/**
 * Updates the players list in the lobby screen
 * @param {Array} players - Array of player objects with id, name, ready status
 */
function updatePlayersList(players) {
  playerCount.textContent = players.length;
  playersList.innerHTML = "";

  players.forEach((player) => {
    const playerDiv = document.createElement("div");
    playerDiv.className = "player-item";
    if (player.id === currentPlayerId) {
      playerDiv.classList.add("you");
    }

    const readyIcon = player.ready ? "✓" : "○";
    playerDiv.innerHTML = `
      <span class="player-name">${player.name}${
      player.id === currentPlayerId ? " (You)" : ""
    }</span>
      <span class="ready-status ${
        player.ready ? "ready" : ""
      }">${readyIcon}</span>
    `;

    playersList.appendChild(playerDiv);
  });
}

/**
 * Updates the turn indicator and enables/disables controls
 * @param {Object} currentPlayer - Current player object with id and name
 */
function updateTurnIndicator(currentPlayer) {
  if (!currentPlayer) return;

  // If we're in race mode, don't enforce turn-based restrictions
  if (isRaceMode) {
    isMyTurn = true;
    currentTurnDisplay.textContent = "Real-time Race";
    currentTurnDisplay.className = "your-turn";
    const controls = [btnUp, btnDown, btnLeft, btnRight, setBtn, hintBtn];
    controls.forEach((btn) => (btn.disabled = false));
    return;
  }

  isMyTurn = currentPlayer.id === currentPlayerId;
  currentTurnDisplay.textContent = isMyTurn
    ? "Your Turn! 🎮"
    : `${currentPlayer.name}'s Turn`;

  currentTurnDisplay.className = isMyTurn ? "your-turn" : "";

  // Enable/disable controls
  const controls = [btnUp, btnDown, btnLeft, btnRight, setBtn];
  controls.forEach((btn) => (btn.disabled = !isMyTurn));
}

/**
 * Updates the scores display in the game screen
 * @param {Array} players - Array of player objects with id, name, and score
 */
function updateScores(players) {
  scoresList.innerHTML = "";

  players.forEach((player) => {
    const scoreDiv = document.createElement("div");
    scoreDiv.className = "score-item";
    if (player.id === currentPlayerId) {
      scoreDiv.classList.add("you");
    }

    scoreDiv.innerHTML = `
      <span class="player-name">${player.name}</span>
      <span class="player-score">${player.score}</span>
    `;

    scoresList.appendChild(scoreDiv);
  });
}

/**
 * Renders the game board based on current game state
 * Creates grid cells and places balls, targets, and kings
 */
function renderBoard() {
  if (!gameState) return;
  const { size, blobs } = gameState;
  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${size}, 45px)`;
  board.style.gridTemplateRows = `repeat(${size}, 45px)`;

  // Create grid
  const grid = Array(size)
    .fill()
    .map(() => Array(size).fill(null));

  // Place targets
  blobs.forEach((blob) => {
    const [tr, tc] = blob.target;
    grid[tr][tc] = { type: "target", color: blob.color };
  });

  // Place blobs (they override targets)
  blobs.forEach((blob) => {
    const [r, c] = blob.pos;
    grid[r][c] = { type: blob.king ? "king" : "blob", color: blob.color };
  });

  // Render cells
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";

      const item = grid[r][c];
      if (item) {
        if (item.type === "blob") {
          cell.innerHTML = `<div class="dot" style="background: ${item.color}"></div>`;
        } else if (item.type === "king") {
          cell.innerHTML = `<div class="king" style="background: ${item.color}"></div>`;
        } else if (item.type === "target") {
          cell.innerHTML = `<div class="dot target" style="border: 3px solid ${item.color}; background: #fff"></div>`;
        }
      }

      board.appendChild(cell);
    }
  }
}

// ============================================================================
// OPTIMIZED AI HINT SYSTEM WITH A* PATHFINDING
// ============================================================================
let cachedSolution = null;
let currentStateHash = null;
let isComputingHint = false;
let hintTimeout = null;

function showHint() {
  if (!gameState) {
    console.warn("No game state available");
    return;
  }

  // Prevent multiple simultaneous hint computations
  if (isComputingHint) {
    showNotification("AI is still thinking...", "info");
    return;
  }

  const { size, blobs } = gameState;

  // Check if puzzle is already solved
  const allAdjacent = blobs.every((blob) => {
    const [r, c] = blob.pos;
    const [tr, tc] = blob.target;
    return Math.abs(r - tr) + Math.abs(c - tc) === 1;
  });

  if (allAdjacent) {
    hintMessage.innerHTML =
      "✅ <strong>Perfect!</strong> All balls are adjacent to targets. Press <strong>SET</strong> to win!";
    hintMessage.className = "hint-message success";
    hintMessage.classList.remove("hidden");
    setTimeout(() => hintMessage.classList.add("hidden"), 4000);
    return;
  }

  // Calculate state hash
  const stateHash = JSON.stringify(blobs.map((b) => b.pos));

  // Use cached solution if state hasn't changed
  if (
    currentStateHash === stateHash &&
    cachedSolution &&
    cachedSolution.length > 0
  ) {
    displayHintResult(cachedSolution[0]);
    return;
  }

  // Show loading state
  isComputingHint = true;
  hintBtn.disabled = true;
  hintMessage.innerHTML =
    "🔄 <strong>AI Computing...</strong> Analyzing optimal moves...";
  hintMessage.className = "hint-message info";
  hintMessage.classList.remove("hidden");

  // Compute solution asynchronously
  currentStateHash = stateHash;
  setTimeout(() => {
    try {
      cachedSolution = solvePuzzleAI(blobs, size);

      if (!cachedSolution || cachedSolution.length === 0) {
        hintMessage.innerHTML =
          "🤔 <strong>Complex Puzzle!</strong> Try moving balls closer to their targets.";
        hintMessage.className = "hint-message warning";
        setTimeout(() => hintMessage.classList.add("hidden"), 4000);
      } else {
        displayHintResult(cachedSolution[0]);
      }
    } catch (error) {
      console.error("Hint computation error:", error);
      hintMessage.innerHTML =
        "❌ <strong>Error</strong> Computing hint. Try again.";
      hintMessage.className = "hint-message warning";
      setTimeout(() => hintMessage.classList.add("hidden"), 3000);
    } finally {
      isComputingHint = false;
      hintBtn.disabled = false;
    }
  }, 50); // Small delay to allow UI to update
}

function displayHintResult(nextMove) {
  if (!nextMove) return;

  const { dirName, arrow, willMove, explanation, totalSteps } = nextMove;

  // Clear previous highlights
  removeHighlight();

  // Highlight balls that will move
  willMove.forEach((blob) => {
    highlightBall(blob.pos[0], blob.pos[1], blob.color);
  });

  // Create hint display
  const movingBalls = willMove
    .map(
      (b) =>
        `<span style="color: ${b.color}; font-weight: bold; text-shadow: 0 0 5px ${b.color};">${b.color}</span>`
    )
    .join(", ");

  const confidence =
    totalSteps <= 6 ? "HIGH" : totalSteps <= 12 ? "MEDIUM" : "COMPLEX";
  const confidenceEmoji =
    confidence === "HIGH" ? "🎯" : confidence === "MEDIUM" ? "⚡" : "🧩";

  hintMessage.innerHTML = `
    ${confidenceEmoji} <strong>AI Confidence: ${confidence}</strong> (${totalSteps} moves)<br>
    ${arrow} <strong>Press ${dirName}</strong><br>
    <small>Moving: ${movingBalls} | ${explanation}</small>
  `;
  hintMessage.className = "hint-message info";
  hintMessage.classList.remove("hidden");

  // Clear previous timeout
  if (hintTimeout) clearTimeout(hintTimeout);

  // Auto-hide after delay
  hintTimeout = setTimeout(() => {
    hintMessage.classList.add("hidden");
    removeHighlight();
  }, CONFIG.HINT_DISPLAY_TIME);
}

// ============================================================================
// OPTIMIZED A* PUZZLE SOLVER
// ============================================================================
function solvePuzzleAI(blobs, size) {
  const startTime = performance.now();
  const directions = [
    { dr: -1, dc: 0, name: "UP", arrow: "⬆️" },
    { dr: 1, dc: 0, name: "DOWN", arrow: "⬇️" },
    { dr: 0, dc: -1, name: "LEFT", arrow: "⬅️" },
    { dr: 0, dc: 1, name: "RIGHT", arrow: "➡️" },
  ];

  // Get difficulty-based parameters from configuration
  const difficultyConfig =
    DIFFICULTY_INFO[gameState.difficulty] || DIFFICULTY_INFO.medium;
  const maxDepth = difficultyConfig.maxDepth;
  const maxTime = difficultyConfig.maxTime;
  const maxNodes = difficultyConfig.maxNodes;

  const visited = new Set();
  const priorityQueue = new PriorityQueue();

  const initialState = {
    blobs: JSON.parse(JSON.stringify(blobs)),
    moves: [],
    depth: 0,
    cost: 0,
  };

  const initialHash = getStateHash(initialState.blobs);
  const initialHeuristic = calculateHeuristic(initialState.blobs);
  priorityQueue.enqueue(initialState, initialState.cost + initialHeuristic);
  visited.add(initialHash);

  let bestPartial = [];
  let bestHeuristic = Infinity;
  let nodesExplored = 0;

  while (!priorityQueue.isEmpty()) {
    // Check time and node limits
    if (performance.now() - startTime > maxTime) {
      console.log(`⏱️ Timeout after ${nodesExplored} nodes`);
      break;
    }

    if (nodesExplored >= maxNodes) {
      console.log(`🛑 Node limit reached: ${nodesExplored}`);
      break;
    }

    const current = priorityQueue.dequeue();
    nodesExplored++;

    // Check if solved
    if (isGoalState(current.blobs)) {
      console.log(
        `✅ Solved in ${current.depth} moves (${nodesExplored} nodes explored)`
      );
      return current.moves;
    }

    // Track best partial
    const currentHeuristic = calculateHeuristic(current.blobs);
    if (currentHeuristic < bestHeuristic) {
      bestHeuristic = currentHeuristic;
      bestPartial = current.moves;
    }

    // Depth limit
    if (current.depth >= maxDepth) continue;

    // Try each direction
    for (const dir of directions) {
      const { dr, dc, name, arrow } = dir;
      const result = simulateMove(current.blobs, dr, dc, size);

      if (!result.moved) continue;

      const newHash = getStateHash(result.newBlobs);
      if (visited.has(newHash)) continue;

      visited.add(newHash);

      const moveInfo = {
        dirName: name,
        arrow: arrow,
        willMove: result.movedBlobs,
        explanation: generateMoveExplanation(
          result.movedBlobs,
          result.newBlobs
        ),
        totalSteps: current.depth + 1,
      };

      const newState = {
        blobs: result.newBlobs,
        moves: [...current.moves, moveInfo],
        depth: current.depth + 1,
        cost: current.cost + 1,
      };

      const newHeuristic = calculateHeuristic(newState.blobs);
      const priority = newState.cost + newHeuristic * 1.2; // Slightly favor heuristic

      priorityQueue.enqueue(newState, priority);
    }
  }

  console.log(
    `🔍 Partial solution found (${nodesExplored} nodes, ${bestPartial.length} moves)`
  );
  return bestPartial;
}

// Priority Queue implementation for A*
class PriorityQueue {
  constructor() {
    this.items = [];
  }

  enqueue(item, priority) {
    this.items.push({ item, priority });
    this.bubbleUp(this.items.length - 1);
  }

  dequeue() {
    if (this.items.length === 0) return null;
    const result = this.items[0].item;
    const end = this.items.pop();
    if (this.items.length > 0) {
      this.items[0] = end;
      this.sinkDown(0);
    }
    return result;
  }

  bubbleUp(index) {
    const element = this.items[index];
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      const parent = this.items[parentIndex];
      if (element.priority >= parent.priority) break;
      this.items[index] = parent;
      index = parentIndex;
    }
    this.items[index] = element;
  }

  sinkDown(index) {
    const length = this.items.length;
    const element = this.items[index];

    while (true) {
      let leftChildIdx = 2 * index + 1;
      let rightChildIdx = 2 * index + 2;
      let swap = null;

      if (leftChildIdx < length) {
        if (this.items[leftChildIdx].priority < element.priority) {
          swap = leftChildIdx;
        }
      }

      if (rightChildIdx < length) {
        if (
          (swap === null &&
            this.items[rightChildIdx].priority < element.priority) ||
          (swap !== null &&
            this.items[rightChildIdx].priority <
              this.items[leftChildIdx].priority)
        ) {
          swap = rightChildIdx;
        }
      }

      if (swap === null) break;
      this.items[index] = this.items[swap];
      index = swap;
    }
    this.items[index] = element;
  }

  isEmpty() {
    return this.items.length === 0;
  }
}

// ============================================================================
// HEURISTIC FUNCTIONS
// ============================================================================
function calculateHeuristic(blobs) {
  let score = 0;

  // Primary: Manhattan distance to targets
  blobs.forEach((blob) => {
    const [r, c] = blob.pos;
    const [tr, tc] = blob.target;
    const distance = Math.abs(r - tr) + Math.abs(c - tc);
    score += distance * 10;
  });

  // Bonus: Balls already adjacent (very valuable)
  blobs.forEach((blob) => {
    const [r, c] = blob.pos;
    const [tr, tc] = blob.target;
    const distance = Math.abs(r - tr) + Math.abs(c - tc);
    if (distance === 1) {
      score -= 50; // Large bonus
    } else if (distance === 2) {
      score -= 10;
    }
  });

  // Alignment bonus: Same row or column as target
  blobs.forEach((blob) => {
    const [r, c] = blob.pos;
    const [tr, tc] = blob.target;
    if (r === tr || c === tc) {
      score -= 5;
    }
  });

  // Penalty: Balls blocking each other
  for (let i = 0; i < blobs.length; i++) {
    for (let j = i + 1; j < blobs.length; j++) {
      if (isBlobBlocking(blobs[i], blobs[j])) {
        score += 8;
      }
    }
  }

  return score;
}

function isBlobBlocking(blob1, blob2) {
  const [r1, c1] = blob1.pos;
  const [r2, c2] = blob2.pos;
  const [tr2, tc2] = blob2.target;

  // Check if blob1 is on blob2's direct path to target
  const minR = Math.min(r2, tr2);
  const maxR = Math.max(r2, tr2);
  const minC = Math.min(c2, tc2);
  const maxC = Math.max(c2, tc2);

  return (
    r1 >= minR &&
    r1 <= maxR &&
    c1 >= minC &&
    c1 <= maxC &&
    (r1 !== r2 || c1 !== c2)
  );
}

function getStateHash(blobs) {
  return JSON.stringify(blobs.map((b) => b.pos).sort());
}

function isGoalState(blobs) {
  return blobs.every((blob) => {
    const [r, c] = blob.pos;
    const [tr, tc] = blob.target;
    return Math.abs(r - tr) + Math.abs(c - tc) === 1;
  });
}

// ============================================================================
// MOVE SIMULATION
// ============================================================================
function simulateMove(blobs, dr, dc, size) {
  const newBlobs = JSON.parse(JSON.stringify(blobs));
  const movedBlobs = [];
  let anyMoved = false;

  for (let i = 0; i < newBlobs.length; i++) {
    const blob = newBlobs[i];
    const [r, c] = blob.pos;
    const nr = r + dr;
    const nc = c + dc;

    // Boundary check
    if (nr < 0 || nr >= size || nc < 0 || nc >= size) {
      continue;
    }

    // Collision check with other blobs
    const collision = newBlobs.some((b) => b.pos[0] === nr && b.pos[1] === nc);
    if (collision) {
      continue;
    }

    // Target overlap check
    const isTarget = newBlobs.some(
      (b) => b.target[0] === nr && b.target[1] === nc
    );
    if (isTarget) {
      // Only allow if ALL blobs align with targets
      const allAlign = newBlobs.every((b) => {
        const br2 = b.pos[0] + dr;
        const bc2 = b.pos[1] + dc;
        if (br2 < 0 || br2 >= size || bc2 < 0 || bc2 >= size) return false;
        return br2 === b.target[0] && bc2 === b.target[1];
      });
      if (!allAlign) {
        continue;
      }
    }

    // Valid move
    blob.pos = [nr, nc];
    movedBlobs.push({ ...blob, color: blobs[i].color });
    anyMoved = true;
  }

  return { newBlobs, movedBlobs, moved: anyMoved };
}

function generateMoveExplanation(movedBlobs, newBlobs) {
  if (movedBlobs.length === 0) return "No movement";

  const adjacentCount = movedBlobs.filter((blob) => {
    const [r, c] = blob.pos;
    const [tr, tc] = blob.target;
    return Math.abs(r - tr) + Math.abs(c - tc) === 1;
  }).length;

  if (adjacentCount === movedBlobs.length && movedBlobs.length > 1) {
    return `🎯 Perfect! All ${adjacentCount} balls reach target position`;
  }

  if (adjacentCount > 0) {
    return `✨ ${adjacentCount} ball${
      adjacentCount > 1 ? "s" : ""
    } reach target!`;
  }

  const almostCount = movedBlobs.filter((blob) => {
    const [r, c] = blob.pos;
    const [tr, tc] = blob.target;
    return Math.abs(r - tr) + Math.abs(c - tc) === 2;
  }).length;

  if (almostCount > 0) {
    return `⚡ ${almostCount} ball${
      almostCount > 1 ? "s" : ""
    } almost there (2 away)`;
  }

  if (movedBlobs.length > 1) {
    return `Moving ${movedBlobs.length} balls closer to targets`;
  }

  return `Moving ${movedBlobs[0].color} ball toward target`;
}

// ============================================================================
// VISUAL HELPERS
// ============================================================================
function highlightBall(row, col, color) {
  const { size } = gameState;
  const cellIndex = row * size + col;
  const cells = board.querySelectorAll(".cell");

  if (cells[cellIndex]) {
    cells[cellIndex].classList.add("highlight");
    cells[cellIndex].style.boxShadow = `0 0 20px ${color}, 0 0 40px ${color}`;
  }
}

function removeHighlight() {
  const cells = board.querySelectorAll(".cell");
  cells.forEach((cell) => {
    cell.classList.remove("highlight");
    cell.style.boxShadow = "";
  });
}

// ============================================================================
// CLEANUP AND INITIALIZATION
// ============================================================================
/**
 * Cleanup function to run on page unload
 * Clears timeouts and disconnects socket properly
 */
function cleanup() {
  try {
    // Clear all active timeouts
    if (notificationTimeout) clearTimeout(notificationTimeout);
    if (hintTimeout) clearTimeout(hintTimeout);

    // Disconnect socket gracefully
    if (socket && socket.connected) {
      socket.disconnect();
    }

    console.log("Cleanup completed");
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
}

// Handle page unload/close
window.addEventListener("beforeunload", cleanup);

// Handle visibility change (tab switching)
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    // Pause long-running operations when tab is hidden
    if (isComputingHint) {
      console.log("Tab hidden, pausing operations");
    }
  }
});

// Initialize
console.log("✨ Client initialized - 3 Color Merge Puzzle v1.0.0");
