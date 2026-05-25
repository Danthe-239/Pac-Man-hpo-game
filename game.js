const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 1100;
canvas.height = 720;

const TILE = 32;

const offsetX = 40;
const offsetY = 70;

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

let pellets = [];
let score = 0;
let lives = 3;

let pelletsEaten = 0;

let estrogenBar = 0;
let progesteroneBar = 0;
let lhBar = 0;

let estrogenMode = false;
let progesteroneMode = false;
let lhMode = false;

const questions = [

{
q:"¿Qué hormona provoca la ovulación?",
o:["LH","Insulina","Adrenalina","Melatonina"],
a:0,
power:"lh"
},

{
q:"¿Qué órgano libera el óvulo?",
o:["Ovario","Pulmón","Riñón","Corazón"],
a:0,
power:"estrogen"
},

{
q:"¿Dónde ocurre la fecundación?",
o:["Pulmón","Corazón","Trompas de Falopio","Hígado"],
a:2,
power:"progesterone"
},

{
q:"¿Qué hormona aumenta en el embarazo?",
o:["hCG","Insulina","Testosterona","Dopamina"],
a:0,
power:"progesterone"
},

{
q:"¿Qué dura aproximadamente 28 días?",
o:["Digestión","Ciclo menstrual","Sueño","Latido"],
a:1,
power:"estrogen"
},

{
q:"¿Qué gameto es masculino?",
o:["Óvulo","Esperma","Neurona","Plaqueta"],
a:1,
power:"lh"
}

];

function createPellets(){

pellets = [];

for(let row=0; row<map.length; row++){

for(let col=0; col<map[row].length; col++){

if(map[row][col] === "0"){

pellets.push({

x: offsetX + col*TILE + TILE/2,
y: offsetY + row*TILE + TILE/2

});

}

}

}

}

createPellets();

const player = {

x: offsetX + TILE*1.5,
y: offsetY + TILE*1.5,

radius: 14,

speed: 2.8,

direction: 0

};

const enemies = [

{
x: offsetX + TILE*14,
y: offsetY + TILE*10,
color:"red",
speed:2.0,
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
speed:1.9,
angle:0
},

{
x: offsetX + TILE*15,
y: offsetY + TILE*11,
color:"orange",
speed:2.2,
angle:0
},

{
x: offsetX + TILE*13,
y: offsetY + TILE*10,
color:"pink",
speed:2.0,
angle:0
},

{
x: offsetX + TILE*16,
y: offsetY + TILE*10,
color:"purple",
speed:2.1,
angle:0
}

];

const keys = {};

window.addEventListener("keydown",(e)=>{

keys[e.key] = true;

});

window.addEventListener("keyup",(e)=>{

keys[e.key] = false;

});

function wallCollision(x,y,radius){

const left = Math.floor((x-radius-offsetX)/TILE);
const right = Math.floor((x+radius-offsetX)/TILE);

const top = Math.floor((y-radius-offsetY)/TILE);
const bottom = Math.floor((y+radius-offsetY)/TILE);

for(let row=top; row<=bottom; row++){

for(let col=left; col<=right; col++){

if(map[row] && map[row][col] === "1"){

return true;

}

}

}

return false;

}

function movePlayer(){

let dx = 0;
let dy = 0;

if(keys["ArrowUp"]){

dy = -player.speed;
player.direction = -Math.PI/2;

}

if(keys["ArrowDown"]){

dy = player.speed;
player.direction = Math.PI/2;

}

if(keys["ArrowLeft"]){

dx = -player.speed;
player.direction = Math.PI;

}

if(keys["ArrowRight"]){

dx = player.speed;
player.direction = 0;

}

const nextX = player.x + dx;
const nextY = player.y + dy;

if(!wallCollision(nextX,player.y,player.radius)){

player.x = nextX;

}

if(!wallCollision(player.x,nextY,player.radius)){

player.y = nextY;

}

}

let mouth = 0;

function drawPlayer(){

ctx.save();

ctx.translate(player.x,player.y);

ctx.rotate(player.direction);

mouth += 0.15;

const open = Math.abs(Math.sin(mouth))*0.25;

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
Math.sin(Date.now()/90+i)*3
);

}

