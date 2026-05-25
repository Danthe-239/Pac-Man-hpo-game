const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 700;

/* =========================
   START SCREEN
========================= */

const startScreen = document.getElementById("startScreen");
const playBtn = document.getElementById("playBtn");

let gameStarted = false;

playBtn.onclick = () => {

    startScreen.style.display = "none";

    gameStarted = true;

};

/* =========================
   HUD
========================= */

const livesText = document.getElementById("lives");
const scoreText = document.getElementById("score");
const questionCountText =
document.getElementById("questionCount");

/* =========================
   POWER BARS
========================= */

const bars = [

document.getElementById("bar1"),
document.getElementById("bar2"),
document.getElementById("bar3"),
document.getElementById("bar4"),
document.getElementById("bar5"),
document.getElementById("bar6")

];

let powerLevels = [0,0,0,0,0,0];

/* =========================
   MAP
========================= */

const TILE = 36;

const map = [

"11111111111111111111111",
"10000000000000000000001",
"10111011101110111011101",
"10000010000000100000001",
"10111010111110101110101",
"10000000000000000000001",
"10111110111110111110101",
"10000010000000100000001",
"11111010111110101111101",
"10000000000000000000001",
"10111111101110111111101",
"10000000000000000000001",
"11111111111111111111111"

];

/* =========================
   PLAYER
========================= */

const pacman = {

x: TILE * 1.5,
y: TILE * 1.5,

radius: 14,

speed: 4,

dirX: 0,
dirY: 0,

mouth: 0

};

/* =========================
   CONTROLS
========================= */

const keys = {};

window.addEventListener("keydown", e => {

keys[e.key] = true;

});

window.addEventListener("keyup", e => {

keys[e.key] = false;

});

/* =========================
   ENEMIES
========================= */

const enemies = [];

const enemyColors = [

"#ff4fd8",
"#00e5ff",
"#7cff00",
"#ff9d00",
"#ff4d4d",
"#9d4dff"

];

for(let i=0;i<6;i++){

enemies.push({

x: 500 + Math.random()*100,
y: 300 + Math.random()*100,

radius: 11,

speed: 2,

color: enemyColors[i],

tailOffset: Math.random()*1000

});

}

/* =========================
   PELLETS
========================= */

let pellets = [];

function createPellets(){

pellets = [];

for(let row=0; row<map.length; row++){

for(let col=0; col<map[row].length; col++){

if(map[row][col] === "0"){

pellets.push({

x: col*TILE + TILE/2,
y: row*TILE + TILE/2

});

}

}

}

}

createPellets();

/* =========================
   GAME STATS
========================= */

let score = 0;
let lives = 3;
let questionsAnswered = 0;
let pelletsEaten = 0;

/* =========================
   WALL COLLISION
========================= */

function wallCollision(x,y,r){

for(let row=0; row<map.length; row++){

for(let col=0; col<map[row].length; col++){

if(map[row][col] === "1"){

const wallX = col*TILE;
const wallY = row*TILE;

if(

x+r > wallX &&
x-r < wallX+TILE &&
y+r > wallY &&
y-r < wallY+TILE

){

return true;

}

}

}

}

return false;

}

/* =========================
   PLAYER MOVE
========================= */

function movePacman(){

pacman.dirX = 0;
pacman.dirY = 0;

if(keys["ArrowUp"]) pacman.dirY = -1;
if(keys["ArrowDown"]) pacman.dirY = 1;
if(keys["ArrowLeft"]) pacman.dirX = -1;
if(keys["ArrowRight"]) pacman.dirX = 1;

const nextX =
pacman.x + pacman.dirX * pacman.speed;

const nextY =
pacman.y + pacman.dirY * pacman.speed;

if(!wallCollision(nextX,pacman.y,pacman.radius)){

pacman.x = nextX;

}

if(!wallCollision(pacman.x,nextY,pacman.radius)){

pacman.y = nextY;

}

}

/* =========================
   ENEMY AI
========================= */

