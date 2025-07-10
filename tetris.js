const grid = document.getElementById('tetris-grid');
const scoreDisplay = document.getElementById('score');
const width = 10;
let squares = [];
let currentPosition = 4;
let currentRotation = 0;
let timerId;
let score = 0;

// Crear la cuadrícula
function createGrid() {
  for (let i = 0; i < 200; i++) {
    const cell = document.createElement('div');
    grid.appendChild(cell);
    squares.push(cell);
  }
  // Crear fila invisible para detectar colisiones en la base
  for (let i = 0; i < width; i++) {
    const cell = document.createElement('div');
    cell.classList.add('taken');
    grid.appendChild(cell);
    squares.push(cell);
  }
}

// Definición de las piezas y sus rotaciones
const lTetromino = [
  [1, width + 1, width * 2 + 1, 2],
  [width, width + 1, width + 2, width * 2 + 2],
  [1, width + 1, width * 2 + 1, width * 2],
  [width, width * 2, width * 2 + 1, width * 2 + 2]
];

const zTetromino = [
  [0, width, width + 1, width * 2 + 1],
  [width + 1, width + 2, width * 2, width * 2 + 1],
  [0, width, width + 1, width * 2 + 1],
  [width + 1, width + 2, width * 2, width * 2 + 1]
];

const tTetromino = [
  [1, width, width + 1, width + 2],
  [1, width + 1, width + 2, width * 2 + 1],
  [width, width + 1, width + 2, width * 2 + 1],
  [1, width, width + 1, width * 2 + 1]
];

const oTetromino = [
  [0, 1, width, width + 1],
  [0, 1, width, width + 1],
  [0, 1, width, width + 1],
  [0, 1, width, width + 1]
];

const iTetromino = [
  [1, width + 1, width * 2 + 1, width * 3 + 1],
  [width, width + 1, width + 2, width + 3],
  [1, width + 1, width * 2 + 1, width * 3 + 1],
  [width, width + 1, width + 2, width + 3]
];

const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino];

// Elegir pieza aleatorio
let random = Math.floor(Math.random() * theTetrominoes.length);
let current = theTetrominoes[random][currentRotation];

// Dibuja la pieza actual
function draw() {
  current.forEach(index => squares[currentPosition + index].classList.add('tetromino'));
}

// Quita la pieza actual
function undraw() {
  current.forEach(index => squares[currentPosition + index].classList.remove('tetromino'));
}

// Mueve la pieza hacia abajo
function moveDown(manual = false) {
  undraw();
  currentPosition += width;
  draw();
  freeze();

  // Si fue por el usuario (teclado o swipe), suma puntos por "soft drop"
  if (manual) {
    score += 1;
    scoreDisplay.textContent = score;
  }
}


// Congela la pieza y genera una nueva si toca el suelo o piezas tomadas
function freeze() {
  if (current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
    current.forEach(index => squares[currentPosition + index].classList.add('taken'));
    random = Math.floor(Math.random() * theTetrominoes.length);
    currentRotation = 0;
    current = theTetrominoes[random][currentRotation];
    currentPosition = 4;
    draw();
    addScore();
    gameOver();
  }
}

// Mueve la pieza a la izquierda
function moveLeft() {
  undraw();
  const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);
  if (!isAtLeftEdge) currentPosition -= 1;
  if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
    currentPosition += 1;
  }
  draw();
}

// Mueve la pieza a la derecha
function moveRight() {
  undraw();
  const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);
  if (!isAtRightEdge) currentPosition += 1;
  if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
    currentPosition -= 1;
  }
  draw();
}

// Rota la pieza
function rotate() {
  undraw();
  currentRotation++;
  if (currentRotation === current.length) currentRotation = 0;
  current = theTetrominoes[random][currentRotation];
  draw();
}

// Añade puntuación y elimina líneas completas
function addScore() {
  let linesCleared = 0;

  for (let i = 0; i < 199; i += width) {
    const row = Array.from({ length: width }, (_, j) => i + j);
    if (row.every(index => squares[index].classList.contains('taken'))) {
      linesCleared++;
      row.forEach(index => {
        squares[index].classList.remove('taken', 'tetromino');
      });
      const removed = squares.splice(i, width);
      squares = removed.concat(squares);
      squares.forEach(cell => grid.appendChild(cell));
    }
  }

  // Puntuación basada en cantidad de líneas
  if (linesCleared === 1) score += 50;
  else if (linesCleared === 2) score += 100;
  else if (linesCleared === 3) score += 200;
  else if (linesCleared >= 4) score += 400;

  scoreDisplay.textContent = score;
}


function gameOver() {
  if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
    clearInterval(timerId);
    detenerMusica(); // Detener música al perder
    alert(`💀 GAME OVER 💀\nTu puntaje fue: ${score}`);
  }
}


// Control por teclado
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') moveLeft();
  else if (e.key === 'ArrowRight') moveRight();
  else if (e.key === 'ArrowDown') moveDown(true);
  else if (e.key === 'ArrowUp') rotate();
});

// Control táctil para móvil
let touchStartX = 0;
let touchStartY = 0;

document.body.addEventListener('touchstart', (e) => {
  const touch = e.changedTouches[0];
  touchStartX = touch.screenX;
  touchStartY = touch.screenY;
});

document.body.addEventListener('touchend', (e) => {
  const touch = e.changedTouches[0];
  const deltaX = touch.screenX - touchStartX;
  const deltaY = touch.screenY - touchStartY;
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  if (absX < 10 && absY < 10) {
    rotate(); // Tap para rotar
  } else if (absX > absY) {
    deltaX > 0 ? moveRight() : moveLeft(); 
  } else {
    if (deltaY > 0) moveDown(true);
 
  }
});

// Inicia el juego
function startGame() {
  grid.innerHTML = '';
  squares = [];
  score = 0;
  scoreDisplay.textContent = score;
  createGrid();
  currentPosition = 4;
  currentRotation = 0;
  random = Math.floor(Math.random() * theTetrominoes.length);
  current = theTetrominoes[random][currentRotation];
  draw();
  clearInterval(timerId);
  timerId = setInterval(moveDown, 500);
  iniciarMusica(); 
}


// Crear cuadrícula al cargar
createGrid();
window.addEventListener("keydown", function(e) {
  if(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.key)) {
    e.preventDefault();
  }
}, false);



//para la musica del tetris
const musica = document.getElementById("musicaFondo");

// Iniciar música al comenzar el juego
function iniciarMusica() {
  musica.currentTime = 0; 
  musica.play().catch(() => {
    console.log("🎵 El usuario debe interactuar primero para reproducir la música.");
  });
}

// Detener música al perder
function detenerMusica() {
  musica.pause();
  musica.currentTime = 0; 
}

// Alternar manualmente con botón (opcional)
function toggleMusica() {
  if (musica.paused) {
    musica.play();
  } else {
    musica.pause();
  }
}

