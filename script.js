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
const referenceBtn = document.getElementById('referenceBtn'); 
const closeWindowBtn = document.getElementById('closeWindowBtn');
const closeWindowBtn2 = document.getElementById('closeWindowBtn2'); 
const resetGameBtn = document.getElementById('resetGameBtn');
const windowHeader = document.getElementById('windowHeader');
const windowHeader2 = document.getElementById('windowHeader2'); 

const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const startGameBtn = document.getElementById('startGameBtn');

let isDrawing = false;
let currentTool = 'round';
let mouseX = 0;
let mouseY = 0;
let livePoints = []; 

let undoStack = [];
let redoStack = [];
const MAX_STATES = 20; 

// 🌟 TRACKING VARIABLES FOR EASTER EGG FISH FOUNTAIN
let isTKeyPressed = false;
let htmlFishParticles = [];
let spawnCooldown = 0; // 🌟 NEW: Controls how rapidly the fish sprout

// ==========================================================================
// 1. WINDOW DRAGGING ENGINE STATE
// ==========================================================================
let isDraggingWindow = false;
let isDraggingWindow2 = false;
let offsetX = 0;
let offsetY = 0;

// ==========================================================================
// 2. WINDOW OPEN / CLOSE & START CORE HANDLERS
// ==========================================================================
startGameBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden-game-element');     
    gameScreen.classList.remove('hidden-game-element');  
    localStorage.setItem('gameActive', 'true');
    if (typeof window.initCustomGame === 'function') {
        window.initCustomGame(); 
    }
});

gameBtn.addEventListener('click', () => {
    miniWindow.classList.remove('hidden-window'); 
    miniWindow.style.display = 'block'; 
    miniWindow.style.zIndex = '100';
    miniWindow2.style.zIndex = '99';
    localStorage.setItem('gameWindowOpen', 'true');
});

referenceBtn.addEventListener('click', () => {
    miniWindow2.classList.remove('hidden-window');
    miniWindow2.style.display = 'block';
    miniWindow2.style.zIndex = '100';
    miniWindow.style.zIndex = '99';
    localStorage.setItem('referenceWindowOpen', 'true');
});

closeWindowBtn.addEventListener('click', () => {
    miniWindow.classList.add('hidden-window'); 
    localStorage.setItem('gameWindowOpen', 'false');
});

closeWindowBtn2.addEventListener('click', () => {
    miniWindow2.classList.add('hidden-window');
    miniWindow2.style.display = 'none';
    localStorage.setItem('referenceWindowOpen', 'false');
});

resetGameBtn.addEventListener('click', () => {
    if (typeof window.teleportToSpawn === 'function') {
        window.teleportToSpawn();
    }
});

miniWindow.addEventListener('mousedown', () => {
    miniWindow.style.zIndex = '100';
    miniWindow2.style.zIndex = '99';
});

miniWindow2.addEventListener('mousedown', () => {
    miniWindow2.style.zIndex = '100';
    miniWindow.style.zIndex = '99';
});

// ==========================================================================
// 3. GLITCH-FREE WINDOW MOVEMENTS
// ==========================================================================
windowHeader.addEventListener('mousedown', (e) => {
    isDraggingWindow = true;
    offsetX = e.clientX - miniWindow.offsetLeft;
    offsetY = e.clientY - miniWindow.offsetTop;
    
    windowHeader.style.backgroundColor = '#624D5A'; 
    miniWindow.style.zIndex = '100';
    miniWindow2.style.zIndex = '99';
});

windowHeader2.addEventListener('mousedown', (e) => {
    isDraggingWindow2 = true;
    offsetX = e.clientX - miniWindow2.offsetLeft;
    offsetY = e.clientY - miniWindow2.offsetTop;
    
    windowHeader2.style.backgroundColor = '#624D5A'; 
    miniWindow.style.zIndex = '99';
    miniWindow2.style.zIndex = '100';
});

