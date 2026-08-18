const {
  SlashCommandBuilder,
  ContainerBuilder,
  MessageFlags,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { defaultColour } = require("../utils/config");

// --- CONFIGURATION ---
const GRID_SIZE = 10;
const PATH_LENGTH = 10;

// Helper: Generates a random snake-like path
const createRandomPath = (size, pathLength) => {
  const path = [];
  let r = Math.floor(Math.random() * size);
  let c = Math.floor(Math.random() * size);
  path.push([r, c]);

  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  while (path.length < pathLength) {
    const validMoves = directions
      .map(([dr, dc]) => [r + dr, c + dc])
      .filter(
        ([nr, nc]) =>
          nr >= 0 &&
          nr < size &&
          nc >= 0 &&
          nc < size &&
          !path.some(([pr, pc]) => pr === nr && pc === nc),
      );

    if (validMoves.length === 0) return createRandomPath(size, pathLength); // Dead end, retry

    const [nr, nc] = validMoves[Math.floor(Math.random() * validMoves.length)];
    path.push([nr, nc]);
    r = nr;
    c = nc;
  }
  return path;
};

// Solver: Backtracking depth-first search (DFS) to count valid paths
const findAllSolutions = (grid, size, start, end, targetSum) => {
  let solutionCount = 0;
  const visited = Array(size)
    .fill(null)
    .map(() => Array(size).fill(false));

  function dfs(r, c, currentSum) {
    // Optimization: Stop if we already exceeded the target
    if (currentSum > targetSum) return;

    // If we reached the end coordinates
    if (r === end[0] && c === end[1]) {
      if (currentSum === targetSum) {
        solutionCount++;
      }
      return;
    }

    visited[r][c] = true;
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];

    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;

      if (nr >= 0 && nr < size && nc >= 0 && nc < size && !visited[nr][nc]) {
        dfs(nr, nc, currentSum + grid[nr][nc]);
      }
    }

    visited[r][c] = false; // Backtrack
  }

  dfs(start[0], start[1], grid[start[0]][start[1]]);
  return solutionCount;
};

// Main function to generate a valid, unique puzzle
const generateSumPathPuzzle = (size = GRID_SIZE, pathLength = PATH_LENGTH) => {
  let grid, path, targetSum;
  let attempts = 0;

  while (attempts < 1000) {
    attempts++;

    // 1. Generate a random path
    path = createRandomPath(size, pathLength);
    grid = Array(size)
      .fill(null)
      .map(() => Array(size).fill(0));

    // 2. Fill the path with numbers (1-9) and get target sum
    targetSum = 0;
    path.forEach(([r, c]) => {
      const val = Math.floor(Math.random() * 9) + 1;
      grid[r][c] = val;
      targetSum += val;
    });

    // 3. Fill the remaining empty spaces with high decoy numbers (7-9)
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] === 0) {
          grid[r][c] = Math.floor(Math.random() * 3) + 7;
        }
      }
    }

    // 4. Use the solver to check how many valid paths exist
    const start = path[0];
    const end = path[path.length - 1];
    const solutions = findAllSolutions(grid, size, start, end, targetSum);

    // 5. If exactly one path works, we found our unique puzzle!
    if (solutions === 1) {
      return {
        grid,
        start,
        end,
        targetSum,
        solutionPath: path,
      };
    }
  }
  throw new Error(
    "Could not generate a unique puzzle. Try changing constraints.",
  );
};

const generateGridString = (puzzle, playerPath) => {
  const output = ["```╭" + "───".repeat(GRID_SIZE) + "╮\n"];
  for (const row of puzzle.grid) {
    const rowString = row
      .map((cell, colIndex) => {
        const isInPath = playerPath.some(
          ([r, c]) => r === puzzle.grid.indexOf(row) && c === colIndex,
        );
        const isEndCell =
          puzzle.end &&
          puzzle.end[0] === puzzle.grid.indexOf(row) &&
          puzzle.end[1] === colIndex;
        const isStartCell =
          puzzle.start &&
          puzzle.start[0] === puzzle.grid.indexOf(row) &&
          puzzle.start[1] === colIndex;
        return isStartCell
          ? `<${cell}>`
          : isEndCell
            ? `(${cell})`
            : isInPath
              ? `[${cell}]`
              : ` ${cell} `;
      })
      .join("");
    output.push("|" + rowString + "|\n");
  }

  output.push("╰" + "───".repeat(GRID_SIZE) + "╯```");
  return output.join("");
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("grid")
    .setContexts(0)
    .setDescription("Daily grid puzzle"),
  async execute(interaction) {
    const gridContent = [];

    // --- HOW TO RUN IT ---
    const puzzle = generateSumPathPuzzle();
    const playerPath = [puzzle.start]; // Initialize player path with the start cell
    const playerSum = puzzle.grid[puzzle.start[0]][puzzle.start[1]]; // Initialize player sum with the value of the start cell
    console.log("🏁 START CELL:", puzzle.start);
    console.log("🏆 END CELL:", puzzle.end);
    console.log("↪️ SOLUTION PATH:", puzzle.solutionPath);
    gridContent.push(
      "### The Grid",
      `-# Find a path from the <start> to the (end) cell that sums to **${puzzle.targetSum}**`,
      `-# You have **${PATH_LENGTH - playerPath.length}** moves to reach the end.`,
      `-# Use the buttons below to move. The path will be highlighted as you go.`,
    );
    gridContent.push(generateGridString(puzzle, playerPath));

    const gridContainer = new ContainerBuilder()
      .setAccentColor(defaultColour)
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent(gridContent.join("\n")),
      )
      .addActionRowComponents((actionRow) =>
        actionRow.setComponents(
          new ButtonBuilder()
            .setLabel("⬅️")
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("left"),
          new ButtonBuilder()
            .setLabel("⬆️")
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("up"),
          new ButtonBuilder()
            .setLabel("➡️")
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("right"),
          new ButtonBuilder()
            .setLabel("⬇️")
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("down"),
        ),
      );

    await interaction.reply({
      components: [gridContainer],
      flags: MessageFlags.IsComponentsV2,
    });

    // on click:
    // if last selection row == 0, cannot go up
    // if last selection row == GRID_SIZE - 1, cannot go down
    // if last selection col == 0, cannot go left
    // if last selection col == GRID_SIZE - 1, cannot go right
    // if last selection is end cell, cannot move anymore
    // if playerPath.length >= PATH_LENGTH, cannot move anymore
  },
};
