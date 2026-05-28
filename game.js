const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const gameContainer = document.getElementById("gameContainer");
const playButton = document.getElementById("playButton");

canvas.width = 896;
canvas.height = 768;

ctx.imageSmoothingEnabled = false;

/* =========================================
   CONFIG
========================================= */

const TILE = 32;

let started = false;

let score = 0;
let lives = 3;
let questionsAnswered = 0;

/* =========================================
   MAP
========================================= */

const map = [
"############################",
"#............##............#",
"#.####.#####.##.#####.####.#",
"#o####.#####.##.#####.####o#",
"#..........................#",
"#.####.##.########.##.####.#",
"#......##....##....##......#",
"######.##### ## #####.######",
"     #.##### ## #####.#     ",
"     #.##          ##.#     ",
"######.## ###--### ##.######",
"      .   #GGGGGG#   .      ",
"######.## ######## ##.######",
"     #.##          ##.#     ",
"     #.## ######## ##.#     ",
"######.## ######## ##.######",
"#............##............#",
"#.####.#####.##.#####.####.#",
"#o..##................##..o#",
"###.##.##.########.##.##.###",
"#......##....##....##......#",
"#.##########.##.##########.#",
"#..........................#",
"############################"
];

/* =========================================
   PACMAN
========================================= */

const pacman = {

    x: TILE * 14,
    y: TILE * 17,

    radius: 13,

    speed: 2.2,

    dirX: 0,
    dirY: 0,

    nextX: 0,
    nextY: 0,

    mouth: 0
};

/* =========================================
   GHOSTS
========================================= */

const ghosts = [];

const ghostColors = [
    "#ff4d6d",
    "#00e5ff",
    "#ffea00",
    "#8a2be2"
];

for(let i=0;i<4;i++){

    ghosts.push({

        x: TILE * (13+i),
        y: TILE * 11,

        radius: 13,

        dirX: 1,
        dirY: 0,

        speed: 1.7,

        color: ghostColors[i]
    });
}

/* =========================================
   INPUT
========================================= */

window.addEventListener("keydown",(e)=>{

    if(e.key==="ArrowUp"){
        pacman.nextX = 0;
        pacman.nextY = -1;
    }

    if(e.key==="ArrowDown"){
        pacman.nextX = 0;
        pacman.nextY = 1;
    }

    if(e.key==="ArrowLeft"){
        pacman.nextX = -1;
        pacman.nextY = 0;
    }

    if(e.key==="ArrowRight"){
        pacman.nextX = 1;
        pacman.nextY = 0;
    }

});

/* =========================================
   START GAME
========================================= */

playButton.addEventListener("click",()=>{

    startScreen.classList.add("hidden");

    gameContainer.classList.remove("hidden");

    started = true;

    requestAnimationFrame(gameLoop);

});

/* =========================================
   COLLISION
========================================= */

function wallAt(x,y){

    const col = Math.floor(x / TILE);
    const row = Math.floor(y / TILE);

    if(
        row < 0 ||
        row >= map.length ||
        col < 0 ||
        col >= map[row].length
    ){
        return true;
    }

    return map[row][col] === "#";
}

/* =========================================
   PACMAN MOVE
========================================= */

function movePacman(){

    const centerX =
    Math.floor(pacman.x/TILE)*TILE + TILE/2;

    const centerY =
    Math.floor(pacman.y/TILE)*TILE + TILE/2;

    const aligned =
    Math.abs(centerX-pacman.x)<2 &&
    Math.abs(centerY-pacman.y)<2;

    if(aligned){

        pacman.x = centerX;
        pacman.y = centerY;

        const tryX =
        pacman.x + pacman.nextX*TILE;

        const tryY =
        pacman.y + pacman.nextY*TILE;

        if(!wallAt(tryX,tryY)){

            pacman.dirX = pacman.nextX;
            pacman.dirY = pacman.nextY;
        }
    }

    const nextX =
    pacman.x + pacman.dirX*pacman.speed;

    const nextY =
    pacman.y + pacman.dirY*pacman.speed;

    if(!wallAt(nextX,nextY)){

        pacman.x = nextX;
        pacman.y = nextY;
    }

    pacman.mouth += 0.18;
}

