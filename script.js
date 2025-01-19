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
let dropCounter = 0;
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
    nextPiece.shape