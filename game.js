const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const gameUI = document.getElementById("gameUI");
const playBtn = document.getElementById("playBtn");

let gameStarted = false;

playBtn.addEventListener("click", () => {

    startScreen.style.display = "none";
    gameUI.style.display = "block";

    gameStarted = true;

    requestAnimationFrame(gameLoop);

});

const TILE = 40;

const map = [
"###########################",
"#.........................#",
"#.#####.#######.#######...#",
"#.........................#",
"#.#####.#.....#.#####.##..#",
"#.......#.....#...........#",
"#.#####.#######.#####.##..#",
"#.........................#",
"#.#####.#.....#.#####.##..#",
"#.........................#",
"###########################"
];

const player = {
    x: 60,
    y: 60,
    size: 28,
    speed: 3,
    dx: 0,
    dy: 0,
    angle: 0
};

const ghosts = [
    {
        x: 500,
        y: 300,
        size: 26,
        color: "#ff4fd8"
    },
    {
        x: 560,
        y: 300,
        size: 26,
        color: "#00e5ff"
    }
];

document.addEventListener("keydown", (e) => {

    if (e.key === "ArrowUp") {
        player.dx = 0;
        player.dy = -player.speed;
        player.angle = 1.5 * Math.PI;
    }

    if (e.key === "ArrowDown") {
        player.dx = 0;
        player.dy = player.speed;
        player.angle = 0.5 * Math.PI;
    }

    if (e.key === "ArrowLeft") {
        player.dx = -player.speed;
        player.dy = 0;
        player.angle = Math.PI;
    }

    if (e.key === "ArrowRight") {
        player.dx = player.speed;
        player.dy = 0;
        player.angle = 0;
    }

});

function drawMap() {

    for (let row = 0; row < map.length; row++) {

        for (let col = 0; col < map[row].length; col++) {

            const tile = map[row][col];

            if (tile === "#") {

                ctx.fillStyle = "#4b0082";
                ctx.fillRect(
                    col * TILE,
                    row * TILE,
                    TILE,
                    TILE
                );

                ctx.strokeStyle = "#ff008c";
                ctx.lineWidth = 3;

                ctx.strokeRect(
                    col * TILE,
                    row * TILE,
                    TILE,
                    TILE
                );

            }

            if (tile === ".") {

                ctx.fillStyle = "#ffd6fa";

                ctx.fillRect(
                    col * TILE + 17,
                    row * TILE + 17,
                    6,
                    6
                );

            }

        }

    }

}

function drawPlayer() {

    ctx.save();

    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);

    ctx.beginPath();

    ctx.moveTo(0, 0);

    ctx.arc(
        0,
        0,
        player.size,
        0.2 * Math.PI,
        1.8 * Math.PI
    );

    ctx.fillStyle = "#ffe600";
    ctx.fill();

    ctx.restore();

}

function drawGhosts() {

    ghosts.forEach(g => {

        ctx.fillStyle = g.color;

        ctx.beginPath();

        ctx.arc(
            g.x,
            g.y,
            g.size,
            Math.PI,
            0
        );

        ctx.lineTo(g.x + g.size, g.y + g.size);
        ctx.lineTo(g.x - g.size, g.y + g.size);

        ctx.fill();

    });

}

function update() {

    player.x += player.dx;
    player.y += player.dy;

}

function gameLoop() {

    if (!gameStarted) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawMap();
    update();
    drawPlayer();
    drawGhosts();

    requestAnimationFrame(gameLoop);

}
