// ===============================
// 🌸 OvuPac - Retro Hormonal Arcade
// FIXED FULL VERSION
// ===============================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 1100;
canvas.height = 700;

// ===============================
// GAME STATE
// ===============================

let score = 0;
let lives = 3;
let questions = 0;

const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const questionsEl = document.getElementById("questions");

// ===============================
// MAP
// 0 = pellet
// 1 = wall
// 2 = empty
// ===============================

const map = [
"1111111111111111111111111",
"1000000000000000000000001",
"1011110111110111110111101",
"1000000000000000000000001",
"1011110111110111110111101",
"1000000000000000000000001",
"1011110111112111110111101",
"1000000000200000000000001",
"1011110111110111110111101",
"1000000000000000000000001",
"1111111111111111111111111"
];

const TILE = 44;

// ===============================
// PLAYER
// ===============================

const pacman = {
    x: TILE * 1.5,
    y: TILE * 1.5,
    size: 18,
    speed: 2.2,
    dx: 0,
    dy: 0,
    nextDx: 0,
    nextDy: 0,
    mouth: 0.2,
    mouthDir: 0.02,
    angle: 0
};

// ===============================
// GHOSTS (RETRO STYLE)
// ===============================

const ghosts = [
{
    x: TILE * 12,
    y: TILE * 5,
    color: "#ff4fd8",
    dx: 1.2,
    dy: 0
},
{
    x: TILE * 15,
    y: TILE * 5,
    color: "#38e1ff",
    dx: -1.2,
    dy: 0
}
];

// ===============================
// INPUT
// ===============================

document.addEventListener("keydown", e => {

    if (e.key === "ArrowUp") {
        pacman.nextDx = 0;
        pacman.nextDy = -pacman.speed;
    }

    if (e.key === "ArrowDown") {
        pacman.nextDx = 0;
        pacman.nextDy = pacman.speed;
    }

    if (e.key === "ArrowLeft") {
        pacman.nextDx = -pacman.speed;
        pacman.nextDy = 0;
    }

    if (e.key === "ArrowRight") {
        pacman.nextDx = pacman.speed;
        pacman.nextDy = 0;
    }

});

// ===============================
// COLLISION
// ===============================

function isWall(x, y) {

    const row = Math.floor(y / TILE);
    const col = Math.floor(x / TILE);

    if (!map[row]) return true;

    return map[row][col] === "1";
}

// ===============================
// MOVE PLAYER
// ===============================

function movePacman() {

    const testX = pacman.x + pacman.nextDx;
    const testY = pacman.y + pacman.nextDy;

    if (
        !isWall(testX - pacman.size, testY - pacman.size) &&
        !isWall(testX + pacman.size, testY - pacman.size) &&
        !isWall(testX - pacman.size, testY + pacman.size) &&
        !isWall(testX + pacman.size, testY + pacman.size)
    ) {
        pacman.dx = pacman.nextDx;
        pacman.dy = pacman.nextDy;
    }

    const futureX = pacman.x + pacman.dx;
    const futureY = pacman.y + pacman.dy;

    if (
        !isWall(futureX - pacman.size, futureY - pacman.size) &&
        !isWall(futureX + pacman.size, futureY - pacman.size) &&
        !isWall(futureX - pacman.size, futureY + pacman.size) &&
        !isWall(futureX + pacman.size, futureY + pacman.size)
    ) {
        pacman.x = futureX;
        pacman.y = futureY;
    }

    // Animation

    pacman.mouth += pacman.mouthDir;

    if (pacman.mouth > 0.45 || pacman.mouth < 0.05) {
        pacman.mouthDir *= -1;
    }

    // Direction

    if (pacman.dx > 0) pacman.angle = 0;
    if (pacman.dx < 0) pacman.angle = Math.PI;
    if (pacman.dy > 0) pacman.angle = Math.PI / 2;
    if (pacman.dy < 0) pacman.angle = -Math.PI / 2;

}

// ===============================
// DRAW PACMAN
// ===============================

function drawPacman() {

    ctx.save();

    ctx.translate(pacman.x, pacman.y);
    ctx.rotate(pacman.angle);

    ctx.beginPath();

    ctx.moveTo(0, 0);

    ctx.arc(
        0,
        0,
        pacman.size,
        pacman.mouth,
        Math.PI * 2 - pacman.mouth
    );

    ctx.fillStyle = "#ffe600";
    ctx.shadowColor = "#ffe600";
    ctx.shadowBlur = 15;
    ctx.fill();

    ctx.restore();
}

