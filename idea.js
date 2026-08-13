// --- CONFIGURATION ---
const GRID_SIZE = 4;
const PATH_LENGTH = 5;

// Helper: Generates a random snake-like path
function createRandomPath(size, pathLength) {
    const path = [];
    let r = Math.floor(Math.random() * size);
    let c = Math.floor(Math.random() * size);
    path.push([r, c]);

    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    while (path.length < pathLength) {
        const validMoves = directions
            .map(([dr, dc]) => [r + dr, c + dc])
            .filter(([nr, nc]) => 
                nr >= 0 && nr < size && nc >= 0 && nc < size &&
                !path.some(([pr, pc]) => pr === nr && pc === nc)
            );

        if (validMoves.length === 0) return createRandomPath(size, pathLength); // Dead end, retry

        const [nr, nc] = validMoves[Math.floor(Math.random() * validMoves.length)];
        path.push([nr, nc]);
        r = nr;
        c = nc;
    }
    return path;
}

// Solver: Backtracking depth-first search (DFS) to count valid paths
function findAllSolutions(grid, size, start, end, targetSum) {
    let solutionCount = 0;
    const visited = Array(size).fill(null).map(() => Array(size).fill(false));

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
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

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
}

// Main function to generate a valid, unique puzzle
function generateSumPathPuzzle(size = GRID_SIZE, pathLength = PATH_LENGTH) {
    let grid, path, targetSum;
    let attempts = 0;

    while (attempts < 1000) {
        attempts++;
        
        // 1. Generate a random path
        path = createRandomPath(size, pathLength);
        grid = Array(size).fill(null).map(() => Array(size).fill(0));

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
                solutionPath: path
            };
        }
    }
    throw new Error("Could not generate a unique puzzle. Try changing constraints.");
}

// --- HOW TO RUN IT ---
const puzzle = generateSumPathPuzzle();

console.log("🎯 TARGET SUM:", puzzle.targetSum);
console.log("🏁 START CELL:", puzzle.start);
console.log("🏆 END CELL:", puzzle.end);
console.log("\n🎲 THE GRID:");
console.log(puzzle.grid.map(row => row.join("  ")).join("\n"));
