// =========================
// OVUPAC - RETRO HPO EDITION
// GAME.JS COMPLETO
// =========================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

canvas.width = 960;
canvas.height = 640;

// =========================
// MAPA
// =========================

const TILE = 40;

const MAP = [
"########################",
"#......................#",
"#.####.######.######...#",
"#......................#",
"#.####.#.##.#.#####.##.#",
"#......#....#..........#",
"###.##.######.#####.##.#",
"#......................#",
"#.####.######.#####.##.#",
"#......................#",
"#.######.##.######.##..#",
"#......................#",
"########################"
];

const ROWS = MAP.length;
const COLS = MAP[0].length;

// =========================
// ESTADO
// =========================

let score = 0;
let lives = 3;
let answeredQuestions = 0;
let pelletsEaten = 0;

let gamePaused = false;
let gameOver = false;
let gameWon = false;

// =========================
// PODERES
// =========================

const powers = {
  estrogen: 0,
  lh: 0,
  fsh: 0,
  progesterone: 0,
  ovulation: 0,
  follicular: 0
};

let doublePoints = false;
let superSpeed = false;
let invincible = false;
let freezeEnemies = false;
let eatEnemies = false;

// =========================
// PACMAN
// =========================

const pacman = {
  x: TILE + TILE / 2,
  y: TILE + TILE / 2,
  size: 14,
  speed: 3.2,
  dx: 0,
  dy: 0,
  angle: 0,
  mouth: 0.2,
  mouthDir: 0.05
};

// =========================
// FANTASMAS / ESPERMAS
// =========================

const ghostColors = [
  "#ff4d6d",
  "#00d4ff",
  "#9dff00",
  "#ffd000",
  "#c44dff",
  "#ff88dd"
];

const ghosts = [];

for (let i = 0; i < 6; i++) {
  ghosts.push({
    x: 12 * TILE + (i % 3) * 25,
    y: 6 * TILE + Math.floor(i / 3) * 25,
    size: 10,
    speed: 1.8,
    color: ghostColors[i],
    dx: 0,
    dy: 0,
    timer: 0
  });
}

// =========================
// PELLETS
// =========================

let pellets = [];

function createPellets() {

  pellets = [];

  for (let row = 0; row < ROWS; row++) {

    for (let col = 0; col < COLS; col++) {

      if (MAP[row][col] === ".") {

        pellets.push({
          x: col * TILE + TILE / 2,
          y: row * TILE + TILE / 2,
          eaten: false
        });

      }

    }

  }

}

createPellets();

// =========================
// INPUT
// =========================

const keys = {};

window.addEventListener("keydown", e => {

  keys[e.key] = true;

  if (e.key === "1") activatePower("estrogen");
  if (e.key === "2") activatePower("lh");
  if (e.key === "3") activatePower("fsh");
  if (e.key === "4") activatePower("progesterone");
  if (e.key === "5") activatePower("ovulation");
  if (e.key === "6") activatePower("follicular");

});

window.addEventListener("keyup", e => {

  keys[e.key] = false;

});

// =========================
// COLISIONES
// =========================

function wallAt(x, y, size) {

  const left = Math.floor((x - size) / TILE);
  const right = Math.floor((x + size) / TILE);

  const top = Math.floor((y - size) / TILE);
  const bottom = Math.floor((y + size) / TILE);

  return (
    MAP[top]?.[left] === "#" ||
    MAP[top]?.[right] === "#" ||
    MAP[bottom]?.[left] === "#" ||
    MAP[bottom]?.[right] === "#"
  );

}

// =========================
// PACMAN UPDATE
// =========================

