const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 960;
canvas.height = 720;

ctx.imageSmoothingEnabled = false;

// =====================================================
// CONFIG
// =====================================================

const TILE = 32;

const ROWS = 21;
const COLS = 28;

const WALL = 1;
const DOT = 0;
const EMPTY = 2;

// =====================================================
// MAPA TIPO PACMAN
// =====================================================

const map = [
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,0,1],
[1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,1,1,0,1,1,1,0,1,1,1,1,1,1,1,1,0,1,1,1,0,1,1,1,0,0,1],
[1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
[1,1,1,1,1,1,0,1,1,1,1,0,1,1,1,0,1,1,1,1,1,1,1,1,0,1,1,1],
[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1],
[1,0,1,1,0,1,1,1,1,0,1,1,1,2,2,1,1,0,1,1,1,1,0,1,1,1,0,1],
[1,0,0,0,0,0,0,0,1,0,0,0,0,2,2,0,0,0,1,0,0,0,0,0,0,0,0,1],
[1,1,1,1,1,1,0,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,1,1,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,0,1],
[1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
[1,1,1,1,0,1,1,1,1,0,1,1,1,1,1,1,1,1,0,1,1,1,0,1,1,1,0,1],
[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
[1,0,1,1,1,1,1,0,1,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

// =====================================================
// PLAYER
// =====================================================

const pacman = {
    x: 1 * TILE + TILE / 2,
    y: 1 * TILE + TILE / 2,
    radius: 12,
    speed: 3.2,

    dirX: 0,
    dirY: 0,

    nextX: 0,
    nextY: 0,

    mouth: 0.2,
    mouthDir: 0.05,

    angle: 0
};

// =====================================================
// GHOSTS
// =====================================================

const ghostColors = [
    "#ff4d6d",
    "#00e5ff",
    "#ffea00",
    "#8a2be2",
    "#00ff88",
    "#ff7b00"
];

const ghosts = [];

for (let i = 0; i < 6; i++) {
    ghosts.push({
        x: 13 * TILE + Math.random() * 40,
        y: 10 * TILE + Math.random() * 40,

        radius: 11,

        speed: 2.2,

        dirX: 0,
        dirY: -1,

        color: ghostColors[i]
    });
}

// =====================================================
// INPUT
// =====================================================

const keys = {};

window.addEventListener("keydown", e => {
    keys[e.key] = true;
});

window.addEventListener("keyup", e => {
    keys[e.key] = false;
});

// =====================================================
// HELPERS
// =====================================================

function isWall(x, y) {

    const col = Math.floor(x / TILE);
    const row = Math.floor(y / TILE);

    if (
        row < 0 ||
        row >= ROWS ||
        col < 0 ||
        col >= COLS
    ) return true;

    return map[row][col] === WALL;
}

// =====================================================
// MOVEMENT
// =====================================================

function updatePacman() {

    if (keys["ArrowLeft"]) {
        pacman.nextX = -1;
        pacman.nextY = 0;
    }

    if (keys["ArrowRight"]) {
        pacman.nextX = 1;
        pacman.nextY = 0;
    }

    if (keys["ArrowUp"]) {
        pacman.nextX = 0;
        pacman.nextY = -1;
    }

    if (keys["ArrowDown"]) {
        pacman.nextX = 0;
        pacman.nextY = 1;
    }

    const testX =
        pacman.x + pacman.nextX * pacman.speed;

    const testY =
        pacman.y + pacman.nextY * pacman.speed;

    if (
        !isWall(testX + pacman.radius, testY) &&
        !isWall(testX - pacman.radius, testY) &&
        !isWall(testX, testY + pacman.radius) &&
        !isWall(testX, testY - pacman.radius)
    ) {
        pacman.dirX = pacman.nextX;
        pacman.dirY = pacman.nextY;
    }

    const moveX =
        pacman.x + pacman.dirX * pacman.speed;

    const moveY =
        pacman.y + pacman.dirY * pacman.speed;

    if (
        !isWall(moveX + pacman.radius, moveY) &&
        !isWall(moveX - pacman.radius, moveY) &&
        !isWall(moveX, moveY + pacman.radius) &&
        !isWall(moveX, moveY - pacman.radius)
    ) {
        pacman.x = moveX;
        pacman.y = moveY;
    }

    pacman.mouth += pacman.mouthDir;

    if (pacman.mouth > 0.7 || pacman.mouth < 0.15) {
        pacman.mouthDir *= -1;
    }

    if (pacman.dirX === 1) pacman.angle = 0;
    if (pacman.dirX === -1) pacman.angle = Math.PI;
    if (pacman.dirY === 1) pacman.angle = Math.PI / 2;
    if (pacman.dirY === -1) pacman.angle = -Math.PI / 2;

    // pellets

    const col = Math.floor(pacman.x / TILE);
    const row = Math.floor(pacman.y / TILE);

    if (map[row][col] === DOT) {
        map[row][col] = EMPTY;
    }
}

// =====================================================
// GHOST AI
// =====================================================

function updateGhosts() {

    ghosts.forEach(g => {

        const dx = pacman.x - g.x;
        const dy = pacman.y - g.y;

        const dist = Math.hypot(dx, dy);

        let moveX = dx / dist;
        let moveY = dy / dist;

        const testX = g.x + moveX * g.speed;
        const testY = g.y + moveY * g.speed;

        if (
            !isWall(testX + g.radius, testY) &&
            !isWall(testX - g.radius, testY) &&
            !isWall(testX, testY + g.radius) &&
            !isWall(testX, testY - g.radius)
        ) {
            g.x = testX;
            g.y = testY;
        }
        else {

            const dirs = [
                [1,0],
                [-1,0],
                [0,1],
                [0,-1]
            ];

            const rand =
                dirs[Math.floor(Math.random() * dirs.length)];

            const rx = g.x + rand[0] * g.speed;
            const ry = g.y + rand[1] * g.speed;

            if (
                !isWall(rx + g.radius, ry) &&
                !isWall(rx - g.radius, ry) &&
                !isWall(rx, ry + g.radius) &&
                !isWall(rx, ry - g.radius)
            ) {
                g.x = rx;
                g.y = ry;
            }
        }
    });
}

// =====================================================
// DRAW MAP
// =====================================================

function drawMap() {

    for (let row = 0; row < ROWS; row++) {

        for (let col = 0; col < COLS; col++) {

            const tile = map[row][col];

            const x = col * TILE;
            const y = row * TILE;

            if (tile === WALL) {

                ctx.fillStyle = "#3a0ca3";
                ctx.fillRect(x, y, TILE, TILE);

                ctx.strokeStyle = "#ff00aa";
                ctx.lineWidth = 2;

                ctx.strokeRect(x, y, TILE, TILE);
            }

            if (tile === DOT) {

                ctx.fillStyle = "#ffd6ff";

                ctx.fillRect(
                    x + TILE / 2 - 2,
                    y + TILE / 2 - 2,
                    4,
                    4
                );
            }
        }
    }
}

// =====================================================
// DRAW PACMAN
// =====================================================

function drawPacman() {

    ctx.save();

    ctx.translate(pacman.x, pacman.y);

    ctx.rotate(pacman.angle);

    ctx.beginPath();

    ctx.moveTo(0,0);

    ctx.arc(
        0,
        0,
        pacman.radius,
        pacman.mouth,
        Math.PI * 2 - pacman.mouth
    );

    ctx.fillStyle = "#ffe600";
    ctx.fill();

    ctx.restore();
}

// =====================================================
// DRAW GHOSTS
// =====================================================

function drawGhosts() {

    ghosts.forEach(g => {

        ctx.fillStyle = g.color;

        ctx.beginPath();

        ctx.arc(
            g.x,
            g.y,
            g.radius,
            Math.PI,
            0
        );

        ctx.lineTo(g.x + g.radius, g.y + g.radius);

        for (let i = 0; i < 4; i++) {

            ctx.lineTo(
                g.x + g.radius - i * 6,
                g.y + g.radius - (i % 2 === 0 ? 0 : 6)
            );
        }

        ctx.closePath();

        ctx.fill();

        // eyes

        ctx.fillStyle = "white";

        ctx.beginPath();
        ctx.arc(g.x - 4, g.y - 2, 3, 0, Math.PI * 2);
        ctx.arc(g.x + 4, g.y - 2, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#001";

        ctx.beginPath();
        ctx.arc(g.x - 4, g.y - 2, 1.5, 0, Math.PI * 2);
        ctx.arc(g.x + 4, g.y - 2, 1.5, 0, Math.PI * 2);
        ctx.fill();
    });
}

// =====================================================
// MAIN LOOP
// =====================================================

function gameLoop() {

    ctx.clearRect(0,0,canvas.width,canvas.height);

    drawMap();

    updatePacman();
    updateGhosts();

    drawPacman();
    drawGhosts();

    requestAnimationFrame(gameLoop);
}

gameLoop();
