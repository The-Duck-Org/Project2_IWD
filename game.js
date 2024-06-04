const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const soundToggleButton = document.getElementById('soundToggleButton');
const scoreDisplay = document.getElementById('score');
const timeLeftDisplay = document.getElementById('timeLeft');
const walkSprite = new Image();
const attackSprite = new Image();
walkSprite.src = 'resources/Walk.png';
attackSprite.src = 'resources/Attack_1.png';

const FRAME_WIDTH = 85;
const FRAME_HEIGHT = 200;
const WALK_FRAME_COUNT = 8;
const ATTACK_FRAME_COUNT = 6;

const CHARACTER_WIDTH = 85;
const CHARACTER_HEIGHT = 200;

let gameInterval;
let timeInterval;
let score = 0;
let timeLeft = 180;
let soundEnabled = true;

let character = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: CHARACTER_WIDTH,
    height: CHARACTER_HEIGHT,
    dx: 0,
    dy: 0,
    speed: 5,
    direction: 'right',
    sprite: walkSprite,
    flipped: false,
    isMoving: false,
    isAttacking: false,
    currentFrame: 0,
    frameDelay: 0,
    frameRate: 10
};

let worms = [];
const wormLifeCycle = 10;

const backgroundMusic = {
    '60': new Audio('resources/retro-1.51min.mp3'),
    '180': new Audio('resources/cyberpunk-3min.mp3'),
    '240': new Audio('resources/ournights-4.28min.mp3'),
    '300': new Audio('resources/Corona-5min.mp3')
};

let soundEffects = [];

function startGame() {
    console.log("startGame() called");
    clearInterval(gameInterval);
    clearInterval(timeInterval);

    let durationDropdown = document.getElementById('gameDuration');
    timeLeft = parseInt(durationDropdown.value, 10);
    console.log("Game started with duration: " + timeLeft + " seconds");

    Object.values(backgroundMusic).forEach(music => music.pause());

    if (backgroundMusic[timeLeft] && soundEnabled) {
        backgroundMusic[timeLeft].currentTime = 0;
        backgroundMusic[timeLeft].play();
    }

    document.getElementById('gameCanvas').style.display = 'block';
    document.getElementById('restartButton').style.display = 'block';
    score = 0;
    scoreDisplay.textContent = score;
    timeLeftDisplay.textContent = timeLeft;
    worms = [];
    createWorms(5);
    startButton.style.display = 'none';
    restartButton.style.display = 'block';

    gameInterval = setInterval(gameLoop, 1000 / 60);
    timeInterval = setInterval(updateTime, 1000);
}

function restartGame() {
    console.log("restartGame() called");
    clearInterval(gameInterval);
    clearInterval(timeInterval);
    startGame();
}

function updateTime() {
    if (timeLeft > 0) {
        timeLeft--;
        timeLeftDisplay.textContent = timeLeft + " seconds left";
    } else {
        clearInterval(gameInterval);
        clearInterval(timeInterval);
        showGameOverPopup();
        startButton.style.display = 'block';
        restartButton.style.display = 'none';
        stopAllSounds();
    }
}

function showGameOverPopup() {
    const gameOverPopup = document.getElementById('gameOverPopup');
    const finalScore = document.getElementById('finalScore');
    finalScore.textContent = score;
    gameOverPopup.style.display = "block";

    const closePopup = document.getElementById('closePopup');
    closePopup.onclick = function() {
        gameOverPopup.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == gameOverPopup) {
            gameOverPopup.style.display = "none";
        }
    }
}

function createWorms(count) {
    for (let i = 0; i < count; i++) {
        worms.push({
            x: Math.random() * (canvas.width - 20) + 10,
            y: Math.random() * (canvas.height - 20) + 10,
            radius: 10,
            stage: 1,
            direction: Math.random() * 2 * Math.PI,
            speed: 2,
            cycleTime: 0
        });
    }
}

function drawCharacter() {
    ctx.save();
    ctx.translate(character.x + character.width / 2, character.y + character.height / 2);
    if (character.flipped) {
        ctx.scale(-1, 1);
    }

    let spriteSheet = walkSprite;
    let frameCount = WALK_FRAME_COUNT;

    if (character.isAttacking) {
        spriteSheet = attackSprite;
        frameCount = ATTACK_FRAME_COUNT;
    }

    let frameX = (character.currentFrame % frameCount) * FRAME_WIDTH;

    ctx.drawImage(
        spriteSheet,
        frameX, 0, CHARACTER_WIDTH, CHARACTER_HEIGHT,
        -character.width / 2, -character.height / 2,
        character.width, character.height
    );

    ctx.restore();

    if (character.isMoving || character.isAttacking) {
        character.frameDelay++;
        if (character.frameDelay > character.frameRate) {
            character.frameDelay = 0;
            character.currentFrame++;
            if (character.isAttacking && character.currentFrame >= frameCount) {
                character.isAttacking = false;
                character.currentFrame = 0;
            }
        }
    } else {
        character.currentFrame = 0;
    }
}

