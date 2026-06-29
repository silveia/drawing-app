// ==========================================================================
// 1. ENGINE CONFIGURATION & VARIABLES
// ==========================================================================
const bgWorld = document.getElementById('gameWorldBackground');
const playerEl = document.getElementById('gamePlayer');

let isPlaying = false;
let gameLoopId = null;

let keyHistory = [];

let camX = 0;
let camY = 0;
const moveSpeed = 1.5; 

let animFrame = 0;
let animTimer = 0;
let playerRow = 5;      
const ANIM_SPEED = 6;   
const FRAME_SIZE = 32;  

const keysPressed = {
    w: false,
    s: false,
    a: false,
    d: false
};

// Silvia - Your invisible collision barrier coordinates
const mapBarriers = [
    // water :3 >>
    { x: 505, y: 864, width: 400, height: 20 },
    { x: 663, y: 834, width: 200, height: 50 },
    { x: 758, y: 805, width: 120, height: 80 },

    // trees
    { x: 257, y: 166, width: 27, height: 10 },
    { x: 320, y: 326, width: 27, height: 10 },
    { x: 161, y: 550, width: 27, height: 10 },
    { x: 194, y: 586, width: 27, height: 10 },
    { x: 221, y: 551, width: 27, height: 10 },
    { x: 767, y: 518, width: 27, height: 10 },
    { x: 798, y: 488, width: 27, height: 10 },
    { x: 828, y: 489, width: 27, height: 10 },
    { x: 804, y: 430, width: 27, height: 10 },
    { x: 737, y: 362, width: 27, height: 10 }
];

// Silvia - The X and Y map coordinates for every tree stamp you want!
const treePositions = [
    // left >>
    { x: 211, y: 600 }, 
    { x: 178, y: 567 }, 
    { x: 338, y: 342 },  
    { x: 274, y: 183 },


    // right >>
    { x: 754, y: 378 }, 
    { x: 820, y: 447 },
    { x: 843, y: 504 }, 
    { x: 814, y: 504 }, 
    { x: 783, y: 534 }  
];

// Helper function to spawn tree elements dynamically
function spawnTrees() {
    const world = document.getElementById('gameWorldBackground');
    if (!world) return;
    
    const oldTrees = document.querySelectorAll('.map-tree');
    oldTrees.forEach(t => t.remove());

    treePositions.forEach(pos => {
        const tree = document.createElement('div');
        tree.className = 'map-tree';
        tree.style.left = `${pos.x}px`;
        tree.style.top = `${pos.y}px`;
        
        world.appendChild(tree);
    });
}

// Helper function to check if a world coordinate lands inside any barrier box
function isCollidingWithBarriers(targetMapX, targetMapY) {
    const pWidth = 16;
    const pHeight = 16;
    
    const pX = targetMapX - (pWidth / 2);
    const pY = targetMapY + 4; 

    for (let barrier of mapBarriers) {
        if (
            pX < barrier.x + barrier.width &&
            pX + pWidth > barrier.x &&
            pY < barrier.y + barrier.height &&
            pY + pHeight > barrier.y
        ) {
            return true; 
        }
    }
    return false;
}