window.addEventListener('mousemove', (e) => {
    if (isDraggingWindow) {
        const finalLeft = `${e.clientX - offsetX}px`;
        const finalTop = `${e.clientY - offsetY}px`;
        
        miniWindow.style.left = finalLeft;
        miniWindow.style.top = finalTop;
        
        localStorage.setItem('miniWindowLeft', finalLeft);
        localStorage.setItem('miniWindowTop', finalTop);
    }
    
    if (isDraggingWindow2) {
        const finalLeft2 = `${e.clientX - offsetX}px`;
        const finalTop2 = `${e.clientY - offsetY}px`;
        
        miniWindow2.style.left = finalLeft2;
        miniWindow2.style.top = finalTop2;
        
        localStorage.setItem('miniWindow2Left', finalLeft2);
        localStorage.setItem('miniWindow2Top', finalTop2);
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

miniWindow2.addEventListener('mouseup', () => {
    const rect = miniWindow2.getBoundingClientRect();
    localStorage.setItem('miniWindow2Width', `${rect.width}px`);
    localStorage.setItem('miniWindow2Height', `${rect.height}px`);
});

// ==========================================================================
// 4. FILE & CANVAS IMAGE STORAGE AGENTS
// ==========================================================================
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

window.addEventListener('beforeunload', () => {
    try {
        const canvasDataUrl = canvas.toDataURL();
        localStorage.setItem('mySavedArt', canvasDataUrl);
        
        if (typeof window.getCustomGameProgress === 'function') {
            const progress = window.getCustomGameProgress(); 
            localStorage.setItem('myGameProgressData', JSON.stringify(progress));
        }
    } catch (err) {
        console.error("Failed to auto-save canvas or game state on departure:", err);
    }
});

// ==========================================================================
// 5. WINDOW LIFECYCLE & CANVAS SCALE INTERFACES
// ==========================================================================
function resizeCanvas() {
    const scale = window.devicePixelRatio || 1; 
    const targetWidth = container ? container.clientWidth : (canvas.clientWidth || 800);
    const targetHeight = container ? container.clientHeight : (canvas.clientHeight || 600);
    
    const newWidth = targetWidth * scale;
    const newHeight = targetHeight * scale;
    
    if (canvas.width !== newWidth || canvas.height !== newHeight) {
        let temporarySave = null;
        if (canvas.width > 0 && canvas.height > 0) {
            temporarySave = canvas.toDataURL();
        }

        canvas.width = newWidth;
        canvas.height = newHeight;

        ctx.setTransform(1, 0, 0, 1, 0, 0); 
        ctx.scale(scale, scale);
        ctx.imageSmoothingEnabled = true;

        if (temporarySave) {
            const restoreImg = new Image();
            restoreImg.onload = () => {
                ctx.save();
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.drawImage(restoreImg, 0, 0, canvas.width, canvas.height);
                ctx.restore();
            };
            restoreImg.src = temporarySave;
        }
    }
}

window.addEventListener('resize', resizeCanvas);

window.addEventListener('load', () => {
    resizeCanvas(); 

    const savedLeft1 = localStorage.getItem('miniWindowLeft');
    const savedTop1 = localStorage.getItem('miniWindowTop');
    if (savedLeft1 && savedTop1) {
        miniWindow.style.left = savedLeft1;
        miniWindow.style.top = savedTop1;
    }

    const savedLeft2 = localStorage.getItem('miniWindow2Left');
    const savedTop2 = localStorage.getItem('miniWindow2Top');
    const savedWidth2 = localStorage.getItem('miniWindow2Width');
    const savedHeight2 = localStorage.getItem('miniWindow2Height');
    
    if (savedLeft2 && savedTop2) {
        miniWindow2.style.left = savedLeft2;
        miniWindow2.style.top = savedTop2;
    }
    if (savedWidth2 && savedHeight2) {
        miniWindow2.style.width = savedWidth2;
        miniWindow2.style.height = savedHeight2;
    }

    const savedDataUrl = localStorage.getItem('mySavedArt');
    if (savedDataUrl) {
        const img = new Image();
        img.onload = () => {
            ctx.setTransform(1, 0, 0, 1, 0, 0); 
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height); 
            const scale = window.devicePixelRatio || 1;
            ctx.scale(scale, scale);
        };
        img.src = savedDataUrl;
    }

    if (localStorage.getItem('referenceWindowOpen') === 'true') {
        miniWindow2.classList.remove('hidden-window');
        miniWindow2.style.display = 'block';
    }

    if (localStorage.getItem('gameWindowOpen') === 'true') {
        miniWindow.classList.remove('hidden-window'); 
        miniWindow.style.display = 'block'; 
    }

    const gameContainer = document.getElementById('gameViewport');
    if (gameContainer) {
        gameContainer.classList.remove('fullscreen-mode');
    }
});

// ==========================================================================
// 6. DRAWING APPLICATION CONTROLS & ENGINE
// ==========================================================================
brushType.addEventListener('change', () => {
    currentTool = brushType.value;
});

const resetTracking = () => {
    isDrawing = false;
    livePoints = [];
    ctx.beginPath();
    ctx.globalCompositeOperation = 'source-over';
};

canvas.addEventListener('mousedown', (e) => {
    if (isTKeyPressed) return;

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

// 🌟 UPDATED: Spawns EVEN LARGER fish elements (80px width)
function spawnFloatingFish() {
    const rect = canvas.getBoundingClientRect();
    
    const spawnX = rect.left + mouseX;
    const spawnY = rect.top + mouseY;

    const fish = document.createElement('img');
    fish.src = 'fish.png'; 
    
    fish.style.position = 'fixed';
    fish.style.left = `${spawnX}px`;
    fish.style.top = `${spawnY}px`;
    fish.style.width = '80px'; // 🌟 UPDATED: Changed from 48px to 80px to make them much bigger!
    fish.style.height = 'auto';
    fish.style.pointerEvents = 'none';
    fish.style.zIndex = '9999999';
    
    // Updated centering offsets matching the new 80px width
    fish.style.marginTop = '-40px';
    fish.style.marginLeft = '-40px';
    
    document.body.appendChild(fish);

    const angle = (Math.random() * Math.PI) + Math.PI; 
    const speed = (Math.random() * 5) + 3;

    htmlFishParticles.push({
        element: fish,
        x: spawnX,
        y: spawnY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() * 8) - 4
    });
}

function draw(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mouseX = x;
    mouseY = y;

    if (!isDrawing || isTKeyPressed) return;        
    
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
    if (e.key.toLowerCase() === 't') {
        isTKeyPressed = true;
    }

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

window.addEventListener('keyup', (e) => {
    if (e.key.toLowerCase() === 't') {
        isTKeyPressed = false;
    }
});

function drawCustomShape(x, y) {
    if (!isImageLoaded || isTKeyPressed) return; 

    const preSnapshot = canvas.toDataURL();
    undoStack.push(preSnapshot);
    if (undoStack.length > MAX_STATES) undoStack.shift();
    redoStack = [];

    ctx.save();
    
    const baseSize = Number(brushSize.value) * 2.5; 

    const aspect = stampImage.width / stampImage.height;
    let targetWidth = baseSize;
    let targetHeight = baseSize;

    if (aspect > 1) {
        targetHeight = baseSize / aspect;
    } else {
        targetWidth = baseSize * aspect;
    }

    const targetX = x - (targetWidth / 2);
    const targetY = y - (targetHeight / 2);
    
    ctx.drawImage(stampImage, targetX, targetY, targetWidth, targetHeight);
    ctx.restore();
    
    const stampSnapshot = canvas.toDataURL();
    localStorage.setItem('mySavedArt', stampSnapshot);
}

// ==========================================================================
// 7. ENVIRONMENT COMPONENT AGENTS (SHIMEJI) & FLOATING EASTER EGG TIMERS
// ==========================================================================
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
});

spawnBtn.addEventListener('click', () => {
    if (!isCharImageLoaded) {
        alert("error - pls upload sprite"); 
        return; 
    }
    characters.push(new Shimeji());
});

// ==========================================================================
// MAIN RUNTIME TICK ENGINE
// ==========================================================================
function animationTick() {
    characters.forEach(char => char.update());

    // 🌟 UPDATED: Slowed down spawning rate using a frame counter cooldown
    if (isTKeyPressed) {
        spawnCooldown++;
        if (spawnCooldown % 5 === 0) { // Spawns 1 fish every 5 loop ticks instead of every frame
            spawnFloatingFish();
        }
    } else {
        spawnCooldown = 0;
    }

    if (htmlFishParticles.length > 0) {
        // Loop backwards through the array to prevent glitchy jumps when slicing elements out
        for (let i = htmlFishParticles.length - 1; i >= 0; i--) {
            const p = htmlFishParticles[i];
            
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.25;             
            p.rotation += p.rotSpeed; 

            p.element.style.left = `${p.x}px`;
            p.element.style.top = `${p.y}px`;
            p.element.style.transform = `rotate(${p.rotation}deg)`;
            // 🌟 UPDATED: p.alpha transparency drop code completely removed so they never fade!

            // 🌟 UPDATED: Removes fish from memory only when they fall completely past the viewport floor layout line
            if (p.y > window.innerHeight + 100) {
                p.element.remove();
                htmlFishParticles.splice(i, 1);
            }
        }
    }

    requestAnimationFrame(animationTick);
}
requestAnimationFrame(animationTick);

// ==========================================================================
// 8. BACKWARD / FORWARD HISTORICAL STATES (UNDO/REDO)
// ==========================================================================
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
    };
    img.src = nextState;
}

document.addEventListener('DOMContentLoaded', () => {
    const fsBtn = document.getElementById('toggleFullscreen');
    if (fsBtn) {
        fsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof window.toggleFullscreen === 'function') {
                window.toggleFullscreen();
            } else {
                console.error("The toggleFullscreen function is not defined in game.js yet!");
            }
        });
    }
});
