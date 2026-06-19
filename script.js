const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const clearBtn = document.getElementById('clearBtn');
const brushType = document.getElementById('brushType');
const imageLoader = document.getElementById('imageLoader');
const container = document.getElementById('canvas-container');
const spawnBtn = document.getElementById('spawnBtn');
const characters = []; 
let charImgUrl = '';
let isCharImageLoaded = false;
const charLoader = document.getElementById('charLoader');

const miniWindow = document.getElementById('miniWindow');
const miniWindow2 = document.getElementById('miniWindow2');

const gameBtn = document.getElementById('gameBtn'); 
const browserBtn = document.getElementById('browserBtn'); 
const closeWindowBtn = document.getElementById('closeWindowBtn');
const closeWindowBtn2 = document.getElementById('closeWindowBtn2'); 
const windowHeader = document.getElementById('windowHeader');
const windowHeader2 = document.getElementById('windowHeader2'); 

const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const startGameBtn = document.getElementById('startGameBtn');

const saveBtn = document.getElementById('saveBtn');
const loadBtn = document.getElementById('loadBtn');

const drawingHistory = []; 
let currentStroke = [];
const redoStack = []; 

let isDrawing = false;
let currentTool = 'round';
let mouseX = 0;
let mouseY = 0;

startGameBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden-game-element');     
    gameScreen.classList.remove('hidden-game-element');  
    console.log("Custom game module booted up successfully!");
    if (typeof initCustomGame === 'function') {
        initCustomGame(); 
    }
});

gameBtn.addEventListener('click', () => {
    miniWindow.classList.remove('hidden-window'); 
    miniWindow.style.display = 'block'; 
    miniWindow.style.zIndex = '100';
    miniWindow2.style.zIndex = '99';
});

browserBtn.addEventListener('click', () => {
    miniWindow2.classList.remove('hidden-window');
    miniWindow2.style.display = 'block';
    miniWindow2.style.zIndex = '100';
    miniWindow.style.zIndex = '99';
});

closeWindowBtn.addEventListener('click', () => {
    miniWindow.classList.add('hidden-window'); 
    startScreen.classList.remove('hidden-game-element'); 
    gameScreen.classList.add('hidden-game-element');    
    if (typeof stopCustomGame === 'function') {
        stopCustomGame(); 
    }
});

closeWindowBtn2.addEventListener('click', () => {
    miniWindow2.classList.add('hidden-window');
    miniWindow2.style.display = 'none';
});

saveBtn.addEventListener('click', () => {
    if (drawingHistory.length === 0) {
        alert("Your canvas is completely blank! Draw something first.");
        return;
    }
    localStorage.setItem('mySavedArt', JSON.stringify(drawingHistory));
});

loadBtn.addEventListener('click', () => {
    const savedData = localStorage.getItem('mySavedArt');
    if (!savedData) {
        alert("No saved artwork found on this browser!");
        return;
    }
    ctx.clearRect(0, 0, canvas