ctx.strokeStyle = enemy.color;
ctx.lineWidth = 2;

ctx.stroke();

ctx.restore();

}

function moveEnemies(){

enemies.forEach(enemy=>{

const dx = player.x - enemy.x;
const dy = player.y - enemy.y;

enemy.angle = Math.atan2(dy,dx);

let speed = enemy.speed;

if(progesteroneMode){

speed *= 0.5;

}

const moveX = Math.cos(enemy.angle) * speed;
const moveY = Math.sin(enemy.angle) * speed;

if(!wallCollision(enemy.x+moveX,enemy.y,8)){

enemy.x += moveX;

}

if(!wallCollision(enemy.x,enemy.y+moveY,8)){

enemy.y += moveY;

}

});

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

}

function eatPellets(){

pellets.forEach((p,index)=>{

const dx = player.x - p.x;
const dy = player.y - p.y;

const dist = Math.sqrt(dx*dx + dy*dy);

if(dist < 18){

pellets.splice(index,1);

pelletsEaten++;

let points = 10;

if(estrogenMode){

points *= 2;

}

score += points;

if(pelletsEaten >= 10){

pelletsEaten = 0;

showQuestion();

}

}

});

if(pellets.length === 0){

createPellets();

enemies.forEach(enemy=>{

enemy.speed += 0.2;

});

}

}

function showQuestion(){

const q = questions[
Math.floor(Math.random()*questions.length)
];

questionText.innerText = q.q;

optionButtons.forEach((btn,index)=>{

btn.innerText = q.o[index];

btn.onclick = ()=>{

if(index === q.a){

score += 100;

if(q.power === "estrogen"){

estrogenBar += 25;

}

if(q.power === "progesterone"){

progesteroneBar += 25;

}

if(q.power === "lh"){

lhBar += 25;

}

activatePowers();

}else{

lives--;

}

questionBox.style.display = "none";

};

});

questionBox.style.display = "block";

}

function activatePowers(){

if(estrogenBar >= 100){

estrogenBar = 0;

estrogenMode = true;

setTimeout(()=>{

estrogenMode = false;

},8000);

}

if(progesteroneBar >= 100){

progesteroneBar = 0;

progesteroneMode = true;

setTimeout(()=>{

progesteroneMode = false;

},8000);

}

if(lhBar >= 100){

lhBar = 0;

lhMode = true;

setTimeout(()=>{

lhMode = false;

},8000);

}

}

function checkEnemyCollision(){

enemies.forEach(enemy=>{

const dx = player.x - enemy.x;
const dy = player.y - enemy.y;

const dist = Math.sqrt(dx*dx + dy*dy);

if(dist < 20){

if(lhMode){

enemy.x = offsetX + TILE*14;
enemy.y = offsetY + TILE*10;

score += 250;

}else{

lives--;

player.x = offsetX + TILE*1.5;
player.y = offsetY + TILE*1.5;

}

if(lives <= 0){

alert("💀 GAME OVER\nPUNTAJE: " + score);

location.reload();

}

}

});

}

function drawHUD(){

ctx.fillStyle = "white";

ctx.font = "22px Arial";

ctx.fillText("❤️ Vidas: " + lives,40,35);

ctx.fillText("⭐ Puntos: " + score,250,35);

ctx.fillText("🟣 Pastillas: " + pelletsEaten + "/10",520,35);

ctx.fillText("🧬 Estrógeno",760,30);
ctx.strokeRect(760,40,100,12);
ctx.fillRect(760,40,estrogenBar,12);

ctx.fillText("🛡 Progesterona",760,70);
ctx.strokeRect(760,80,100,12);
ctx.fillRect(760,80,progesteroneBar,12);

ctx.fillText("⚡ LH",760,110);
ctx.strokeRect(760,120,100,12);
ctx.fillRect(760,120,lhBar,12);

}

function gameLoop(){

ctx.clearRect(0,0,canvas.width,canvas.height);

movePlayer();

moveEnemies();

eatPellets();

checkEnemyCollision();

drawWalls();

drawPellets();

drawPlayer();

enemies.forEach(drawEnemy);

drawHUD();

}

function animate(){

gameLoop();

requestAnimationFrame(animate);

}

animate();