/* =========================================
   GHOST AI
========================================= */

function moveGhosts(){

    ghosts.forEach(g=>{

        const nextX =
        g.x + g.dirX*g.speed;

        const nextY =
        g.y + g.dirY*g.speed;

        if(wallAt(nextX,nextY)){

            const dirs = [
                [1,0],
                [-1,0],
                [0,1],
                [0,-1]
            ];

            const valid = dirs.filter(d=>{

                const tx =
                g.x + d[0]*TILE;

                const ty =
                g.y + d[1]*TILE;

                return !wallAt(tx,ty);

            });

            const best = valid.sort((a,b)=>{

                const da =
                Math.hypot(
                    pacman.x-(g.x+a[0]*TILE),
                    pacman.y-(g.y+a[1]*TILE)
                );

                const db =
                Math.hypot(
                    pacman.x-(g.x+b[0]*TILE),
                    pacman.y-(g.y+b[1]*TILE)
                );

                return da-db;

            });

            if(best.length){

                g.dirX = best[0][0];
                g.dirY = best[0][1];
            }

        }else{

            g.x = nextX;
            g.y = nextY;
        }

    });

}

/* =========================================
   DRAW MAP
========================================= */

function drawMap(){

    for(let row=0;row<map.length;row++){

        for(let col=0;col<map[row].length;col++){

            const tile = map[row][col];

            const x = col*TILE;
            const y = row*TILE;

            if(tile==="#"){

                ctx.fillStyle="#32145f";

                ctx.fillRect(
                    x,
                    y,
                    TILE,
                    TILE
                );

                ctx.strokeStyle="#ff006e";

                ctx.lineWidth=3;

                ctx.strokeRect(
                    x,
                    y,
                    TILE,
                    TILE
                );
            }

            if(tile==="." || tile==="o"){

                ctx.fillStyle="#ffd6ff";

                const size =
                tile==="o" ? 8 : 4;

                ctx.fillRect(
                    x+TILE/2-size/2,
                    y+TILE/2-size/2,
                    size,
                    size
                );
            }

        }

    }

}

/* =========================================
   DRAW PACMAN
========================================= */

function drawPacman(){

    ctx.save();

    ctx.translate(
        pacman.x,
        pacman.y
    );

    let angle = 0;

    if(pacman.dirX===1) angle=0;
    if(pacman.dirX===-1) angle=Math.PI;
    if(pacman.dirY===1) angle=Math.PI/2;
    if(pacman.dirY===-1) angle=-Math.PI/2;

    ctx.rotate(angle);

    const mouth =
    Math.abs(Math.sin(pacman.mouth))*0.45;

    ctx.fillStyle="#ffe600";

    ctx.beginPath();

    ctx.moveTo(0,0);

    ctx.arc(
        0,
        0,
        pacman.radius,
        mouth,
        Math.PI*2-mouth
    );

    ctx.fill();

    ctx.restore();
}

/* =========================================
   DRAW GHOSTS
========================================= */

function drawGhost(g){

    ctx.fillStyle=g.color;

    ctx.beginPath();

    ctx.arc(
        g.x,
        g.y-5,
        12,
        Math.PI,
        0
    );

    ctx.lineTo(
        g.x+12,
        g.y+10
    );

    for(let i=0;i<4;i++){

        ctx.lineTo(
            g.x+12-(i*6),
            g.y+5+(i%2===0?5:0)
        );
    }

    ctx.closePath();

    ctx.fill();

    ctx.fillStyle="white";

    ctx.fillRect(g.x-6,g.y-5,4,4);
    ctx.fillRect(g.x+2,g.y-5,4,4);
}

/* =========================================
   UI
========================================= */

function updateUI(){

    document.getElementById("score").textContent =
    score;

    document.getElementById("lives").textContent =
    lives;

    document.getElementById("questions").textContent =
    questionsAnswered;
}

/* =========================================
   MAIN LOOP
========================================= */

function gameLoop(){

    if(!started) return;

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawMap();

    movePacman();

    moveGhosts();

    drawPacman();

    ghosts.forEach(drawGhost);

    updateUI();

    requestAnimationFrame(gameLoop);
}