function moveEnemies(){

enemies.forEach(enemy=>{

const dx = pacman.x - enemy.x;
const dy = pacman.y - enemy.y;

const dist = Math.sqrt(dx*dx + dy*dy);

const moveX = dx/dist;
const moveY = dy/dist;

const nextX =
enemy.x + moveX * enemy.speed;

const nextY =
enemy.y + moveY * enemy.speed;

if(!wallCollision(nextX,enemy.y,enemy.radius)){

enemy.x = nextX;

}

if(!wallCollision(enemy.x,nextY,enemy.radius)){

enemy.y = nextY;

}

});

}

/* =========================
   DRAW MAP
========================= */

function drawMap(){

for(let row=0; row<map.length; row++){

for(let col=0; col<map[row].length; col++){

if(map[row][col] === "1"){

ctx.fillStyle = "#263dff";

ctx.shadowBlur = 15;
ctx.shadowColor = "#4d7dff";

ctx.fillRect(
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

ctx.fillStyle = "#ff9be8";

pellets.forEach(p=>{

ctx.beginPath();

ctx.arc(
p.x,
p.y,
4,
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

pacman.mouth += 0.18;

const open =
Math.abs(Math.sin(pacman.mouth))*0.70;

ctx.fillStyle = "yellow";

ctx.beginPath();

ctx.arc(

pacman.x,
pacman.y,

pacman.radius,

open*Math.PI,
(2-open)*Math.PI

);

ctx.lineTo(pacman.x,pacman.y);

ctx.fill();

}

/* =========================
   DRAW ENEMIES
========================= */

function drawEnemies(){

enemies.forEach(enemy=>{

ctx.strokeStyle = enemy.color;

ctx.lineWidth = 4;

ctx.beginPath();

ctx.moveTo(enemy.x,enemy.y);

for(let i=0;i<12;i++){

ctx.lineTo(

enemy.x - i*5,

enemy.y +
Math.sin(Date.now()/100+i)*5

);

}

ctx.stroke();

ctx.fillStyle = enemy.color;

ctx.beginPath();

ctx.arc(
enemy.x,
enemy.y,
enemy.radius,
0,
Math.PI*2
);

ctx.fill();

});

}

/* =========================
   EAT PELLETS
========================= */

function eatPellets(){

pellets = pellets.filter(p=>{

const dx = pacman.x - p.x;
const dy = pacman.y - p.y;

const dist = Math.sqrt(dx*dx + dy*dy);

if(dist < 18){

score += 10;

pelletsEaten++;

if(pelletsEaten % 15 === 0){

questionsAnswered++;

}

return false;

}

return true;

});

if(pellets.length === 0){

createPellets();

}

}

/* =========================
   COLLISIONS
========================= */

function enemyCollision(){

enemies.forEach(enemy=>{

const dx = pacman.x - enemy.x;
const dy = pacman.y - enemy.y;

const dist = Math.sqrt(dx*dx + dy*dy);

if(dist < 20){

lives--;

pacman.x = TILE*1.5;
pacman.y = TILE*1.5;

if(lives <= 0){

alert("GAME OVER");

location.reload();

}

}

});

}

/* =========================
   UPDATE HUD
========================= */

function updateHUD(){

livesText.textContent = lives;

scoreText.textContent = score;

questionCountText.textContent =
questionsAnswered;

bars.forEach((bar,index)=>{

powerLevels[index] += 0.03;

if(powerLevels[index] > 100){

powerLevels[index] = 100;

}

bar.style.width =
powerLevels[index] + "%";

});

}

/* =========================
   GAME LOOP
========================= */

function gameLoop(){

if(!gameStarted){

requestAnimationFrame(gameLoop);
return;

}

ctx.clearRect(
0,
0,
canvas.width,
canvas.height
);

movePacman();

moveEnemies();

eatPellets();

enemyCollision();

drawMap();

drawPellets();

drawPacman();

drawEnemies();

updateHUD();

requestAnimationFrame(gameLoop);

}

gameLoop();
