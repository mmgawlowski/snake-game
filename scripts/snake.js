// Get the canvas element by its ID
let canvas = document.getElementById("gameCanvas");
// Get the 2D rendering context for the drawing surface of a canvas
let context = canvas.getContext("2d");
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
// Variable to hold the score
let score = 0;
// Variable to hold the high score
let highScore = 0;
// Create an array to hold the obstacles
let obstacles = [];

// Add an event listener for keydown events
document.addEventListener("keydown", direction);

// Function to update the direction based on the key pressed
function direction(event) {
    if (event.keyCode == 37 && d != "RIGHT") {
        d = "LEFT";
    } else if (event.keyCode == 38 && d != "DOWN") {
        d = "UP";
    } else if (event.keyCode == 39 && d != "LEFT") {
        d = "RIGHT";
    } else if (event.keyCode == 40 && d != "UP") {
        d = "DOWN";
    }
}

// Function to generate a new obstacle
function generateObstacle() {
    return {
        x: Math.floor(Math.random() * 15 + 1) * box,
        y: Math.floor(Math.random() * 15 + 1) * box
    };
}

// Function to generate initial obstacles
function generateInitialObstacles(numObstacles) {
    for (let i = 0; i < numObstacles; i++) {
        obstacles.push(generateObstacle());
    }
}

// Draw the obstacles
function drawObstacles() {
    for (let i = 0; i < obstacles.length; i++) {
        context.fillStyle = "black";
        context.fillRect(obstacles[i].x, obstacles[i].y, box, box);
    }
}

// Check if the snake has hit an obstacle
function hitObstacle(head, obstacles) {
    for (let i = 0; i < obstacles.length; i++) {
        if (head.x == obstacles[i].x && head.y == obstacles[i].y) {
            return true;
        }
    }
    return false;
}

// Function to generate a new food position
function generateFood() {
    while (true) {
        let newFood = {
            x: Math.floor(Math.random() * 17 + 1) * box,
            y: Math.floor(Math.random() * 15 + 3) * box
        };

        let collisionWithSnake = snake.some(snakePart => snakePart.x === newFood.x && snakePart.y === newFood.y);
        let collisionWithObstacle = obstacles.some(obstacle => obstacle.x === newFood.x && obstacle.y === newFood.y);

        if (!collisionWithSnake && !collisionWithObstacle) {
            return newFood;
        }
    }
}

// Function to draw the food
function drawFood() {
    context.fillStyle = "red";
    context.fillRect(food.x, food.y, box, box);
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

// Function to draw the game state on each frame
function draw() {
    // Clear the entire canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw each part of the snake
    for (let i = 0; i < snake.length; i++) {
        // The head of the snake is green, the rest of the body is light green
        context.fillStyle = (i == 0) ? "green" : "lightgreen";
        // Draw a box for this part of the snake
        context.fillRect(snake[i].x, snake[i].y, box, box);
    }

    // Draw the food
    drawFood();

    // Draw the obstacles
    drawObstacles();

    // Get the current head position of the snake
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    // Update the position of the snake according to the direction
    if (d == "LEFT") snakeX -= box;
    if (d == "UP") snakeY -= box;
    if (d == "RIGHT") snakeX += box;
    if (d == "DOWN") snakeY += box;

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
    if (snakeX == food.x && snakeY == food.y) {
        document.getElementById('eatSound').play();
        // Generate new food position
        food = generateFood();
        // Increase the score
        score++;
        // Update the score display
        document.getElementById('score').innerHTML = 'Score: ' + score;
        // Check if the current score is higher than the high score and update high score if needed
        if (score > highScore) {
            highScore = score;
            document.getElementById('highScore').innerText = 'High Score: ' + highScore;
        }
    } else {
        // Remove the tail of the snake
        snake.pop();
    }

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
    }

    // Add the new head to the front of the snake
    snake.unshift(newHead);
}

function startGame() {
    // Reset the game state
    score = 0;
    document.getElementById('score').innerHTML = 'Score: ' + score;
    snake.length = 0;
    d = '';
    snake[0] = { x: 10 * box, y: 10 * box };
    obstacles.length = 0;
    document.getElementById('gameOver').style.display = 'none';

    // Get the difficulty level selected by the user
    let difficulty = document.getElementById('difficultySelect').value;
    let speed;
    let obstaclesNum;
    switch (difficulty) {
        case 'easy':
            speed = 200;
            obstaclesNum = 0;
            break;
        case 'medium':
            speed = 100;
            obstaclesNum = 5;
            break;
        case 'hard':
            speed = 50;
            obstaclesNum = 10;
            break;
    }
    
    // Generate initial obstacles
    generateInitialObstacles(obstaclesNum);
    
    // Generate initial food position
    food = generateFood();

    // Clear the game interval if it exists
    if (typeof game !== 'undefined') {
        clearInterval(game);
    }

    // Start the game loop
    game = setInterval(draw, speed);
}

// Add an event listener for the start button
document.getElementById('startButton').addEventListener('click', startGame);