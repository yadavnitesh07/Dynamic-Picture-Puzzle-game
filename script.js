const puzzleContainer = document.getElementById("puzzleContainer");
const moveCounter = document.getElementById("moveCounter");
const timerDisplay = document.getElementById("timer");
const successMsg = document.getElementById("successMsg");
const startBtn = document.getElementById("startBtn");
const imageInput = document.getElementById("imageUpload");
const difficultySelect = document.getElementById("difficulty");
const sampleImages = document.getElementById("sampleImages");

let tiles = [];
let moveCount = 0;
let seconds = 0;
let timer = null;

// Sample Image Selection Logic
sampleImages.addEventListener("change", function () {
  const selectedImage = this.value;
  if (selectedImage) {
    const img = new Image();
    img.onload = function () {
      const size = parseInt(difficultySelect.value);
      createPuzzle(img, size);
    };
    img.src = selectedImage;
  }
});

// Start button click: Upload image or use sample image
startBtn.addEventListener("click", () => {
  const file = imageInput.files[0];
  const size = parseInt(difficultySelect.value);

  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image();
      img.onload = function () {
        createPuzzle(img, size);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  } else if (sampleImages.value) {
    const img = new Image();
    img.onload = function () {
      createPuzzle(img, size);
    };
    img.src = sampleImages.value;
  } else {
    alert("Please upload an image or select a sample one.");
  }
});

function createPuzzle(image, size) {
  puzzleContainer.innerHTML = "";
  successMsg.classList.add("hidden");

  moveCount = 0;
  seconds = 0;
  moveCounter.textContent = moveCount;
  timerDisplay.textContent = seconds;

  clearInterval(timer);
  timer = setInterval(() => {
    seconds++;
    timerDisplay.textContent = seconds;
  }, 1000);

  const containerSize = Math.min(window.innerWidth * 0.9, 500);
  const tileSize = Math.floor(containerSize / size);

  puzzleContainer.style.backgroundColor = "#111";  // dark but not fully black
  puzzleContainer.style.width = `${containerSize}px`;
  puzzleContainer.style.height = `${containerSize}px`;
  puzzleContainer.style.display = "grid";
  puzzleContainer.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  puzzleContainer.style.gridTemplateRows = `repeat(${size}, 1fr)`;
  puzzleContainer.style.gap = "2px";

  const canvas = document.createElement("canvas");
  canvas.width = containerSize;
  canvas.height = containerSize;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  tiles = [];

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const tileCanvas = document.createElement("canvas");
      tileCanvas.width = tileSize;
      tileCanvas.height = tileSize;
      const tileCtx = tileCanvas.getContext("2d");

      tileCtx.drawImage(
        canvas,
        col * tileSize,
        row * tileSize,
        tileSize,
        tileSize,
        0,
        0,
        tileSize,
        tileSize
      );

      const tile = document.createElement("div");
      tile.className = "border-2 border-white hover:border-yellow-400 transition cursor-pointer shadow-md rounded-sm";

      tile.style.width = "100%";
      tile.style.aspectRatio = "1 / 1";
      tile.draggable = true;
      tile.dataset.position = `${row}-${col}`;

      tile.innerHTML = `<img src="${tileCanvas.toDataURL()}" class="w-full h-full object-cover rounded-sm" draggable="false">`;

      tiles.push(tile);
    }
  }

  shuffleArray(tiles);
  tiles.forEach((tile) => puzzleContainer.appendChild(tile));
  enableDragAndDrop();
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function enableDragAndDrop() {
  let dragged;

  tiles.forEach((tile) => {
    tile.addEventListener("dragstart", (e) => {
      dragged = tile;
    });

    tile.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    tile.addEventListener("drop", (e) => {
      e.preventDefault();
      if (dragged !== tile) {
        const draggedIndex = tiles.indexOf(dragged);
        const droppedIndex = tiles.indexOf(tile);

        [tiles[draggedIndex], tiles[droppedIndex]] = [tiles[droppedIndex], tiles[draggedIndex]];

        puzzleContainer.innerHTML = "";
        tiles.forEach((t) => puzzleContainer.appendChild(t));

        moveCount++;
        moveCounter.textContent = moveCount;

        if (checkIfSolved()) {
          clearInterval(timer);
          successMsg.classList.remove("hidden");
        }
      }
    });
  });
}

function checkIfSolved() {
  return tiles.every((tile, index) => {
    const correctRow = Math.floor(index / Math.sqrt(tiles.length));
    const correctCol = index % Math.sqrt(tiles.length);
    return tile.dataset.position === `${correctRow}-${correctCol}`;
  });
}
