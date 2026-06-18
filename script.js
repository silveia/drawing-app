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

// 🎬 Handle swapping from start button to the game sandbox area
startGameBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden-game-element');     // Hides the start screen/button
    gameScreen.classList.remove('hidden-game-element');  // Reveals your blank custom game screen
    
    console.log("Custom game module booted up successfully!");
    initCustomGame(); // 🚀 Calls the initialization function inside game.js!
});

// Open window action
gameBtn.addEventListener('click', () => {
    miniWindow.classList.remove('hidden-window'); // Reveals the window
    miniWindow.style.display = 'block'; 
});

// 🔄 Consolidated close action: Resets screens and stops the loops
closeWindowBtn.addEventListener('click', () => {
    miniWindow.classList.add('hidden-window'); // 1 - Hides the window
    startScreen.classList.remove('hidden-game-element'); // 2 - Puts the START button back
    gameScreen.classList.add('hidden-game-element');    // 3 - Hides your custom game arena
    
    if (typeof stopCustomGame === 'function') {
        stopCustomGame(); // 🛑 Calls the stop function inside game.js safely if it exists
    }
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

// other code >>

let isDrawing = false;
let currentTool = 'round';
let mouseX = 0;
let mouseY = 0;

let stampImage = new Image();
let isImageLoaded = false;

stampImage.onload = () => { isImageLoaded = true; };

imageLoader.addEventListener('change', (e) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        stampImage = new Image();
        stampImage.onload = () => {
            isImageLoaded = true;
        };
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


// resize canvas >>

function resizeCanvas() {
    // 1. Create a temporary canvas to cache the current drawing state
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    
    // Turn off smoothing on the temporary cache canvas
    tempCtx.imageSmoothingEnabled = false;
    tempCtx.drawImage(canvas, 0, 0);

    // 2. Calculate pixel ratio scale factor
    const scale = window.devicePixelRatio || 1; 

    // 3. Resize the main canvas dimensions
    canvas.width = canvas.clientWidth * scale;
    canvas.height = canvas.clientHeight * scale;

    // 4. Reset the context matrix and scale it
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Completely flushes the old matrix scale
    ctx.scale(scale, scale);

    // 5. CRITICAL: Force the browser to turn off smoothing on the newly resized board
    if (currentTool === 'square') {
        ctx.imageSmoothingEnabled = false; 
    } else {
        // Change this to false if you want your round brush to stay 100% pixelated too!
        ctx.imageSmoothingEnabled = true; 
    }

    // 6. Restore the previous drawing back onto the crisp, new resolution board
    ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, canvas.clientWidth, canvas.clientHeight);
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
    canvas.lastY = null;
    ctx.beginPath();
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
        ctx.imageSmoothingEnabled = false; 
    } else {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.imageSmoothingEnabled = true;
    }

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
    
            if (this.stateTimer <= 0) {
                this.chooseNewState();
            }
    
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


// save/load code >>

const saveBtn = document.getElementById('saveBtn');
const loadBtn = document.getElementById('loadBtn');

// 💾 1. THE SAVE FEATURE
saveBtn.addEventListener('click', () => {
    if (drawingHistory.length === 0) {
        alert("Your canvas is completely blank! Draw something first.");
        return;
    }
    
    // Turn the drawingHistory array into a text string and save it to the browser memory
    localStorage.setItem('mySavedArt', JSON.stringify(drawingHistory));
    
    alert("Art saved successfully to browser storage! 🎉");
});

// 📂 2. THE LOAD FEATURE
loadBtn.addEventListener('click', () => {
    // Look up our saved data string in the browser memory
    const savedData = localStorage.getItem('mySavedArt');
    
    if (!savedData) {
        
        // no art found alert

        return;
    }
    
    // Clear the current board and current history array first
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    drawingHistory.length = 0; 
    
    // Convert the text string back into structural arrays and push them into history
    const parsedHistory = JSON.parse(savedData);
    parsedHistory.forEach(stroke => drawingHistory.push(stroke));
    
    // Fire your existing layout engine to cleanly redraw the shapes smoothly!
    redrawAllStrokes();
    
    // art loaded alert

});

// Automatically checks for saves when the page first boots up
window.addEventListener('DOMContentLoaded', () => {
    const savedData = localStorage.getItem('mySavedArt');
    if (savedData) {
        const parsedHistory = JSON.parse(savedData);
        parsedHistory.forEach(stroke => drawingHistory.push(stroke));
        redrawAllStrokes();
    }
});
