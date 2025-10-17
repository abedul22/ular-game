document.addEventListener('DOMContentLoaded', () => {
    // --- Elemen DOM ---
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('highScore');
    const gameOverScreen = document.getElementById('gameOverScreen');
    const finalScoreElement = document.getElementById('finalScore');
    const restartButton = document.getElementById('restartButton');

    // --- Elemen Kontrol Mobile ---
    const upBtn = document.getElementById('upBtn');
    const downBtn = document.getElementById('downBtn');
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');

    // --- Konstanta & Variabel Game ---
    const GRID_SIZE = 20;
    let CELL_SIZE, canvasSize;
    
    let snake, food, dx, dy, score, highScore;
    let gameRunning = false;
    let lastRenderTime = 0;
    const GAME_SPEED = 100; // ms per gerakan

    // --- FUNGSI INISIALISASI ---
    function initGame() {
        setupCanvas(); // Atur ukuran canvas terlebih dahulu
        
        snake = [{ x: 10, y: 10 }];
        dx = 0;
        dy = 0;
        food = createFood();
        score = 0;
        scoreElement.textContent = score;
        gameOverScreen.classList.add('hidden');
        loadHighScore();
        
        gameRunning = true;
        window.requestAnimationFrame(gameLoop);
    }

    // --- FUNGSI UTAMA GAME LOOP ---
    function gameLoop(currentTime) {
        if (!gameRunning) return;

        window.requestAnimationFrame(gameLoop);

        const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000;
        if (secondsSinceLastRender < GAME_SPEED / 1000) return;
        
        lastRenderTime = currentTime;

        update();
        draw();
    }
    
    function update() {
        if (didGameEnd()) {
            endGame();
            return;
        }
        moveSnake();
        checkFoodCollision();
    }

    function draw() {
        clearCanvas();
        drawFood();
        drawSnake();
    }

    // --- FUNGSI GAMBAR & LOGIKA ---
    function setupCanvas() {
        // Untuk mobile, gunakan lebar container. Untuk desktop, gunakan 400px.
        const isMobile = window.innerWidth < 768;
        canvasSize = isMobile ? canvas.offsetWidth : 400;
        canvas.width = canvasSize;
        canvas.height = canvasSize;
        CELL_SIZE = canvasSize / GRID_SIZE;
    }

    function clearCanvas() {
        ctx.fillStyle = '#1a252f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawSnake() {
        snake.forEach(segment => {
            ctx.fillStyle = '#2ecc71';
            ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE - 2, CELL_SIZE - 2);
        });
    }

    function drawFood() {
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(food.x * CELL_SIZE + CELL_SIZE / 2, food.y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
    }

    function moveSnake() {
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };
        snake.unshift(head);

        if (head.x !== food.x || head.y !== food.y) {
            snake.pop();
        }
    }

    function checkFoodCollision() {
        const head = snake[0];
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            scoreElement.textContent = score;
            food = createFood();
        }
    }

    function createFood() {
        let newFoodPosition;
        while (true) {
            newFoodPosition = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE)
            };
            if (!snake.some(segment => segment.x === newFoodPosition.x && segment.y === newFoodPosition.y)) {
                break;
            }
        }
        return newFoodPosition;
    }

    function didGameEnd() {
        const head = snake[0];
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
            return true;
        }
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                return true;
            }
        }
        return false;
    }

    // --- FUNGSI KONTROL ---
    function changeDirection(newDx, newDy) {
        // Mencegah ular berbalik arah 180 derajat
        if (dx === -newDx && dy === -newDy) return;
        dx = newDx;
        dy = newDy;
    }

    // --- EVENT LISTENER ---
    // Kontrol Keyboard (Desktop)
    document.addEventListener('keydown', (e) => {
        if (!gameRunning) return;
        switch (e.keyCode) {
            case 37: changeDirection(-1, 0); break; // Kiri
            case 38: changeDirection(0, -1); break; // Atas
            case 39: changeDirection(1, 0); break;  // Kanan
            case 40: changeDirection(0, 1); break;  // Bawah
        }
    });

    // Kontrol Sentuh (Mobile)
    const handleTouch = (e, direction) => {
        e.preventDefault(); // Mencegah scroll
        if (!gameRunning) return;
        switch (direction) {
            case 'up': changeDirection(0, -1); break;
            case 'down': changeDirection(0, 1); break;
            case 'left': changeDirection(-1, 0); break;
            case 'right': changeDirection(1, 0); break;
        }
    };

    upBtn.addEventListener('touchstart', (e) => handleTouch(e, 'up'));
    downBtn.addEventListener('touchstart', (e) => handleTouch(e, 'down'));
    leftBtn.addEventListener('touchstart', (e) => handleTouch(e, 'left'));
    rightBtn.addEventListener('touchstart', (e) => handleTouch(e, 'right'));

    // Event listener untuk window resize (misalnya rotasi layar)
    window.addEventListener('resize', () => {
        if (gameRunning) {
            setupCanvas();
            draw(); // Gambar ulang dengan ukuran baru
        }
    });

    // --- FUNGSI AKHIR GAME ---
    function endGame() {
        gameRunning = false;
        finalScoreElement.textContent = score;
        gameOverScreen.classList.remove('hidden');
        saveHighScore();
    }

    function saveHighScore() {
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            highScoreElement.textContent = highScore;
        }
    }

    function loadHighScore() {
        highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
        highScoreElement.textContent = highScore;
    }

    restartButton.addEventListener('click', initGame);

    // --- MULAI GAME ---
    initGame();
});