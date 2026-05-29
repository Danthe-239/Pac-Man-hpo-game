// ==========================================
// 🌸 OVUPAC - RETRO HORMONAL ARCADE
// COMPLETE FULL VERSION
// ==========================================

// =====================
// CANVAS
// =====================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// =====================
// HUD
// =====================

const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const questionsEl = document.getElementById("questions");

// =====================
// GAME STATE
// =====================

let gameStarted = false;

let score = 0;
let lives = 3;
let questionsSolved = 0;

let pelletsEaten = 0;

let gamePaused = false;

// =====================
// TILE + MAP
// =====================

const TILE = 40;

let map = [
"111111111111111111111111111",
"100000000000100000000000001",
"101111011110101111011111101",
"100000010000000000010000001",
"101111010111111110010111101",
"100000000000100000000000001",
"101111011110101111011111101",
"100000010000000000010000001",
"101111010111111110010111101",
"100000000000000000000000001",
"111111111111111111111111111"
];

// =====================
// PLAYER
// =====================

const pacman = {

    x: TILE * 1.5,
    y: TILE * 1.5,

    radius: 15,

    speed: 2.1,

    dx: 0,
    dy: 0,

    nextDx: 0,
    nextDy: 0,

    angle: 0,

    mouth: 0.2,
    mouthSpeed: 0.04

};

// =====================
// SPERM GHOSTS
// =====================

const ghosts = [

{
    x: TILE * 13,
    y: TILE * 5,

    dx: 1,
    dy: 0,

    speed: 1.3,

    color: "#ff4fd8"
},

{
    x: TILE * 15,
    y: TILE * 7,

    dx: -1,
    dy: 0,

    speed: 1.3,

    color: "#38e1ff"
},

{
    x: TILE * 20,
    y: TILE * 3,

    dx: 0,
    dy: 1,

    speed: 1.3,

    color: "#ff7b00"
}

];

// =====================
// QUESTIONS
// =====================

const questionBox = document.getElementById("questionBox");
const questionText = document.getElementById("questionText");

const answerButtons = [
document.getElementById("answer1"),
document.getElementById("answer2"),
document.getElementById("answer3")
];

const questions = [

{
q:"Which hormone triggers ovulation?",
a:["LH","FSH","Progesterone"],
c:0
},

{
q:"What hormone prepares the uterus?",
a:["Progesterone","Insulin","TSH"],
c:0
},

{
q:"What does HPO stand for?",
a:[
"Hypothalamic Pituitary Ovarian",
"Human Pelvic Ovary",
"Hormonal Pregnancy Organ"
],
c:0
},

{
q:"Which phase happens after ovulation?",
a:[
"Luteal phase",
"Follicular phase",
"Menstrual phase"
],
c:0
},

{
q:"Which hormone rises before ovulation?",
a:["Estrogen","Cortisol","Adrenaline"],
c:0
},

{
q:"Where are eggs stored?",
a:["Ovaries","Uterus","Liver"],
c:0
},

{
q:"What is menstruation?",
a:[
"Shedding uterine lining",
"Egg fertilization",
"Ovulation"
],
c:0
},

{
q:"Which hormone maintains pregnancy?",
a:["Progesterone","FSH","LH"],
c:0
},

{
q:"What organ releases LH?",
a:["Pituitary gland","Heart","Kidney"],
c:0
},

{
q:"Which phase includes menstruation?",
a:["Menstrual phase","Luteal phase","Ovulation"],
c:0
},

{
q:"What is ovulation?",
a:[
"Release of an egg",
"Start of menstruation",
"Fertilization"
],
c:0
},

{
q:"Which hormone stimulates follicles?",
a:["FSH","LH","Estrogen"],
c:0
},

{
q:"What is the average menstrual cycle length?",
a:["28 days","7 days","60 days"],
c:0
},

{
q:"What does LH mean?",
a:[
"Luteinizing Hormone",
"Liver Hormone",
"Linear Hormone"
],
c:0
},

{
q:"What does FSH mean?",
a:[
"Follicle Stimulating Hormone",
"Female System Hormone",
"Fertility Signal Hormone"
],
c:0
},

{
q:"Which organ receives the fertilized egg?",
a:["Uterus","Lung","Pancreas"],
c:0
},

{
q:"Which hormone peaks during ovulation?",
a:["LH","Insulin","TSH"],
c:0
},

{
q:"What releases hormones in the brain?",
a:["Hypothalamus","Stomach","Skin"],
c:0
},

{
q:"What is fertilization?",
a:[
"Sperm joins egg",
"Egg release",
"Menstruation"
],
c:0
},

{
q:"Which hormone thickens endometrium?",
a:["Estrogen","Testosterone","Insulin"],
c:0
},

{
q:"Which hormone dominates luteal phase?",
a:["Progesterone","FSH","LH"],
c:0
},

{
q:"What are follicles?",
a:[
"Egg-containing sacs",
"Blood cells",
"Muscles"
],
c:0
},

{
q:"Which structure connects ovaries and uterus?",
a:["Fallopian tubes","Spinal cord","Veins"],
c:0
},

{
q:"What is the first phase of the cycle?",
a:[
"Menstrual phase",
"Ovulation",
"Luteal phase"
],
c:0
},

{
q:"Which hormone helps egg maturation?",
a:["FSH","Adrenaline","Cortisol"],
c:0
}

];

