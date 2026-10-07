// ======================================================
// A* MAZE HUNTER
// Dynamic Goals + Levels + Increasing Enemy Speed
// ======================================================


// ======================================================
// GAME SETTINGS
// ======================================================

const rows = 10;
const cols = 10;

const board = document.getElementById("game-board");

const scoreElement =
    document.getElementById("score");

const livesElement =
    document.getElementById("lives");

const timerElement =
    document.getElementById("timer");

const levelElement =
    document.getElementById("level");

const messageElement =
    document.getElementById("message");

const restartButton =
    document.getElementById("restartBtn");


// ======================================================
// PLAYER
// ======================================================

let player = {
    row: 1,
    col: 1
};


// ======================================================
// ENEMY
// ======================================================

let enemy = {
    row: 8,
    col: 8
};


// ======================================================
// GOAL
// ======================================================

let goal = {
    row: 8,
    col: 1
};


// ======================================================
// GAME VARIABLES
// ======================================================

let score = 0;

let lives = 3;

let timeLeft = 60;

let level = 1;

let goalNumber = 1;

let gameOver = false;


// ======================================================
// ENEMY TIMER
// ======================================================

let enemyTimer;


// ======================================================
// COUNTDOWN TIMER
// ======================================================

let countdownTimer;


// ======================================================
// A* VARIABLES
// ======================================================

let currentPath = [];

let visitedNodes = [];


// ======================================================
// WALLS
// ======================================================

const walls = [

    // Top border

    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
    [0, 5],
    [0, 6],
    [0, 7],
    [0, 8],
    [0, 9],


    // Bottom border

    [9, 0],
    [9, 1],
    [9, 2],
    [9, 3],
    [9, 4],
    [9, 5],
    [9, 6],
    [9, 7],
    [9, 8],
    [9, 9],


    // Left border

    [1, 0],
    [2, 0],
    [3, 0],
    [4, 0],
    [5, 0],
    [6, 0],
    [7, 0],
    [8, 0],


    // Right border

    [1, 9],
    [2, 9],
    [3, 9],
    [4, 9],
    [5, 9],
    [6, 9],
    [7, 9],
    [8, 9],


    // Internal maze walls

    [2, 2],
    [3, 2],
    [4, 2],

    [4, 3],
    [4, 4],
    [4, 5],

    [2, 6],
    [3, 6],
    [4, 6],

    [6, 4],
    [7, 4],
    [8, 4],

    [6, 6],
    [6, 7],
    [6, 8]

];


// ======================================================
// CHECK WALL
// ======================================================

function isWall(row, col) {

    return walls.some(function(wall) {

        return (
            wall[0] === row &&
            wall[1] === col
        );

    });

}


// ======================================================
// CHECK VALID CELL
// ======================================================

function isValidCell(row, col) {

    return (

        row >= 0 &&
        row < rows &&

        col >= 0 &&
        col < cols &&

        !isWall(row, col)

    );

}


// ======================================================
// MANHATTAN DISTANCE
// ======================================================

function getDistance(
    row1,
    col1,
    row2,
    col2
) {

    return (

        Math.abs(row1 - row2) +

        Math.abs(col1 - col2)

    );

}


// ======================================================
// GENERATE NEW GOAL
// ======================================================

function generateNewGoal() {

    let newRow;

    let newCol;

    let attempts = 0;


    do {

        newRow =
            Math.floor(
                Math.random() * rows
            );

        newCol =
            Math.floor(
                Math.random() * cols
            );


        attempts++;


        if (attempts > 100) {

            newRow = 8;

            newCol = 1;

            break;

        }


    } while (

        // Must not be wall

        !isValidCell(
            newRow,
            newCol
        )


        // Must not be player

        ||

        (
            newRow === player.row &&
            newCol === player.col
        )


        // Must not be enemy

        ||

        (
            newRow === enemy.row &&
            newCol === enemy.col
        )


        // Keep distance from player

        ||

        getDistance(
            newRow,
            newCol,
            player.row,
            player.col
        ) < 5

    );


    goal.row = newRow;

    goal.col = newCol;

}


