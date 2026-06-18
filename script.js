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
const gameBtn = document.getElementById('gameBtn'); 
const closeWindowBtn = document.getElementById('closeWindowBtn');
const windowHeader = document.getElementById('windowHeader');

const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const startGameBtn = document.getElementById('startGameBtn');

const saveBtn = document.getElementById('saveBtn');
const loadBtn = document.getElementById('loadBtn');

let isDrawing = false;
let currentTool = 'round';
let mouseX = 0;
let mouseY = 0;
const drawingHistory = []; 
let currentStroke = [];

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
});

closeWindowBtn.addEventListener('click', () => {
    miniWindow.classList.add('hidden-window'); 
    startScreen.classList.remove('hidden-game-element'); 
    gameScreen.classList.add('hidden-game-element');    
    if (typeof stopCustomGame === 'function') {
        stopCustomGame(); 
    }
});

saveBtn.addEventListener('click', () => {
    if (drawingHistory.length === 0) {
        alert("Your canvas is completely blank! Draw something first.");
        return;
    }
    localStorage.setItem('mySavedArt', JSON.stringify(drawingHistory));
    alert("Art saved successfully to browser storage! 🎉");
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
    alert("Art loaded smoothly! 🎨");
});

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

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mouseX = x;
    mouseY = y;

    if (!canvas.lastX) {
        canvas.lastX = x;
        canvas.lastY = y;
        canvas.lastMidX = x;
        canvas.lastMidY = y;
    }

    const midX = (canvas.lastX + x) / 2;
    const midY = (canvas.lastY + y) / 2;

    ctx.beginPath();
    ctx.moveTo(canvas.lastMidX, canvas.lastMidY);
    ctx.quadraticCurveTo(canvas.lastX, canvas.lastY, midX, midY);
    ctx.stroke();
    
    const lastPoint = currentStroke[currentStroke.length - 1];
    if (!lastPoint || Math.abs(x - lastPoint.x) > 2 || Math.abs(y - lastPoint.y) > 2) {
        currentStroke.push({
            x: x,
            y: y,
            color: ctx.strokeStyle,
            size: ctx.lineWidth,
            tool: currentTool
        });
    }
    
    canvas.lastX = x;
    canvas.lastY = y;
    canvas.lastMidX = midX;
    canvas.lastMidY = midY;
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'Shift') {
        if (mouseX >= 0 && mouseX <= canvas.clientWidth && mouseY >= 0 && mouseY <= canvas.clientHeight) {
            drawCustomShape(mouseX, mouseY);
        }
    }
});

function drawCustomShape(x, y) {
    if (!isImageLoaded) return; 
    ctx.save();
    const dynamicSize = Number(brushSize.value) * 2.5; 
    const targetX = x - (dynamicSize / 2);
    const targetY = y - (dynamicSize / 2);
    ctx.drawImage(stampImage, targetX, targetY, dynamicSize, dynamicSize);
    ctx.restore();
}

class Shimeji {
    constructor() {
        this.x = Math.random() * (window.innerWidth - 100);
        this.y = -50; 
        this.velocityY = 0; 
        this.velocityX = (Math.random() - 0.5) * 2; 
        this.gravity = 0.4;
        this.bounceFactor = -0.3; 
        this.isGrounded = false;
        this.state = 'falling'; 
        this.stateTimer = 0;

        this.element = document.createElement('img');
        this.element.src = charImgUrl;
        this.element.classList.add('shimeji-char');
        document.body.appendChild(this.element); 
        this.updateElementPosition();
    }

    chooseNewState() {
        this.stateTimer = Math.floor(Math.random() * 120) + 60; 
        const choices = ['walking', 'idle', 'jumping'];
        this.state = choices[Math.floor(Math.random() * choices.length)];

        if (this.state === 'walking') {
            this.velocityX = (Math.random() > 0.5 ? 1 : -1) * 1.2;
        } else if (this.state === 'idle') {
            this.velocityX = 0;
        } else if (this.state === 'jumping') {
            this.velocityY = -8 - Math.random() * 5; 
            this.velocityX = (Math.random() - 0.5) * 4; 
            this.isGrounded = false;
            this.state = 'falling';
        }
    }
    
    update() {
        const floorLevel = window.innerHeight - 100;

        if (!this.isGrounded && this.state !== 'climbing') {
            this.velocityY += this.gravity;
            this.y += this.velocityY;
            this.x += this.velocityX;

            if (this.y >= floorLevel) {
                this.y = floorLevel;
                this.velocityY = this.velocityY * this.bounceFactor; 
                if (Math.abs(this.velocityY) < 1) {
                    this.velocityY = 0;
                    this.isGrounded = true;
                    this.chooseNewState();
                }
            }
        }
        else if (this.state === 'climbing') {
            this.y += this.velocityY; 
            this.stateTimer--;

            if (this.stateTimer <= 0 || this.y <= 0 || this.y >= floorLevel) {
                this.state = 'falling';
                this.isGrounded = false;
                this.velocityX = this.x <= 0 ? 1.5 : -1.5; 
                this.element.style.transform = 'rotate(0deg)'; 
            }
        }
        else {
            this.x += this.velocityX;
            this.stateTimer--;
            if (this.stateTimer <= 0) this.chooseNewState();
    
            if (this.x <= 0 || this.x >= window.innerWidth - 100) {
                this.x = this.x <= 0 ? 0 : window.innerWidth - 100;
                if (Math.random() > 0.5) {
                    this.state = 'climbing';
                    this.isGrounded = false;
                    this.velocityY = -1.5; 
                    this.velocityX = 0;
                    this.stateTimer = Math.floor(Math.random() * 150) + 100; 
                    this.element.style.transform = this.x <= 0 ? 'rotate(90deg)' : 'rotate(-90deg)';
                } else {
                    this.velocityX *= -1; 
                }
            }
        }
        
        if (this.x < 0) this.x = 0;
        if (this.x > window.innerWidth - 100) this.x = window.innerWidth - 100;

        if (this.state !== 'climbing' && this.velocityX !== 0) {
            this.element.style.transform = this.velocityX > 0 ? 'scaleX(1)' : 'scaleX(-1)';
        }
        this.updateElementPosition();
    }

    updateElementPosition() {
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }
}

clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    characters.forEach(char => char.element.remove());
    characters.length = 0;
    drawingHistory.length = 0; 
});

spawnBtn.addEventListener('click', () => {
    if (!isCharImageLoaded) {
        alert("error - pls upload sprite"); 
        return; 
    }
    characters.push(new Shimeji());
});

function animationTick() {
    characters.forEach(char => char.update());
    requestAnimationFrame(animationTick);
}
requestAnimationFrame(animationTick);

window.addEventListener('DOMContentLoaded', () => {
    const savedData = localStorage.getItem('mySavedArt');
    if (savedData) {
        const parsedHistory = JSON.parse(savedData);
        parsedHistory.forEach(stroke => drawingHistory.push(stroke));
        redrawAllStrokes();
    }
});
