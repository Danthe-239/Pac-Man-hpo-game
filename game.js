const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 960;
canvas.height = 640;

ctx.imageSmoothingEnabled = false;

/* =========================
   CONFIG
========================= */

const TILE = 40;
const ROWS = 16;
const COLS = 24;

const WALL = 1;
const PELLET = 0;

let score = 0;
let lives = 3;
let answered = 0;

const map = [
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,1,1,1,1,0,1,1,1,0,1,0,1,1,1,1,1,0,1,1,1,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,1,1,0,1,1,1,1,0,1,1,0,1,1,1,1,0,1,1,1,0,1,1,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,1,1,1,1,0,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

/* =========================
   PACMAN
========================= */

const pacman = {
    x: TILE + 20,
    y: TILE + 20,
    size: 14,
    speed: 2.4,
    dx: 0,
    dy: 0,
    mouth: 0.2
};

/* =========================
   GHOSTS
========================= */

const ghostColors = [
    "#ff4d6d",
    "#00e5ff",
    "#ffe600",
    "#8cff00",
    "#c77dff",
    "#ff9f1c"
];

const ghosts = [];

for(let i=0;i<6;i++){
    ghosts.push({
        x: 460 + (i*5),
        y: 300,
        size: 12,
        speed: 1.6,
        color: ghostColors[i]
    });
}

/* =========================
   INPUT
========================= */

document.addEventListener("keydown", e => {

    if(e.key === "ArrowUp"){
        pacman.dx = 0;
        pacman.dy = -pacman.speed;
    }

    if(e.key === "ArrowDown"){
        pacman.dx = 0;
        pacman.dy = pacman.speed;
    }

    if(e.key === "ArrowLeft"){
        pacman.dx = -pacman.speed;
        pacman.dy = 0;
    }

    if(e.key === "ArrowRight"){
        pacman.dx = pacman.speed;
        pacman.dy = 0;
    }
});

/* =========================
   COLLISION
========================= */

function wallAt(x,y){

    const col = Math.floor(x / TILE);
    const row = Math.floor(y / TILE);

    return map[row]?.[col] === WALL;
}

/* =========================
   UPDATE
========================= */

function update(){

    const nextX = pacman.x + pacman.dx;
    const nextY = pacman.y + pacman.dy;

    if(
        !wallAt(nextX - pacman.size, nextY - pacman.size) &&
        !wallAt(nextX + pacman.size, nextY - pacman.size) &&
        !wallAt(nextX - pacman.size, nextY + pacman.size) &&
        !wallAt(nextX + pacman.size, nextY + pacman.size)
    ){
        pacman.x = nextX;
        pacman.y = nextY;
    }

    ghosts.forEach(g => {

        const angle = Math.atan2(
            pacman.y - g.y,
            pacman.x - g.x
        );

        const nx = g.x + Math.cos(angle) * g.speed;
        const ny = g.y + Math.sin(angle) * g.speed;

        if(
            !wallAt(nx-g.size, ny-g.size) &&
            !wallAt(nx+g.size, ny+g.size)
        ){
            g.x = nx;
            g.y = ny;
        }
    });

}

/* =========================
   DRAW MAP
========================= */

function drawMap(){

    for(let r=0;r<ROWS;r++){

        for(let c=0;c<COLS;c++){

            const x = c*TILE;
            const y = r*TILE;

            if(map[r][c] === WALL){

                ctx.fillStyle = "#351c75";
                ctx.fillRect(x,y,TILE,TILE);

                ctx.strokeStyle = "#ff0080";
                ctx.lineWidth = 3;
                ctx.strokeRect(x,y,TILE,TILE);

            }else{

                ctx.fillStyle = "#ffd6ff";
                ctx.fillRect(
                    x + TILE/2 - 2,
                    y + TILE/2 - 2,
                    4,
                    4
                );
            }
        }
    }
}

/* =========================
   DRAW PACMAN
========================= */

function drawPacman(){

    ctx.fillStyle = "yellow";

    ctx.beginPath();

    ctx.arc(
        pacman.x,
        pacman.y,
        pacman.size,
        pacman.mouth,
        Math.PI*2 - pacman.mouth
    );

    ctx.lineTo(pacman.x,pacman.y);
    ctx.fill();

    pacman.mouth += 0.1;

    if(pacman.mouth > 0.7){
        pacman.mouth = 0.2;
    }
}

/* =========================
   DRAW GHOSTS
========================= */

function drawGhosts(){

    ghosts.forEach(g => {

        ctx.fillStyle = g.color;

        ctx.fillRect(
            g.x - g.size/2,
            g.y - g.size/2,
            g.size,
            g.size
        );
    });
}

/* =========================
   HUD
========================= */

function drawHUD(){

    ctx.fillStyle = "white";
    ctx.font = "28px Courier New";

    ctx.fillText("❤️ Vidas: " + lives, 20, 30);
    ctx.fillText("⭐ Puntuación: " + score, 20, 70);
    ctx.fillText("🧠 Preguntas: " + answered, 20, 110);
}

/* =========================
   LOOP
========================= */

function gameLoop(){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    update();

    drawMap();
    drawPacman();
    drawGhosts();
    drawHUD();

    requestAnimationFrame(gameLoop);
}

gameLoop();