// ======================================================
// CREATE BOARD
// ======================================================

function createBoard() {

    board.innerHTML = "";


    for (
        let row = 0;
        row < rows;
        row++
    ) {

        for (
            let col = 0;
            col < cols;
            col++
        ) {

            const cell =
                document.createElement("div");


            cell.classList.add("cell");


            // WALL

            if (isWall(row, col)) {

                cell.classList.add("wall");

                cell.textContent = "⬛";

            }


            // PLAYER

            else if (

                row === player.row &&
                col === player.col

            ) {

                cell.classList.add("player");

                cell.textContent = "🟢";

            }


            // ENEMY

            else if (

                row === enemy.row &&
                col === enemy.col

            ) {

                cell.classList.add("enemy");

                cell.textContent = "🔴";

            }


            // GOAL

            else if (

                row === goal.row &&
                col === goal.col

            ) {

                cell.classList.add("goal");

                cell.textContent = "🏁";

            }


            // A* PATH

            else if (

                currentPath.some(
                    function(position) {

                        return (

                            position.row === row &&
                            position.col === col

                        );

                    }
                )

            ) {

                cell.classList.add("path");

                cell.textContent = "•";

            }


            // VISITED NODES

            else if (

                visitedNodes.some(
                    function(position) {

                        return (

                            position.row === row &&
                            position.col === col

                        );

                    }
                )

            ) {

                cell.classList.add("visited");

            }


            // EMPTY

            else {

                cell.classList.add("empty");

            }


            board.appendChild(cell);

        }

    }

}


// ======================================================
// PLAYER MOVEMENT
// ======================================================

function movePlayer(
    rowChange,
    colChange
) {

    if (gameOver) {

        return;

    }


    const newRow =
        player.row + rowChange;


    const newCol =
        player.col + colChange;


    // Board boundary

    if (

        newRow < 0 ||
        newRow >= rows ||

        newCol < 0 ||
        newCol >= cols

    ) {

        return;

    }


    // Wall

    if (isWall(newRow, newCol)) {

        return;

    }


    // Move player

    player.row = newRow;

    player.col = newCol;


    // Clear old path

    currentPath = [];

    visitedNodes = [];


    // Check goal

    checkGoal();


    // Check collision

    checkCollision();


    // Recalculate A*

    if (!gameOver) {

        calculateEnemyPath();

    }


    createBoard();

}


// ======================================================
// KEYBOARD CONTROLS
// ======================================================

document.addEventListener(
    "keydown",
    function(event) {

        switch (event.key) {

            case "ArrowUp":

            case "w":

            case "W":

                movePlayer(-1, 0);

                break;


            case "ArrowDown":

            case "s":

            case "S":

                movePlayer(1, 0);

                break;


            case "ArrowLeft":

            case "a":

            case "A":

                movePlayer(0, -1);

                break;


            case "ArrowRight":

            case "d":

            case "D":

                movePlayer(0, 1);

                break;

        }

    }
);


// ======================================================
// A* NODE
// ======================================================

class Node {

    constructor(row, col) {

        this.row = row;

        this.col = col;


        // Distance from enemy

        this.g = Infinity;


        // Estimated distance to player

        this.h = Infinity;


        // Total cost

        this.f = Infinity;


        // Previous node

        this.parent = null;

    }

}


// ======================================================
// HEURISTIC
// ======================================================

function heuristic(node, target) {

    return (

        Math.abs(
            node.row - target.row
        )

        +

        Math.abs(
            node.col - target.col
        )

    );

}


// ======================================================
// GET NEIGHBOURS
// ======================================================

function getNeighbours(node) {

    const neighbours = [];


    const directions = [

        [-1, 0],

        [1, 0],

        [0, -1],

        [0, 1]

    ];


    for (
        const direction
        of directions
    ) {

        const newRow =
            node.row + direction[0];


        const newCol =
            node.col + direction[1];


        if (
            isValidCell(
                newRow,
                newCol
            )
        ) {

            neighbours.push(
                new Node(
                    newRow,
                    newCol
                )
            );

        }

    }


    return neighbours;

}