// ===============================
// DRAW GHOSTS
// ===============================

function drawGhost(ghost) {

    ctx.save();

    ctx.translate(ghost.x, ghost.y);

    ctx.fillStyle = ghost.color;
    ctx.shadowColor = ghost.color;
    ctx.shadowBlur = 15;

    // head

    ctx.beginPath();
    ctx.arc(0, -8, 18, Math.PI, 0);
    ctx.rect(-18, -8, 36, 30);
    ctx.fill();

    // bottom waves

    for (let i = -18; i < 18; i += 12) {
        ctx.beginPath();
        ctx.arc(i + 6, 22, 6, 0, Math.PI);
        ctx.fill();
    }

    // eyes

    ctx.fillStyle = "white";

    ctx.beginPath();
    ctx.arc(-6, -5, 4, 0, Math.PI * 2);
    ctx.arc(6, -5, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// ===============================
// MOVE GHOSTS
// ===============================

function moveGhosts() {

    ghosts.forEach(ghost => {

        const futureX = ghost.x + ghost.dx;
        const futureY = ghost.y + ghost.dy;

        if (
            isWall(futureX - 16, futureY - 16) ||
            isWall(futureX + 16, futureY + 16)
        ) {

            const dirs = [
                [1.2,0],
                [-1.2,0],
                [0,1.2],
                [0,-1.2]
            ];

            const random = dirs[Math.floor(Math.random() * dirs.length)];

            ghost.dx = random[0];
            ghost.dy = random[1];

        } else {

            ghost.x += ghost.dx;
            ghost.y += ghost.dy;

        }

        // collision with player

        const dist = Math.hypot(
            pacman.x - ghost.x,
            pacman.y - ghost.y
        );

        if (dist < 25) {

            lives--;

            livesEl.innerText = lives;

            pacman.x = TILE * 1.5;
            pacman.y = TILE * 1.5;

            if (lives <= 0) {
                alert("GAME OVER");
                location.reload();
            }
        }

    });

}

// ===============================
// PELLETS
// ===============================

function eatPellets() {

    const row = Math.floor(pacman.y / TILE);
    const col = Math.floor(pacman.x / TILE);

    if (map[row][col] === "0") {

        map[row] =
            map[row].substring(0, col) +
            "2" +
            map[row].substring(col + 1);

        score += 10;

        scoreEl.innerText = score;

        // power bars

        const bars = document.querySelectorAll(".fill");

        bars.forEach(bar => {

            let current = parseInt(bar.style.width) || 0;

            if (current < 100) {
                current += 2;
                bar.style.width = current + "%";
            }

        });

    }

}

// ===============================
// DRAW MAP
// ===============================

function drawMap() {

    for (let row = 0; row < map.length; row++) {

        for (let col = 0; col < map[row].length; col++) {

            const tile = map[row][col];

            const x = col * TILE;
            const y = row * TILE;

            // walls

            if (tile === "1") {

                ctx.fillStyle = "#7000c7";
                ctx.strokeStyle = "#ff00a6";

                ctx.lineWidth = 3;

                ctx.fillRect(x, y, TILE, TILE);

                ctx.strokeRect(x, y, TILE, TILE);

            }

            // pellets

            if (tile === "0") {

                ctx.beginPath();

                ctx.arc(
                    x + TILE / 2,
                    y + TILE / 2,
                    4,
                    0,
                    Math.PI * 2
                );

                ctx.fillStyle = "white";
                ctx.fill();

            }

        }

    }

}

// ===============================
// UPDATE UI
// ===============================

function updateUI() {

    scoreEl.innerText = score;
    livesEl.innerText = lives;
    questionsEl.innerText = questions;

}

// ===============================
// GAME LOOP
// ===============================

function gameLoop() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawMap();

    movePacman();

    moveGhosts();

    eatPellets();

    drawPacman();

    ghosts.forEach(drawGhost);

    updateUI();

    requestAnimationFrame(gameLoop);

}

// ===============================
// START GAME
// ===============================

function startGame() {

    const menu = document.getElementById("menuScreen");

    menu.style.display = "none";

    gameLoop();

}

// ===============================
// BUTTON
// ===============================

document
.getElementById("playButton")
.addEventListener("click", startGame);