function moveCharacter() {
    character.x += character.dx;
    character.y += character.dy;

    if (character.x < 0) character.x = 0;
    if (character.y < 0) character.y = 0;
    if (character.x + character.width > canvas.width) character.x = canvas.width - character.width;
    if (character.y + character.height > canvas.height) character.y = canvas.height - character.height;
}

function drawWorms() {
    worms.forEach(worm => {
        if (worm.stage !== 4) {
            let gradient = ctx.createRadialGradient(worm.x, worm.y, 0, worm.x, worm.y, worm.radius);
            gradient.addColorStop(0, 'sandybrown');
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(worm.x, worm.y, worm.radius, 0, Math.PI, true);
            ctx.fill();
        }
    });
}

function moveWorms() {
    worms.forEach(worm => {
        worm.x += Math.cos(worm.direction) * worm.speed;
        worm.y += Math.sin(worm.direction) * worm.speed;

        if (worm.x < 0 || worm.x > canvas.width || worm.y < 0 || worm.y > canvas.height) {
            worm.direction = Math.random() * 2 * Math.PI;
        }

        worm.cycleTime += 1 / 60;
        if (worm.cycleTime >= wormLifeCycle) {
            worm.cycleTime = 0;
            worm.stage++;
            if (worm.stage > 3) {
                worm.stage = 1;
                worm.x = Math.random() * (canvas.width - 20) + 10;
                worm.y = Math.random() * (canvas.height - 20) + 10;
                worm.radius = 5;
            }
        }

        switch (worm.stage) {
            case 1:
                worm.radius = Math.min(20, worm.radius + 0.1);
                break;
            case 2:
                worm.radius = Math.min(30, worm.radius + 0.5);
                break;
            case 3:
                worm.radius = Math.max(10, worm.radius - 0.3);
                break;
        }
    });
}

function checkCatch() {
    console.log("Checking catch...");
    let caught = false;
    worms.forEach(worm => {
        if (worm.stage !== 4 && isColliding(character, worm)) {
            console.log(`Collision detected with worm at stage ${worm.stage} with radius ${worm.radius}`);
            if (worm.radius >= 10) {
                worm.stage = 4;
                worm.cycleTime = 0;
                score++;
                scoreDisplay.textContent = score;
                playSound('success');
                caught = true;
                console.log("Success in catch");
            }
        }
    });
    if (!caught && character.isAttacking) {
        playSound('fail');
        console.log("Failed to catch, radius too small");
    }
}

function isColliding(rect, circle) {
    let rectCenterX = rect.x + rect.width / 2;
    let rectCenterY = rect.y + rect.height / 2;
    let circleTopX = circle.x;
    let circleTopY = circle.y - circle.radius;

    let dx = rectCenterX - circleTopX;
    let dy = rectCenterY - circleTopY;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < (rect.width / 2 + circle.radius) && rectCenterY <= circle.y) {
        return true;
    }
    return false;
}

function playSound(type) {
    if (!soundEnabled) return;

    let audioFile = '';
    if (type === 'success') {
        audioFile = 'resources/hitmarker_2.mp3';
    } else if (type === 'fail') {
        audioFile = 'resources/quack_5.mp3';
    }

    console.log(`Playing sound from: ${audioFile}`);
    let audio = new Audio(audioFile);
    soundEffects.push(audio);
    audio.play().catch((e) => {
        console.error('Error playing sound:', e);
    });
}

function stopAllSounds() {
    Object.values(backgroundMusic).forEach(music => music.pause());
    soundEffects.forEach(effect => effect.pause());
    soundEffects = [];
}

soundToggleButton.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    if (!soundEnabled) {
        stopAllSounds();
    } else {
        let durationDropdown = document.getElementById('gameDuration');
        if (backgroundMusic[timeLeft]) {
            backgroundMusic[timeLeft].currentTime = 0;
            backgroundMusic[timeLeft].play();
        }
    }
});

document.addEventListener('keydown', (e) => {
    character.isMoving = true;
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
            character.dy = -character.speed;
            character.direction = 'up';
            character.flipped = false;
            break;
        case 'ArrowDown':
        case 's':
            character.dy = character.speed;
            character.direction = 'down';
            character.flipped = false;
            break;
        case 'ArrowLeft':
        case 'a':
            character.dx = -character.speed;
            character.direction = 'left';
            character.flipped = true;
            break;
        case 'ArrowRight':
        case 'd':
            character.dx = character.speed;
            character.direction = 'right';
            character.flipped = false;
            break;
        case ' ':
            if (!character.isAttacking) {
                character.isAttacking = true;
                character.currentFrame = 0;
                checkCatch();
            }
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'ArrowDown':
        case 's':
            character.dy = 0;
            break;
        case 'ArrowLeft':
        case 'a':
        case 'ArrowRight':
        case 'd':
            character.dx = 0;
            break;
    }
    character.isMoving = character.dx !== 0 || character.dy !== 0;
});

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCharacter();
    drawWorms();
    moveCharacter();
    moveWorms();
}

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);