// =====================
// START GAME
// =====================

document
.getElementById("playButton")
.addEventListener("click", () => {

    document
    .getElementById("menuScreen")
    .style.display = "none";

    gameStarted = true;

    gameLoop();

});

// =====================
// INPUT
// =====================

document.addEventListener("keydown", e => {

    if (e.key === "ArrowUp") {
        pacman.nextDx = 0;
        pacman.nextDy = -pacman.speed;
    }

    if (e.key === "ArrowDown") {
        pacman.nextDx = 0;
        pacman.nextDy = pacman.speed;
    }

    if (e.key === "ArrowLeft") {
        pacman.nextDx = -pacman.speed;
        pacman.nextDy = 0;
    }

    if (e.key === "ArrowRight") {
        pacman.nextDx = pacman.speed;
        pacman.nextDy = 0;
    }

});

// =====================
// WALL COLLISION
// =====================

function isWall(x, y) {

    const col = Math.floor(x / TILE);
    const row = Math.floor(y / TILE);

    if (!map[row]) return true;

    return map[row][col] === "1";
}

// =====================
// MOVE PACMAN
// =====================

function movePacman() {

    const testX = pacman.x + pacman.nextDx;
    const testY = pacman.y + pacman.nextDy;

    if (
        !isWall(testX - pacman.radius, testY - pacman.radius) &&
        !isWall(testX + pacman.radius, testY - pacman.radius) &&
        !isWall(testX - pacman.radius, testY + pacman.radius) &&
        !isWall(testX + pacman.radius, testY + pacman.radius)
    ) {

        pacman.dx = pacman.nextDx;
        pacman.dy = pacman.nextDy;

    }

    const futureX = pacman.x + pacman.dx;
    const futureY = pacman.y + pacman.dy;

    if (
        !isWall(futureX - pacman.radius, futureY - pacman.radius) &&
        !isWall(futureX + pacman.radius, futureY - pacman.radius) &&
        !isWall(futureX - pacman.radius, futureY + pacman.radius) &&
        !isWall(futureX + pacman.radius, futureY + pacman.radius)
    ) {

        pacman.x = futureX;
        pacman.y = futureY;

    }

    pacman.mouth += pacman.mouthSpeed;

    if (pacman.mouth > 0.45 || pacman.mouth < 0.05) {
        pacman.mouthSpeed *= -1;
    }

    if (pacman.dx > 0) pacman.angle = 0;
    if (pacman.dx < 0) pacman.angle = Math.PI;
    if (pacman.dy > 0) pacman.angle = Math.PI / 2;
    if (pacman.dy < 0) pacman.angle = -Math.PI / 2;
}

// =====================
// EAT PELLETS
// =====================

function eatPellets() {

    const row = Math.floor(pacman.y / TILE);
    const col = Math.floor(pacman.x / TILE);

    if (map[row][col] === "0") {

        map[row] =
            map[row].substring(0, col) +
            "2" +
            map[row].substring(col + 1);

        score += 10;

        pelletsEaten++;

        updateBars();

        if (pelletsEaten >= 15) {

            pelletsEaten = 0;

            showQuestion();
        }

    }

}

// =====================
// DRAW MAP
// =====================

