const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/* =========================================
   PIXEL PERFECT SETTINGS
========================================= */

canvas.width = 864;
canvas.height = 608;

ctx.imageSmoothingEnabled = false;

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
   TILE SYSTEM
========================================= */

const TILE = 32;

/* =========================================
   RETRO MAP
========================================= */

const map = [

"###########################",
"#.........................#",
"#.#####.#######.#####.###.#",
"#.........................#",
"#.#####.#.###.#.#####.###.#",
"#.......#.....#.........#.#",
"###.###.#####.#####.###.#.#",
"#.........#.....#.......#.#",
"#.#####.#.#.###.#.#####.#.#",
"#.......#...#...#.........#",
"#.#####.###.#.###.#####.#.#",
"#.........................#",
"#.#####.#.#####.#.#####.#.#",
"#.......#...#...#.......#.#",
"#.#########.#.#########.#.#",
"#.........................#",
"###########################"

];

const rows = map.length;
const cols = map[0].length;

/* =========================================
   PLAYER
========================================= */

const pacman = {

x: TILE * 1.5,
y: TILE * 1.5,

radius: 11,

speed: 165,

vx: 0,
vy: 0,

angle: 0,

mouth: 0

};

/* =========================================
   GHOSTS
========================================= */

const ghostColors = [

"#ff004d",
"#00e5ff",
"#ff77a8",
"#00ff88",
"#ffcc00",
"#9d4edd"

];

const ghosts = [];

for(let i=0;i<6;i++){

ghosts.push({

x: 13*TILE + (i%3)*20,
y: 8*TILE + Math.floor(i/3)*20,

radius: 8,

speed: 110,

vx: 0,
vy: 0,

color: ghostColors[i],

changeDirTimer: 0,

tailSeed: Math.random()*999

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
a:["LH","FSH","Progesterona","Estrógeno"],
c:0
},

{
q:"¿Qué hormona domina la fase lútea?",
a:["Progesterona","FSH","LH","Estrógeno"],
c:0
},

{
q:"¿Qué órgano produce GnRH?",
a:["Hipotálamo","Ovario","Hipófisis","Útero"],
c:0
},

{
q:"¿Qué hormona estimula el folículo?",
a:["FSH","LH","Progesterona","Cortisol"],
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
   COLLISIONS
========================================= */

function isWall(x,y){

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

return map[row][col] === "#";

}

function canMove(x,y,r){

const points = [

[x-r,y-r],
[x+r,y-r],
[x-r,y+r],
[x+r,y+r]

];

for(let p of points){

if(isWall(p[0],p[1])){

return false;

}

}

return true;

}

/* =========================================
   PLAYER MOVE
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

if(canMove(nextX,pacman.y,pacman.radius)){

pacman.x = nextX;

}

if(canMove(pacman.x,nextY,pacman.radius)){

pacman.y = nextY;

}

pacman.mouth += dt * 12;

}

/* =========================================
   GHOST AI
========================================= */

function moveGhosts(dt){

if(gamePaused) return;

ghosts.forEach(g=>{

g.changeDirTimer -= dt;

if(g.changeDirTimer <= 0){

g.changeDirTimer = 0.15;

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

if(!canMove(nx,ny,g.radius)) return;

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

if(canMove(nextX,g.y,g.radius)){

g.x = nextX;

}

if(canMove(g.x,nextY,g.radius)){

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

ctx.fillStyle = "#2b0f54";

ctx.fillRect(
x,
y,
TILE,
TILE
);

ctx.strokeStyle = "#ff004d";

ctx.lineWidth = 2;

ctx.strokeRect(
x+1,
y+1,
TILE-2,
TILE-2
);

}

}

}

}

/* =========================================
   DRAW PELLETS
========================================= */

function drawPellets(){

ctx.fillStyle = "#ffd6ff";

pellets.forEach(p=>{

if(p.eaten) return;

ctx.fillRect(
p.x-2,
p.y-2,
4,
4
);

});

}

/* =========================================
   DRAW PACMAN
========================================= */

function drawPacman(){

ctx.save();

ctx.translate(
Math.round(pacman.x),
Math.round(pacman.y)
);

ctx.rotate(pacman.angle);

const open =

Math.abs(
Math.sin(pacman.mouth)
)*0.28;

ctx.fillStyle = "#ffe600";

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

}

/* =========================================
   DRAW GHOSTS
========================================= */

function drawGhosts(){

ghosts.forEach(g=>{

ctx.save();

ctx.translate(
Math.round(g.x),
Math.round(g.y)
);

let angle = 0;

if(g.vx > 0) angle = 0;
if(g.vx < 0) angle = Math.PI;
if(g.vy > 0) angle = Math.PI/2;
if(g.vy < 0) angle = -Math.PI/2;

ctx.rotate(angle);

/* TAIL */

ctx.strokeStyle = g.color;

ctx.lineWidth = 2;

ctx.beginPath();

ctx.moveTo(-6,0);

for(let i=0;i<10;i++){

ctx.lineTo(

-6 - i*3,

Math.sin(
Date.now()/70 +
i +
g.tailSeed
)*2

);

}

ctx.stroke();

/* HEAD */

ctx.fillStyle = g.color;

ctx.beginPath();

ctx.ellipse(
0,
0,
8,
5,
0,
0,
Math.PI*2
);

ctx.fill();

/* EYES */

ctx.fillStyle = "white";

ctx.fillRect(1,-2,2,2);
ctx.fillRect(1,1,2,2);

ctx.restore();

});

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
   GHOST COLLISION
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

pacman.x = TILE * 1.5;
pacman.y = TILE * 1.5;

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
