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

let penSize = 5;
let eraserSize = 20;
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

let zoomLevel = 1;
let canvasOffsetX = 0;
let canvasOffsetY = 0;

const ZOOM_SPEED = 0.25; 
const MAX_ZOOM = 5;
const MIN_ZOOM = 0.2;

let isDrawing = false;
let currentTool = 'round';
let mouseX = 0;
let mouseY = 0;
let livePoints = []; 

let undoStack = [];
let redoStack = [];
const MAX_STATES = 20; 

let isTKeyPressed = false;
let htmlFishParticles = [];
let spawnCooldown = 0; 

let isSpacePressed = false;
let isPanning = false;
let startPanX = 0;
let startPanY = 0;

let isDraggingWindow = false;
let isDraggingWindow2 = false;
let offsetX = 0;
let offsetY = 0;
const toggleFullscreenBtn = document.getElementById('toggleFullscreen');
const gameViewport = document.getElementById('gameViewport');

if (toggleFullscreenBtn && gameViewport) {
    toggleFullscreenBtn.addEventListener('click', () => {
        if (!startScreen.classList.contains('hidden-game-element')) {
            return;
        }

        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
            if (gameViewport.requestFullscreen) {
                gameViewport.requestFullscreen();
            } else if (gameViewport.webkitRequestFullscreen) {
                gameViewport.webkitRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    });
}

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

let stampImage = new Image();
let isImageLoaded = false;
stampImage.onload = () => { isImageLoaded = true; };

const referenceImage = document.getElementById('referenceImage');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');
const windowImageLoader = document.getElementById('windowImageLoader');

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

if (windowImageLoader) {
    windowImageLoader.addEventListener('change', (e) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (referenceImage) {
                referenceImage.src = event.target.result;
                referenceImage.style.display = 'block'; 
            }
            if (uploadPlaceholder) {
                uploadPlaceholder.style.display = 'none'; 
            }
        };
        if (e.target.files[0]) {
            reader.readAsDataURL(e.target.files[0]);
        }
    });
}

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

function updateCSSView() {
    canvas.style.transform = `translate(${canvasOffsetX}px, ${canvasOffsetY}px) scale(${zoomLevel})`;
    canvas.style.transformOrigin = '0 0';
}

function resizeCanvas() {
    if (!canvas.dataset.initialized) {
        const scale = window.devicePixelRatio || 1; 
        const targetWidth = container ? container.clientWidth : 800;
        const targetHeight = container ? container.clientHeight : 600;
        
        canvas.width = targetWidth * scale;
        canvas.height = targetHeight * scale;
        canvas.style.width = `${targetWidth}px`;
        canvas.style.height = `${targetHeight}px`;

        ctx.setTransform(1, 0, 0, 1, 0, 0); 
        ctx.scale(scale, scale);
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        canvas.dataset.initialized = "true";
        
        updateCSSView();
    }
}

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
            const scale = window.devicePixelRatio || 1;
            ctx.setTransform(1, 0, 0, 1, 0, 0); 
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height); 
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
});

brushType.addEventListener('change', () => {
    currentTool = brushType.value;
    brushSize.value = currentTool === 'eraser' ? eraserSize : penSize;
});

const resetTracking = () => {
    isDrawing = false;
    isPanning = false; 
    canvas.style.cursor = isSpacePressed ? 'grab' : 'crosshair';
    livePoints = [];
    ctx.beginPath();
    ctx.globalCompositeOperation = 'source-over';
};

function getCanvasCoordinates(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) / (rect.width / canvas.clientWidth);
    const y = (clientY - rect.top) / (rect.height / canvas.clientHeight);
    return { x, y };
}

canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

