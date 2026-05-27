const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 960;
canvas.height = 640;

const TILE = 40;

const map = [
"########################",
"#......................#",
"#.####.######.#####.##.#",
"#......................#",
"#.####.#.##.#.#####.##.#",
"#......#....#.........##",
"###.##.####.#####.###..#",
"#......................#",
"#.####.#.######.#####..#",
"#......................#",
"#.####.######.#####.##.#",
"#......................#",
"########################"
];

let pellets = [];
let walls = [];

for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {

        const tile = map[y][x];

        if (tile === "#") {
            walls.push({
                x: x * TILE,
                y: y * TILE
            });
        }

        if (tile === ".") {
            pellets.push({
                x: x * TILE + TILE / 2,
                y: y * TILE + TILE / 2,
                active: true
            });
        }
    }
}

const pacman = {
    x: TILE * 1.5,
    y: TILE * 1.5,
    size: 14,
    speed: 3,
    dx: 0,
    dy: 0,
    mouth: 0.2,
    mouthDir: 0.02
};

const ghosts = [
    { x: 440, y: 320, color: "#ff4d6d" },
    { x: 480, y: 320, color: "#4cc9f0" },
    { x: 520, y: 320, color: "#f72585" },
    { x: 560, y: 320, color: "#b5179e" },
    { x: 600, y: 320, color: "#80ed99" },
    { x: 640, y: 320, color: "#ffd60a" }
];

ghosts.forEach(g => {
    g.size = 12;
    g.speed = 2;
    g.dx = 0;
    g.dy = 0;
});

let score = 0;
let lives = 3;

const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");

function updateHUD() {
    scoreEl.textContent = score;
    livesEl.textContent = lives;
}

function drawWalls() {
    walls.forEach(w => {
        ctx.fillStyle = "#2d0066";
        ctx.fillRect(w.x, w.y, TILE, TILE);

        ctx.strokeStyle = "#ff00aa";
        ctx.lineWidth = 3;
        ctx.strokeRect(w.x, w.y, TILE, TILE);
    });
}

function drawPellets() {
    pellets.forEach(p => {
        if (!p.active) return;

        ctx.fillStyle = "#ffd6ff";
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
    });
}

function drawPacman() {

    pacman.mouth += pacman.mouthDir;

    if (pacman.mouth > 0.35 || pacman.mouth < 0.05) {
        pacman.mouthDir *= -1;
    }

    ctx.fillStyle = "yellow";

    ctx.beginPath();

    ctx.moveTo(pacman.x, pacman.y);

    ctx.arc(
        pacman.x,
        pacman.y,
        pacman.size,
        pacman.mouth,
        Math.PI * 2 - pacman.mouth
    );

    ctx.fill();
}

function drawGhost(g) {

    ctx.fillStyle = g.color;

    ctx.fillRect(
        g.x - g.size / 2,
        g.y - g.size / 2,
        g.size,
        g.size
    );

    ctx.fillStyle = "white";

    ctx.fillRect(g.x - 4, g.y - 2, 2, 2);
    ctx.fillRect(g.x + 2, g.y - 2, 2, 2);
}

function collides(x, y, size) {

    for (let w of walls) {

        if (
            x + size > w.x &&
            x - size < w.x + TILE &&
            y + size > w.y &&
            y - size < w.y + TILE
        ) {
            return true;
        }
    }

    return false;
}

function movePacman() {

    let nextX = pacman.x + pacman.dx;
    let nextY = pacman.y + pacman.dy;

    if (!collides(nextX, pacman.y, pacman.size)) {
        pacman.x = nextX;
    }

    if (!collides(pacman.x, nextY, pacman.size)) {
        pacman.y = nextY;
    }

    pellets.forEach(p => {

        if (!p.active) return;

        const dist = Math.hypot(
            pacman.x - p.x,
            pacman.y - p.y
        );

        if (dist < 14) {
            p.active = false;
            score += 10;
            updateHUD();
        }
    });

    const remaining = pellets.filter(p => p.active);

    if (remaining.length === 0) {

        pellets.forEach(p => {
            p.active = true;
        });
    }
}

function moveGhosts() {

    ghosts.forEach(g => {

        let dx = pacman.x - g.x;
        let dy = pacman.y - g.y;

        const dist = Math.hypot(dx, dy);

        dx /= dist;
        dy /= dist;

        const nextX = g.x + dx * g.speed;
        const nextY = g.y + dy * g.speed;

        if (!collides(nextX, g.y, g.size)) {
            g.x = nextX;
        }

        if (!collides(g.x, nextY, g.size)) {
            g.y = nextY;
        }

        const hit = Math.hypot(
            pacman.x - g.x,
            pacman.y - g.y
        );

        if (hit < 18) {

            lives--;

            updateHUD();

            pacman.x = TILE * 1.5;
            pacman.y = TILE * 1.5;

            if (lives <= 0) {
                alert("GAME OVER");
                location.reload();
            }
        }
    });
}

function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawWalls();

    drawPellets();

    drawPacman();

    ghosts.forEach(drawGhost);
}

function gameLoop() {

    movePacman();

    moveGhosts();

    draw();

    requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", e => {

    if (e.key === "ArrowUp") {
        pacman.dx = 0;
        pacman.dy = -pacman.speed;
    }

    if (e.key === "ArrowDown") {
        pacman.dx = 0;
        pacman.dy = pacman.speed;
    }

    if (e.key === "ArrowLeft") {
        pacman.dx = -pacman.speed;
        pacman.dy = 0;
    }

    if (e.key === "ArrowRight") {
        pacman.dx = pacman.speed;
        pacman.dy = 0;
    }
});

updateHUD();

gameLoop();
