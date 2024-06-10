const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    color: '#ff0000',
    dx: 2,
    dy: 5
};

const obstacles = [];
const obstacleWidth = 100;
const obstacleHeight = 20;
const obstacleSpeed = 3;

let gameOver = false;
let score = 0;

document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowLeft') {
        ball.dx = -5;
    } else if (event.key === 'ArrowRight') {
        ball.dx = 5;
    }
});

document.addEventListener('keyup', function(event) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        ball.dx = 0;
    }
});

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(obstacle.x, obstacle.y, obstacleWidth, obstacleHeight);
    });
}

function updateObstacles() {
    obstacles.forEach(obstacle => {
        obstacle.y += obstacleSpeed;

        if (obstacle.y > canvas.height) {
            obstacle.y = -obstacleHeight;
            obstacle.x = Math.random() * (canvas.width - obstacleWidth);
            score++;
        }

        if (ball.x > obstacle.x && ball.x < obstacle.x + obstacleWidth &&
            ball.y + ball.radius > obstacle.y && ball.y - ball.radius < obstacle.y + obstacleHeight) {
            gameOver = true;
        }
    });
}

function createObstacles() {
    for (let i = 0; i < 5; i++) {
        obstacles.push({
            x: Math.random() * (canvas.width - obstacleWidth),
            y: -obstacleHeight * (i + 1) * 3
        });
    }
}

function update() {
    if (gameOver) {
        alert('Game Over! Your score: ' + score);
        document.location.reload();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBall();
    drawObstacles();

    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
    }

    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
    }

    updateObstacles();

    requestAnimationFrame(update);
}

createObstacles();
update();
