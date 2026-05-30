// ======================================================
// OVUPAC
// RETRO HORMONAL ARCADE
// FULL REWRITE
// ======================================================

const canvas = document.getElementById("gameCanvas");
console.log("menuScreen:", document.getElementById("menuScreen"));
console.log("playButton:", document.getElementById("playButton"));
console.log("gameCanvas:", document.getElementById("gameCanvas"));
const ctx = canvas.getContext("2d");

// ======================================================
// CONFIG
// ======================================================

canvas.width = 1120;
canvas.height = 760;

const TILE = 40;

const COLORS = {
background: "#050010",
wall: "#6a00ff",
wallGlow: "#ff00c8",
pellet: "#ffd6ff",
pacman: "#ffe600",
ui: "#ff4fc3",
text: "#ffffff",
pink: "#ff4fd8",
cyan: "#45e6ff",
orange: "#ff9f1c"
};

// ======================================================
// GAME STATE
// ======================================================

let gameStarted = false;
let gameOver = false;

let score = 0;
let lives = 3;
let questionsSolved = 0;

let powerMode = false;
let powerTimer = 0;

// ======================================================
// UI
// ======================================================

const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const questionsEl = document.getElementById("questions");

const startMenu = document.getElementById("menuScreen");
const playBtn = document.getElementById("playButton");
console.log(startMenu);
console.log(playBtn);

// ======================================================
// CLASSIC STYLE MAP
// 1 wall
// 0 pellet
// 2 empty
// ======================================================

