const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const clearBtn = document.getElementById('clearBtn');
const brushType = document.getElementById('brushType');
const imageLoader = document.getElementById('imageLoader');
const container = document.getElementById('canvas-container');
const spawnBtn = document.getElementById('spawnBtn');
const characters = []; // array to hold all the characters created
let charImgUrl = '';
let isCharImageLoaded = false;
const charLoader = document.getElementById('charLoader');
const miniWindow = document.getElementById('miniWindow');
const gameBtn = document.getElementById('gameBtn'); 
const closeWindowBtn = document.getElementById('closeWindowBtn');
const windowHeader = document.getElementById('windowHeader');

// Grab the customizable game container handles
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const startGameBtn = document.getElementById('startGameBtn');

// New Save and Load buttons
const saveBtn = document.getElementById('saveBtn');
const loadBtn = document.getElementById('loadBtn');

// Tracking variables for drawing and history
let isDrawing = false;
let currentTool = 'round';
let mouseX = 0;
let mouseY = 0;
const drawingHistory = []; 
let currentStroke = [];

// 🎬 Handle swapping from start button to the game sandbox area
startGameBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden-game-element');     
    gameScreen.classList.remove('hidden-game-element');  
    console.log("Custom game module booted up successfully!");
    if (typeof initCustomGame === 'function') {
        initCustomGame(); 
    }
});

// Open window action
gameBtn.addEventListener('click', () => {
    miniWindow.classList.remove('hidden-window'); 
    miniWindow.style.display = 'block'; 
});

// 🔄 Consolidated close action
closeWindowBtn.addEventListener('click', () => {
    miniWindow.classList.add('hidden-window'); 
    startScreen.classList.remove('hidden-game-element'); 
    gameScreen.classList.add('hidden-game-element');    
    if (typeof stopCustomGame === 'function') {
        stopCustomGame(); 
    }
});

// 💾 SAVE FEATURE
saveBtn.addEventListener('click', () => {
    if (drawingHistory.length === 0) {
        alert("Your canvas is completely blank! Draw something first.");
        return;
    }
    localStorage.setItem('mySavedArt', JSON.stringify(drawingHistory));
    alert("Art saved successfully to browser storage! 🎉");
});

// 📂 LOAD FEATURE
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
    alert("Art loaded smoothly! 🎨");
});

// draggable window code >>
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
});

window.addEventListener('mousemove', (e) => {
    if (!isDraggingWindow) return;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    miniWindow.style.left = `${initialWindowLeft + deltaX}px`;
    miniWindow.style.top = `${initialWindowTop + deltaY}px`;
});

window.addEventListener('mouseup', () => {
    if (isDraggingWindow) {
        isDraggingWindow = false;
        windowHeader.style.backgroundColor = '#49393F'; 
    }
});

// Stamp loading logic
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
        if (stroke.length < 2) return;

        ctx.strokeStyle = stroke[0].color;
        ctx.lineWidth = stroke[0].size;
        ctx.lineCap = stroke[0].tool === 'square' ? 'square' : 'round';
        ctx.lineJoin = stroke[0].tool === 'square' ? 'miter' : 'round';

        ctx.beginPath();
        ctx.moveTo(stroke[0].x, stroke[0].y);

        for (let i = 1; i < stroke.length - 1; i++) {
            const midX = (stroke[i].x + stroke[i + 1].x) / 2;
            const midY = (stroke[i].y + stroke[i + 1].y) / 2;
            ctx.quadraticCurveTo(stroke[i].x, stroke[i].y, midX, midY);
        }
        ctx.stroke();
    });
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

brushType.addEventListener('change', () => {
    currentTool = brushType.value;
});

window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

const resetTracking = () => {
    isDrawing = false;
    canvas.lastX = null;
    canvas.lastY = null;
    canvas.lastMidX = null;
    canvas.lastMidY = null;
    ctx.beginPath();

    if (currentStroke.length > 0) {
        drawingHistory.push([...currentStroke]);
        currentStroke = []; 
    }
};

canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    draw(e);
});

window.addEventListener('mousemove', draw);
window.addEventListener('mouseup', resetTracking);

function draw(e) {
    if (!isDrawing || !e.clientX || !e.clientY) return;        
    
    if (currentTool === 'round' || currentTool === 'square') {
        ctx.strokeStyle = colorPicker.value;
    } else {
        ctx.strokeStyle = '#ffffff'; 
    }

    ctx.lineWidth = brushSize.value;
    
    if (currentTool === 'square') {
        ctx.lineCap = 'square';
        ctx.lineJoin = 'miter';
    } else {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }
    ctx.imageSmoothingEnabled = true;

    const rect =
