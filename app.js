let boxes = document.querySelectorAll(".box");
let resetBtn = document.querySelector("#reset-btn");
let newGameBtn = document.querySelector("#new-btn");
let msgContainer = document.querySelector(".msg-container");
let msg = document.querySelector("#msg");
let pvpBtn = document.querySelector("#pvp-btn");
let pvcBtn = document.querySelector("#pvc-btn");
let count = 0;
let isWinner = false;
let turnO = true;
let isComputerGame = false;
let isComputerTurn = false;

const winPatterns = [
    [0, 1, 2],
    [0, 3, 6],
    [0, 4, 8],
    [1, 4, 7],
    [2, 5, 8],
    [2, 4, 6],
    [3, 4, 5],
    [6, 7, 8]
];

boxes.forEach((box) =>{
    box.addEventListener("click", () =>{
        if (isComputerGame && isComputerTurn) return;

        if(turnO){
            box.innerText = "O";
            turnO = false;
        }else{
            box.innerText = "X";
            turnO = true;
        }
        box.disabled = true;

        count++;

        checkWinner();

        if (isComputerGame && !turnO && !isWinner && count < 9) {
            isComputerTurn = true;
            setTimeout(computerMove, 500);
        }
    });
});

const disableBoxes = () =>{
    for(let box of boxes){
        box.disabled = true;
    }
};

const enableBoxes = () =>{
    for(let box of boxes){
        box.disabled = false;
        box.innerText = "";
    }
};

const showWinner = (winner, pattern) => {
    msg.innerText = `Congratulations, winner is ${winner}`;
    msgContainer.classList.remove("hide");
    
    let lineElement = document.getElementById("winning-line");
    if(lineElement) {
        let lineClass = `line-${pattern[0]}-${pattern[1]}-${pattern[2]}`;
        lineElement.className = `winning-line ${lineClass}`;
    }

    disableBoxes();
};

const showDraw = () => {
    msg.innerText = "Game was a Draw!";
    msgContainer.classList.remove("hide");
    disableBoxes();
};

const checkWinner = () =>{
    isWinner = false;

    for(let pattern of winPatterns){
        console.log(pattern[0], pattern[1], pattern[2]);
        console.log(
            boxes[pattern[0]].innerText, 
            boxes[pattern[1]].innerText, 
            boxes[pattern[2]].innerText
        );
        let pos1val = boxes[pattern[0]].innerText;
        let pos2val = boxes[pattern[1]].innerText;
        let pos3val = boxes[pattern[2]].innerText;

        if(pos1val != "" && pos2val != "" && pos3val != ""){
            if(pos1val === pos2val && pos2val==pos3val ){
               showWinner(pos1val, pattern);
               isWinner = true;
               return;
            }
        }
    }

    if(count ===9 && !isWinner){
        showDraw()
    }
};

const resetGame = () => {
    turnO = true;
    count = 0;
    isWinner = false;
    isComputerTurn = false;
    
    let lineElement = document.getElementById("winning-line");
    if(lineElement) {
        lineElement.className = "winning-line hide";
    }

    enableBoxes();
    msgContainer.classList.add("hide");
};

const computerMove = () => {
    let availableBoxes = [];
    boxes.forEach((box, index) => {
        if (box.innerText === "") {
            availableBoxes.push(index);
        }
    });

    if (availableBoxes.length === 0) return;

    let moveIndex = -1;

    for (let currentTurn of ["X", "O"]) {
        for (let pattern of winPatterns) {
            let pos1 = boxes[pattern[0]].innerText;
            let pos2 = boxes[pattern[1]].innerText;
            let pos3 = boxes[pattern[2]].innerText;

            if (pos1 === currentTurn && pos2 === currentTurn && pos3 === "") moveIndex = pattern[2];
            else if (pos1 === currentTurn && pos3 === currentTurn && pos2 === "") moveIndex = pattern[1];
            else if (pos2 === currentTurn && pos3 === currentTurn && pos1 === "") moveIndex = pattern[0];

            if (moveIndex !== -1) break;
        }
        if (moveIndex !== -1) break;
    }

    if (moveIndex === -1) {
        let randomIndex = Math.floor(Math.random() * availableBoxes.length);
        moveIndex = availableBoxes[randomIndex];
    }

    boxes[moveIndex].innerText = "X";
    boxes[moveIndex].disabled = true;
    turnO = true;
    count++;
    isComputerTurn = false;
    checkWinner();
};

pvpBtn.addEventListener("click", () => {
    isComputerGame = false;
    pvpBtn.classList.add("active");
    pvcBtn.classList.remove("active");
    resetGame();
});

pvcBtn.addEventListener("click", () => {
    isComputerGame = true;
    pvcBtn.classList.add("active");
    pvpBtn.classList.remove("active");
    resetGame();
});

newGameBtn.addEventListener("click", resetGame);
resetBtn.addEventListener("click", resetGame);