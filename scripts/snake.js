// Get the canvas element by its ID
let canvas = document.getElementById('gameCanvas');
// Get the 2D rendering context for the drawing surface of a canvas
let context = canvas.getContext('2d');
// Define the size of a box (a unit in the game grid)
let box = 20;
// Initialize the snake as an empty array
let snake = [];
// Variable to hold the position of the food
let food;
// Variable to hold the current direction of the snake
let d;
// Variable to hold the game interval
let game;
// Get the score counter element
let scoreCounter = document.getElementById('score');
// Variable to hold the score
let score = 0;
// Variables to hold the high score
let highScoreEasy = 0;
let highScoreMedium = 0;
let highScoreHard = 0;
// Create an array to hold the obstacles
let obstacles = [];
// Get the game button
let newGameButton = document.getElementById('startButton');
// Get the pause button
let pauseGameButton = document.getElementById('pauseButton');
// Variable to check if the direction has changed
let directionChanged;
// Get the difficulty select element
let difficultySelect = document.getElementById('difficultySelect')
// Variable to hold the previous difficulty level
let previousDifficulty = difficultySelect.value;
// Variable to hold the speed of the game
let speed;

// Function to reset the game state
function resetGameState() {
    score = 0;
    scoreCounter.textContent = 'Score: ' + score;
    snake.length = 0;
    d = '';
    snake[0] = { x: 10 * box, y: 10 * box };
    obstacles.length = 0;
    document.getElementById('gameOver').style.display = 'none';
    directionChanged = false;
    context.clearRect(0, 0, canvas.width, canvas.height);
    pauseGameButton.style.visibility = 'hidden';
    pauseGameButton.textContent = 'Pause Game';
    removeEventListener('keydown', direction);

    // Clear the game interval if it exists
    if (typeof game !== 'undefined') {
        clearInterval(game);
    }
}

// Function to update the direction based on the key pressed
function direction(event) {
    if (event.keyCode == 37 && d != 'RIGHT' && !directionChanged) {
        d = 'LEFT';
        directionChanged = true;
    } else if (event.keyCode == 38 && d != 'DOWN' && !directionChanged) {
        d = 'UP';
        directionChanged = true;
    } else if (event.keyCode == 39 && d != 'LEFT' && !directionChanged) {
        d = 'RIGHT';
        directionChanged = true;
    } else if (event.keyCode == 40 && d != 'UP' && !directionChanged) {
        d = 'DOWN';
        directionChanged = true;
    }
}

// Function to draw the snake
function drawSnake() {
    // Draw each part of the snake
    for (let i = 0; i < snake.length; i++) {
        if (i == 0) {
            // Draw the head of the snake
            context.beginPath();
            context.arc(snake[i].x + box / 2, snake[i].y + box / 2, box / 2, 0, Math.PI * 2, false);
            context.fillStyle = 'green';
            context.fill();

            // Draw the eyes of the snake
            context.fillStyle = 'yellow';
            context.fillRect(snake[i].x + box / 3, snake[i].y + box / 4, box / 6, box / 6); // Left eye
            context.fillRect(snake[i].x + 2 * box / 3, snake[i].y + box / 4, box / 6, box / 6); // Right eye
        } else if (i == snake.length - 1) {
            // Draw the tail of the snake
            context.beginPath();
            context.arc(snake[i].x + box / 2, snake[i].y + box / 2, box / 4, 0, Math.PI * 2, false);
            context.fillStyle = 'lightgreen';
            context.fill();
        } else {
            // Draw the body of the snake
            context.beginPath();
            context.arc(snake[i].x + box / 2, snake[i].y + box / 2, box / 3, 0, Math.PI * 2, false);
            context.fillStyle = 'lightgreen';
            context.fill();
        }
    }
}

