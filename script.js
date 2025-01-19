const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");

const nextCanvas = document.getElementById("nextCanvas");
const nextContext = nextCanvas.getContext("2d");

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

const COLORS = [
    null,
    "cyan", "blue", "orange", "yellow", "green", "purple", "red"
];

const SHAPES = [
    [],
    [[1, 1, 1, 1]],                          // I
    [[2, 0, 0], [2, 2, 2]],                  // J
    [[0, 0, 3], [3, 3, 3]],                  // L
    [[4, 4], [4, 4]],                        // O
    [[0, 5, 5], [5, 5, 0]],                  // S
    [[0, 6, 0], [6, 6, 6]],                  // T
    [[7, 7, 0], [0, 7, 7]]                   // Z
];

let board = createBoard();
let currentPiece = randomPiece();
let nextPiece = randomPiece();
let lastPieceType = null;
let dropInterval = 1000;
let lastTime = 0;
let score = 0;

function createBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function drawBlock(x, y, color, ctx) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
}

function drawBoard() {
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) drawBlock(x, y, COLORS[value], context);
        });
    });
}

function drawPiece(piece, ctx = context) {
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) drawBlock(piece.x + x, piece.y + y, COLORS[value], ctx);
        });
    });
}

function drawNextPiece() {
    nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    nextPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) drawBlock(x, y, COLORS[value], nextContext);
        });
    });
}

function mergePiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) board[currentPiece.y + y][currentPiece.x + x] = value;
        });
    });
}

function clearLines() {
    let cleared = 0;
    board = board.filter(row => {
        if (row.every(value => value !== 0)) {
            cleared++;
            return false;
        }
        return true;
    });
    while (board.length < ROWS) {
        board.unshift(Array(COLS).fill(0));
    }
    score += cleared;
    document.getElementById("score").innerText = `スコア: ${score}`;
    dropInterval = Math.max(200, 1000 - Math.floor(score / 5) * 100); // スピードアップ
}

function collide() {
    return currentPiece.shape.some((row, y) =>
        row.some((value, x) =>
            value &&
            (board[currentPiece.y + y] === undefined ||
             board[currentPiece.y + y][currentPiece.x + x] === undefined ||
             board[currentPiece.y + y][currentPiece.x + x] !== 0)
        )
    );
}

function rotatePiece() {
    const shape = currentPiece.shape.map((row, i) =>
        row.map((_, j) => currentPiece.shape[currentPiece.shape.length - j - 1][i])
    );

    const x = currentPiece.x;
    currentPiece.shape = shape;

    // 壁と衝突した場合は補正
    while (collide()) {
        currentPiece.x += currentPiece.x > COLS / 2 ? -1 : 1;
        if (collide()) {
            currentPiece.shape = shape.map((row, i) =>
                row.map((_, j) => currentPiece.shape[j][row.length - 1 - i])
            ); // 回転を元に戻す
            break;
        }
    }
}

function movePiece(dir) {
    currentPiece.x += dir;
    if (collide()) currentPiece.x -= dir;
}

function dropPiece() {
    currentPiece.y++;
    if (collide()) {
        currentPiece.y--;
        mergePiece();
        clearLines();
        lastPieceType = currentPiece.type;
        currentPiece = nextPiece;

        // 同じタイプが連続で3回出ないよう調整
        do {
            nextPiece = randomPiece();
        } while (nextPiece.type === lastPieceType && nextPiece.type === currentPiece.type);

        if (collide()) {
            board = createBoard(); // ゲームオーバー
            score = 0;
            document.getElementById("score").innerText = `スコア: ${score}`;
        }
    }
}

function randomPiece() {
    const typeId = Math.floor(Math.random() * (SHAPES.length - 1)) + 1;
    return { shape: SHAPES[typeId], x: 4, y: 0, type: typeId };
}

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    if (deltaTime > dropInterval) {
        dropPiece();
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();
    drawPiece(currentPiece);
    drawNextPiece();

    requestAnimationFrame(update);
}

document.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") movePiece(-1);
    if (event.key === "ArrowRight") movePiece(1);
    if (event.key === "ArrowDown") dropPiece();
    if (event.key === "ArrowUp") rotatePiece();
});

// モバイル用ボタン
document.getElementById("left").addEventListener("click", () => movePiece(-1));
document.getElementById("right").addEventListener("click", () => movePiece(1));
document.getElementById("down").addEventListener("click", dropPiece);
document.getElementById("rotate").addEventListener("click", rotatePiece);

update();