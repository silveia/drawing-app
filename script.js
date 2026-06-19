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

// Tracking states declared cleanly once
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
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    drawingHistory.length = 0; 
    
    const parsedHistory = JSON.parse(savedData);
    parsedHistory.forEach(stroke => drawingHistory.push(stroke));
    
    redrawAllStrokes();
});

// 🎯 CLICK-ANYWHERE WINDOW FOCUS LOGIC
miniWindow.addEventListener('mousedown', () => {
    miniWindow.style.zIndex = '100';
    miniWindow2.style.zIndex = '99';
});

miniWindow2.addEventListener('mousedown', () => {
    miniWindow2.style.zIndex = '100';
    miniWindow.style.zIndex = '99';
});

// 🛠️ DRAG LOGIC FOR WINDOW 1
let isDraggingWindow = false;
let startX, startY, initialWindowLeft, initialWindowTop;

windowHeader.addEventListener('mousedown', (e) => {
    isDraggingWindow = true;
    startX = e.clientX;
    startY = e.clientY;
    
    const rect = miniWindow.getBoundingClientRect();
    initialWindowLeft = rect.left;
    initialWindowTop = rect.top;
    windowHeader.style.backgroundColor = '#624D5A'; 

    miniWindow.style.zIndex = '100';
    miniWindow2.style.zIndex = '99';
});

// 🛠️ DRAG LOGIC FOR WINDOW 2
let isDraggingWindow2 = false;
let startX2, startY2, initialWindowLeft2, initialWindowTop2;

windowHeader2.addEventListener('mousedown', (e) => {
    isDraggingWindow2 = true;
    startX2 = e.clientX;
    startY2 = e.clientY;
    
    const rect = miniWindow2.getBoundingClientRect();
    initialWindowLeft2 = rect.left;
    initialWindowTop2 = rect.top;
    windowHeader2.style.backgroundColor = '#624D5A'; 

    miniWindow.style.zIndex = '99';
    miniWindow2.style.zIndex = '100';
});

window.addEventListener('mousemove', (e) => {
    if (isDraggingWindow) {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        miniWindow.style.left = `${initialWindowLeft + deltaX}px`;
        miniWindow.style.top = `${initialWindowTop + deltaY}px`;
    }
    if (isDraggingWindow2) {
        const deltaX = e.clientX - startX2;
        const deltaY = e.clientY - startY2;
        miniWindow2.style.left = `${initialWindowLeft2 + deltaX}px`;
        miniWindow2.style.top = `${initialWindowTop2 + deltaY}px`;
    }
});

window.addEventListener('mouseup', () => {
    if (isDraggingWindow) {
        isDraggingWindow = false;
        windowHeader.style.backgroundColor = '#49393F'; 
    }
    if (isDraggingWindow2) {
        isDraggingWindow2 = false;
        windowHeader2.style.backgroundColor = '#49393F'; 
    }
});

let stampImage = new Image();
let isImageLoaded = false;
stampImage.onload = () => { isImageLoaded = true; };

imageLoader.addEventListener('change', (e) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        stampImage = new Image();
        stampImage.onload = () => { isImageLoaded = true; };
        stampImage.src = event.target.result;
    };
    if (e.target.files[0]) {
        reader.readAsDataURL(e.target.files[0]);
    }
});

charLoader.addEventListener('change', (e) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        charImgUrl = event.target.result;
        isCharImageLoaded = true;
    };
    if (e.target.files[0]) {
        reader.readAsDataURL(e.target.files[0]);
    }
});

function resizeCanvas() {
    const scale = window.devicePixelRatio || 1; 
    canvas.width = canvas.clientWidth * scale;
    canvas.height = canvas.clientHeight * scale;

    ctx.setTransform(1, 0, 0, 1, 0, 0); 
    ctx.scale(scale, scale);
    ctx.imageSmoothingEnabled = true;

    redrawAllStrokes();
}

function redrawAllStrokes() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight); 

    drawingHistory.forEach(stroke => {
        if (stroke.length === 0) return;

        // Configure standard context properties
        if (stroke[0].tool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.strokeStyle = 'rgba(0,0,0,1)';
            ctx.fillStyle = 'rgba(0,0,0,1)';
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = stroke[0].color;
            ctx.fillStyle = stroke[0].color;
        }

        ctx.lineWidth = stroke[0].size;
        ctx.lineCap = stroke[0].tool === 'square' ? 'square' : 'round';
        ctx.lineJoin = stroke[0].tool === 'square' ? 'miter' : 'round';

        // Fix: Render standalone dots/clicks safely 
        if (stroke.length === 1) {
            ctx.beginPath();
            if (stroke[0].tool === 'square') {
                const size = stroke[0].size;
                ctx.fillRect(stroke[0].x - size / 2, stroke[0].y - size / 2, size, size);
            } else {
                ctx.arc(stroke[0].x, stroke[0].y, stroke[0].size / 2, 0, Math.PI * 2);
                ctx.fill();
            }
            return;
        }

        // Draw standard lines smoothly
        ctx.beginPath();
        ctx.moveTo(stroke[0].x, stroke[0].y);

        for (let i = 1; i < stroke.length - 1; i++) {
            const midX = (stroke[i].x + stroke[i + 1].x) / 2;
            const midY = (stroke[i].y + stroke[i + 1].y) / 2;
            ctx.quadraticCurveTo(stroke[i].x, stroke[i].y, midX, midY);
        }
        
        // Connect accurately to final stroke segment
        ctx.quadraticCurveTo(
            stroke[stroke.length - 1].x,
            stroke[stroke.length - 1].y,
            stroke[stroke.length - 1].x,
            stroke[stroke.length - 1].y
        );
        ctx.stroke();
    });

    ctx.globalCompositeOperation = 'source-over';
}

resizeCanvas();
window.addEventListener('resize
