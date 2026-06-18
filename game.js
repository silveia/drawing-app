// 📄 game.js
let gameScore = 0;
let targetInterval;

const currentScoreDisplay = document.getElementById('currentScore');
const gameTarget = document.getElementById('gameTarget');

function initCustomGame() {
    gameScore = 0;
    currentScoreDisplay.textContent = gameScore;
    moveTarget();
    
    targetInterval = setInterval(moveTarget, 1000);
}

function moveTarget() {
    // 🛠️ Updated coordinates to fit comfortably in your updated 400x500 box layout
    const boxWidth = 330;  
    const boxHeight = 400; 
    
    const randomX = Math.floor(Math.random() * boxWidth);
    const randomY = Math.floor(Math.random() * boxHeight);
    
    gameTarget.style.left = `${randomX}px`;
    gameTarget.style.top = `${randomY}px`;
}

gameTarget.addEventListener('click', () => {
    gameScore++;
    currentScoreDisplay.textContent = gameScore;
    moveTarget(); 
});

function stopCustomGame() {
    clearInterval(targetInterval);
}
