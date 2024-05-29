(function () {
    // Get the canvas element and its 2D rendering context
    const canvas = document.getElementById('gameCanvas');
    const context = canvas.getContext('2d');

    // Define the size of each box in the game
    const box = 20;

    // Get the score counter, start button, pause button, and difficulty select elements
    const scoreCounter = document.getElementById('score');
    const newGameButton = document.getElementById('startButton');
    const pauseGameButton = document.getElementById('pauseButton');
    const difficultySelect = document.getElementById('difficultySelect');

    // Initialize variables for the game state
    let game = null;
    let currentDifficulty = difficultySelect.value;
    let highScores = { easy: 0, medium: 0, hard: 0 };
    let pauseGame = null;
    let handleDirectionChange = null;

    // Helper function to capitalize the first letter of a string
    const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

    // Helper function to generate a random integer
    const getRandomInt = (max) => Math.floor(Math.random() * max);

    // Helper function to set the visibility of the pause button
    const setPauseButtonVisibility = (visible) => {
        pauseGameButton.style.visibility = visible ? 'visible' : 'hidden';
    };

    // Helper function to hide an element by its ID
    const hideElementById = (id) => {
        document.getElementById(id).style.display = 'none';
    };

    // Helper function to show an element by its ID
    const showElementById = (id) => {
        document.getElementById(id).style.display = 'block';
    };

    // Function to start the game
    const startGame = () => {
        // Initialize the snake with its initial position
        let snake = [{ x: 10 * box, y: 10 * box }];

        // Initialize the food position, direction, score, and obstacles
        let food;
        let d = '';
        let score = 0;
        let directionChanged = false;
        let obstacles = [];
        let speed;

        // Function to update the score counter
        const updateScore = () => {
            scoreCounter.textContent = `Score: ${score}`;
        };

        // Function to update the high score for the current difficulty level
        const updateHighScore = () => {
            const difficulty = currentDifficulty;
            if (score > highScores[difficulty]) {
                highScores[difficulty] = score;
                document.getElementById(`highScore${capitalize(difficulty)}`).textContent = `${capitalize(difficulty)}: ${score}`;
            }
        };

        // Event handler for direction change
        handleDirectionChange = (event) => {
            if (!directionChanged) {
                switch (event.keyCode) {
                    case 37:
                        if (d !== 'RIGHT') d = 'LEFT';
                        break;
                    case 38:
                        if (d !== 'DOWN') d = 'UP';
                        break;
                    case 39:
                        if (d !== 'LEFT') d = 'RIGHT';
                        break;
                    case 40:
                        if (d !== 'UP') d = 'DOWN';
                        break;
                }
                directionChanged = true;
            }
        };

        // Function to draw the snake on the canvas
        const drawSnake = () => {
            snake.forEach((part, index) => {
                context.fillStyle = index === 0 ? 'green' : 'lightgreen';
                context.beginPath();
                context.arc(part.x + box / 2, part.y + box / 2, box / (index === 0 ? 2 : index === snake.length - 1 ? 4 : 3), 0, Math.PI * 2);
                context.fill();
                if (index === 0) {
                    context.fillStyle = 'yellow';
                    context.fillRect(part.x + box / 3, part.y + box / 4, box / 6, box / 6);
                    context.fillRect(part.x + 2 * box / 3, part.y + box / 4, box / 6, box / 6);
                }
            });
        };

        // Function to generate an obstacle with a specified number of squares
        const generateObstacle = (numSquares) => {
            const obstacle = [];
            let newSquare = { x: (getRandomInt(30) + 1) * box, y: (getRandomInt(15) + 1) * box };
            for (let i = 0; i < numSquares; i++) {
                if (!isCollision(newSquare, snake) && !isCollision(newSquare, obstacles.flat())) {
                    obstacle.push(newSquare);
                    newSquare = getNextSquare(newSquare);
                } else {
                    i--;
                    newSquare = { x: (getRandomInt(30) + 1) * box, y: (getRandomInt(15) + 1) * box };
                }
            }
            return obstacle;
        };

        // Function to get the next square for an obstacle
        const getNextSquare = (currentSquare) => {
            const direction = getRandomInt(4);
            const newSquare = { ...currentSquare };
            switch (direction) {
                case 0:
                    newSquare.x += box;
                    break;
                case 1:
                    newSquare.y += box;
                    break;
                case 2:
                    newSquare.x -= box;
                    break;
                case 3:
                    newSquare.y -= box;
                    break;
            }
            return newSquare;
        };

        // Function to generate the initial obstacles
        const generateInitialObstacles = (numObstacles, numSquares) => {
            for (let i = 0; i < numObstacles; i++) {
                obstacles.push(generateObstacle(numSquares));
            }
        };

        // Function to draw the obstacles on the canvas
        const drawObstacles = () => {
            obstacles.flat().forEach(obstacle => {
                context.fillStyle = 'black';
                context.fillRect(obstacle.x, obstacle.y, box, box);
            });
        };

        // Function to check if there is a collision between the head and any part of the snake or obstacles
        const isCollision = (head, array) => array.some(part => head.x === part.x && head.y === part.y);

        // Function to generate the food position
        const generateFood = () => {
            let newFood;
            do {
                newFood = { x: (getRandomInt(30) + 1) * box, y: (getRandomInt(15) + 3) * box };
            } while (isCollision(newFood, snake) || isCollision(newFood, obstacles.flat()) || isNearObstacle(newFood, obstacles));
            return newFood;
        };

        // Function to check if the food is near an obstacle
        const isNearObstacle = (food, obstacles) => {
            return obstacles.flat().some(obstacle =>
                Math.abs(food.x - obstacle.x) <= box && Math.abs(food.y - obstacle.y) <= box
            );
        };

        // Function to draw the food on the canvas
        const drawFood = () => {
            const centerX = food.x + box / 2;
            const centerY = food.y + box / 2;

            context.beginPath();
            context.ellipse(centerX, centerY, box / 2, box / 3, 0, 0, Math.PI * 2, false);
            context.fillStyle = 'red';
            context.fill();

            context.fillStyle = 'black';
            context.fillRect(centerX - box / 10, food.y, box / 5, box / 4);
        };

        // Function to update the snake position and check for collisions
        const updateSnake = () => {
            const head = { x: snake[0].x, y: snake[0].y };
            let foodEaten = false;
            switch (d) {
                case 'LEFT':
                    head.x -= box;
                    break;
                case 'UP':
                    head.y -= box;
                    break;
                case 'RIGHT':
                    head.x += box;
                    break;
                case 'DOWN':
                    head.y += box;
                    break;
            }

            // Wrap the snake around the canvas if it goes out of bounds
            head.x = (head.x + canvas.width) % canvas.width;
            head.y = (head.y + canvas.height) % canvas.height;

            // Function to check if the snake has eaten the food
            const checkFood = () => {
                if (head.x === food.x && head.y === food.y) {
                    document.getElementById('eatSound').play();
                    score++;
                    updateScore();
                    updateHighScore();
                    return true;
                } else {
                    snake.pop();
                    return false;
                }
            };

            foodEaten = checkFood();

            // Check for collisions with the snake or obstacles
            if (isCollision(head, snake) || isCollision(head, obstacles.flat())) {
                document.getElementById('gameoverSound').play();
                clearInterval(game);
                showElementById('gameOver');
                setPauseButtonVisibility(false);
                return;
            }

            // Update the snake position and generate new food if necessary
            snake.unshift(head);

            if (foodEaten) {
                food = generateFood();
            }
        };

        // Function to draw the game elements on the canvas
        const draw = () => {
            clearCanvas();
            drawSnake();
            drawFood();
            drawObstacles();
        };

        // Function to clear the canvas
        const clearCanvas = () => {
            context.clearRect(0, 0, canvas.width, canvas.height);
        };

        // Function to update the game state
        const updateGame = () => {
            draw();
            updateSnake();
            directionChanged = false;
        };

        // Function to set the game parameters based on the difficulty level
        const setGameParameters = (difficulty) => {
            switch (difficulty) {
                case 'easy':
                    speed = 100;
                    break;
                case 'medium':
                    speed = 100;
                    break;
                case 'hard':
                    speed = 50;
                    break;
            }
        };

        // Function to get the number of obstacles based on the difficulty level
        const getNumObstacles = () => currentDifficulty === 'hard' ? 15 : currentDifficulty === 'medium' ? 10 : 0;

        // Function to get the number of squares for each obstacle based on the difficulty level
        const getNumSquares = () => currentDifficulty === 'hard' ? 3 : currentDifficulty === 'medium' ? 3 : 0;

        // Function to pause or resume the game
        pauseGame = () => {
            if (pauseGameButton.textContent === 'Pause Game') {
                document.removeEventListener('keydown', handleDirectionChange);
                clearInterval(game);
                pauseGameButton.textContent = 'Resume Game';
            } else {
                document.addEventListener('keydown', handleDirectionChange);
                game = setInterval(updateGame, speed);
                pauseGameButton.textContent = 'Pause Game';
            }
        };

        // Hide the game over message and set the initial game state
        hideElementById('gameOver');
        setPauseButtonVisibility(false);
        pauseGameButton.textContent = 'Pause Game';
        if (game) clearInterval(game);
        updateScore();

        // Get the current difficulty level and set the game parameters
        currentDifficulty = difficultySelect.value;
        setGameParameters(currentDifficulty);

        // Generate initial obstacles and food
        generateInitialObstacles(getNumObstacles(), getNumSquares());
        food = generateFood();

        // Add event listeners and start the game
        document.addEventListener('keydown', handleDirectionChange);
        pauseGameButton.addEventListener('click', pauseGame);
        game = setInterval(updateGame, speed);
        setPauseButtonVisibility(true);
    };

    // Event listener for the new game button
    newGameButton.addEventListener('click', () => {
        document.removeEventListener('keydown', handleDirectionChange);
        pauseGameButton.removeEventListener('click', pauseGame);
        startGame();
    });

    // Event listener for the difficulty select element
    difficultySelect.addEventListener('change', function () {
        if (pauseGameButton.style.visibility === 'visible') {
            if (confirm('Are you sure you want to change the difficulty level? Your current game progress will be lost.')) {
                document.removeEventListener('keydown', handleDirectionChange);
                pauseGameButton.removeEventListener('click', pauseGame);
                startGame();
                difficultySelect.blur();
            } else {
                difficultySelect.value = currentDifficulty;
            }
        }
    });
})();
