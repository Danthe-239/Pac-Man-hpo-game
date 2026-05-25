const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 1100;
canvas.height = 720;

const TILE = 32;

const offsetX = 30;
const offsetY = 60;

const livesEl = document.getElementById("lives");
const scoreEl = document.getElementById("score");
const powerEl = document.getElementById("power");

const questionBox = document.getElementById("questionBox");
const questionText = document.getElementById("questionText");

const optionButtons = [
document.getElementById("opt0"),
document.getElementById("opt1"),
document.getElementById("opt2"),
document.getElementById("opt3")
];

const map = [

"111111111111111111111111111111",
"100000000000000000000000000001",
"101110111101111111101111011101",
"102000100001000000100001000201",
"101110111101111111101111011101",
"100000000000000000000000000001",
"101110111111011110111111011101",
"100000000000010000000000000001",
"111110111011111110111011111111",
"100000100010000010000100000001",
"111110101111044011110101111111",
"100000100000000000000100000001",
"111110101111111111110101111111",
"100000100000000000000100000001",
"111110101111111111110101111111",
"100000000000010000000000000001",
"101110111111011110111111011101",
"102000000001000000100000000201",
"111111111111111111111111111111"

];

const pellets = [];
const powerPellets = [];

let score = 0;
let lives = 3;
let powers = 0;

const questions = [

{
q:"¿Qué órgano libera el óvulo?",
o:["Ovario","Corazón","Pulmón","Riñón"],
a:0
},

{
q:"¿Cuánto dura un ciclo menstrual promedio?",
o:["7 días","14 días","28 días","60 días"],
a:2
},

{
q:"¿Qué hormona provoca la ovulación?",
o:["LH","Insulina","Adrenalina","Melatonina"],
a:0
},

{
q:"¿Dónde ocurre la fecundación?",
o:["Útero","Pulmón","Trompas de Falopio","Corazón"],
a:2
},

{
q:"¿Qué célula fecunda el óvulo?",
o:["Neurona","Esperma","Plaqueta","Glóbulo rojo"],
a:1
},

{
q:"¿Qué órgano alberga al bebé?",
o:["Pulmón","Útero","Riñón","Hígado"],
a:1
},

{
q:"¿Qué hormona aumenta en el embarazo?",
o:["hCG","Testosterona","Dopamina","Serotonina"],
a:0
},

{
q:"¿Qué ocurre en la menstruación?",
o:["El útero elimina tejido","Se rompen huesos","Se detiene el corazón","Crecen dientes"],
a:0
},

{
q:"¿Cuál es el gameto femenino?",
o:["Óvulo","Esperma","Neurona","Plaqueta"],
a:0
},

{
q:"¿Cuál es el gameto masculino?",
o:["Esperma","Óvulo","Cabello","Hueso"],
a:0
},

{
q:"¿Qué hormona regula el ciclo menstrual?",
o:["Estrógeno","Saliva","Insulina","Melanina"],
a:0
},

{
q:"¿Qué órgano produce espermatozoides?",
o:["Testículos","Pulmón","Cerebro","Riñón"],
a:0
}

];

function createPellets(){

for(let row=0; row<map.length; row++){

for(let col=0; col<map[row].length; col++){

const x = offsetX + col*TILE + TILE/2;
const y = offsetY + row*TILE + TILE/2;

if(map[row][col] === "0"){

pellets.push({x,y});

}

if(map[row][col] === "2"){

powerPellets.push({x,y});

}

}

}

}

createPellets();

const player = {

x: offsetX + TILE*1.5,
y: offsetY + TILE*1.5,

radius: 14,

speed: 8,

direction: 0,
nextDirection: 0

};

const enemies = [

{
x: offsetX + TILE*14,
y: offsetY + TILE*10,
color:"red",
speed:2.2,
angle:0
},

{
x: offsetX + TILE*15,
y: offsetY + TILE*10,
color:"cyan",
speed:2.1,
angle:0
},

{
x: offsetX + TILE*14,
y: offsetY + TILE*11,
color:"lime",
speed:2.0,
angle:0
},

{
x: offsetX + TILE*15,
y: offsetY + TILE*11,
color:"orange",
speed:2.3,
angle:0
},

{
x: offsetX + TILE*13,
y: offsetY + TILE*10,
color:"pink",
speed:2.1,
angle:0
},

{
x: offsetX + TILE*16,
y: offsetY + TILE*10,
color:"purple",
speed:2.2,
angle:0
}

];

const keys = {};

window.addEventListener("keydown",(e)=>{

keys[e.key.toLowerCase()] = true;

});

window.addEventListener("keyup",(e)=>{

keys[e.key.toLowerCase()] = false;

});

function wallCollision(x,y,radius){

const left = Math.floor((x - radius - offsetX)/TILE);
const right = Math.floor((x + radius - offsetX)/TILE);

const top = Math.floor((y - radius - offsetY)/TILE);
const bottom = Math.floor((y + radius - offsetY)/TILE);

for(let row = top; row <= bottom; row++){

for(let col = left; col <= right; col++){

if(
map[row] &&
map[row][col] === "1"
){

return true;

}

}

}

return false;

}