// Function to generate a new obstacle
function generateObstacle(numSquares) {
    let obstacle = [];
    let initialSquare = {
        x: Math.floor(Math.random() * 30 + 1) * box,
        y: Math.floor(Math.random() * 15 + 1) * box
    };
    let collisionWithSnake = snake.some(snakePart => snakePart.x === initialSquare.x && snakePart.y === initialSquare.y);
    let collisionWithObstacle = obstacles.some(obstacle => obstacle.some(square => square.x === initialSquare.x && square.y === initialSquare.y));
    if (!collisionWithSnake && !collisionWithObstacle) {
        obstacle.push(initialSquare);
    }

    let newSquare = initialSquare;
    let direction;

    for (let i = 1; i < numSquares; i++) {
        direction = Math.floor(Math.random() * 4); // Random direction: 0 - right, 1 - down, 2 - left, 3 - up
        switch (direction) {
            case 0: // right
                newSquare = {
                    x: newSquare.x + 1 * box,
                    y: newSquare.y
                };
                break;
            case 1: // down
                newSquare = {
                    x: newSquare.x,
                    y: newSquare.y + 1 * box
                };
                break;
            case 2: // left
                newSquare = {
                    x: newSquare.x - 1 * box,
                    y: newSquare.y
                };
                break;
            case 3: // up
                newSquare = {
                    x: newSquare.x,
                    y: newSquare.y - 1 * box
                };
                break;
        }

        collisionWithSnake = snake.some(snakePart => snakePart.x === newSquare.x && snakePart.y === newSquare.y);
        collisionWithObstacle = obstacles.some(obstacle => obstacle.some(square => square.x === newSquare.x && square.y === newSquare.y));
        if (!collisionWithSnake && !collisionWithObstacle) {
            obstacle.push(newSquare);
        } else {
            i--;
        }
    }

    return obstacle;
}

// Function to generate initial obstacles
function generateInitialObstacles(numObstacles, numSquares) {
    for (let i = 0; i < numObstacles; i++) {
        // Generate a random number of squares for the obstacle
        let obstacle = generateObstacle(Math.floor(Math.random() * numSquares + 1));
        obstacles.push(obstacle);
    }
}

// Function to draw the obstacles
function drawObstacles() {
    for (let i = 0; i < obstacles.length; i++) {
        for (let j = 0; j < obstacles[i].length; j++) {
            context.fillStyle = 'black';
            context.fillRect(obstacles[i][j].x, obstacles[i][j].y, box, box);
        }
    }
}

// Check if the snake has hit an obstacle
function hitObstacle(head, obstacles) {
    for (let i = 0; i < obstacles.length; i++) {
        for (let j = 0; j < obstacles[i].length; j++) {
            if (head.x == obstacles[i][j].x && head.y == obstacles[i][j].y) {
                return true;
            }
        }
    }
    return false;
}

// Function to generate a new food position
function generateFood() {
    while (true) {
        let newFood = {
            x: Math.floor(Math.random() * 30 + 1) * box,
            y: Math.floor(Math.random() * 15 + 3) * box
        };

        let collisionWithSnake = snake.some(snakePart => snakePart.x === newFood.x && snakePart.y === newFood.y);
        let collisionWithObstacle = obstacles.some(obstacle => obstacle.some(square => square.x === newFood.x && square.y === newFood.y));

        if (!collisionWithSnake && !collisionWithObstacle) {
            return newFood;
        }
    }
}

// Function to draw the food
function drawFood() {
    // Draw the apple
    context.beginPath();
    context.ellipse(food.x + box / 2, food.y + box / 2, box / 2, box / 3, 0, 0, Math.PI * 2, false);
    context.fillStyle = 'red';
    context.fill();

    // Draw the apple stem
    context.fillStyle = 'black';
    context.fillRect(food.x + box / 2 - box / 10, food.y, box / 5, box / 4);
}

// Function to check if the snake has eaten the food
function checkFood(snakeX, snakeY) {
    if (snakeX == food.x && snakeY == food.y) {
        document.getElementById('eatSound').play();
        // Increase the score
        score++;
        // Update the score display
        scoreCounter.textContent = 'Score: ' + score;
        // Update the high score display
        updateHighScores();
        return true;
    } else {
        // Remove the tail of the snake
        snake.pop();
        return false;
    }
}

// Function to check if the head of the snake has collided with any part of the snake
function collision(head, array) {
    for (let i = 0; i < array.length; i++) {
        if (head.x == array[i].x && head.y == array[i].y) {
            return true;
        }
    }
    return false;
}

