// 1. GET THE HTML ELEMENTS
// We use document.getElementById to grab the containers we made in our HTML file.
const target = document.getElementById('gameTarget');
const scoreDisplay = document.getElementById('currentScore');

// We grab the target's "parent" element (the white box container) so we know the boundaries.
const gameBox = target.parentElement; 

// 2. SET UP GAME VARIABLES
// These track the state of our game while it's running.
let gameScore = 0;
let isPlaying = false;

// 3. THE TELEPORT FUNCTION
// This function calculates a random spot inside the box boundaries and moves the target there.
function teleportTarget() {
    if (!isPlaying) return; // Stop if the game isn't actively running

    // Find the max boundaries by subtracting the target's size from the white box size
    const maxX = gameBox.clientWidth - target.clientWidth;
    const maxY = gameBox.clientHeight - target.clientHeight;

    // Math.random() gives a number between 0 and 1. We multiply it by our max boundaries.
    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);

    // Apply the new coordinates to the target element using CSS positioning
    target.style.left = randomX + 'px';
    target.style.top = randomY + 'px';
}

// 4. LISTEN FOR CLICKS ON THE TARGET
// Every time the user clicks down on the target, this block of code runs.
target.addEventListener('mousedown', () => {
    if (!isPlaying) return;

    // Add 1 to the score variable
    gameScore = gameScore + 1;

    // Change the text inside our HTML score span to show the new score
    scoreDisplay.textContent = gameScore;

    // Teleport the target to a brand new random location instantly
    teleportTarget();
});

// 5. HOOKS FOR SCRIPT.JS
// These functions are called by your main script.js when you open or close the mini window.
function initCustomGame() {
    gameScore = 0;                  // Reset score back to zero
    scoreDisplay.textContent = gameScore; // Update the screen display
    isPlaying = true;               // Turn the game mechanics ON
    teleportTarget();               // Jump the target to its first random spot
}

// 🖼️ MINI WINDOW IMAGE UPLOADER LOGIC
const windowImageLoader = document.getElementById('windowImageLoader');
const windowImagePreview = document.getElementById('windowImagePreview');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');

windowImageLoader.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        
        reader.onload = (event) => {
            // Set the image src to the uploaded file data link
            windowImagePreview.src = event.target.result;
            
            // Toggle visibility so the image shows and placeholder text hides
            windowImagePreview.style.display = 'block';
            uploadPlaceholder.style.display = 'none';
        };
        
        reader.readAsDataURL(file);
    }
});