// ======================================================
// FIND NODE
// ======================================================

function findNode(
    list,
    row,
    col
) {

    return list.find(
        function(node) {

            return (

                node.row === row &&
                node.col === col

            );

        }
    );

}


// ======================================================
// LOWEST F
// ======================================================

function getLowestFNode(openList) {

    let lowestNode =
        openList[0];


    for (
        let i = 1;
        i < openList.length;
        i++
    ) {

        if (

            openList[i].f <
            lowestNode.f

        ) {

            lowestNode =
                openList[i];

        }

    }


    return lowestNode;

}


// ======================================================
// A* ALGORITHM
// ======================================================

function calculateEnemyPath() {


    // START

    const start =
        new Node(
            enemy.row,
            enemy.col
        );


    // TARGET

    const target =
        new Node(
            player.row,
            player.col
        );


    // OPEN LIST

    const openList = [];


    // CLOSED LIST

    const closedList = [];


    visitedNodes = [];


    // Initial values

    start.g = 0;


    start.h =
        heuristic(
            start,
            target
        );


    start.f =
        start.g +
        start.h;


    openList.push(start);


    // A* LOOP

    while (
        openList.length > 0
    ) {


        // Lowest F node

        const current =
            getLowestFNode(
                openList
            );


        // Remove from open

        const currentIndex =
            openList.indexOf(
                current
            );


        openList.splice(
            currentIndex,
            1
        );


        // Add to closed

        closedList.push(
            current
        );


        // Save visited node

        visitedNodes.push({

            row: current.row,

            col: current.col

        });


        // Target found

        if (

            current.row ===
                target.row &&

            current.col ===
                target.col

        ) {

            currentPath =
                reconstructPath(
                    current
                );

            return;

        }


        // Get neighbours

        const neighbours =
            getNeighbours(
                current
            );


        for (
            const neighbour
            of neighbours
        ) {


            // Already closed?

            const closedNode =
                findNode(
                    closedList,
                    neighbour.row,
                    neighbour.col
                );


            if (closedNode) {

                continue;

            }


            // Calculate G

            const tentativeG =
                current.g + 1;


            // Check open

            const openNode =
                findNode(
                    openList,
                    neighbour.row,
                    neighbour.col
                );


            // New node

            if (!openNode) {

                neighbour.g =
                    tentativeG;


                neighbour.h =
                    heuristic(
                        neighbour,
                        target
                    );


                neighbour.f =
                    neighbour.g +
                    neighbour.h;


                neighbour.parent =
                    current;


                openList.push(
                    neighbour
                );

            }


            // Better path

            else if (
                tentativeG <
                openNode.g
            ) {

                openNode.g =
                    tentativeG;


                openNode.f =
                    openNode.g +
                    openNode.h;


                openNode.parent =
                    current;

            }

        }

    }


    currentPath = [];

}


// ======================================================
// RECONSTRUCT PATH
// ======================================================

function reconstructPath(node) {

    const path = [];


    let current = node;


    while (current !== null) {

        path.push({

            row: current.row,

            col: current.col

        });


        current =
            current.parent;

    }


    path.reverse();


    return path;

}


// ======================================================
// GET ENEMY SPEED
// ======================================================

function getEnemySpeed() {

    /*
        Level 1 → 700 ms
        Level 2 → 600 ms
        Level 3 → 500 ms
        Level 4 → 400 ms
        Level 5 → 300 ms

        Minimum speed = 250 ms
    */


    const speed =
        800 - ((level - 1) * 100);


    return Math.max(
        250,
        speed
    );

}


// ======================================================
// START ENEMY TIMER
// ======================================================

function startEnemyTimer() {

    // Stop previous timer

    clearInterval(
        enemyTimer
    );


    // Get speed based on level

    const enemySpeed =
        getEnemySpeed();


    // Start new timer

    enemyTimer =
        setInterval(
            moveEnemy,
            enemySpeed
        );

}


// ======================================================
// ENEMY MOVEMENT
// ======================================================

