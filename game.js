// ==========================================================================
// 1. ENGINE CONFIGURATION & VARIABLES
// ==========================================================================
const bgWorld = document.getElementById('gameWorldBackground');
const playerEl = document.getElementById('gamePlayer');

let isPlaying = false;
let gameLoopId = null;

let coinPositions = []; 
const MAX_COINS = 20;   
let coinAnimTimer = 0;  
let playerCoins = 0;    // 🌟 NEW: Tracks your current score state

let keyHistory = [];

let worldPlayerX = 512;
let worldPlayerY = 512;

let camX = 0;
let camY = 0;
let moveSpeed = 1.5; 

const DESIGN_WIDTH = 300;
const DESIGN_HEIGHT = 295;
let viewWidth = 300;
let viewHeight = 295;

let animFrame = 0;
let animTimer = 0;
let playerRow = 5;      
const ANIM_SPEED = 6;   
const FRAME_SIZE = 32;  

const keysPressed = { w: false, s: false, a: false, d: false };

const mapBarriers = [
    { x: 505, y: 864, width: 400, height: 20 },
    { x: 663, y: 834, width: 200, height: 50 },
    { x: 758, y: 805, width: 120, height: 80 },
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

const treePositions = [
    { x: 211, y: 600 }, { x: 178, y: 567 }, { x: 338, y: 342 }, { x: 274, y: 183 },
    { x: 754, y: 378 }, { x: 820, y: 447 }, { x: 843, y: 504 }, { x: 814, y: 504 }, { x: 783, y: 534 }  
];

function updateViewportDimensions() {
    const container = document.getElementById('gameViewport'); 
    
    if (document.fullscreenElement) {
        if (container) {
            viewWidth = container.clientWidth || window.innerWidth || DESIGN_WIDTH;
            viewHeight = container.clientHeight || window.innerHeight || DESIGN_HEIGHT;
        }
    } else {
        viewWidth = DESIGN_WIDTH;   
        viewHeight = DESIGN_HEIGHT; 
    }
}

function spawnCoinOutsideView() {
    if (coinPositions.length >= MAX_COINS) return;
    const mapSize = 1024;
    const coinSize = 24;

    const visibleMinX = worldPlayerX - (viewWidth / 2);
    const visibleMaxX = worldPlayerX + (viewWidth / 2);
    const visibleMinY = worldPlayerY - (viewHeight / 2);
    const visibleMaxY = worldPlayerY + (viewHeight / 2);

    let validLocation = false;
    let spawnX = 0, spawnY = 0, attempts = 0;

    while (!validLocation && attempts < 150) {
        attempts++;
        let rawX = Math.floor(Math.random() * mapSize); 
        let rawY = Math.floor(Math.random() * mapSize);
        spawnX = Math.max(40, Math.min(rawX, mapSize - 40));
        spawnY = Math.max(40, Math.min(rawY, mapSize - 40));

        if (spawnX < 140 || spawnX > 880 || spawnY < 140 || spawnY > 860) continue; 

        const isVisible = spawnX >= visibleMinX && spawnX <= visibleMaxX && spawnY >= visibleMinY && spawnY <= visibleMaxY;
        let isWalkable = true;
        for (let barrier of mapBarriers) {
            if (spawnX < barrier.x + barrier.width + 20 && spawnX + coinSize > barrier.x - 20 &&
                spawnY < barrier.y + barrier.height + 20 && spawnY + coinSize > barrier.y - 20) {
                isWalkable = false;
                break;
            }
        }
        if (!isVisible && isWalkable) validLocation = true;
    }

    if (!validLocation) return;
    const world = document.getElementById('gameWorldBackground');
    const coinEl = document.createElement('img');
    coinEl.src = `coin.gif?v=${Date.now()}_${Math.random()}`; 
    coinEl.className = 'map-coin';
    coinEl.style.left = `${spawnX}px`;
    coinEl.style.top = `${spawnY}px`;
    coinEl.style.zIndex = spawnY + 16; 
    world.appendChild(coinEl);

    coinPositions.push({ x: spawnX, y: spawnY, element: coinEl });
}

function spawnTrees() {
    const world = document.getElementById('gameWorldBackground');
    if (!world) return;
    document.querySelectorAll('.map-tree').forEach(t => t.remove());
    treePositions.forEach(pos => {
        const tree = document.createElement('div');
        tree.className = 'map-tree';
        tree.style.left = `${pos.x}px`;
        tree.style.top = `${pos.y}px`;
        tree.style.zIndex = pos.y;
        world.appendChild(tree);
    });
}

function spawnInitialCoins() {
    const mapSize = 1024;
    while (coinPositions.length < MAX_COINS) {
        let validLocation = false, spawnX = 0, spawnY = 0, attempts = 0;
        while (!validLocation && attempts < 100) {
            attempts++;
            let rawX = Math.floor(Math.random() * mapSize); 
            let rawY = Math.floor(Math.random() * mapSize);
            spawnX = Math.max(80, Math.min(rawX, mapSize - 80));
            spawnY = Math.max(80, Math.min(rawY, mapSize - 80));

            if (spawnX < 140 || spawnX > 880 || spawnY < 140 || spawnY > 860) continue; 

            let isWalkable = true;
            for (let barrier of mapBarriers) {
                if (spawnX < barrier.x + barrier.width + 20 && spawnX + 24 > barrier.x - 20 &&
                    spawnY < barrier.y + barrier.height + 20 && spawnY + 24 > barrier.y - 20) {
                    isWalkable = false;
                    break;
                }
            }
            if (isWalkable) validLocation = true;
        }
        if (!validLocation) continue;
        const world = document.getElementById('gameWorldBackground');
        const coinEl = document.createElement('img');
        coinEl.src = `coin.gif?v=${Date.now()}_${Math.random()}`; 
        coinEl.className = 'map-coin';
        coinEl.style.left = `${spawnX}px`;
        coinEl.style.top = `${spawnY}px`;
        coinEl.style.zIndex = spawnY + 16; 
        world.appendChild(coinEl);
        coinPositions.push({ x: spawnX, y: spawnY, element: coinEl });
    }
}

function isCollidingWithBarriers(targetMapX, targetMapY) {
    const pWidth = 16, pHeight = 16;
    const pX = targetMapX - (pWidth / 2);
    const pY = targetMapY + 4; 
    for (let barrier of mapBarriers) {
        if (pX < barrier.x + barrier.width && pX + pWidth > barrier.x &&
            pY < barrier.y + barrier.height && pY + pHeight > barrier.y) {
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
    let nextWorldX = worldPlayerX;
    let nextWorldY = worldPlayerY;

    const minFenceX = 140; 
    const maxFenceX = 880; 
    const minFenceY = 140; 
    const maxFenceY = 860; 

    if (keysPressed.a) nextWorldX -= moveSpeed;
    if (keysPressed.d) nextWorldX += moveSpeed;
    if (!isCollidingWithBarriers(nextWorldX, worldPlayerY) && nextWorldX >= minFenceX && nextWorldX <= maxFenceX) {
        worldPlayerX = nextWorldX;
    }

    if (keysPressed.w) nextWorldY -= moveSpeed;
    if (keysPressed.s) nextWorldY += moveSpeed;
    if (!isCollidingWithBarriers(worldPlayerX, nextWorldY) && nextWorldY >= minFenceY && nextWorldY <= maxFenceY) {
        worldPlayerY = nextWorldY;
    }

    if (keysPressed.w || keysPressed.s || keysPressed.a || keysPressed.d) {
        isMoving = true;
    }

    if (keyHistory.length > 0) {
        if (keysPressed.w && keysPressed.d) { playerRow = 3; } 
        else if (keysPressed.w && keysPressed.a) { playerRow = 3; } 
        else if (keysPressed.s && keysPressed.d) { playerRow = 4; } 
        else if (keysPressed.s && keysPressed.a) { playerRow = 4; }
        else {
            const currentFacingKey = keyHistory[keyHistory.length - 1];
            if (currentFacingKey === 'w') { playerRow = 6; } 
            else if (currentFacingKey === 's') { playerRow = 5; } 
            else if (currentFacingKey === 'a') { playerRow = 2; } 
            else if (currentFacingKey === 'd') { playerRow = 2; }
        }
    }

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
    // 3. GLITCH-FREE UNIFORM TRANSFORMS
    // ==========================================================================
    playerEl.style.backgroundPosition = `${-(animFrame * FRAME_SIZE)}px ${-(playerRow * FRAME_SIZE)}px`;

    let scaleFactor = 1;
    let alignmentOffsetX = 0;
    let alignmentOffsetY = 0;

    if (document.fullscreenElement) {
        const scaleX = viewWidth / DESIGN_WIDTH;
        const scaleY = viewHeight / DESIGN_HEIGHT;
        scaleFactor = Math.min(Math.min(scaleX, scaleY), 2.0);

        alignmentOffsetX = (viewWidth - (DESIGN_WIDTH * scaleFactor)) / 2;
        alignmentOffsetY = (viewHeight - (DESIGN_HEIGHT * scaleFactor)) / 2;
    }

    if (document.fullscreenElement) {
        camX = (DESIGN_WIDTH / 2) - worldPlayerX;
        camY = (DESIGN_HEIGHT / 2) - worldPlayerY;
    } else {
        camX = (viewWidth / 2) - worldPlayerX;
        camY = (viewHeight / 2) - worldPlayerY;
    }

    let maxMapScrollX = 1024 - DESIGN_WIDTH;
    let maxMapScrollY = 1024 - DESIGN_HEIGHT;
    
    let minScrollLimitX = 0;
    let minScrollLimitY = 0;

    if (document.fullscreenElement) {
        let hPadding = ((viewWidth / scaleFactor) - DESIGN_WIDTH) / 2;
        let vPadding = ((viewHeight / scaleFactor) - DESIGN_HEIGHT) / 2;

        minScrollLimitX = hPadding;
        minScrollLimitY = vPadding;
        maxMapScrollX = 1024 - DESIGN_WIDTH - hPadding;
        maxMapScrollY = 1024 - DESIGN_HEIGHT - vPadding;
    } else {
        maxMapScrollX = 1024 - viewWidth;
        maxMapScrollY = 1024 - viewHeight;
    }

    if (camX > -minScrollLimitX) camX = -minScrollLimitX;
    if (camY > -minScrollLimitY) camY = -minScrollLimitY;

    if (camX < -maxMapScrollX) camX = -maxMapScrollX;
    if (camY < -maxMapScrollY) camY = -maxMapScrollY;

    if (document.fullscreenElement) {
        bgWorld.style.transform = `translate(${alignmentOffsetX}px, ${alignmentOffsetY}px) scale(${scaleFactor}) translate(${camX}px, ${camY}px)`;
    } else {
        bgWorld.style.transform = `scale(1) translate(${camX}px, ${camY}px)`;
    }

    playerEl.style.left = `${worldPlayerX}px`;
    playerEl.style.top = `${worldPlayerY}px`;
    playerEl.style.zIndex = Math.floor(worldPlayerY + 16);

    let facingDirectionTransform = 'scale(2)';
    if (keyHistory.length > 0) {
        if (keysPressed.w && keysPressed.d) facingDirectionTransform = 'scale(2, 2)';
        else if (keysPressed.w && keysPressed.a) facingDirectionTransform = 'scale(-2, 2)';
        else if (keysPressed.s && keysPressed.d) facingDirectionTransform = 'scale(-2, 2)';
        else if (keysPressed.s && keysPressed.a) facingDirectionTransform = 'scale(2, 2)';
        else {
            const currentFacingKey = keyHistory[keyHistory.length - 1];
            if (currentFacingKey === 'w' || currentFacingKey === 's') facingDirectionTransform = 'scale(2)';
            else if (currentFacingKey === 'a') facingDirectionTransform = 'scale(2, 2)';
            else if (currentFacingKey === 'd') facingDirectionTransform = 'scale(-2, 2)';
        }
    }
    playerEl.style.transform = `translate(-50%, -50%) ${facingDirectionTransform}`;

    if (Math.random() < 0.01) spawnCoinOutsideView();

    coinAnimTimer++;
    if (coinAnimTimer >= 45) { 
        coinAnimTimer = 0;
        coinPositions.forEach(coin => {
            const baseSrc = coin.element.src.split('?')[0];
            coin.element.src = `${baseSrc}?v=${Date.now()}_${Math.random()}`;
        });
    }

    coinPositions = coinPositions.filter(coin => {
        const dx = worldPlayerX - (coin.x + 12);
        const dy = (worldPlayerY + 12) - (coin.y + 12);
        if (Math.sqrt(dx * dx + dy * dy) < 26) { 
            coin.element.remove(); 
            
            // 🌟 NEW: Increment score counter state and update layout overlay string
            playerCoins++;
            const counterLabel = document.getElementById('coinScoreValue');
            if (counterLabel) counterLabel.innerText = playerCoins;

            return false; 
        }
        return true; 
    });

    gameLoopId = requestAnimationFrame(runGameTick);
}

// ==========================================================================
// 4. CORE ENGINE LIFECYCLE CONTROLLER
// ==========================================================================
window.initCustomGame = function() {
    isPlaying = false; 
    if (gameLoopId) cancelAnimationFrame(gameLoopId);

    for (let key in keysPressed) keysPressed[key] = false;
    keyHistory = []; 
    
    updateViewportDimensions();
    
    worldPlayerX = 512;
    worldPlayerY = 512;
    playerRow = 5; 
    animFrame = 0;
    animTimer = 0;

    // 🌟 NEW: Reset the score to 0 upon startup/restart clicks
    playerCoins = 0;
    const counterLabel = document.getElementById('coinScoreValue');
    if (counterLabel) counterLabel.innerText = playerCoins;

    spawnTrees();
    document.querySelectorAll('.map-coin').forEach(c => c.remove());
    coinPositions = []; 
    spawnInitialCoins(); 

    isPlaying = true;
    gameLoopId = requestAnimationFrame(runGameTick);
};

window.teleportToSpawn = function() {
    worldPlayerX = 512;
    worldPlayerY = 512;
    playerRow = 5; 
    animFrame = 0;
};

// ==========================================================================
// 5. GLOBAL DOCUMENT INPUT LISTENERS
// ==========================================================================
document.body.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key in keysPressed && !keysPressed[key]) {
        keysPressed[key] = true;
        keyHistory.push(key); 
    }
});

document.body.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (key in keysPressed) {
        keysPressed[key] = false;
        keyHistory = keyHistory.filter(k => k !== key);
    }
});

// ==========================================================================
// 6. DOM COMPONENT ASSETS & INTERFACES FULLSCREEN ENGINE
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    window.toggleFullscreen = function() {
        const gameContainer = document.getElementById('gameViewport'); 
        if (!gameContainer) return;

        if (!document.fullscreenElement) {
            const requestFS = gameContainer.requestFullscreen || gameContainer.webkitRequestFullscreen;
            if (requestFS) {
                requestFS.call(gameContainer).then(() => {
                    setTimeout(updateViewportDimensions, 100);
                });
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().then(() => {
                    setTimeout(updateViewportDimensions, 100);
                });
            }
        }
    };

    document.addEventListener('fullscreenchange', () => {
        updateViewportDimensions();
    });
});
