const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const menuScreen = document.getElementById("menuScreen");
const gameContainer = document.getElementById("gameContainer");
const playButton = document.getElementById("playButton");

let gameStarted = false;

const TILE = 40;

const map = [
"########################",
"#......................#",
"#.####.######.######...#",
"#......................#",
"#.####.#....#.#######..#",
"#......................#",
"#.####.######.######...#",
"#......................#",
"########################"
];

const pacman = {
    x: 60,
    y: 60,
    size: 16,
    speed: 4,
    dx: 0,
    dy: 0,
    mouth: 0
};

const ghosts = [
    {x:500,y:300,color:"#ff4f8b"},
    {x:540,y:300,color:"#00e5ff"},
    {x:580,y:300,color:"#ffe600"},
    {x:620,y:300,color:"#8aff00"}
];

const pellets = [];

function createPellets(){
    pellets.length = 0;

    for(let row=0; row<map.length; row++){
        for(let col=0; col<map[row].length; col++){

            if(map[row][col] === "."){
                pellets.push({
                    x: col*TILE + TILE/2,
                    y: row*TILE + TILE/2,
                    eaten:false
                });
            }

        }
    }
}

createPellets();

function drawMap(){

    for(let row=0; row<map.length; row++){

        for(let col=0; col<map[row].length; col++){

            const tile = map[row][col];

            if(tile === "#"){

                ctx.fillStyle = "#4d0080";
                ctx.fillRect(
                    col*TILE,
                    row*TILE,
                    TILE,
                    TILE
                );

                ctx.strokeStyle = "#ff00a6";
                ctx.lineWidth = 3;
                ctx.strokeRect(
                    col*TILE,
                    row*TILE,
                    TILE,
                    TILE
                );

            }

        }

    }

}

function drawPellets(){

    ctx.fillStyle = "#ffd6f5";

    pellets.forEach(p=>{

        if(!p.eaten){

            ctx.fillRect(
                p.x-2,
                p.y-2,
                4,
                4
            );

        }

    });

}

function drawPacman(){

    pacman.mouth += 0.15;

    const mouthOpen = Math.abs(Math.sin(pacman.mouth))*0.4;

    ctx.fillStyle = "yellow";

    ctx.beginPath();

    ctx.moveTo(pacman.x,pacman.y);

    ctx.arc(
        pacman.x,
        pacman.y,
        pacman.size,
        mouthOpen,
        Math.PI*2-mouthOpen
    );

    ctx.fill();

}

function drawGhost(g){

    ctx.fillStyle = g.color;

    ctx.fillRect(
        g.x-12,
        g.y-12,
        24,
        24
    );

}

function movePacman(){

    const nextX = pacman.x + pacman.dx;
    const nextY = pacman.y + pacman.dy;

    const col = Math.floor(nextX / TILE);
    const row = Math.floor(nextY / TILE);

    if(map[row][col] !== "#"){
        pacman.x = nextX;
        pacman.y = nextY;
    }

}

function moveGhosts(){

    ghosts.forEach(g=>{

        if(g.x < pacman.x) g.x += 1.5;
        if(g.x > pacman.x) g.x -= 1.5;

        if(g.y < pacman.y) g.y += 1.5;
        if(g.y > pacman.y) g.y -= 1.5;

    });

}

function eatPellets(){

    pellets.forEach(p=>{

        if(p.eaten) return;

        const dx = pacman.x - p.x;
        const dy = pacman.y - p.y;

        const dist = Math.sqrt(dx*dx + dy*dy);

        if(dist < 18){

            p.eaten = true;

            const score = document.getElementById("score");

            score.textContent =
                Number(score.textContent)+10;

        }

    });

}

function gameLoop(){

    if(!gameStarted) return;

    ctx.clearRect(0,0,canvas.width,canvas.height);

    drawMap();

    drawPellets();

    movePacman();

    moveGhosts();

    eatPellets();

    drawPacman();

    ghosts.forEach(drawGhost);

    requestAnimationFrame(gameLoop);

}

document.addEventListener("keydown",e=>{

    if(e.key==="ArrowRight"){
        pacman.dx = pacman.speed;
        pacman.dy = 0;
    }

    if(e.key==="ArrowLeft"){
        pacman.dx = -pacman.speed;
        pacman.dy = 0;
    }

    if(e.key==="ArrowUp"){
        pacman.dy = -pacman.speed;
        pacman.dx = 0;
    }

    if(e.key==="ArrowDown"){
        pacman.dy = pacman.speed;
        pacman.dx = 0;
    }

});

playButton.addEventListener("click",()=>{

    console.log("PLAY CLICKED");

    menuScreen.classList.add("hidden");

    gameContainer.classList.remove("hidden");

    gameStarted = true;

    gameLoop();

});