canvas.addEventListener('pointerdown', (e) => {
    const isTabletHardwarePan = e.button === 1 || e.buttons === 4;

    if (isSpacePressed || isTabletHardwarePan) {
        e.preventDefault(); 
        isPanning = true;
        canvas.style.cursor = 'grabbing';
        
        startPanX = e.screenX - canvasOffsetX;
        startPanY = e.screenY - canvasOffsetY;
        return; 
    }

    if (e.pointerType === 'pen') {
        if (e.buttons === 32) {
            currentTool = 'eraser';
            canvas.style.cursor = 'cell'; 
            ctx.lineWidth = eraserSize;
            brushSize.value = eraserSize;
        } else {
            currentTool = 'round';
            brushType.value = 'round';
            canvas.style.cursor = 'crosshair';
            ctx.lineWidth = penSize;
            brushSize.value = penSize;
        }
    } else {
        currentTool = brushType.value;
        canvas.style.cursor = currentTool === 'eraser' ? 'cell' : 'crosshair';
        
        if (currentTool === 'eraser') {
            ctx.lineWidth = eraserSize;
            brushSize.value = eraserSize;
        } else {
            ctx.lineWidth = penSize;
            brushSize.value = penSize;
        }
    }

    isDrawing = true;
    
    const preSnapshot = canvas.toDataURL();
    undoStack.push(preSnapshot);
    if (undoStack.length > MAX_STATES) undoStack.shift();
    redoStack = []; 

    const coords = getCanvasCoordinates(e.clientX, e.clientY);
    mouseX = coords.x;
    mouseY = coords.y;
    livePoints = [{ x: mouseX, y: mouseY }];
    
    ctx.beginPath();
    ctx.globalCompositeOperation = currentTool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = currentTool === 'eraser' ? 'rgba(0,0,0,1)' : colorPicker.value;
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.moveTo(mouseX, mouseY);
    ctx.lineTo(mouseX, mouseY); 
    ctx.stroke();
});

window.addEventListener('pointerup', resetTracking);

function draw(e) {
    if (isPanning) {
        e.preventDefault();
        canvasOffsetX += e.movementX;
        canvasOffsetY += e.movementY;
        updateCSSView();
        return; 
    }

    const coords = getCanvasCoordinates(e.clientX, e.clientY);
    mouseX = coords.x;
    mouseY = coords.y;

    if (e.pointerType === 'pen' && e.buttons !== 1 && e.buttons !== 32) return;
    if (!isDrawing || isTKeyPressed) return;        
    
    ctx.globalCompositeOperation = currentTool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = currentTool === 'eraser' ? 'rgba(0,0,0,1)' : colorPicker.value;
    
    ctx.lineWidth = currentTool === 'eraser' ? eraserSize : penSize;
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    livePoints.push({ x: mouseX, y: mouseY });

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

window.addEventListener('pointermove', draw);

function spawnFloatingFish() {
    const rect = canvas.getBoundingClientRect();
    const fish = document.createElement('img');
    fish.src = 'fish.png'; 
    
    fish.style.position = 'fixed';
    fish.style.left = `${mouseX * (rect.width / canvas.clientWidth) + rect.left}px`;
    fish.style.top = `${mouseY * (rect.height / canvas.clientHeight) + rect.top}px`;
    fish.style.width = '120px'; 
    fish.style.height = 'auto';
    fish.style.imageRendering = 'pixelated';
    fish.style.pointerEvents = 'none';
    fish.style.zIndex = '9999999';
    fish.style.marginTop = '-60px';  
    fish.style.marginLeft = '-60px'; 
    
    document.body.appendChild(fish);

    const angle = (Math.random() * Math.PI) + Math.PI; 
    const speed = (Math.random() * 5) + 3;

    htmlFishParticles.push({
        element: fish,
        x: parseFloat(fish.style.left),
        y: parseFloat(fish.style.top),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() * 8) - 4
    });
}

