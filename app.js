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

let scoreO = 0;
let scoreX = 0;
let scoreTies = 0;
let scoreOEl = document.getElementById("score-o");
let scoreXEl = document.getElementById("score-x");
let scoreTiesEl = document.getElementById("score-ties");
let labelX = document.getElementById("label-x");

const updateScoreboard = () => {
    if(scoreOEl) scoreOEl.innerText = scoreO;
    if(scoreXEl) scoreXEl.innerText = scoreX;
    if(scoreTiesEl) scoreTiesEl.innerText = scoreTies;
};

const resetScores = () => {
    scoreO = 0;
    scoreX = 0;
    scoreTies = 0;
    updateScoreboard();
};

let audioCtx;

const initAudio = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
};

const playTone = (freq, toneType, duration, vol, delay) => {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = toneType;
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    let now = audioCtx.currentTime + delay;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.05);
    gain.gain.setValueAtTime(vol, now + Math.max(0, duration - 0.1));
    gain.gain.linearRampToValueAtTime(0, now + duration);

    osc.start(now);
    osc.stop(now + duration);
};

const playSound = (event) => {
    if (event === 'click') {
        playTone(600, 'sine', 0.1, 0.1, 0);
    } else if (event === 'win') {
        playTone(440, 'sine', 0.3, 0.1, 0);
        playTone(554.37, 'sine', 0.3, 0.1, 0.1);
        playTone(659.25, 'sine', 0.3, 0.1, 0.2);
        playTone(880, 'sine', 0.5, 0.1, 0.3);
    } else if (event === 'draw') {
        playTone(300, 'triangle', 0.3, 0.1, 0);
        playTone(270, 'triangle', 0.3, 0.1, 0.2);
        playTone(200, 'triangle', 0.5, 0.1, 0.4);
    }
};

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

boxes.forEach((box) => {
    box.addEventListener("click", () => {
        if (isComputerGame && isComputerTurn) return;

        playSound('click');

        if (turnO) {
            box.innerText = "O";
            turnO = false;
        } else {
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

const disableBoxes = () => {
    for (let box of boxes) {
        box.disabled = true;
    }
};

const enableBoxes = () => {
    for (let box of boxes) {
        box.disabled = false;
        box.innerText = "";
    }
};

const showWinner = (winner, pattern) => {
    playSound('win');
    
    if (winner === "O") scoreO++;
    else scoreX++;
    updateScoreboard();

    msg.innerText = `Congratulations, winner is ${winner}`;
    msgContainer.classList.remove("hide");

    let lineElement = document.getElementById("winning-line");
    if (lineElement) {
        let lineClass = `line-${pattern[0]}-${pattern[1]}-${pattern[2]}`;
        lineElement.className = `winning-line ${lineClass}`;
    }

    disableBoxes();
};

const showDraw = () => {
    playSound('draw');
    
    scoreTies++;
    updateScoreboard();

    msg.innerText = "Game was a Draw!";
    msgContainer.classList.remove("hide");
    disableBoxes();
};

const checkWinner = () => {
    isWinner = false;

    for (let pattern of winPatterns) {
        console.log(pattern[0], pattern[1], pattern[2]);
        console.log(
            boxes[pattern[0]].innerText,
            boxes[pattern[1]].innerText,
            boxes[pattern[2]].innerText
        );
        let pos1val = boxes[pattern[0]].innerText;
        let pos2val = boxes[pattern[1]].innerText;
        let pos3val = boxes[pattern[2]].innerText;

        if (pos1val != "" && pos2val != "" && pos3val != "") {
            if (pos1val === pos2val && pos2val == pos3val) {
                showWinner(pos1val, pattern);
                isWinner = true;
                return;
            }
        }
    }

    if (count === 9 && !isWinner) {
        showDraw()
    }
};

const resetGame = () => {
    turnO = true;
    count = 0;
    isWinner = false;
    isComputerTurn = false;

    let lineElement = document.getElementById("winning-line");
    if (lineElement) {
        lineElement.className = "winning-line hide";
    }

    enableBoxes();
    msgContainer.classList.add("hide");
};

const evaluateBoard = (board) => {
    for (let pattern of winPatterns) {
        let pos1 = board[pattern[0]];
        let pos2 = board[pattern[1]];
        let pos3 = board[pattern[2]];

        if (pos1 !== "" && pos1 === pos2 && pos2 === pos3) {
            return pos1 === "X" ? 10 : -10;
        }
    }
    return 0;
};

const minimax = (board, depth, isMaximizing) => {
    let score = evaluateBoard(board);
    if (score === 10) return score - depth;
    if (score === -10) return score + depth;
    if (!board.includes("")) return 0;

    if (isMaximizing) {
        let best = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === "") {
                board[i] = "X";
                best = Math.max(best, minimax(board, depth + 1, false));
                board[i] = "";
            }
        }
        return best;
    } else {
        let best = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === "") {
                board[i] = "O";
                best = Math.min(best, minimax(board, depth + 1, true));
                board[i] = "";
            }
        }
        return best;
    }
};

const computerMove = () => {
    let board = [];
    boxes.forEach(box => board.push(box.innerText));

    if (!board.includes("")) return;

    let bestVal = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
            board[i] = "X";
            let moveVal = minimax(board, 0, false);
            board[i] = "";

            if (moveVal > bestVal) {
                bestMove = i;
                bestVal = moveVal;
            }
        }
    }

    if (bestMove !== -1) {
        boxes[bestMove].innerText = "X";
        boxes[bestMove].disabled = true;
        turnO = true;
        count++;
        isComputerTurn = false;

        playSound('click');
        checkWinner();
    }
};

pvpBtn.addEventListener("click", () => {
    isComputerGame = false;
    if(labelX) labelX.innerText = "P2 (X)";
    resetScores();
    pvpBtn.classList.add("active");
    pvcBtn.classList.remove("active");
    resetGame();
});

pvcBtn.addEventListener("click", () => {
    isComputerGame = true;
    if(labelX) labelX.innerText = "CPU (X)";
    resetScores();
    pvcBtn.classList.add("active");
    pvpBtn.classList.remove("active");
    resetGame();
});

newGameBtn.addEventListener("click", resetGame);
resetBtn.addEventListener("click", resetGame);