const map = [
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1],
[1,0,1,2,2,1,0,1,2,2,1,0,1,2,2,1,0,1,2,2,1,0,1,2,2,1,0,1],
[1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,1,1,1,1,0,1,1,1,1,1,1,2,2,1,1,1,1,1,1,0,1,1,1,1,0,1],
[1,0,0,0,0,1,0,0,0,0,0,0,1,2,2,1,0,0,0,0,0,0,1,0,0,0,0,1],
[1,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1],
[2,2,2,1,0,1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1,0,1,2,2,2],
[1,1,1,1,0,1,0,1,1,0,1,1,1,2,2,1,1,1,0,1,1,0,1,0,1,1,1,1],
[1,0,0,0,0,0,0,1,2,0,0,0,1,2,2,1,0,0,0,0,1,0,0,0,0,0,0,1],
[1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// ======================================================
// PACMAN
// ======================================================

const pacman = {
x: TILE * 1.5,
y: TILE * 1.5,
radius: 15,
speed: 2.2,
dx: 0,
dy: 0,
nextDx: 0,
nextDy: 0,
mouth: 0.2,
mouthDir: 1,
rotation: 0
};

// ======================================================
// GHOSTS / ESPERMATOZOIDES
// ======================================================

const ghosts = [
{
x: 520,
y: 360,
color: COLORS.pink,
dx: 1.2,
dy: 0,
tail: 0
},
{
x: 640,
y: 360,
color: COLORS.cyan,
dx: -1.2,
dy: 0,
tail: 0
},
{
x: 760,
y: 360,
color: COLORS.orange,
dx: 0,
dy: 1.2,
tail: 0
}
];

// ======================================================
// START BUTTON
// ======================================================

playBtn.addEventListener("click", () => {

startMenu.style.display = "none";

gameStarted = true;

requestAnimationFrame(gameLoop);

});

// ======================================================
// INPUT
// ======================================================

document.addEventListener("keydown", e => {

if(e.key === "ArrowRight"){
pacman.nextDx = pacman.speed;
pacman.nextDy = 0;
pacman.rotation = 0;
}

if(e.key === "ArrowLeft"){
pacman.nextDx = -pacman.speed;
pacman.nextDy = 0;
pacman.rotation = Math.PI;
}

if(e.key === "ArrowUp"){
pacman.nextDx = 0;
pacman.nextDy = -pacman.speed;
pacman.rotation = Math.PI * 1.5;
}

if(e.key === "ArrowDown"){
pacman.nextDx = 0;
pacman.nextDy = pacman.speed;
pacman.rotation = Math.PI / 2;
}

});

// ======================================================
// WALL COLLISION
// ======================================================

function isWall(x, y){

const row = Math.floor(y / TILE);
const col = Math.floor(x / TILE);

if(
row < 0 ||
col < 0 ||
row >= map.length ||
col >= map[0].length
){
return true;
}

return map[row][col] === 1;

}

// ======================================================
// DRAW MAP
// ======================================================

function drawMap(){

for(let row=0; row<map.length; row++){

for(let col=0; col<map[row].length; col++){

const tile = map[row][col];

const x = col * TILE;
const y = row * TILE;

if(tile === 1){

ctx.fillStyle = COLORS.wall;
ctx.fillRect(x,y,TILE,TILE);

ctx.strokeStyle = COLORS.wallGlow;
ctx.lineWidth = 2;
ctx.strokeRect(x,y,TILE,TILE);

}

if(tile === 0){

ctx.beginPath();
ctx.fillStyle = COLORS.pellet;

ctx.arc(
x + TILE/2,
y + TILE/2,
4,
0,
Math.PI*2
);

ctx.fill();

}

}

}

}

// ======================================================
// DRAW PACMAN
// ======================================================

function drawPacman(){

ctx.save();

ctx.translate(pacman.x, pacman.y);
ctx.rotate(pacman.rotation);

ctx.beginPath();

ctx.fillStyle = COLORS.pacman;

ctx.moveTo(0,0);

ctx.arc(
0,
0,
pacman.radius,
pacman.mouth,
Math.PI*2 - pacman.mouth
);

ctx.fill();

ctx.restore();

}

// ======================================================
// DRAW ESPERM GHOST
// ======================================================

function drawGhost(g){

ctx.save();

ctx.translate(g.x, g.y);

ctx.beginPath();
ctx.fillStyle = g.color;

ctx.arc(0,0,14,0,Math.PI*2);
ctx.fill();

for(let i=0; i<5; i++){

ctx.beginPath();

ctx.strokeStyle = g.color;
ctx.lineWidth = 3;

ctx.moveTo(
-5,
0
);

ctx.quadraticCurveTo(
-20 - i*4,
Math.sin(g.tail + i)*8,
-35 - i*7,
Math.cos(g.tail + i)*8
);

ctx.stroke();

}

ctx.restore();

g.tail += 0.15;

}

// ======================================================
// MOVE PACMAN
// ======================================================

function movePacman(){

const nextX = pacman.x + pacman.nextDx;
const nextY = pacman.y + pacman.nextDy;

if(!isWall(nextX, nextY)){

pacman.dx = pacman.nextDx;
pacman.dy = pacman.nextDy;

}

const futureX = pacman.x + pacman.dx;
const futureY = pacman.y + pacman.dy;

if(!isWall(futureX, futureY)){

pacman.x += pacman.dx;
pacman.y += pacman.dy;

}

pacman.mouth += 0.015 * pacman.mouthDir;

if(pacman.mouth > 0.45){
pacman.mouthDir = -1;
}

if(pacman.mouth < 0.08){
pacman.mouthDir = 1;
}

}

// ======================================================
// PELLETS
// ======================================================

function eatPellets(){

const row = Math.floor(pacman.y / TILE);
const col = Math.floor(pacman.x / TILE);

if(map[row][col] === 0){

map[row][col] = 2;

score += 10;

scoreEl.innerText = score;

}

}

// ======================================================
// MOVE GHOSTS
// ======================================================

function moveGhosts(){

ghosts.forEach(g => {

const futureX = g.x + g.dx;
const futureY = g.y + g.dy;

if(isWall(futureX, futureY)){

const dirs = [
[1.2,0],
[-1.2,0],
[0,1.2],
[0,-1.2]
];

const random = dirs[Math.floor(Math.random()*dirs.length)];

g.dx = random[0];
g.dy = random[1];

}else{

g.x += g.dx;
g.y += g.dy;

}

});

}

// ======================================================
// COLLISION
// ======================================================

function checkGhostCollision(){

ghosts.forEach(g => {

const dx = pacman.x - g.x;
const dy = pacman.y - g.y;

const dist = Math.sqrt(dx*dx + dy*dy);

if(dist < 24){

lives--;

livesEl.innerText = lives;

pacman.x = TILE * 1.5;
pacman.y = TILE * 1.5;

if(lives <= 0){

gameOver = true;

}

}

});

}

// ======================================================
// GAME OVER
// ======================================================

function drawGameOver(){

ctx.fillStyle = "rgba(0,0,0,0.8)";
ctx.fillRect(0,0,canvas.width,canvas.height);

ctx.fillStyle = "#ff4fc3";
ctx.font = "70px Arial";
ctx.textAlign = "center";

ctx.fillText(
"GAME OVER",
canvas.width/2,
canvas.height/2
);

}

// ======================================================
// MAIN LOOP
// ======================================================

function gameLoop(){

ctx.clearRect(0,0,canvas.width,canvas.height);

drawMap();

movePacman();

eatPellets();

moveGhosts();

checkGhostCollision();

drawPacman();

ghosts.forEach(drawGhost);

if(gameOver){

drawGameOver();

return;

}

requestAnimationFrame(gameLoop);

}