function moveEnemy() {

    if (gameOver) {

        return;

    }


    // Calculate A* path

    calculateEnemyPath();


    // No path

    if (
        currentPath.length <= 1
    ) {

        checkCollision();

        createBoard();

        return;

    }


    // Get next position

    const nextPosition =
        currentPath[1];


    // Move enemy

    enemy.row =
        nextPosition.row;

    enemy.col =
        nextPosition.col;


    // Check collision

    checkCollision();


    // Draw board

    createBoard();

}


// ======================================================
// CHECK COLLISION
// ======================================================

function checkCollision() {

    if (

        player.row === enemy.row &&

        player.col === enemy.col

    ) {


        // Lose life

        lives--;


        livesElement.textContent =
            lives;


        messageElement.textContent =
            "💥 Enemy caught you!";


        // Reset player

        player.row = 1;

        player.col = 1;


        // Reset enemy

        enemy.row = 8;

        enemy.col = 8;


        // Clear path

        currentPath = [];

        visitedNodes = [];


        // Game over

        if (lives <= 0) {

            endGame();

        }

    }

}


// ======================================================
// CHECK GOAL
// ======================================================

function checkGoal() {

    if (

        player.row === goal.row &&

        player.col === goal.col

    ) {


        // Score

        score += 100;


        scoreElement.textContent =
            score;


        // Completed goal

        const completedGoal =
            goalNumber;


        // New goal number

        goalNumber++;


        // Increase level

        level++;


        // Update level UI

        levelElement.textContent =
            level;


        // Message

        messageElement.textContent =

            "🎉 Goal " +
            completedGoal +
            " completed! " +

            "🏆 +100 | " +

            "🎯 Level " +
            level;


        // Generate new goal

        generateNewGoal();


        // Clear A* path

        currentPath = [];

        visitedNodes = [];


        // Calculate new path

        calculateEnemyPath();


        // Restart enemy timer
        // with new speed

        startEnemyTimer();

    }

}


// ======================================================
// GAME OVER
// ======================================================

function endGame() {

    gameOver = true;


    clearInterval(
        enemyTimer
    );


    clearInterval(
        countdownTimer
    );


    messageElement.textContent =

        "💀 GAME OVER! " +

        "Final Score: " +
        score;

}


// ======================================================
// TIMER
// ======================================================

function startTimer() {

    countdownTimer =
        setInterval(
            function() {


                if (gameOver) {

                    return;

                }


                timeLeft--;


                timerElement.textContent =
                    timeLeft;


                if (timeLeft <= 0) {

                    endGame();


                    messageElement.textContent =

                        "⏰ Time's up! " +

                        "Final Score: " +
                        score;

                }


            },
            1000
        );

}


// ======================================================
// RESTART GAME
// ======================================================

restartButton.addEventListener(
    "click",
    function() {


        // Stop timers

        clearInterval(
            enemyTimer
        );

        clearInterval(
            countdownTimer
        );


        // Reset player

        player = {

            row: 1,

            col: 1

        };


        // Reset enemy

        enemy = {

            row: 8,

            col: 8

        };


        // Reset goal

        goal = {

            row: 8,

            col: 1

        };


        // Reset score

        score = 0;


        // Reset lives

        lives = 3;


        // Reset time

        timeLeft = 60;


        // Reset level

        level = 1;


        // Reset goal number

        goalNumber = 1;


        // Reset game

        gameOver = false;


        // Clear paths

        currentPath = [];

        visitedNodes = [];


        // Update UI

        scoreElement.textContent =
            score;

        livesElement.textContent =
            lives;

        timerElement.textContent =
            timeLeft;

        levelElement.textContent =
            level;

        messageElement.textContent =
            "";


        // Draw

        createBoard();


        // Start game

        startGame();

    }
);


// ======================================================
// START GAME
// ======================================================

function startGame() {


    // Calculate initial path

    calculateEnemyPath();


    // Draw board

    createBoard();


    // Start enemy

    startEnemyTimer();


    // Start countdown

    startTimer();

}


// ======================================================
// START
// ======================================================

startGame();