function drawMap() {

    for (let row = 0; row < map.length; row++) {

        for (let col = 0; col < map[row].length; col++) {

            const tile = map[row][col];

            const x = col * TILE;
            const y = row * TILE;

            if (tile === "1") {

                ctx.fillStyle = "#7200ff";

                ctx.fillRect(x,y,TILE,TILE);

                ctx.strokeStyle = "#ff1493";
                ctx.lineWidth = 2;

                ctx.strokeRect(x,y,TILE,TILE);

            }

            if (tile === "0") {

                ctx.beginPath();

                ctx.arc(
                    x + TILE / 2,
                    y + TILE / 2,
                    4,
                    0,
                    Math.PI * 2
                );

                ctx.fillStyle = "white";
                ctx.fill();

            }

        }

    }

}

// =====================
// DRAW PACMAN
// =====================

function drawPacman() {

    ctx.save();

    ctx.translate(pacman.x, pacman.y);
    ctx.rotate(pacman.angle);

    ctx.beginPath();

    ctx.moveTo(0,0);

    ctx.arc(
        0,
        0,
        pacman.radius,
        pacman.mouth,
        Math.PI * 2 - pacman.mouth
    );

    ctx.fillStyle = "#ffe600";

    ctx.shadowColor = "#ffe600";
    ctx.shadowBlur = 15;

    ctx.fill();

    ctx.restore();
}

// =====================
// DRAW SPERM
// =====================

function drawGhost(g) {

    ctx.save();

    ctx.translate(g.x, g.y);

    ctx.strokeStyle = g.color;
    ctx.lineWidth = 4;

    ctx.beginPath();

    ctx.moveTo(-15,0);

    ctx.quadraticCurveTo(
        -28,
        Math.sin(Date.now() * 0.01) * 10,
        -40,
        0
    );

    ctx.stroke();

    ctx.beginPath();

    ctx.arc(0,0,14,0,Math.PI * 2);

    ctx.fillStyle = g.color;

    ctx.shadowColor = g.color;
    ctx.shadowBlur = 15;

    ctx.fill();

    ctx.restore();
}

// =====================
// MOVE GHOSTS
// =====================

function moveGhosts() {

    ghosts.forEach(g => {

        const dx = pacman.x - g.x;
        const dy = pacman.y - g.y;

        if (Math.abs(dx) > Math.abs(dy)) {

            g.dx = dx > 0 ? g.speed : -g.speed;
            g.dy = 0;

        } else {

            g.dy = dy > 0 ? g.speed : -g.speed;
            g.dx = 0;

        }

        const futureX = g.x + g.dx;
        const futureY = g.y + g.dy;

        if (
            !isWall(futureX - 12, futureY - 12) &&
            !isWall(futureX + 12, futureY + 12)
        ) {

            g.x = futureX;
            g.y = futureY;

        }

        const dist = Math.hypot(
            pacman.x - g.x,
            pacman.y - g.y
        );

        if (dist < 22) {

            lives--;

            pacman.x = TILE * 1.5;
            pacman.y = TILE * 1.5;

            if (lives <= 0) {

                alert("GAME OVER");

                location.reload();
            }

        }

    });

}

// =====================
// QUESTIONS
// =====================

function showQuestion() {

    gamePaused = true;

    const q =
    questions[
        Math.floor(Math.random() * questions.length)
    ];

    questionText.innerText = q.q;

    answerButtons.forEach((btn,index) => {

        btn.innerText = q.a[index];

        btn.onclick = () => {

            if (index === q.c) {

                score += 200;

                questionsSolved++;

            } else {

                lives--;

            }

            questionBox.style.display = "none";

            gamePaused = false;

        };

    });

    questionBox.style.display = "block";
}

// =====================
// POWER BARS
// =====================

function updateBars() {

    const value = Math.min(score / 20, 100);

    document.getElementById("estrogenFill")
    .style.width = value + "%";

    document.getElementById("lhFill")
    .style.width = value * 0.8 + "%";

    document.getElementById("fshFill")
    .style.width = value * 0.6 + "%";

    document.getElementById("progFill")
    .style.width = value * 0.4 + "%";
}

// =====================
// DRAW
// =====================

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawMap();

    drawPacman();

    ghosts.forEach(drawGhost);

}

// =====================
// UPDATE HUD
// =====================

function updateHUD() {

    scoreEl.innerText = score;
    livesEl.innerText = lives;
    questionsEl.innerText = questionsSolved;

}

// =====================
// GAME LOOP
// =====================

function gameLoop() {

    if (!gameStarted) return;

    if (!gamePaused) {

        movePacman();

        moveGhosts();

        eatPellets();

    }

    draw();

    updateHUD();

    requestAnimationFrame(gameLoop);

}
