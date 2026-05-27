const playBtn = document.getElementById("playBtn");

const menuScreen = document.getElementById("menuScreen");
const gameScreen = document.getElementById("gameScreen");

playBtn.addEventListener("click", () => {

    menuScreen.classList.add("hidden");

    gameScreen.classList.remove("hidden");

    startGame();

});

// ==========================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 960;
canvas.height = 640;

ctx.imageSmoothingEnabled = false;

// ==========================================

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
"#..........................#",
"############################"

];

// ==========================================

const pacman = {

    x:64,
    y:64,

    size:14,

    speed:3,

    dx:0,
    dy:0,

    mouth:0.2,
    mouthDir:0.05,

    angle:0
};

// ==========================================

const ghosts = [];

const ghostColors = [
    "#ff4d6d",
    "#00e5ff",
    "#ffea00",
    "#8a2be2"
];

for(let i=0;i<4;i++){

    ghosts.push({

        x:450 + i * 40,
        y:300,

        size:14,

        dx:0,
        dy:0,

        speed:2,

        color:ghostColors[i]
    });
}

// ==========================================

const keys = {};

window.addEventListener("keydown", e=>{

    keys[e.key]=true;
});

window.addEventListener("keyup", e=>{

    keys[e.key]=false;
});

// ==========================================

function wallAt(x,y){

    const col = Math.floor(x / TILE);
    const row = Math.floor(y / TILE);

    if(
        row < 0 ||
        col < 0 ||
        row >= map.length ||
        col >= map[0].length
    ){
        return true;
    }

    return map[row][col] === "#";
}

// ==========================================

function updatePacman(){

    if(keys["ArrowLeft"]){
        pacman.dx=-1;
        pacman.dy=0;
        pacman.angle=Math.PI;
    }

    if(keys["ArrowRight"]){
        pacman.dx=1;
        pacman.dy=0;
        pacman.angle=0;
    }

    if(keys["ArrowUp"]){
        pacman.dx=0;
        pacman.dy=-1;
        pacman.angle=-Math.PI/2;
    }

    if(keys["ArrowDown"]){
        pacman.dx=0;
        pacman.dy=1;
        pacman.angle=Math.PI/2;
    }

    const nextX =
        pacman.x + pacman.dx * pacman.speed;

    const nextY =
        pacman.y + pacman.dy * pacman.speed;

    if(
        !wallAt(nextX - pacman.size, nextY) &&
        !wallAt(nextX + pacman.size, nextY) &&
        !wallAt(nextX, nextY - pacman.size) &&
        !wallAt(nextX, nextY + pacman.size)
    ){
        pacman.x = nextX;
        pacman.y = nextY;
    }

    pacman.mouth += pacman.mouthDir;

    if(
        pacman.mouth > 0.7 ||
        pacman.mouth < 0.15
    ){
        pacman.mouthDir *= -1;
    }
}

// ==========================================

function updateGhosts(){

    ghosts.forEach(g=>{

        const dx =
            pacman.x - g.x;

        const dy =
            pacman.y - g.y;

        const dist =
            Math.hypot(dx,dy);

        const moveX =
            dx / dist;

        const moveY =
            dy / dist;

        const nextX =
            g.x + moveX * g.speed;

        const nextY =
            g.y + moveY * g.speed;

        if(
            !wallAt(nextX - g.size,nextY) &&
            !wallAt(nextX + g.size,nextY) &&
            !wallAt(nextX,nextY - g.size) &&
            !wallAt(nextX,nextY + g.size)
        ){
            g.x = nextX;
            g.y = nextY;
        }
    });
}

// ==========================================

function drawMap(){

    for(let row=0; row<map.length; row++){

        for(let col=0; col<map[row].length; col++){

            const tile = map[row][col];

            const x = col * TILE;
            const y = row * TILE;

            if(tile === "#"){

                ctx.fillStyle="#3a0ca3";

                ctx.fillRect(
                    x,
                    y,
                    TILE,
                    TILE
                );

                ctx.strokeStyle="#ff00aa";

                ctx.lineWidth=2;

                ctx.strokeRect(
                    x,
                    y,
                    TILE,
                    TILE
                );
            }

            if(tile === "."){

                ctx.fillStyle="#ffd6ff";

                ctx.fillRect(
                    x + 14,
                    y + 14,
                    4,
                    4
                );
            }
        }
    }
}

// ==========================================

function drawPacman(){

    ctx.save();

    ctx.translate(
        pacman.x,
        pacman.y
    );

    ctx.rotate(
        pacman.angle
    );

    ctx.beginPath();

    ctx.moveTo(0,0);

    ctx.arc(
        0,
        0,
        pacman.size,
        pacman.mouth,
        Math.PI*2-pacman.mouth
    );

    ctx.fillStyle="#ffe600";

    ctx.fill();

    ctx.restore();
}

// ==========================================

function drawGhosts(){

    ghosts.forEach(g=>{

        ctx.fillStyle=g.color;

        ctx.beginPath();

        ctx.arc(
            g.x,
            g.y,
            g.size,
            Math.PI,
            0
        );

        ctx.rect(
            g.x-g.size,
            g.y,
            g.size*2,
            g.size
        );

        ctx.fill();

        ctx.fillStyle="white";

        ctx.beginPath();

        ctx.arc(
            g.x-5,
            g.y-2,
            3,
            0,
            Math.PI*2
        );

        ctx.arc(
            g.x+5,
            g.y-2,
            3,
            0,
            Math.PI*2
        );

        ctx.fill();
    });
}

// ==========================================

function render(){

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawMap();

    updatePacman();

    updateGhosts();

    drawPacman();

    drawGhosts();

    requestAnimationFrame(render);
}

// ==========================================

function startGame(){

    render();
}