window.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.code === 'Space') {
        if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            e.preventDefault();
            isSpacePressed = true;
            if (!isPanning) canvas.style.cursor = 'grab';
        }
    }

    if (e.ctrlKey || e.metaKey) {
        if (e.key === '+' || e.key === '=') {
            e.preventDefault(); 
            const containerRect = container.getBoundingClientRect();
            const centerX = containerRect.width / 2;
            const centerY = containerRect.height / 2;
            const mouseBeforeZoomX = (centerX - canvasOffsetX) / zoomLevel;
            const mouseBeforeZoomY = (centerY - canvasOffsetY) / zoomLevel;
            const oldZoom = zoomLevel;
            zoomLevel = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomLevel + ZOOM_SPEED));
            canvasOffsetX -= mouseBeforeZoomX * (zoomLevel - oldZoom);
            canvasOffsetY -= mouseBeforeZoomY * (zoomLevel - oldZoom);
            updateCSSView();
        }
        if (e.key === '-') {
            e.preventDefault(); 
            const containerRect = container.getBoundingClientRect();
            const centerX = containerRect.width / 2;
            const centerY = containerRect.height / 2;
            const mouseBeforeZoomX = (centerX - canvasOffsetX) / zoomLevel;
            const mouseBeforeZoomY = (centerY - canvasOffsetY) / zoomLevel;
            const oldZoom = zoomLevel;
            zoomLevel = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomLevel - ZOOM_SPEED));
            canvasOffsetX -= mouseBeforeZoomX * (zoomLevel - oldZoom);
            canvasOffsetY -= mouseBeforeZoomY * (zoomLevel - oldZoom);
            updateCSSView();
        }
        if (e.key === '0') {
            e.preventDefault(); 
            zoomLevel = 1; 
            canvasOffsetX = 0; 
            canvasOffsetY = 0;
            updateCSSView();
        }
        if (e.key.toLowerCase() === 'z') {
            e.preventDefault(); 
            executeUndo();
        }
        if (e.key.toLowerCase() === 'y') {
            e.preventDefault();
            executeRedo();
        }
    }

    if (e.key.toLowerCase() === 't') {
        isTKeyPressed = true;
    }

    if (e.key === 'Shift') {
        drawCustomShape(mouseX, mouseY);
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === ' ' || e.code === 'Space') {
        isSpacePressed = false;
        isPanning = false;
        canvas.style.cursor = 'crosshair';
    }
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

    if (isTKeyPressed) {
        spawnCooldown++;
        if (spawnCooldown % 5 === 0) { 
            spawnFloatingFish();
        }
    } else {
        spawnCooldown = 0;
    }

    if (htmlFishParticles.length > 0) {
        for (let i = htmlFishParticles.length - 1; i >= 0; i--) {
            const p = htmlFishParticles[i];
            
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.25;             
            p.rotation += p.rotSpeed; 

            p.element.style.left = `${p.x}px`;
            p.element.style.top = `${p.y}px`;
            p.element.style.transform = `rotate(${p.rotation}deg)`;

            if (p.y > window.innerHeight + 100) {
                p.element.remove();
                htmlFishParticles.splice(i, 1);
            }
        }
    }

    requestAnimationFrame(animationTick);
}
requestAnimationFrame(animationTick);

function executeUndo() {
    if (undoStack.length === 0) return;
    const currentState = canvas.toDataURL();
    redoStack.push(currentState);
    const previousState = undoStack.pop();
    const img = new Image();
    img.onload = () => {
        const scale = window.devicePixelRatio || 1;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
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
        const scale = window.devicePixelRatio || 1;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);
    };
    img.src = nextState;
}

container.addEventListener('wheel', (e) => {
    e.preventDefault(); 
    const isTabletScroll = e.pointerType === 'pen' || (e.deltaX === 0 && Math.abs(e.deltaY) < 10 && !e.ctrlKey); 
    
    if (isTabletScroll) {
        canvasOffsetX -= e.deltaX;
        canvasOffsetY -= e.deltaY;
        updateCSSView();
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const mouseBeforeZoomX = (e.clientX - rect.left) / zoomLevel;
    const mouseBeforeZoomY = (e.clientY - rect.top) / zoomLevel;

    if (e.ctrlKey) {
        let delta = e.deltaY;
        if (e.deltaMode === 1) delta *= 40; 
        
        const oldZoom = zoomLevel;
        zoomLevel = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomLevel - delta * 0.008));

        canvasOffsetX -= mouseBeforeZoomX * (zoomLevel - oldZoom);
        canvasOffsetY -= mouseBeforeZoomY * (zoomLevel - oldZoom);
    } 
    else {
        let moveX = e.deltaX;
        let moveY = e.deltaY;
        if (e.deltaMode === 1) {
            moveX *= 40;
            moveY *= 40;
        }
        canvasOffsetX -= moveX;
        canvasOffsetY -= moveY;
    }

    updateCSSView();
}, { passive: false });

brushSize.addEventListener('input', (e) => {
    const newSize = parseInt(e.target.value);
    if (currentTool === 'eraser') {
        eraserSize = newSize; 
    } else {
        penSize = newSize;    
    }
});
