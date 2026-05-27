const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const playButton = document.getElementById("playButton");

canvas.width = 960;
canvas.height = 640;

const TILE = 32;

/* =========================
   MAPA ESTILO PACMAN
========================= */

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

/* =========================
   PLAYER
========================= */

const pacman = {
    x: 1 * TILE + TILE/2,
    y: 1 * TILE + TILE/2,
    radius: 13,
    speed: 2.6,
    dirX: 0,
    dirY: 0,
    nextX: 0,
    nextY: 0,
    mouth: 0
};

/* =========================
   GHOSTS
========================= */

const ghosts = [
    {
        x: 13 * TILE,
        y: 11 * TILE,
        color:"#ff3b6b",
        dirX:1,
        dirY:0
    },
    {
        x: 14 * TILE,
        y: 11 * TILE,
        color:"#00e5ff",
        dirX:-1,
        dirY:0
    },
    {
        x: 15 * TILE,
        y: 11 * TILE,
        color:"#ffea00",
        dirX:0,
        dirY:-1
    },
    {
        x: 16 * TILE,
        y: 11 * TILE,
        color:"#7d5cff",
        dirX:0,
        dirY:1
    }
];

/* =========================
   GAME STATE
========================= */

let score = 0;
let lives = 3;
let started = false;

/* =========================
   START BUTTON
========================= */

playButton.addEventListener("click", () => {

    startScreen.classList.add("hidden");

    started = true;

    requestAnimationFrame(gameLoop);
});

/* =========================
   INPUT
========================= */

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

/* =========================
   COLLISION
========================= */

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

/* =========================
   MOVE PACMAN
========================= */

function movePacman(){

    const centerX =
    Math.floor(pacman.x / TILE) * TILE + TILE/2;

    const centerY =
    Math.floor(pacman.y / TILE) * TILE + TILE/2;

    const closeEnough =
    Math.abs(pacman.x-centerX)<2 &&
    Math.abs(pacman.y-centerY)<2;

    if(closeEnough){

        pacman.x = centerX;
        pacman.y = centerY;

        const testX =
        pacman.x + pacman.nextX * TILE;

        const testY =
        pacman.y + pacman.nextY * TILE;

        if(!wallAt(testX,testY)){
            pacman.dirX = pacman.nextX;
            pacman.dirY = pacman.nextY;
        }
    }

    const newX =
    pacman.x + pacman.dirX * pacman.speed;

    const newY =
    pacman.y + pacman.dirY * pacman.speed;

    if(!wallAt(newX,newY)){
        pacman.x = newX;
        pacman.y = newY;
    }

    pacman.mouth += 0.18;
}

/* =========================
   MOVE GHOSTS
========================= */

function moveGhosts(){

    ghosts.forEach(g=>{

        const speed = 1.8;

        const nextX =
        g.x + g.dirX * speed;

        const nextY =
        g.y + g.dirY * speed;

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

            const pick =
            valid[Math.floor(Math.random()*valid.length)];

            if(pick){
                g.dirX = pick[0];
                g.dirY = pick[1];
            }

        }else{

            g.x = nextX;
            g.y = nextY;
        }

    });

}

/* =========================
   DRAW MAP
========================= */

function drawMap(){

    for(let row=0; row<map.length; row++){

        for(let col=0; col<map[row].length; col++){

            const tile = map[row][col];

            const x = col*TILE;
            const y = row*TILE;

            if(tile === "#"){

                ctx.fillStyle="#3b1578";
                ctx.fillRect(x,y,TILE,TILE);

                ctx.strokeStyle="#ff007a";
                ctx.lineWidth=3;
                ctx.strokeRect(x,y,TILE,TILE);

            }

            if(tile==="." || tile==="o"){

                ctx.fillStyle="#ffd7f5";

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

/* =========================
   DRAW PACMAN
========================= */

function drawPacman(){

    ctx.save();

    ctx.translate(pacman.x,pacman.y);

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

/* =========================
   DRAW GHOSTS
========================= */

function drawGhost(g){

    ctx.fillStyle = g.color;

    ctx.beginPath();

    ctx.arc(g.x,g.y-5,12,Math.PI,0);

    ctx.lineTo(g.x+12,g.y+10);

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

/* =========================
   UI
========================= */

function updateUI(){

    document.getElementById("lives").textContent=lives;
    document.getElementById("score").textContent=score;
}

/* =========================
   LOOP
========================= */

function gameLoop(){

    if(!started) return;

    ctx.clearRect(0,0,canvas.width,canvas.height);

    drawMap();

    movePacman();

    moveGhosts();

    drawPacman();

    ghosts.forEach(drawGhost);

    updateUI();

    requestAnimationFrame(gameLoop);
}