function updatePacman() {

  let speed = pacman.speed;

  if (superSpeed) speed *= 1.8;

  let nextDx = 0;
  let nextDy = 0;

  if (keys["ArrowLeft"]) {
    nextDx = -speed;
    pacman.angle = Math.PI;
  }

  if (keys["ArrowRight"]) {
    nextDx = speed;
    pacman.angle = 0;
  }

  if (keys["ArrowUp"]) {
    nextDy = -speed;
    pacman.angle = -Math.PI / 2;
  }

  if (keys["ArrowDown"]) {
    nextDy = speed;
    pacman.angle = Math.PI / 2;
  }

  const nextX = pacman.x + nextDx;
  const nextY = pacman.y + nextDy;

  if (!wallAt(nextX, pacman.y, pacman.size)) {
    pacman.x = nextX;
  }

  if (!wallAt(pacman.x, nextY, pacman.size)) {
    pacman.y = nextY;
  }

  pacman.mouth += pacman.mouthDir;

  if (pacman.mouth > 0.7 || pacman.mouth < 0.1) {
    pacman.mouthDir *= -1;
  }

}

// =========================
// IA ESPERMAS
// =========================

function updateGhosts() {

  if (freezeEnemies) return;

  ghosts.forEach(g => {

    g.timer--;

    if (g.timer <= 0) {

      const dirs = [
        { dx: g.speed, dy: 0 },
        { dx: -g.speed, dy: 0 },
        { dx: 0, dy: g.speed },
        { dx: 0, dy: -g.speed }
      ];

      let best = null;
      let bestDist = Infinity;

      dirs.forEach(d => {

        const nx = g.x + d.dx;
        const ny = g.y + d.dy;

        if (!wallAt(nx, ny, g.size)) {

          const dist = Math.hypot(
            pacman.x - nx,
            pacman.y - ny
          );

          if (dist < bestDist) {
            bestDist = dist;
            best = d;
          }

        }

      });

      if (best) {
        g.dx = best.dx;
        g.dy = best.dy;
      }

      g.timer = 10;

    }

    const nx = g.x + g.dx;
    const ny = g.y + g.dy;

    if (!wallAt(nx, ny, g.size)) {
      g.x = nx;
      g.y = ny;
    }

    const dist = Math.hypot(
      g.x - pacman.x,
      g.y - pacman.y
    );

    if (dist < 18) {

      if (eatEnemies) {

        g.x = 12 * TILE;
        g.y = 6 * TILE;

        score += 200;

      } else if (!invincible) {

        lives--;

        pacman.x = TILE + TILE / 2;
        pacman.y = TILE + TILE / 2;

        if (lives <= 0) {
          gameOver = true;
        }

      }

    }

  });

}

// =========================
// PELLETS
// =========================

function updatePellets() {

  let remaining = 0;

  pellets.forEach(p => {

    if (!p.eaten) {

      remaining++;

      const dist = Math.hypot(
        p.x - pacman.x,
        p.y - pacman.y
      );

      if (dist < 12) {

        p.eaten = true;

        pelletsEaten++;

        score += doublePoints ? 20 : 10;

        powers.estrogen += 4;
        powers.lh += 3;
        powers.fsh += 3;
        powers.progesterone += 3;
        powers.ovulation += 3;
        powers.follicular += 2;

        Object.keys(powers).forEach(k => {
          if (powers[k] > 100) powers[k] = 100;
        });

        if (pelletsEaten % 15 === 0) {
          showQuestion();
        }

      }

    }

  });

  if (remaining === 0) {

    setTimeout(() => {
      createPellets();
    }, 30000);

  }

}

// =========================
// PREGUNTAS
// =========================

function showQuestion() {

  gamePaused = true;

  const q =
    QUESTIONS[
      Math.floor(Math.random() * QUESTIONS.length)
    ];

  const answer = prompt(
`${q.question}

A) ${q.options[0]}
B) ${q.options[1]}
C) ${q.options[2]}
D) ${q.options[3]}`
  );

  if (
    answer &&
    answer.toUpperCase() === q.answer
  ) {

    answeredQuestions++;

    score += 300;

    Object.keys(powers).forEach(k => {
      powers[k] += 20;

      if (powers[k] > 100)
        powers[k] = 100;
    });

    if (answeredQuestions >= QUESTIONS.length) {
      gameWon = true;
    }

  }

  gamePaused = false;

}

// =========================
// PODERES
// =========================

