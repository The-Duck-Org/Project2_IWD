const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const scoreDisplay = document.getElementById('score');
const timeLeftDisplay = document.getElementById('timeLeft');



let gameInterval;
let timeInterval;
let score = 0;
let timeLeft = 180; 
let character = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 50,
    height: 50,
    dx: 0,
    dy: 0,
    speed: 5,
    direction: 'right'
};
let worms = [];
const wormLifeCycle = 10; 

function startGame() {
    clearInterval(gameInterval);
    clearInterval(timeInterval);


    console.log("Game started");
    let durationDropdown = document.getElementById('gameDuration');
    timeLeft = parseInt(durationDropdown.value, 10);
    console.log("Game started with duration: " + timeLeft + " seconds");
    
    document.getElementById('gameCanvas').style.display = 'block';
    document.getElementById('restartButton').style.display = 'block';
    score = 0;
    timeLeft = 180;
    scoreDisplay.textContent = score;
    timeLeftDisplay.textContent = timeLeft;
    worms = [];
    createWorms(5); 
    startButton.style.display = 'none';
    restartButton.style.display = 'block';
    resetGame();
    gameInterval = setInterval(gameLoop, 1000 / 60); 
    timeInterval = setInterval(updateTime, 1000);
}

function restartGame() {
    clearInterval(gameInterval); 
    timeLeft = parseInt(document.getElementById('gameDuration').value, 10);  
    score = 0;
    scoreDisplay.textContent = score;
    timeLeftDisplay.textContent = timeLeft;
    worms = [];
    createWorms(5);  
    character.x = canvas.width / 2;
    character.y = canvas.height / 2;
    character.dx = 0;
    character.dy = 0;
    gameInterval = setInterval(gameLoop, 1000 / 60); 
    startGame();
}

function updateTime() {
    if (timeLeft > 0) {
        timeLeft--;
        timeLeftDisplay.textContent = timeLeft + " seconds left";
    } else {
        clearInterval(gameInterval);
        clearInterval(timeInterval);
        
        startButton.style.display = 'block';
        restartButton.style.display = 'none';
    }
}

function createWorms(count) {
    for (let i = 0; i < count; i++) {
        worms.push({
            x: Math.random() * (canvas.width - 20) + 10,  
            y: Math.random() * (canvas.height - 20) + 10,
            radius: 15,  
            stage: 1,
            direction: Math.random() * 2 * Math.PI,
            speed: 2  
        });
    }
}

function drawCharacter() {
    ctx.fillStyle = 'blue';
    ctx.fillRect(character.x, character.y, character.width, character.height);
    
    ctx.strokeStyle = 'red';
    ctx.strokeRect(character.x, character.y, character.width, character.height);
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
        ctx.fillStyle = 'sandybrown';
        ctx.beginPath();
        ctx.arc(worm.x, worm.y, worm.radius, 0, Math.PI, true);
        ctx.fill();
    });
} 


function resetGame() {
    clearInterval(gameInterval); 
    timeLeft = parseInt(document.getElementById('gameDuration').value, 10);  
    score = 0;
    scoreDisplay.textContent = score;
    timeLeftDisplay.textContent = timeLeft;
    worms = [];
    createWorms(5); 
    character.x = canvas.width / 2;
    character.y = canvas.height / 2;
    character.dx = 0;
    character.dy = 0;
    gameInterval = setInterval(gameLoop, 1000 / 60); 
}


function gameLoop() {
    console.log("Game Loop Running");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCharacter();
    drawWorms();
    moveCharacter();
    moveWorms();
    console.log(`Character at (${character.x}, ${character.y})`);
    worms.forEach((worm, index) => {
        console.log(`Worm ${index} at (${worm.x}, ${worm.y}) with radius ${worm.radius}`);
    });
    checkCatch();
}

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
            character.dy = -character.speed;
            character.direction = 'up';
            break;
        case 'ArrowDown':
        case 's':
            character.dy = character.speed;
            character.direction = 'down';
            break;
        case 'ArrowLeft':
        case 'a':
            character.dx = -character.speed;
            character.direction = 'left';
            break;
        case 'ArrowRight':
        case 'd':
            character.dx = character.speed;
            character.direction = 'right';
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
});

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);

function drawWorms() {
    worms.forEach(worm => {
        if (worm.stage !== 4) {  
            ctx.fillStyle = 'sandybrown';
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
            }
        }

        
        switch (worm.stage) {
            case 1:
                worm.radius = Math.min(10, worm.radius + 5); 
                break;
            case 2:
                worm.radius = Math.min(20, worm.radius + 10);
                break;
            case 3:
                worm.radius = Math.max(30, worm.radius - 6); 
                break;
        }
    });
}



function checkCatch() {
    console.log("Checking catch...");
    worms.forEach(worm => {
        if (worm.stage !== 4 && isColliding(character, worm)) {
            console.log(`Collision detected with worm at stage ${worm.stage} with radius ${worm.radius}`);
            if (worm.radius >= 10) { 
                worm.stage = 4;
                worm.cycleTime = 0;
                score++;
                scoreDisplay.textContent = score;
                playSound('success');
                console.log("Success in catch");
            } else {
                playSound('fail');
                console.log("Failed to catch, radius too small");
            }
        }
    });
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
    let audioFile = '';  
    if (type === 'success') {
        audioFile = 'resources/hitmarker_2.mp3';  
    } else if (type === 'fail') {
        audioFile = 'resources/quack_5.mp3';  
    }

    console.log(`Playing sound from: ${audioFile}`);
    let audio = new Audio(audioFile);
    audio.play().catch;
}



document.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        checkCatch();
    }
});