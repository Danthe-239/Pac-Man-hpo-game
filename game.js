const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/* =========================================
   CANVAS
========================================= */

canvas.width = 896;
canvas.height = 640;

/* =========================================
   MENU
========================================= */

const menuScreen =
document.getElementById("menuScreen");

const gameScreen =
document.getElementById("gameScreen");

const playBtn =
document.getElementById("playBtn");

let gameStarted = false;

playBtn.onclick = () => {

    menuScreen.style.display = "none";

    gameScreen.style.display = "block";

    gameStarted = true;

};

/* =========================================
   HUD
========================================= */

const livesText =
document.getElementById("lives");

const scoreText =
document.getElementById("score");

const questionsText =
document.getElementById("questions");

/* =========================================
   POWER BARS
========================================= */

const powerBars = [

document.getElementById("power1"),
document.getElementById("power2"),
document.getElementById("power3"),
document.getElementById("power4"),
document.getElementById("power5"),
document.getElementById("power6")

];

let powers = [0,0,0,0,0,0];

/* =========================================
   MAP
========================================= */

const TILE = 32;

const map = [

"############################",
"#............##............#",
"#.######.###.##.###.######.#",
"#..........................#",
"#.######.#.######.#.######.#",
"#........#...##...#........#",
"######.#.### ## ###.#.######",
"#......#..........#........#",
"#.######.###--###.######.#.#",
"#..........................#",
"#.######.#.######.#.######.#",
"#...##...#...##...#...##...#",
"###.##.#####.##.#####.##.###",
"#..........................#",
"#.######.###.##.###.######.#",
"#..........................#",
"############################"

];

const rows = map.length;
const cols = map[0].length;

/* =========================================
   PLAYER
========================================= */

const pacman = {

x: 1.5 * TILE,
y: 1.5 * TILE,

radius: 10,

speed: 210,

vx: 0,
vy: 0,

angle: 0,

mouth: 0

};

/* =========================================
   GHOSTS
========================================= */

const ghostColors = [

"#ff006e",
"#00e5ff",
"#ffbe0b",
"#8338ec",
"#3a86ff",
"#70e000"

];

const ghosts = [];

for(let i=0;i<6;i++){

ghosts.push({

x: 13*TILE + (i%3)*20,
y: 8*TILE + Math.floor(i/3)*20,

radius: 8,

speed: 120,

vx: 0,
vy: 0,

color: ghostColors[i],

dirTimer: 0,

tailSeed: Math.random()*1000

});

}

/* =========================================
   PELLETS
========================================= */

let pellets = [];