// Function to update the high scores
function updateHighScores() {
    if (previousDifficulty === 'easy' && score > highScoreEasy) {
        highScoreEasy = score;
        document.getElementById('highScoreEasy').textContent = 'High Score (Easy): ' + highScoreEasy;
    } else if (previousDifficulty === 'medium' && score > highScoreMedium) {
        highScoreMedium = score;
        document.getElementById('highScoreMedium').textContent = 'High Score (Medium): ' + highScoreMedium;
    } else if (previousDifficulty === 'hard' && score > highScoreHard) {
        highScoreHard = score;
        document.getElementById('highScoreHard').textContent = 'High Score (Hard): ' + highScoreHard;
    }
}

// Function to draw the game state on each frame
function draw() {
    // Clear the entire canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the snake
    drawSnake();

    // Draw the food
    drawFood();

    // Draw the obstacles
    drawObstacles();

    // Get the current head position of the snake
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    // Update the position of the snake according to the direction
    if (d == 'LEFT') snakeX -= box;
    if (d == 'UP') snakeY -= box;
    if (d == 'RIGHT') snakeX += box;
    if (d == 'DOWN') snakeY += box;

    // Wrap the snake position horizontally on edge of screen
    if (snakeX < 0) {
        snakeX = canvas.width - box;
    } else if (snakeX >= canvas.width) {
        snakeX = 0;
    }

    // Wrap the snake position vertically on edge of screen
    if (snakeY < 0) {
        snakeY = canvas.height - box;
    } else if (snakeY >= canvas.height) {
        snakeY = 0;
    }

    // Check if the snake has eaten the food
    let foodEaten = checkFood(snakeX, snakeY);

    // Create the new head of the snake
    let newHead = {
        x: snakeX,
        y: snakeY
    }

    // Check if the snake has hit the border or itself or an obstacle
    if (collision(newHead, snake) || hitObstacle(newHead, obstacles)) {
        // Stop the game
        clearInterval(game);
        document.getElementById('gameOver').style.display = 'block';
        document.getElementById('gameoverSound').play();
        pauseGameButton.style.visibility = 'hidden';
    }

    // Add the new head to the front of the snake
    snake.unshift(newHead);

    if (foodEaten) {
        // Generate a new food position
        food = generateFood();
    }

    // Reset the direction changed flag
    directionChanged = false;
}

function startGame() {
    // Set the new difficulty level
    previousDifficulty = difficultySelect.value;

    // Reset the game state
    resetGameState();

    // Add an event listener for keydown events
    document.addEventListener('keydown', direction);

    // Show the pause button
    pauseGameButton.style.visibility = 'visible';

    // Adjust the game difficulty
    let obstaclesNum;
    let obstacleSquares;

    switch (difficultySelect.value) {
        case 'easy':
            speed = 200;
            obstaclesNum = 0;
            obstacleSquares = 0;
            break;
        case 'medium':
            speed = 100;
            obstaclesNum = 10;
            obstacleSquares = 3;
            break;
        case 'hard':
            speed = 50;
            obstaclesNum = 15;
            obstacleSquares = 3;
            break;
    }

    // Generate initial obstacles
    generateInitialObstacles(obstaclesNum, obstacleSquares);

    // Generate initial food position
    food = generateFood();

    // Start the game loop
    game = setInterval(draw, speed);
}

// Function to pause the game
function pauseGame() {
    clearInterval(game);
    document.removeEventListener('keydown', direction);
    pauseGameButton.textContent = 'Resume Game';
}

// Function to resume the game
function resumeGame() {
    game = setInterval(draw, speed);
    document.addEventListener('keydown', direction);
    pauseGameButton.textContent = 'Pause Game';
}

// Add event listener to the game button
newGameButton.addEventListener('click', function () {
    startGame();
});

// Add event listener to the pause button
pauseGameButton.addEventListener('click', function () {
    if (pauseGameButton.textContent === 'Pause Game') {
        pauseGame();
    } else {
        resumeGame();
    }
});

// Add event listener to the difficulty select element
difficultySelect.addEventListener('change', function () {
    if (pauseGameButton.style.visibility === 'visible') {
        if (confirm('Are you sure you want to change the difficulty level? Your current game progress will be lost.')) {
            startGame();
            difficultySelect.blur();
        } else {
            difficultySelect.value = previousDifficulty;
        }
    }
});

