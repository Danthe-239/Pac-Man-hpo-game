const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const TILE = 40;

const map = [
"########################",
"#..........##..........#",
"#.####.###.##.###.####.#",
"#......................#",
"#.####.#.######.#.####.#",
"#......#....##..#......#",
"######.#### ## ####.####",
"#......................#",
"#.####.##########.####.#",
"#......................#",
"########################"
];

const rows = map.length;
const cols = map[0].length;

const pacman = {
  x: 1,
  y: 1,
  dirX: 0,
  dirY: 0,
  nextX: 0,
  nextY: 0,
  mouth: 0
};

const ghosts = [
  {x:12,y:5,color:"#ff4fd8"},
  {x:13,y:5,color:"#00e5ff"}
];

let score = 0;
let lives = 3;
let questions = 0;

const questionsData = [
  {
    q:"Which hormone triggers ovulation?",
    a:["LH","FSH","Estrogen","Progesterone"],
    c:0
  },
  {
    q:"What hormone thickens the uterine lining?",
    a:["Progesterone","LH","FSH","Testosterone"],
    c:0
  }
];

document.getElementById("playBtn").onclick = () => {

  document.getElementById("startScreen").style.display = "none";

  document.getElementById("gameContainer").style.display = "block";

  gameLoop();
};

document.addEventListener("keydown",(e)=>{

  if(e.key==="ArrowUp"){
    pacman.nextX=0;
    pacman.nextY=-1;
  }

  if(e.key==="ArrowDown"){
    pacman.nextX=0;
    pacman.nextY=1;
  }

  if(e.key==="ArrowLeft"){
    pacman.nextX=-1;
    pacman.nextY=0;
  }

  if(e.key==="ArrowRight"){
    pacman.nextX=1;
    pacman.nextY=0;
  }

});

function canMove(x,y){

  return map[y][x] !== "#";
}

function update(){

  const testX = pacman.x + pacman.nextX;
  const testY = pacman.y + pacman.nextY;

  if(canMove(testX,testY)){
    pacman.dirX = pacman.nextX;
    pacman.dirY = pacman.nextY;
  }

  const nextX = pacman.x + pacman.dirX;
  const nextY = pacman.y + pacman.dirY;

  if(canMove(nextX,nextY)){
    pacman.x = nextX;
    pacman.y = nextY;
  }

  ghosts.forEach(g=>{

    const dx = pacman.x - g.x;
    const dy = pacman.y - g.y;

    if(Math.abs(dx) > Math.abs(dy)){

      if(dx > 0 && canMove(g.x+1,g.y)) g.x++;
      if(dx < 0 && canMove(g.x-1,g.y)) g.x--;

    }else{

      if(dy > 0 && canMove(g.x,g.y+1)) g.y++;
      if(dy < 0 && canMove(g.x,g.y-1)) g.y--;

    }

    if(g.x === pacman.x && g.y === pacman.y){

      lives--;

      document.getElementById("lives").innerText = lives;

      pacman.x = 1;
      pacman.y = 1;

      if(lives <= 0){

        alert("GAME OVER");

        location.reload();
      }
    }

  });

  pacman.mouth += 0.2;

  score++;

  document.getElementById("score").innerText = score;

  if(score % 200 === 0){
    triggerQuestion();
  }

  updateBars();
}

function drawMap(){

  for(let y=0;y<rows;y++){

    for(let x=0;x<cols;x++){

      if(map[y][x] === "#"){

        ctx.fillStyle = "#6a00b8";

        ctx.fillRect(
          x*TILE,
          y*TILE,
          TILE,
          TILE
        );

        ctx.strokeStyle = "#ff0088";
        ctx.lineWidth = 3;

        ctx.strokeRect(
          x*TILE,
          y*TILE,
          TILE,
          TILE
        );
      }

      else{

        ctx.fillStyle = "white";

        ctx.beginPath();

        ctx.arc(
          x*TILE + TILE/2,
          y*TILE + TILE/2,
          3,
          0,
          Math.PI*2
        );

        ctx.fill();
      }

    }

  }

}

function drawPacman(){

  const px = pacman.x*TILE + TILE/2;
  const py = pacman.y*TILE + TILE/2;

  const mouth = Math.abs(Math.sin(pacman.mouth))*0.5;

  let angle = 0;

  if(pacman.dirX === 1) angle = 0;
  if(pacman.dirX === -1) angle = Math.PI;
  if(pacman.dirY === 1) angle = Math.PI/2;
  if(pacman.dirY === -1) angle = -Math.PI/2;

  ctx.save();

  ctx.translate(px,py);
  ctx.rotate(angle);

  ctx.fillStyle = "#ffe600";

  ctx.beginPath();

  ctx.moveTo(0,0);

  ctx.arc(
    0,
    0,
    18,
    mouth,
    Math.PI*2-mouth
  );

  ctx.fill();

  ctx.restore();
}

function drawGhost(g){

  const x = g.x*TILE;
  const y = g.y*TILE;

  ctx.fillStyle = g.color;

  ctx.beginPath();

  ctx.arc(x+20,y+18,18,Math.PI,0);

  ctx.lineTo(x+38,y+36);

  ctx.lineTo(x+32,y+30);

  ctx.lineTo(x+24,y+36);

  ctx.lineTo(x+16,y+30);

  ctx.lineTo(x+8,y+36);

  ctx.lineTo(x+2,y+30);

  ctx.lineTo(x+2,y+36);

  ctx.fill();

  ctx.fillStyle="white";

  ctx.beginPath();
  ctx.arc(x+13,y+18,4,0,Math.PI*2);
  ctx.arc(x+27,y+18,4,0,Math.PI*2);
  ctx.fill();
}

function draw(){

  ctx.clearRect(0,0,canvas.width,canvas.height);

  drawMap();

  drawPacman();

  ghosts.forEach(drawGhost);
}

function gameLoop(){

  update();

  draw();

  requestAnimationFrame(gameLoop);
}

function triggerQuestion(){

  questions++;

  document.getElementById("questions").innerText = questions;

  const q = questionsData[
    Math.floor(Math.random()*questionsData.length)
  ];

  document.getElementById("questionText").innerText = q.q;

  const answers = document.getElementById("answers");

  answers.innerHTML = "";

  q.a.forEach((answer,index)=>{

    const btn = document.createElement("button");

    btn.className = "answer-btn";

    btn.innerText = answer;

    btn.onclick = ()=>{

      if(index === q.c){

        score += 500;

      }else{

        lives--;

      }

      document.getElementById("questionModal").style.display = "none";
    };

    answers.appendChild(btn);

  });

  document.getElementById("questionModal").style.display = "flex";
}

function updateBars(){

  document.getElementById("bar1").style.width =
  Math.min(score/20,100)+"%";

  document.getElementById("bar2").style.width =
  Math.min(score/25,100)+"%";

  document.getElementById("bar3").style.width =
  Math.min(score/30,100)+"%";

  document.getElementById("bar4").style.width =
  Math.min(score/40,100)+"%";
}