function drawWalls(){

ctx.strokeStyle = "#4d7cff";

ctx.lineWidth = 4;

ctx.shadowBlur = 15;
ctx.shadowColor = "#4d7cff";

for(let row=0; row<map.length; row++){

for(let col=0; col<map[row].length; col++){

if(map[row][col] === "1"){

const x = offsetX + col*TILE;
const y = offsetY + row*TILE;

ctx.strokeRect(
x+2,
y+2,
TILE-4,
TILE-4
);

}

}

}

ctx.shadowBlur = 0;

}

function drawPellets(){

ctx.fillStyle = "hotpink";

pellets.forEach(p=>{

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

powerPellets.forEach(p=>{

ctx.beginPath();

ctx.arc(
p.x,
p.y,
8,
0,
Math.PI*2
);

ctx.fill();

});

}

let mouth = 0;

function drawPlayer(){

ctx.save();

ctx.translate(player.x,player.y);

ctx.rotate(player.direction);

mouth += 0.22;

const open = Math.abs(Math.sin(mouth))*0.28;

ctx.fillStyle = "yellow";

ctx.beginPath();

ctx.arc(
0,
0,
player.radius,
open*Math.PI,
(2-open)*Math.PI
);

ctx.lineTo(0,0);

ctx.fill();

ctx.restore();

}

function drawEnemy(enemy){

ctx.save();

ctx.translate(enemy.x,enemy.y);

ctx.rotate(enemy.angle);

ctx.fillStyle = enemy.color;

ctx.beginPath();

ctx.ellipse(0,0,7,5,0,0,Math.PI*2);

ctx.fill();

ctx.beginPath();

ctx.moveTo(-8,0);

for(let i=0;i<12;i++){

ctx.lineTo(
-8 - i*3,
Math.sin(Date.now()/100 + i)*3
);

}

ctx.strokeStyle = enemy.color;
ctx.lineWidth = 2;

ctx.stroke();

ctx.restore();

}

function drawEnemies(){

enemies.forEach(enemy=>{

drawEnemy(enemy);

});

}

function movePlayer(){

if(keys["arrowup"] || keys["w"]){

player.nextDirection = -Math.PI/2;

}

if(keys["arrowdown"] || keys["s"]){

player.nextDirection = Math.PI/2;

}

if(keys["arrowleft"] || keys["a"]){

player.nextDirection = Math.PI;

}

if(keys["arrowright"] || keys["d"]){

player.nextDirection = 0;

}

const testX =
player.x + Math.cos(player.nextDirection) * player.speed;

const testY =
player.y + Math.sin(player.nextDirection) * player.speed;

if(!wallCollision(testX,testY,player.radius)){

player.direction = player.nextDirection;

}

const nextX =
player.x + Math.cos(player.direction) * player.speed;

const nextY =
player.y + Math.sin(player.direction) * player.speed;

if(!wallCollision(nextX,nextY,player.radius)){

player.x = nextX;
player.y = nextY;

}

}

function moveEnemies(){

enemies.forEach(enemy=>{

const dx = player.x - enemy.x;
const dy = player.y - enemy.y;

enemy.angle = Math.atan2(dy,dx);

const speed = enemy.speed;

const moveX = Math.cos(enemy.angle) * speed;
const moveY = Math.sin(enemy.angle) * speed;

if(!wallCollision(enemy.x + moveX, enemy.y, 8)){

enemy.x += moveX;

}

if(!wallCollision(enemy.x, enemy.y + moveY, 8)){

enemy.y += moveY;

}

});

}

function eatPellets(){

pellets.forEach((p,index)=>{

const dx = player.x - p.x;
const dy = player.y - p.y;

const dist = Math.sqrt(dx*dx + dy*dy);

if(dist < 18){

pellets.splice(index,1);

score += 10;

}

});

powerPellets.forEach((p,index)=>{

const dx = player.x - p.x;
const dy = player.y - p.y;

const dist = Math.sqrt(dx*dx + dy*dy);

if(dist < 20){

powerPellets.splice(index,1);

powers++;

score += 50;

showQuestion();

}

});

}

function showQuestion(){

const q =
questions[
Math.floor(Math.random()*questions.length)
];

questionText.innerText = q.q;

optionButtons.forEach((btn,index)=>{

btn.innerText = q.o[index];

btn.onclick = ()=>{

if(index === q.a){

score += 100;

}else{

lives--;

}

questionBox.style.display = "none";

};

});

questionBox.style.display = "block";

}

function checkEnemyCollision(){

enemies.forEach(enemy=>{

const dx = player.x - enemy.x;
const dy = player.y - enemy.y;

const dist = Math.sqrt(dx*dx + dy*dy);

if(dist < 20){

lives--;

player.x = offsetX + TILE*1.5;
player.y = offsetY + TILE*1.5;

if(lives <= 0){

alert("💀 GAME OVER");

location.reload();

}

}

});

}

function updateHUD(){

scoreEl.innerText = score;
livesEl.innerText = lives;
powerEl.innerText = powers;

}

function gameLoop(){

ctx.clearRect(0,0,canvas.width,canvas.height);

movePlayer();

moveEnemies();

eatPellets();

checkEnemyCollision();

updateHUD();

drawWalls();

drawPellets();

drawPlayer();

drawEnemies();

}

function animate(){

gameLoop();

requestAnimationFrame(animate);

}

animate();