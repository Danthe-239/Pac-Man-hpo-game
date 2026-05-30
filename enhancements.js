// ======================================================
// OVUPAC ENHANCEMENTS V1
// ======================================================

let currentQuestion = null;
let questionOpen = false;

let estrogen = 0;
let lh = 0;
let fsh = 0;
let progesterone = 0;

const questionBox = document.getElementById("questionBox");
const questionText = document.getElementById("questionText");

const answer1 = document.getElementById("answer1");
const answer2 = document.getElementById("answer2");
const answer3 = document.getElementById("answer3");
const answer4 = document.getElementById("answer4");

const estrogenFill = document.getElementById("estrogenFill");
const lhFill = document.getElementById("lhFill");
const fshFill = document.getElementById("fshFill");
const progFill = document.getElementById("progFill");

// ======================================================
// UPDATE BARS
// ======================================================

function updateBars() {

    estrogenFill.style.width = estrogen + "%";
    lhFill.style.width = lh + "%";
    fshFill.style.width = fsh + "%";
    progFill.style.width = progesterone + "%";

}

// ======================================================
// RANDOM QUESTION
// ======================================================

function showQuestion() {

    if(questionOpen) return;

    questionOpen = true;

    currentQuestion =
        QUESTIONS[
            Math.floor(Math.random() * QUESTIONS.length)
        ];

    questionText.textContent =
        currentQuestion.question;

    answer1.textContent =
        currentQuestion.answers[0];

    answer2.textContent =
        currentQuestion.answers[1];

    answer3.textContent =
        currentQuestion.answers[2];

    answer4.textContent =
        currentQuestion.answers[3];

    questionBox.style.display = "block";

}

// ======================================================
// ANSWER
// ======================================================

function answerQuestion(index){

    if(!currentQuestion) return;

    if(index === currentQuestion.correct){

        questionsSolved++;

        questionsEl.innerText =
            questionsSolved;

        estrogen =
            Math.min(estrogen + 10, 100);

        lh =
            Math.min(lh + 10, 100);

        fsh =
            Math.min(fsh + 10, 100);

        progesterone =
            Math.min(progesterone + 10, 100);

        updateBars();

        checkVictory();

    }else{

        lives--;

        livesEl.innerText = lives;

        if(lives <= 0){

            gameOver = true;

        }

    }

    questionBox.style.display = "none";

    questionOpen = false;

}

// ======================================================
// BUTTONS
// ======================================================

answer1.addEventListener(
    "click",
    () => answerQuestion(0)
);

answer2.addEventListener(
    "click",
    () => answerQuestion(1)
);

answer3.addEventListener(
    "click",
    () => answerQuestion(2)
);

answer4.addEventListener(
    "click",
    () => answerQuestion(3)
);

// ======================================================
// VICTORY
// ======================================================

function checkVictory(){

    if(
        estrogen >= 100 &&
        lh >= 100 &&
        fsh >= 100 &&
        progesterone >= 100
    ){

        alert(
            "🏆 YOU WIN!\n\nAll hormones reached maximum level."
        );

    }

}

// ======================================================
// AUTO QUESTIONS
// ======================================================

setInterval(() => {

    if(
        typeof gameStarted !== "undefined" &&
        gameStarted &&
        !questionOpen &&
        !gameOver
    ){

        showQuestion();

    }

}, 25000);

// ======================================================
// PELLET REGEN
// ======================================================

setInterval(() => {

    if(typeof map === "undefined")
        return;

    for(
        let r = 0;
        r < map.length;
        r++
    ){

        for(
            let c = 0;
            c < map[r].length;
            c++
        ){

            if(
                map[r][c] === 2 &&
                Math.random() < 0.15
            ){

                map[r][c] = 0;

            }

        }

    }

}, 30000);

// ======================================================

updateBars();
