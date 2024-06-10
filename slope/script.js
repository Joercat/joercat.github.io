const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 20,
    dx: 5,
    dy: 5,
    speed: 5
};

const obstacles = [];
const obstacleFrequency = 50;
let frame = 0;

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#00f';
    ctx.fill();
    ctx.closePath();
}

function createObstacle() {
    const width = 50;
    const height = 20;
    const x = Math.random() * (canvas.width - width);
    const y = 0 - height;
    obstacles.push({ x, y, width, height });
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.fillStyle = '#f00';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

function updateObstacles() {
    obstacles.forEach(obstacle => {
        obstacle.y += ball.speed;

        // Check for collision
        if (
            ball.x < obstacle.x + obstacle.width &&
            ball.x + ball.radius > obstacle.x &&
            ball.y < obstacle.y + obstacle.height &&
            ball.y + ball.radius > obstacle.y
        ) {
            alert("Game Over");
            document.location.reload();
        }
    });

    // Remove off-screen obstacles
    obstacles = obstacles.filter(obstacle => obstacle.y < canvas.height);
}

function updateBall() {
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
    }
    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
    }

    ball.x += ball.dx;
    ball.y += ball.dy;
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    frame++;
    if (frame % obstacleFrequency === 0) {
        createObstacle();
    }

    drawBall();
    drawObstacles();
    updateBall();
    updateObstacles();

    requestAnimationFrame(gameLoop);
}

gameLoop();
