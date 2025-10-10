/* Réplica fiel del Maze + DepthFirst + flujo CreateMaze/SetupGenerator de OshwdemMazes */
var OSHWDemMazeGenerator = function () {
    class Maze {
        static Direction = { N: 1, E: 2, S: 4, W: 8 };

        constructor(cols, rows) {
            this.cols = cols;
            this.rows = rows;
            this.cells = Array.from({ length: cols }, () => Array.from({ length: rows }, () => 15));
        }

        setWall(col, row, dir, propagate = true) {
            this.cells[col][row] |= dir;
            if (!propagate) return;
            switch (dir) {
                case Maze.Direction.N: if (row > 0) this.cells[col][row - 1] |= Maze.Direction.S; break;
                case Maze.Direction.S: if (row < this.rows - 1) this.cells[col][row + 1] |= Maze.Direction.N; break;
                case Maze.Direction.W: if (col > 0) this.cells[col - 1][row] |= Maze.Direction.E; break;
                case Maze.Direction.E: if (col < this.cols - 1) this.cells[col + 1][row] |= Maze.Direction.W; break;
            }
        }

        unsetWall(col, row, dir, propagate = true) {
            this.cells[col][row] &= ~dir;
            if (!propagate) return;
            switch (dir) {
                case Maze.Direction.N: if (row > 0) this.cells[col][row - 1] &= ~Maze.Direction.S; break;
                case Maze.Direction.S: if (row < this.rows - 1) this.cells[col][row + 1] &= ~Maze.Direction.N; break;
                case Maze.Direction.W: if (col > 0) this.cells[col - 1][row] &= ~Maze.Direction.E; break;
                case Maze.Direction.E: if (col < this.cols - 1) this.cells[col + 1][row] &= ~Maze.Direction.W; break;
            }
        }

        isOpen(col, row, dir) {
            return (this.cells[col][row] & dir) === 0;
        }

        toString() {
            const cellW = 4, cellH = 2;
            const outH = this.rows * cellH + 1;
            const outW = this.cols * cellW + 1;
            const buf = Array.from({ length: outH }, () => Array.from({ length: outW }, () => ' '));

            // 1) dibujar paredes
            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.cols; c++) {
                    const x = c * cellW;
                    const y = r * cellH;

                    if (!this.isOpen(c, r, Maze.Direction.N)) {
                        buf[y][x] = '+';
                        for (let i = 1; i < cellW; i++) buf[y][x + i] = '-';
                        buf[y][x + cellW] = '+';
                    }
                    if (!this.isOpen(c, r, Maze.Direction.S)) {
                        buf[y + cellH][x] = '+';
                        for (let i = 1; i < cellW; i++) buf[y + cellH][x + i] = '-';
                        buf[y + cellH][x + cellW] = '+';
                    }
                    if (!this.isOpen(c, r, Maze.Direction.W)) {
                        buf[y][x] = '+';
                        for (let i = 1; i < cellH; i++) buf[y + i][x] = '|';
                        buf[y + cellH][x] = '+';
                    }
                    if (!this.isOpen(c, r, Maze.Direction.E)) {
                        buf[y][x + cellW] = '+';
                        for (let i = 1; i < cellH; i++) buf[y + i][x + cellW] = '|';
                        buf[y + cellH][x + cellW] = '+';
                    }
                }
            }

            // 2) START 'S'
            const sx = Math.trunc(cellW / 2);
            const sy = this.rows * cellH - 1;
            if (sy >= 0 && sx >= 0 && sx < outW && sy < outH) buf[sy][sx] = 'S';

            // 3) GOAL 'G'
            let goalCells = [];

            if (Maze.CornerGoal) {
                // esquina superior derecha 2x2
                goalCells.push([this.cols - 2, 0]);
                goalCells.push([this.cols - 1, 0]);
                goalCells.push([this.cols - 2, 1]);
                goalCells.push([this.cols - 1, 1]);
            } else if (Maze.Fixed16Goal) {
                // siempre las cuatro centrales del 16x16 oficial
                goalCells.push([7, this.rows - 9]);
                goalCells.push([7, this.rows - 8]);
                goalCells.push([8, this.rows - 9]);
                goalCells.push([8, this.rows - 8]);
            } else {
                // centro dinámico (middle)
                goalCells = getGoalCells(this.cols, this.rows);
            }

            // Pintar 'G' en el centro visual de cada celda
            goalCells.forEach(([gc, gr]) => {
                if (gc < 0 || gc >= this.cols || gr < 0 || gr >= this.rows) return;
                const gx = gc * cellW + Math.trunc(cellW / 2);
                const gy = gr * cellH + Math.trunc(cellH / 2);
                if (gy >= 0 && gy < outH && gx >= 0 && gx < outW) {
                    buf[gy][gx] = 'G';
                }
            });

            return buf.map(row => row.join('')).join('\n');
        }

    }

    function getGoalCells(cols, rows) {
        const goalCells = [];
        const cx = Math.floor(cols / 2);
        const cy = Math.floor(rows / 2);

        // queremos siempre un bloque 2x2 "centrado" en torno a (cx,cy)
        goalCells.push([cx - 1, cy - 1]);
        goalCells.push([cx, cy - 1]);
        goalCells.push([cx - 1, cy]);
        goalCells.push([cx, cy]);

        return goalCells.filter(([c, r]) => c >= 0 && c < cols && r >= 0 && r < rows);
    }

    class DepthFirst {
        constructor(maze) {
            this.maze = maze;
            this.visited = Array.from({ length: maze.cols }, () => Array.from({ length: maze.rows }, () => false));
            this.straightforward = 0.0;
        }

        IsVisited(col, row) { return this.visited[col][row]; }
        SetVisited(col, row, flag) { this.visited[col][row] = !!flag; }

        Generate(col, row) {
            if (this.straightforward < 0.0) this.straightforward = 0.0;
            if (this.straightforward > 1.0) this.straightforward = 1.0;
            this.visitRec(col, row, Maze.Direction.N);
        }

        visitRec(col, row, previous) {
            this.visited[col][row] = true;
            const FourRoses = [Maze.Direction.N, Maze.Direction.E, Maze.Direction.S, Maze.Direction.W];
            let pending = FourRoses.slice();
            let previous_elegible = true;

            while (pending.length > 0) {
                let direction;
                if (previous_elegible && Math.random() < this.straightforward) {
                    direction = previous;
                    const idx = pending.indexOf(direction);
                    if (idx !== -1) pending.splice(idx, 1);
                    previous_elegible = false;
                } else {
                    const idx = Math.floor(Math.random() * pending.length);
                    direction = pending.splice(idx, 1)[0];
                }

                let c = col, r = row;
                switch (direction) {
                    case Maze.Direction.N: r--; break;
                    case Maze.Direction.E: c++; break;
                    case Maze.Direction.S: r++; break;
                    case Maze.Direction.W: c--; break;
                }

                if (c >= 0 && c < this.maze.cols && r >= 0 && r < this.maze.rows && !this.visited[c][r]) {
                    if (!(col == 0 && row == this.maze.rows - 1 && direction == Maze.Direction.E)) {
                        this.maze.unsetWall(col, row, direction);
                    }
                    this.visitRec(c, r, direction);
                }
            }
        }
    }

    function generateMaze(cols, rows, centerMode = "middle", straightforward = 0.5) {
        const maze = new Maze(cols, rows);
        Maze.CornerGoal = (centerMode === "corner");
        Maze.Fixed16Goal = (centerMode === "fixed16");

        // Entrada (arriba siempre abierta)
        maze.unsetWall(0, rows - 1, Maze.Direction.N);

        if (!Maze.CornerGoal && !Maze.Fixed16Goal) {
            // middle normal
            const midCells = getGoalCells(cols, rows);

            const [c1, r1] = midCells[0]; // arriba izquierda
            const [c2, r2] = midCells[1]; // arriba derecha
            const [c3, r3] = midCells[2]; // abajo izquierda

            maze.unsetWall(c1, r1, Maze.Direction.E);
            maze.unsetWall(c1, r1, Maze.Direction.S);
            maze.unsetWall(c2, r2, Maze.Direction.S);
            maze.unsetWall(c3, r3, Maze.Direction.E);

            // quitar una pared al azar de las 8 externas del bloque central 2x2
            const edges = [
                [midCells[0][0], midCells[0][1], Maze.Direction.N],
                [midCells[0][0], midCells[0][1], Maze.Direction.W],
                [midCells[1][0], midCells[1][1], Maze.Direction.N],
                [midCells[1][0], midCells[1][1], Maze.Direction.E],
                [midCells[2][0], midCells[2][1], Maze.Direction.S],
                [midCells[2][0], midCells[2][1], Maze.Direction.W],
                [midCells[3][0], midCells[3][1], Maze.Direction.S],
                [midCells[3][0], midCells[3][1], Maze.Direction.E]
            ];
            const [c, r, dir] = edges[Math.floor(Math.random() * edges.length)];
            maze.unsetWall(c, r, dir);
        } else if (Maze.CornerGoal) {
            // corner
            maze.unsetWall(cols - 1, 0, Maze.Direction.S);
            maze.unsetWall(cols - 2, 0, Maze.Direction.E);
            maze.unsetWall(cols - 2, 0, Maze.Direction.S);
            maze.unsetWall(cols - 2, 1, Maze.Direction.E);

            // quitar una pared al azar de las 4 posibles de acceso: izquierda o abajo
            const edges = [
                [cols - 2, 1, Maze.Direction.S],
                [cols - 2, 0, Maze.Direction.W],
                [cols - 1, 1, Maze.Direction.S],
                [cols - 2, 1, Maze.Direction.W]
            ];
            const [c, r, dir] = edges[Math.floor(Math.random() * edges.length)];
            maze.unsetWall(c, r, dir);
        } else if (Maze.Fixed16Goal) {
            // fixed16: abrir 2x2 objetivo como antes
            maze.unsetWall(7, rows - 9, Maze.Direction.S);
            maze.unsetWall(7, rows - 9, Maze.Direction.E);
            maze.unsetWall(8, rows - 9, Maze.Direction.S);
            maze.unsetWall(7, rows - 8, Maze.Direction.E);

            // abrir una pared al azar de las 8 externas del bloque para que sea accesible
            const edges = [
                [7, rows - 9, Maze.Direction.N],
                [7, rows - 9, Maze.Direction.W],
                [8, rows - 9, Maze.Direction.N],
                [8, rows - 9, Maze.Direction.E],
                [7, rows - 8, Maze.Direction.S],
                [7, rows - 8, Maze.Direction.W],
                [8, rows - 8, Maze.Direction.S],
                [8, rows - 8, Maze.Direction.E]
            ];
            const [c, r, dir] = edges[Math.floor(Math.random() * edges.length)];
            maze.unsetWall(c, r, dir);
        }

        const generator = new DepthFirst(maze);
        generator.straightforward = straightforward;
        generator.SetVisited(0, rows - 1, true);

        if (!Maze.CornerGoal && !Maze.Fixed16Goal) {
            const midCells = getGoalCells(cols, rows);
            midCells.forEach(([c, r]) => generator.SetVisited(c, r, true));
        } else if (Maze.CornerGoal) {
            generator.SetVisited(cols - 2, 0, true);
            generator.SetVisited(cols - 1, 0, true);
            generator.SetVisited(cols - 2, 1, true);
            generator.SetVisited(cols - 1, 1, true);
        } else if (Maze.Fixed16Goal) {
            generator.SetVisited(7, rows - 9, true);
            generator.SetVisited(7, rows - 8, true);
            generator.SetVisited(8, rows - 9, true);
            generator.SetVisited(8, rows - 8, true);
        }

        generator.Generate(0, rows - 1);

        const webArray = convertMazeToWebArray(maze);
        document.getElementById("maze-array").value = JSON.stringify(webArray);
        return { maze, array: webArray, ascii: maze.toString() };
    }

    function convertMazeToWebArray(maze) {
        const cols = maze.cols;
        const rows = maze.rows;

        const C_N = 1, C_E = 2, C_S = 4, C_W = 8;
        const W_VISITED = 1, W_E = 2, W_S = 4, W_W = 8, W_N = 16;

        const out = [];
        for (let row = rows - 1; row >= 0; row--) {
            for (let col = 0; col < cols; col++) {
                const csharp = maze.cells[col][row];
                let webCell = 0;
                if (csharp & C_N) webCell |= W_N;
                if (csharp & C_E) webCell |= W_E;
                if (csharp & C_S) webCell |= W_S;
                if (csharp & C_W) webCell |= W_W;
                out.push(webCell);
            }
        }

        for (let i = out.length; i < 16 * 16; i++) out.push(0);

        return out;
    }

    return {
        generateMaze: function (cols, rows, centerMode, straightforward) {
            return generateMaze(cols, rows, centerMode, straightforward);
        }
    }

}();
