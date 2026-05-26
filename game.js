
<div id="questionBox">

<div class="questionCard">

<div id="questionText"></div>

<div id="options"></div>

</div>

</div>

<script src="game.js"></script>

</body>
</html>
me pasas pls el nuevo js completo?
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 650;

/* =========================
   MENU
========================= */

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

/* =========================
   HUD
========================= */

const livesText =
document.getElementById("lives");

const scoreText =
document.getElementById("score");

const questionsText =
document.getElementById("questions");

/* =========================
   POWER BARS
========================= */

const powerBars = [

document.getElementById("power1"),
document.getElementById("power2"),
document.getElementById("power3"),
document.getElementById("power4"),
document.getElementById("power5"),
document.getElementById("power6")

];

let powers = [0,0,0,0,0,0];

/* =========================
   MAP
========================= */

const TILE = 32;

const map = [

"#########################",
"#.......................#",
"#.#####.#######.#####...#",
"#.......................#",
"#.###.###.#.###.###.###.#",
"#.......................#",
"#.#####.#.#.#.#.#####...#",
"#.........#.#.........###",
"###.#####.....#####.#####",
"#.......................#",
"#.#####.#######.#####...#",
"#.......................#",
"#.###.###.#.###.###.###.#",
"#.......................#",
"#.#####.#.#.#.#.#####...#",
"#.......................#",
"#########################"

];

const rows = map.length;
const cols = map[0].length;

/* =========================
   PLAYER
========================= */

const pacman = {

x: 1.5,
y: 1.5,

radius: 13,

speed: 0.10,

dirX: 0,
dirY: 0,

angle: 0,

mouth: 0

};

/* =========================
   GHOSTS / ESPERMAS
========================= */

const ghosts = [];

const ghostColors = [

"#ff4fd8",
"#00e5ff",
"#7cff00",
"#ff9d00",
"#ff4d4d",
"#9d4dff"

];

for(let i=0;i<6;i++){

ghosts.push({

x: 12 + (i%3),
y: 8 + Math.floor(i/3),

radius: 10,

color: ghostColors[i],

dirX: 0,
dirY: 0,

speed: 0.06,

moveCooldown: 0

});

}

/* =========================
   PELLETS
========================= */

let pellets = [];

function createPellets(){

pellets = [];

for(let row=0; row<rows; row++){

for(let col=0; col<cols; col++){

if(map[row][col] === "."){

pellets.push({

x: col + 0.5,
y: row + 0.5,

eaten:false

});

}

}

}

}

createPellets();

/* =========================
   STATS
========================= */

let score = 0;
let lives = 3;
let questionsAnswered = 0;
let pelletsEaten = 0;

/* =========================
   QUESTIONS
========================= */

const questionBox =
document.getElementById("questionBox");

const questionText =
document.getElementById("questionText");

const optionsBox =
document.getElementById("options");

let gamePaused = false;

const questions = [

{
q:"¿Qué hormona desencadena la ovulación?",
a:["Estrógeno","LH","FSH","Progesterona"],
c:1
},

{
q:"¿Qué hormona domina la fase lútea?",
a:["Progesterona","FSH","LH","Estrógeno"],
c:0
},

{
q:"¿Qué significa HPO?",
a:[
"Hipotálamo Pituitaria Ovario",
"Hormona Progesterona Ovulación",
"Hipófisis Placenta Ovario",
"Hormona Pituitaria Ovárica"
],
c:0
},

{
q:"¿Dónde se producen los estrógenos?",
a:[
"Ovarios",
"Hígado",
"Riñones",
"Hipotálamo"
],
c:0
},

{
q:"¿Qué hormona estimula los folículos?",
a:["FSH","LH","Progesterona","Insulina"],
c:0
},

{
q:"¿Qué órgano libera GnRH?",
a:["Hipotálamo","Ovario","Útero","Hipófisis"],
c:0
},

{
q:"¿Qué estructura libera el óvulo?",
a:[
"Folículo",
"Hipotálamo",
"Útero",
"Trompa"
],
c:0
}

];

/* =========================
   CONTROLS
========================= */

const keys = {};

window.addEventListener("keydown",(e)=>{

keys[e.key] = true;

});

window.addEventListener("keyup",(e)=>{

keys[e.key] = false;

});

/* =========================
   WALL COLLISION
========================= */