function createPellets(){

pellets = [];

for(let row=0; row<rows; row++){

for(let col=0; col<cols; col++){

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

/* =========================================
   STATS
========================================= */

let score = 0;
let lives = 3;
let pelletsEaten = 0;
let questionsAnswered = 0;

/* =========================================
   QUESTIONS
========================================= */

const questionBox =
document.getElementById("questionBox");

const questionText =
document.getElementById("questionText");

const optionsBox =
document.getElementById("options");

let gamePaused = false;

const questions = [

{
q:"¿Qué hormona provoca la ovulación?",
a:["FSH","LH","Progesterona","Estrógeno"],
c:1
},

{
q:"¿Qué hormona domina la fase lútea?",
a:["Progesterona","LH","FSH","Insulina"],
c:0
},

{
q:"¿Qué órgano libera GnRH?",
a:["Hipotálamo","Útero","Ovario","Hipófisis"],
c:0
},

{
q:"¿Qué hormona estimula los folículos?",
a:["FSH","LH","Progesterona","Cortisol"],
c:0
},

{
q:"¿Qué hormona aumenta antes de ovular?",
a:["LH","Cortisol","Insulina","Adrenalina"],
c:0
},

{
q:"¿Qué hormona mantiene el endometrio?",
a:["Progesterona","FSH","LH","GH"],
c:0
},

{
q:"¿Qué significa HPO?",
a:[
"Hipotálamo Pituitaria Ovario",
"Hormona Progesterona Ovulación",
"Hipotálamo Progesterona Ovulación",
"Hormona Pituitaria Ovárica"
],
c:0
}

];

/* =========================================
   CONTROLS
========================================= */

const keys = {};

window.addEventListener("keydown",(e)=>{

keys[e.key] = true;

});

window.addEventListener("keyup",(e)=>{

keys[e.key] = false;

});

/* =========================================
   COLLISION
========================================= */

function wallAtPixel(x,y){

const col = Math.floor(x / TILE);
const row = Math.floor(y / TILE);

if(
row < 0 ||
row >= rows ||
col < 0 ||
col >= cols
){

return true;

}

const cell = map[row][col];

return cell === "#";

}

function circleWallCollision(x,y,r){

const points = [

[x-r,y-r],
[x+r,y-r],
[x-r,y+r],
[x+r,y+r]

];

for(let p of points){

if(wallAtPixel(p[0],p[1])){

return true;

}

}

return false;

}

/* =========================================
   PACMAN MOVE
========================================= */

function movePacman(dt){

if(gamePaused) return;

pacman.vx = 0;
pacman.vy = 0;

if(keys["ArrowLeft"]){

pacman.vx = -pacman.speed;
pacman.angle = Math.PI;

}

if(keys["ArrowRight"]){

pacman.vx = pacman.speed;
pacman.angle = 0;

}

if(keys["ArrowUp"]){

pacman.vy = -pacman.speed;
pacman.angle = -Math.PI/2;

}

if(keys["ArrowDown"]){

pacman.vy = pacman.speed;
pacman.angle = Math.PI/2;

}

const nextX =
pacman.x + pacman.vx * dt;

const nextY =
pacman.y + pacman.vy * dt;

if(
!circleWallCollision(
nextX,
pacman.y,
pacman.radius
)
){

pacman.x = nextX;

}

if(
!circleWallCollision(
pacman.x,
nextY,
pacman.radius
)
){

pacman.y = nextY;

}

pacman.mouth += dt * 14;

}

/* =========================================
   GHOST AI
========================================= */

function moveGhosts(dt){

if(gamePaused) return;

ghosts.forEach(g=>{

g.dirTimer -= dt;

if(g.dirTimer <= 0){

g.dirTimer = 0.18;

const dirs = [

[1,0],
[-1,0],
[0,1],
[0,-1]

];

let best = null;
let bestDist = 999999;

dirs.forEach(d=>{

const nx =
g.x + d[0]*TILE;

const ny =
g.y + d[1]*TILE;

if(
circleWallCollision(
nx,
ny,
g.radius
)
){

return;

}

const dist =

Math.hypot(
pacman.x - nx,
pacman.y - ny
);

if(dist < bestDist){

bestDist = dist;
best = d;

}

});

if(best){

g.vx = best[0] * g.speed;
g.vy = best[1] * g.speed;

}

}

const nextX =
g.x + g.vx * dt;

const nextY =
g.y + g.vy * dt;

if(
!circleWallCollision(
nextX,
g.y,
g.radius
)
){

g.x = nextX;

}

if(
!circleWallCollision(
g.x,
nextY,
g.radius
)
){

g.y = nextY;

}

});

}

/* =========================================
   DRAW MAP
========================================= */

function drawMap(){

for(let row=0; row<rows; row++){

for(let col=0; col<cols; col++){

if(map[row][col] === "#"){

const x = col*TILE;
const y = row*TILE;

ctx.fillStyle = "#18003a";

ctx.shadowBlur = 12;
ctx.shadowColor = "#ff006e";

ctx.fillRect(
x,
y,
TILE,
TILE
);

ctx.strokeStyle = "#ff006e";

ctx.lineWidth = 2;

ctx.strokeRect(
x,
y,
TILE,
TILE
);

}

}

}

ctx.shadowBlur = 0;

}

/* =========================================
   DRAW PELLETS
========================================= */

function drawPellets(){

pellets.forEach(p=>{

if(p.eaten) return;

ctx.fillStyle = "#ff87d0";

ctx.shadowBlur = 12;
ctx.shadowColor = "#ff87d0";

ctx.beginPath();

ctx.arc(
p.x,
p.y,
3,
0,
Math.PI*2
);

ctx.fill();

});

ctx.shadowBlur = 0;

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

ctx.rotate(pacman.angle);

const open =

Math.abs(
Math.sin(pacman.mouth)
)*0.70;

ctx.fillStyle = "#ffe600";

ctx.shadowBlur = 18;
ctx.shadowColor = "#ffe600";

ctx.beginPath();

ctx.arc(
0,
0,
pacman.radius,
open*Math.PI,
(2-open)*Math.PI
);

ctx.lineTo(0,0);

ctx.fill();

ctx.restore();

ctx.shadowBlur = 0;

}

/* =========================================
   DRAW GHOSTS
========================================= */

function drawGhosts(){

ghosts.forEach(g=>{

ctx.save();

ctx.translate(g.x,g.y);

let angle = 0;

if(g.vx > 0) angle = 0;
if(g.vx < 0) angle = Math.PI;
if(g.vy > 0) angle = Math.PI/2;
if(g.vy < 0) angle = -Math.PI/2;

ctx.rotate(angle);

ctx.beginPath();

ctx.moveTo(-8,0);

for(let i=0;i<16;i++){

ctx.lineTo(

-8 - i*3,

Math.sin(
Date.now()/90 +
i +
g.tailSeed
)*3

);

}

ctx.strokeStyle = g.color;

ctx.lineWidth = 2;

ctx.shadowBlur = 14;
ctx.shadowColor = g.color;

ctx.stroke();

ctx.fillStyle = g.color;

ctx.beginPath();

ctx.ellipse(
0,
0,
10,
6,
0,
0,
Math.PI*2
);

ctx.fill();

ctx.fillStyle = "white";

ctx.beginPath();

ctx.arc(2,-2,1.2,0,Math.PI*2);
ctx.arc(2,2,1.2,0,Math.PI*2);

ctx.fill();

ctx.restore();

});

ctx.shadowBlur = 0;

}

/* =========================================
   EAT PELLETS
========================================= */

function eatPellets(){

pellets.forEach(p=>{

if(p.eaten) return;

const dist =

Math.hypot(
pacman.x - p.x,
pacman.y - p.y
);

if(dist < 14){

p.eaten = true;

score += 10;

pelletsEaten++;

scoreText.innerText = score;

if(pelletsEaten % 15 === 0){

showQuestion();

}

}

});

const left =

pellets.filter(p=>!p.eaten);

if(left.length === 0){

createPellets();

}

}

/* =========================================
   QUESTIONS
========================================= */

function showQuestion(){

gamePaused = true;

const q =

questions[
Math.floor(Math.random()*questions.length)
];

questionBox.style.display = "flex";

questionText.innerText = q.q;

optionsBox.innerHTML = "";

q.a.forEach((answer,index)=>{

const btn =
document.createElement("div");

btn.className = "option";

btn.innerText = answer;

btn.onclick = ()=>{

if(index === q.c){

score += 100;

questionsAnswered++;

powers[
questionsAnswered % 6
] += 20;

}

scoreText.innerText = score;

questionsText.innerText =
questionsAnswered;

questionBox.style.display = "none";

gamePaused = false;

};

optionsBox.appendChild(btn);

});

}

/* =========================================
   COLLISIONS
========================================= */

function checkGhostCollision(){

if(gamePaused) return;

ghosts.forEach(g=>{

const dist =

Math.hypot(
pacman.x - g.x,
pacman.y - g.y
);

if(dist < 16){

lives--;

livesText.innerText = lives;

pacman.x = 1.5*TILE;
pacman.y = 1.5*TILE;

if(lives <= 0){

alert("GAME OVER");

location.reload();

}

}

});

}

/* =========================================
   POWERS
========================================= */

function updatePowers(){

powers.forEach((p,index)=>{

if(p > 100) p = 100;

powerBars[index].style.width =
p + "%";

});

}

/* =========================================
   GAME LOOP
========================================= */

let lastTime = 0;

function gameLoop(timestamp){

requestAnimationFrame(gameLoop);

if(!gameStarted) return;

const dt =

(timestamp - lastTime) / 1000;

lastTime = timestamp;

ctx.clearRect(
0,
0,
canvas.width,
canvas.height
);

drawMap();

drawPellets();

movePacman(dt);

moveGhosts(dt);

eatPellets();

checkGhostCollision();

drawPacman();

drawGhosts();

updatePowers();

}

requestAnimationFrame(gameLoop);