function activatePower(name) {

  if (powers[name] < 100) return;

  powers[name] = 0;

  if (name === "estrogen") {

    doublePoints = true;

    setTimeout(() => {
      doublePoints = false;
    }, 10000);

  }

  if (name === "lh") {

    superSpeed = true;

    setTimeout(() => {
      superSpeed = false;
    }, 8000);

  }

  if (name === "fsh") {

    invincible = true;

    setTimeout(() => {
      invincible = false;
    }, 7000);

  }

  if (name === "progesterone") {

    freezeEnemies = true;

    setTimeout(() => {
      freezeEnemies = false;
    }, 8000);

  }

  if (name === "ovulation") {

    eatEnemies = true;

    setTimeout(() => {
      eatEnemies = false;
    }, 10000);

  }

  if (name === "follicular") {

    lives++;

  }

}

// =========================
// DIBUJO MAPA
// =========================

function drawMap() {

  for (let row = 0; row < ROWS; row++) {

    for (let col = 0; col < COLS; col++) {

      if (MAP[row][col] === "#") {

        ctx.fillStyle = "#34116b";

        ctx.fillRect(
          col * TILE,
          row * TILE,
          TILE,
          TILE
        );

        ctx.strokeStyle = "#ff0077";
        ctx.lineWidth = 3;

        ctx.strokeRect(
          col * TILE,
          row * TILE,
          TILE,
          TILE
        );

      }

    }

  }

}

// =========================
// DIBUJAR PELLETS
// =========================

function drawPellets() {

  pellets.forEach(p => {

    if (!p.eaten) {

      ctx.fillStyle = "#ffd6ff";

      ctx.fillRect(
        p.x - 2,
        p.y - 2,
        4,
        4
      );

    }

  });

}

// =========================
// PACMAN PIXEL
// =========================

function drawPacman() {

  ctx.save();

  ctx.translate(pacman.x, pacman.y);
  ctx.rotate(pacman.angle);

  ctx.fillStyle = "#ffe600";

  ctx.beginPath();

  ctx.moveTo(0, 0);

  ctx.arc(
    0,
    0,
    pacman.size,
    pacman.mouth,
    Math.PI * 2 - pacman.mouth
  );

  ctx.fill();

  ctx.restore();

}

// =========================
// ESPERMAS PIXEL
// =========================

function drawGhosts() {

  ghosts.forEach(g => {

    ctx.fillStyle = g.color;

    ctx.fillRect(
      g.x - 5,
      g.y - 5,
      10,
      10
    );

    ctx.fillStyle = "#fff";

    ctx.fillRect(g.x - 2, g.y - 2, 2, 2);
    ctx.fillRect(g.x + 1, g.y - 2, 2, 2);

  });

}

// =========================
// HUD
// =========================

function drawHUD() {

  document.getElementById("lives").innerText = lives;
  document.getElementById("score").innerText = score;
  document.getElementById("questions").innerText =
    answeredQuestions;

  document.getElementById("bar-estrogen").style.width =
    powers.estrogen + "%";

  document.getElementById("bar-lh").style.width =
    powers.lh + "%";

  document.getElementById("bar-fsh").style.width =
    powers.fsh + "%";

  document.getElementById("bar-progesterone").style.width =
    powers.progesterone + "%";

  document.getElementById("bar-ovulation").style.width =
    powers.ovulation + "%";

  document.getElementById("bar-follicular").style.width =
    powers.follicular + "%";

}

// =========================
// GAME OVER / WIN
// =========================

function drawEnd(text, color) {

  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = color;

  ctx.font = "38px 'Press Start 2P'";

  ctx.fillText(text, 180, 320);

}

// =========================
// LOOP
// =========================

function gameLoop() {

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  drawMap();
  drawPellets();

  if (
    !gamePaused &&
    !gameOver &&
    !gameWon
  ) {

    updatePacman();
    updateGhosts();
    updatePellets();

  }

  drawPacman();
  drawGhosts();
  drawHUD();

  if (gameOver) {
    drawEnd("GAME OVER", "#ff004c");
  }

  if (gameWon) {
    drawEnd("YOU WIN!", "#00ff99");
  }

  requestAnimationFrame(gameLoop);

}

gameLoop();
