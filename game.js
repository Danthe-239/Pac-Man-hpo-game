const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const playBtn = document.getElementById("playBtn");

canvas.width = 960;
canvas.height = 640;

let gameStarted = false;

const TILE = 32;

const map = [
  "############################",
  "#............##............#",
  "#.####.#####.##.#####.####.#",
  "#..........................#",
  "#.####.##.########.##.####.#",
  "#......##....##....##......#",
  "######.##### ## #####.######",
  "#............##............#",
  "#.####.#####.##.#####.####.#",
  "#...##................##...#",
  "###.##.##.########.##.##.###",
  "#......##....##....##......#",
  "#.##########.##.##########.#",
  "#..........................#",
  "############################"
];

const pacman = {
  x: 1,
  y: 1,
  dirX: 0,
  dirY: 0,
  speed: 0.12,
  mouth: 0
};

const ghosts = [
  { x: 14, y: 7, color: "#ff2e63" },
  { x: 15, y: 7, color: "#08d9d6" },
  { x: 13, y: 7, color: "#f9ed69" },
  { x: 16, y: 7, color: "#a29bfe" }
];

const keys = {};

document.addEventListener("keydown", e => {
  keys[e.key] = true;
});

document.addEventListener("keyup", e => {
  keys[e.key] = false;
});

playBtn.addEventListener("click", () => {
  startScreen.style.display = "none";
  gameStarted = true;
});

function wallAt(x, y) {
  const gx = Math.floor(x);
  const gy = Math.floor(y);

  if (gy < 0 || gy >= map.length) return true;
  if (gx < 0 || gx >= map[0].length) return true;

  return map[gy][gx] === "#";
}

function updatePacman() {

  if (keys["ArrowUp"]) {
    pacman.dirX = 0;
    pacman.dirY = -1;
  }

  if (keys["ArrowDown"]) {
    pacman.dirX = 0;
    pacman.dirY = 1;
  }

  if (keys["ArrowLeft"]) {
    pacman.dirX = -1;
    pacman.dirY = 0;
  }

  if (keys["ArrowRight"]) {
    pacman.dirX = 1;
    pacman.dirY = 0;
  }

  let nextX = pacman.x + pacman.dirX * pacman.speed;
  let nextY = pacman.y + pacman.dirY * pacman.speed;

  if (!wallAt(nextX, pacman.y)) {
    pacman.x = nextX;
  }

  if (!wallAt(pacman.x, nextY)) {
    pacman.y = nextY;
  }

  pacman.mouth += 0.2;
}

function drawMap() {

  for (let y = 0; y < map.length; y++) {

    for (let x = 0; x < map[y].length; x++) {

      const cell = map[y][x];

      if (cell === "#") {

        ctx.fillStyle = "#ff0080";
        ctx.fillRect(x * TILE, y * TILE, TILE, TILE);

        ctx.fillStyle = "#5900b3";
        ctx.fillRect(
          x * TILE + 3,
          y * TILE + 3,
          TILE - 6,
          TILE - 6
        );

      } else {

        ctx.fillStyle = "#ffd6f7";
        ctx.beginPath();
        ctx.arc(
          x * TILE + TILE / 2,
          y * TILE + TILE / 2,
          2,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
  }
}

function drawPacman() {

  const px = pacman.x * TILE + TILE / 2;
  const py = pacman.y * TILE + TILE / 2;

  const mouth = Math.abs(Math.sin(pacman.mouth)) * 0.4;

  let angle = 0;

  if (pacman.dirX === 1) angle = 0;
  if (pacman.dirX === -1) angle = Math.PI;
  if (pacman.dirY === -1) angle = -Math.PI / 2;
  if (pacman.dirY === 1) angle = Math.PI / 2;

  ctx.save();

  ctx.translate(px, py);
  ctx.rotate(angle);

  ctx.fillStyle = "#ffe600";

  ctx.beginPath();

  ctx.moveTo(0, 0);

  ctx.arc(
    0,
    0,
    TILE / 2 - 3,
    mouth,
    Math.PI * 2 - mouth
  );

  ctx.fill();

  ctx.restore();
}

function drawGhost(ghost) {

  const x = ghost.x * TILE;
  const y = ghost.y * TILE;

  ctx.fillStyle = ghost.color;

  ctx.beginPath();

  ctx.moveTo(x + 4, y + TILE - 4);

  ctx.lineTo(x + 4, y + 10);

  ctx.arc(
    x + TILE / 2,
    y + 10,
    TILE / 2 - 4,
    Math.PI,
    0
  );

  ctx.lineTo(x + TILE - 4, y + TILE - 4);

  ctx.fill();

  ctx.fillStyle = "white";

  ctx.beginPath();
  ctx.arc(x + 11, y + 14, 4, 0, Math.PI * 2);
  ctx.arc(x + 21, y + 14, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "black";

  ctx.beginPath();
  ctx.arc(x + 11, y + 14, 2, 0, Math.PI * 2);
  ctx.arc(x + 21, y + 14, 2, 0, Math.PI * 2);
  ctx.fill();
}

function updateGhosts() {

  ghosts.forEach(g => {

    const dx = pacman.x - g.x;
    const dy = pacman.y - g.y;

    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {

      let moveX = dx / dist * 0.03;
      let moveY = dy / dist * 0.03;

      if (!wallAt(g.x + moveX, g.y)) {
        g.x += moveX;
      }

      if (!wallAt(g.x, g.y + moveY)) {
        g.y += moveY;
      }
    }
  });
}

function loop() {

  requestAnimationFrame(loop);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!gameStarted) return;

  drawMap();

  updatePacman();
  updateGhosts();

  drawPacman();

  ghosts.forEach(drawGhost);
}

loop();