function wallAt(x,y){

const col = Math.floor(x);
const row = Math.floor(y);

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

/* =========================
   PACMAN MOVE
========================= */

function movePacman(){

if(gamePaused) return;

let nextX = pacman.x;
let nextY = pacman.y;

if(keys["ArrowLeft"]){

nextX -= pacman.speed;

pacman.dirX = -1;
pacman.dirY = 0;

pacman.angle = Math.PI;

}

if(keys["ArrowRight"]){

nextX += pacman.speed;

pacman.dirX = 1;
pacman.dirY = 0;

pacman.angle = 0;

}

if(keys["ArrowUp"]){

nextY -= pacman.speed;

pacman.dirX = 0;
pacman.dirY = -1;

pacman.angle = -Math.PI/2;

}

if(keys["ArrowDown"]){

nextY += pacman.speed;

pacman.dirX = 0;
pacman.dirY = 1;

pacman.angle = Math.PI/2;

}

if(!wallAt(nextX,nextY)){

pacman.x = nextX;
pacman.y = nextY;

}

pacman.mouth += 0.25;

}

/* =========================
   GHOST AI
========================= */

function moveGhosts(){

if(gamePaused) return;

ghosts.forEach(g=>{

g.moveCooldown++;

if(g.moveCooldown < 12) return;

g.moveCooldown = 0;

const dirs = [

[1,0],
[-1,0],
[0,1],
[0,-1]

];

let bestMove = null;
let bestDist = 999999;

dirs.forEach(d=>{

const nx = g.x + d[0];
const ny = g.y + d[1];

if(wallAt(nx,ny)) return;

const dist =

Math.abs(nx - pacman.x) +
Math.abs(ny - pacman.y);

if(dist < bestDist){

bestDist = dist;

bestMove = d;

}

});

if(bestMove){

g.x += bestMove[0];
g.y += bestMove[1];

g.dirX = bestMove[0];
g.dirY = bestMove[1];

}

});

}

/* =========================
   DRAW MAP
========================= */

function drawMap(){

for(let row=0; row<rows; row++){

for(let col=0; col<cols; col++){

if(map[row][col] === "#"){

ctx.fillStyle = "#1e34ff";

ctx.shadowBlur = 15;
ctx.shadowColor = "#5fa8ff";

ctx.fillRect(
col*TILE,
row*TILE,
TILE,
TILE
);

ctx.strokeStyle = "#8fd0ff";

ctx.strokeRect(
col*TILE,
row*TILE,
TILE,
TILE
);

}

}

}

ctx.shadowBlur = 0;

}

/* =========================
   DRAW PELLETS
========================= */

function drawPellets(){

pellets.forEach(p=>{

if(p.eaten) return;

ctx.fillStyle = "#ff9be8";

ctx.beginPath();

ctx.arc(
p.x*TILE,
p.y*TILE,
3,
0,
Math.PI*2
);

ctx.fill();

});

}

/* =========================
   DRAW PACMAN
========================= */

function drawPacman(){

const open =

Math.abs(Math.sin(pacman.mouth))*0.70;

ctx.save();

ctx.translate(
pacman.x*TILE,
pacman.y*TILE
);

ctx.rotate(pacman.angle);

ctx.fillStyle = "yellow";

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

/* =========================
   DRAW GHOSTS
========================= */

function drawGhosts(){

ghosts.forEach(g=>{

const x = g.x*TILE;
const y = g.y*TILE;

ctx.save();

ctx.translate(x,y);

let angle = 0;

if(g.dirX === 1) angle = 0;
if(g.dirX === -1) angle = Math.PI;
if(g.dirY === 1) angle = Math.PI/2;
if(g.dirY === -1) angle = -Math.PI/2;

ctx.rotate(angle);

ctx.fillStyle = g.color;

/* head */

ctx.beginPath();

ctx.ellipse(
0,
0,
11,
7,
0,
0,
Math.PI*2
);

ctx.fill();

/* eyes */

ctx.fillStyle = "white";

ctx.beginPath();

ctx.arc(3,-2,1.5,0,Math.PI*2);
ctx.arc(3,2,1.5,0,Math.PI*2);

ctx.fill();

/* tail */

ctx.beginPath();

ctx.moveTo(-8,0);

for(let i=0;i<14;i++){

ctx.lineTo(

-8-(i*4),

Math.sin(Date.now()/120+i)*3

);

}

ctx.strokeStyle = g.color;

ctx.lineWidth = 3;

ctx.stroke();

ctx.restore();

});

}

/* =========================
   EAT PELLETS
========================= */

function eatPellets(){

pellets.forEach(p=>{

if(p.eaten) return;

const dx = p.x - pacman.x;
const dy = p.y - pacman.y;

const dist = Math.sqrt(dx*dx + dy*dy);

if(dist < 0.4){

p.eaten = true;

score += 10;

pelletsEaten++;

scoreText.innerText = score;

if(pelletsEaten % 15 === 0){

showQuestion();

}

}

});

const remaining =

pellets.filter(p=>!p.eaten);

if(remaining.length === 0){

createPellets();

}

}

/* =========================
   QUESTIONS
========================= */

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

/* =========================
   COLLISIONS
========================= */

function checkGhostCollisions(){

if(gamePaused) return;

ghosts.forEach(g=>{

const dx = g.x - pacman.x;
const dy = g.y - pacman.y;

const dist = Math.sqrt(dx*dx + dy*dy);

if(dist < 0.6){

lives--;

livesText.innerText = lives;

pacman.x = 1.5;
pacman.y = 1.5;

if(lives <= 0){

alert("GAME OVER");

location.reload();

}

}

});

}

/* =========================
   POWERS
========================= */

function updatePowers(){

powers.forEach((p,index)=>{

if(p > 100) p = 100;

powerBars[index].style.width =
p + "%";

});

}

/* =========================
   LOOP
========================= */

function gameLoop(){

requestAnimationFrame(gameLoop);

if(!gameStarted) return;

ctx.clearRect(
0,
0,
canvas.width,
canvas.height
);

drawMap();

drawPellets();

movePacman();

moveGhosts();

eatPellets();

checkGhostCollisions();

drawPacman();

drawGhosts();

updatePowers();

}

gameLoop();