// ==========================================================================
// 2. MAIN ANIMATION TICK / GAME LOOP
// ==========================================================================
function runGameTick() {
    if (!isPlaying) return;

    let isMoving = false;
    let nextCamX = camX;
    let nextCamY = camY;

    // 1. Check and apply X movement independently (East/West sliding)
    let testCamX = camX;
    if (keysPressed.a) testCamX += moveSpeed;
    if (keysPressed.d) testCamX -= moveSpeed;

    const playerMapX = (300 / 2) - testCamX;
    const currentPlayerMapY = (295 / 2) - camY; 

    if (!isCollidingWithBarriers(playerMapX, currentPlayerMapY)) {
        nextCamX = testCamX; 
    }

    // 2. Check and apply Y movement independently (North/South sliding)
    let testCamY = camY;
    if (keysPressed.w) testCamY += moveSpeed;
    if (keysPressed.s) testCamY -= moveSpeed;

    const currentPlayerMapX = (300 / 2) - nextCamX; 
    const playerMapY = (295 / 2) - testCamY;

    if (!isCollidingWithBarriers(currentPlayerMapX, playerMapY)) {
        nextCamY = testCamY; 
    }

    // Character Sprite Directional/Turning Calculations
    if (keyHistory.length > 0) {
        isMoving = true;

        if (keysPressed.w && keysPressed.d) {
            playerRow = 3; 
            playerEl.style.transform = 'translate(-50%, -50%) scale(2, 2)'; 
        } 
        else if (keysPressed.w && keysPressed.a) {
            playerRow = 3; 
            playerEl.style.transform = 'translate(-50%, -50%) scale(-2, 2)'; 
        } 
        else if (keysPressed.s && keysPressed.d) {
            playerRow = 4; 
            playerEl.style.transform = 'translate(-50%, -50%) scale(-2, 2)'; 
        } 
        else if (keysPressed.s && keysPressed.a) {
            playerRow = 4; 
            playerEl.style.transform = 'translate(-50%, -50%) scale(2, 2)'; 
        }
        else {
            const currentFacingKey = keyHistory[keyHistory.length - 1];

            if (currentFacingKey === 'w') {
                playerRow = 6; 
                playerEl.style.transform = 'translate(-50%, -50%) scale(2)'; 
            } 
            else if (currentFacingKey === 's') {
                playerRow = 5; 
                playerEl.style.transform = 'translate(-50%, -50%) scale(2)'; 
            } 
            else if (currentFacingKey === 'a') {
                playerRow = 2; 
                playerEl.style.transform = 'translate(-50%, -50%) scale(2, 2)'; 
            } 
            else if (currentFacingKey === 'd') {
                playerRow = 2; 
                playerEl.style.transform = 'translate(-50%, -50%) scale(-2, 2)'; 
            }
        }
    }

    // Outer Edge World Constraints
    const viewWidth = 300;
    const viewHeight = 295; 
    const mapWidth = 1024;
    const mapHeight = 1024;

    const minCamX = viewWidth - mapWidth;   
    const minCamY = viewHeight - mapHeight; 

    if (nextCamX > 0) nextCamX = 0;
    if (nextCamX < minCamX) nextCamX = minCamX;

    if (nextCamY > 0) nextCamY = 0;
    if (nextCamY < minCamY) nextCamY = minCamY;

    camX = nextCamX;
    camY = nextCamY;

    // Sprite Framing Engine
    if (isMoving) {
        animTimer++;
        if (animTimer >= ANIM_SPEED) {
            animTimer = 0;
            animFrame = (animFrame + 1) % 8; 
        }
    } else {
        animFrame = 0; 
    }

    // ==========================================================================
    // 3. RENDER AND POSITION UPDATES
    // ==========================================================================
    const offsetX = -(animFrame * FRAME_SIZE);
    const offsetY = -(playerRow * FRAME_SIZE);
    
    playerEl.style.backgroundPosition = `${offsetX}px ${offsetY}px`;
    
    // Move the background map container
    bgWorld.style.transform = `scale(1) translate(${camX}px, ${camY}px)`;

    // Keep player movement centered inside viewport
    const counterX = -camX + (300 / 2);
    const counterY = -camY + (295 / 2);
    playerEl.style.left = `${counterX}px`;
    playerEl.style.top = `${counterY}px`;

    // Dynamic Depth Y-Sorting Calculations (Sorting Player & Trees)
    const exactPlayerMapY = (295 / 2) - camY;
    const playerFeetY = Math.floor(exactPlayerMapY + 16); 
    playerEl.style.zIndex = playerFeetY;

    const dynamicTrees = document.querySelectorAll('.map-tree');
    dynamicTrees.forEach(tree => {
        const treeBaseY = parseInt(tree.style.top, 10) || 0;
        tree.style.zIndex = treeBaseY; 
    });

    gameLoopId = requestAnimationFrame(runGameTick);
}

// ==========================================================================
// 4. CORE ENGINE LIFECYCLE CONTROLLER
// ==========================================================================
function getCenterCoordinates() {
    return {
        x: (300 / 2) - (1024 / 2),
        y: (295 / 2) - (1024 / 2)
    };
}

window.initCustomGame = function() {
    isPlaying = false; 
    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId);
        gameLoopId = null;
    }

    for (let key in keysPressed) {
        keysPressed[key] = false;
    }
    keyHistory = []; 
    
    const center = getCenterCoordinates();
    camX = center.x;
    camY = center.y;
    
    playerRow = 5; 
    animFrame = 0;
    animTimer = 0;

    spawnTrees();

    isPlaying = true;
    gameLoopId = requestAnimationFrame(runGameTick);
};

window.teleportToSpawn = function() {
    const center = getCenterCoordinates();
    camX = center.x;
    camY = center.y;
    playerRow = 5; 
    animFrame = 0;
    
    bgWorld.style.transform = `scale(1) translate(${camX}px, ${camY}px)`;
    
    const counterX = -camX + (300 / 2);
    const counterY = -camY + (295 / 2);
    playerEl.style.left = `${counterX}px`;
    playerEl.style.top = `${counterY}px`;
    
    playerEl.style.backgroundPosition = `0px -160px`; 
};

window.getCustomGameProgress = function() {
    return { camX, camY };
};

// ==========================================================================
// 5. GLOBAL DOCUMENT INPUT LISTENERS
// ==========================================================================
document.body.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key in keysPressed) {
        if (!keysPressed[key]) {
            keysPressed[key] = true;
            keyHistory.push(key); 
        }
    }
});

document.body.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (key in keysPressed) {
        keysPressed[key] = false;
        keyHistory = keyHistory.filter(k => k !== key);
    }
});
