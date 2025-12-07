// ============================================================================
// SHARED GAME LOGIC MODULE (Server & Client)
// ============================================================================

// Use hex colors for consistency with client rendering
const COLORS = ["#ff4757", "#ffa502", "#1e90ff"];

const DIFFICULTY_SETTINGS = {
  easy: { size: 5, balls: 2, minDistance: 2 },
  medium: { size: 7, balls: 3, minDistance: 3 },
  hard: { size: 9, balls: 4, minDistance: 4 },
  veryhard: { size: 11, balls: 5, minDistance: 5 },
  insane: { size: 13, balls: 6, minDistance: 6 },
};

class GameLogic {
  /**
   * Creates a new puzzle based on difficulty
   * @param {number} size - Default board size (overridden by difficulty)
   * @param {number} numBalls - Default number of balls (overridden by difficulty)
   * @param {string} difficulty - Difficulty level (easy, medium, hard, veryhard, insane)
   * @returns {Object} Puzzle state with size, blobs, colors, and difficulty
   */
  static createPuzzle(size = 7, numBalls = 3, difficulty = "medium") {
    // Get difficulty settings or use defaults
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

      // Ensure minimum distance between start and target
      do {
        start = randomCell();
        target = randomCell();
        attempts++;
      } while (distance(start, target) < minDistance && attempts < maxAttempts);

      // Remove from used set if we need to retry
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

  /**
   * Moves all balls in the specified direction
   * @param {Object} gameState - Current game state
   * @param {number} dr - Row delta (-1, 0, 1)
   * @param {number} dc - Column delta (-1, 0, 1)
   * @returns {Object} New state with moved blobs and movement flag
   */
  static moveAll(gameState, dr, dc) {
    const { size, blobs } = gameState;
    const newPos = [];
    let anyMoved = false;

    for (let i = 0; i < blobs.length; i++) {
      const blob = blobs[i];
      const [r, c] = blob.pos;
      let nr = r + dr;
      let nc = c + dc;

      // Check boundaries
      if (nr < 0 || nr >= size || nc < 0 || nc >= size) {
        newPos.push([r, c]);
        continue;
      }

      // Check if trying to move onto a target
      const isTarget = blobs.some(
        (b) => b.target[0] === nr && b.target[1] === nc
      );
      if (isTarget) {
        // Check if all blobs would align with their targets
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

      // Check if another blob is already at destination
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

    return {
      blobs: blobs.map((b, i) => ({ ...b, pos: newPos[i] })),
      moved: anyMoved,
    };
  }

  /**
   * Attempts to complete the puzzle by setting all balls to their targets
   * @param {Object} gameState - Current game state
   * @returns {Object} Success status and updated blobs if successful
   */
  static setEntry(gameState) {
    const { blobs } = gameState;

    // Check if all balls are next to their targets
    const allAligned = blobs.every((b) => {
      const [r, c] = b.pos;
      const [tr, tc] = b.target;
      return Math.abs(r - tr) + Math.abs(c - tc) === 1;
    });

    if (!allAligned) {
      return {
        success: false,
        message: "All balls must stand next to their targets before SET.",
      };
    }

    // Move all blobs to their targets
    const updatedBlobs = blobs.map((b) => ({
      ...b,
      pos: b.target,
      king: true,
    }));

    return {
      success: true,
      blobs: updatedBlobs,
    };
  }
}

// Export for Node.js
if (typeof module !== "undefined" && module.exports) {
  module.exports = GameLogic;
}
