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

let isDrawing = false;
let currentTool = 'round';
let mouseX = 0;
let mouseY = 0;
let livePoints = []; 

let undoStack = [];
let redoStack = [];
const MAX_STATES = 20; 

startGameBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden-game-element');     
    gameScreen.classList.remove('hidden-game-element');  
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

// ==========================================================================
// 💾 FIXED PIXEL-PERFECT SAVE/LOAD ENGINE (ALERTS & FLASHES REMOVED)
// ==========================================================================

saveBtn.addEventListener('click', () => {
    const canvasDataUrl = canvas.toDataURL();
    localStorage.setItem('mySavedArt', canvasDataUrl);
});

loadBtn.addEventListener('click', () => {
    const savedDataUrl = localStorage.getItem('mySavedArt');
    if (!savedDataUrl) {
        return; 
    }
    
    const img = new Image();
    img.onload = () => {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const scale = window.devicePixelRatio || 1;
        ctx.scale(scale, scale);
    };
    img.src = savedDataUrl;
});

miniWindow.addEventListener('mousedown', () => {
    miniWindow.style.zIndex = '100';
    miniWindow2.style.zIndex = '99';
});

miniWindow2.addEventListener('mousedown', () => {
    miniWindow2.style.zIndex = '100';
    miniWindow.style.zIndex = '99';
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

    miniWindow.style.zIndex = '100';
    miniWindow2.style.zIndex = '99';
});

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

    const savedDataUrl = localStorage.getItem('mySavedArt');
    if (savedDataUrl) {
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = savedDataUrl;
    }
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

brushType.addEventListener('change', () => {
    currentTool = brushType.value;
});

const resetTracking = () => {
    if (isDrawing) {
        const midSnapshot = canvas.toDataURL();
        localStorage.setItem('mySavedArt', midSnapshot);
    }
    isDrawing = false;
    livePoints = [];
    ctx.beginPath();
    ctx.globalCompositeOperation = 'source-over';
};

canvas.addEventListener('mousedown', (e) => {
    const preSnapshot = canvas.toDataURL();
    undoStack.push(preSnapshot);
    if (undoStack.length > MAX_STATES) undoStack.shift();
    redoStack = []; 

    isDrawing = true;
    livePoints = [];
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    livePoints.push({ x: x, y: y });

    ctx.beginPath();
    if (currentTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.fillStyle = 'rgba(0,0,0,1)';
    } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = colorPicker.value;
        ctx.fillStyle = colorPicker.value;
    }
    ctx.lineWidth = brushSize.value;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.arc(x, y, brushSize.value / 2, 0, Math.PI * 2);
    ctx.fill();
});

window.addEventListener('mouseup', resetTracking);

function draw(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mouseX = x;
    mouseY = y;

    if (!isDrawing) return;        
    
    if (currentTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)'; 
    } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = colorPicker.value;
    }

    ctx.lineWidth = brushSize.value;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    livePoints.push({ x: x, y: y });

    if (livePoints.length > 1) {
        ctx.beginPath();
        const p1 = livePoints[livePoints.length - 2];
        const p2 = livePoints[livePoints.length - 1];
        
        if (livePoints.length === 2) {
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
        } else {
            const p0 = livePoints[livePoints.length - 3];
            const mid1X = (p0.x + p1.x) / 2;
            const mid1Y = (p0.y + p1.y) / 2;
            const mid2X = (p1.x + p2.x) / 2;
            const mid2Y = (p1.y + p2.y) / 2;
            
            ctx.moveTo(mid1X, mid1Y);
            ctx.quadraticCurveTo(p1.x, p1.y, mid2X, mid2Y);
        }
        ctx.stroke();
    }
}

window.addEventListener('mousemove', draw);

window.addEventListener('keydown', (e) => {
    if (e.key === 'Shift') {
        if (mouseX >= 0 && mouseX <= canvas.clientWidth && mouseY >= 0 && mouseY <= canvas.clientHeight) {
            drawCustomShape(mouseX, mouseY);
        }
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault(); 
        executeUndo();
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        executeRedo();
    }
});

function drawCustomShape(x, y) {
    if (!isImageLoaded) return; 

    const preSnapshot = canvas.toDataURL();
    undoStack.push(preSnapshot);
    if (undoStack.length > MAX_STATES) undoStack.shift();
    redoStack = [];

    ctx.save();
    const dynamicSize = Number(brushSize.value) * 2.5; 
    const targetX = x - (dynamicSize / 2);
    const targetY = y - (dynamicSize / 2);
    ctx.drawImage(stampImage, targetX, targetY, dynamicSize, dynamicSize);
    ctx.restore();
    
    const stampSnapshot = canvas.toDataURL();
    localStorage.setItem('mySavedArt', stampSnapshot);
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
    const preSnapshot = canvas.toDataURL();
    undoStack.push(preSnapshot);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    characters.forEach(char => char.element.remove());
    characters.length = 0;
    localStorage.removeItem('mySavedArt');
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
    const savedDataUrl = localStorage.getItem('mySavedArt');
    if (savedDataUrl) {
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = savedDataUrl;
    }
});

const refWindowBtn = document.getElementById('uploadBtn');
const refImageLoader = document.getElementById('windowImageLoader');
const refImagePreview = document.getElementById('windowImagePreview');
const refPlaceholder = document.getElementById('uploadPlaceholder');

if (refWindowBtn && refImageLoader) {
    refWindowBtn.addEventListener('click', () => {
        refImageLoader.click();
    });
}

if (refImageLoader && refImagePreview) {
    refImageLoader.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                refImagePreview.src = event.target.result;
                refImagePreview.style.display = 'block';
                if (refPlaceholder) {
                    refPlaceholder.style.display = 'none';
                }
            };
            
            reader.readAsDataURL(file);
        }
    });
}

function executeUndo() {
    if (undoStack.length === 0) return;

    const currentState = canvas.toDataURL();
    redoStack.push(currentState);

    const previousState = undoStack.pop();
    
    const img = new Image();
    img.onload = () => {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const scale = window.devicePixelRatio || 1;
        ctx.scale(scale, scale);
        localStorage.setItem('mySavedArt', previousState);
    };
    img.src = previousState;
}

function executeRedo() {
    if (redoStack.length === 0) return;

    const nextState = redoStack.pop();
    undoStack.push(canvas.toDataURL());

    const img = new Image();
    img.onload = () => {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const scale = window.devicePixelRatio || 1;
        ctx.scale(scale, scale);
        localStorage.setItem('mySavedArt', nextState);
    };
    img.src = nextState;
}
