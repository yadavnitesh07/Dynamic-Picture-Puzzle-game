
function startGame() {
  const nameInput = document.querySelector('input[type="text"]');
  const playerName = nameInput.value.trim();

  if (!playerName) {
    alert("Please enter your name!");
    return;
  }

  // Optionally display name somewhere
  console.log("Player Name:", playerName);

  document.getElementById("welcomeScreen").classList.add("hidden");
  document.getElementById("gameScreen").classList.remove("hidden");
}



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
// Only update preview when sample image is selected
sampleImages.addEventListener("change", function () {
  const selected = this.value;
  if (selected) {
    originalPreview.src = selected;
    originalPreview.classList.remove("hidden");
    imageInput.value = ""; // clear uploaded file input
  } else {
    originalPreview.classList.add("hidden");
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

// ✅ Restrict drag-and-drop to adjacent tiles only
function enableDragAndDrop() {
  let dragged;
  let touchStartTile = null;
  let touchCurrentTile = null;

  tiles.forEach((tile) => {
    // Desktop drag events
    tile.addEventListener("dragstart", (e) => {
      dragged = tile;
    });

    tile.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    tile.addEventListener("drop", (e) => {
      e.preventDefault();
      if (dragged !== tile) {
        swapTiles(dragged, tile);
      }
    });

    // Mobile touch events
    tile.addEventListener("touchstart", (e) => {
      touchStartTile = tile;
      touchCurrentTile = tile;
    });

    tile.addEventListener("touchmove", (e) => {
      e.preventDefault();
      // Find tile currently under touch point
      const touch = e.touches[0];
      const elem = document.elementFromPoint(touch.clientX, touch.clientY);

      if (elem) {
        const tileElem = elem.closest("div[data-position]");
        if (tileElem && tileElem !== touchCurrentTile) {
          touchCurrentTile = tileElem;
        }
      }
    });

    tile.addEventListener("touchend", (e) => {
      if (touchStartTile && touchCurrentTile && touchStartTile !== touchCurrentTile) {
        swapTiles(touchStartTile, touchCurrentTile);
      }
      touchStartTile = null;
      touchCurrentTile = null;
    });
  });

  function swapTiles(tile1, tile2) {
    const draggedIndex = tiles.indexOf(tile1);
    const droppedIndex = tiles.indexOf(tile2);

    const size = parseInt(difficultySelect.value);

    const draggedRow = Math.floor(draggedIndex / size);
    const draggedCol = draggedIndex % size;
    const droppedRow = Math.floor(droppedIndex / size);
    const droppedCol = droppedIndex % size;

    const rowDiff = Math.abs(draggedRow - droppedRow);
    const colDiff = Math.abs(draggedCol - droppedCol);

    if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
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
  }
}


function checkIfSolved() {
  return tiles.every((tile, index) => {
    const correctRow = Math.floor(index / Math.sqrt(tiles.length));
    const correctCol = index % Math.sqrt(tiles.length);
    return tile.dataset.position === `${correctRow}-${correctCol}`;
  });
}


// ✅ Image Preview Setup
const originalPreview = document.getElementById("originalPreview");

// Preview for sample image
sampleImages.addEventListener("change", function () {
  const selected = this.value;
  if (selected) {
    originalPreview.src = selected;
    originalPreview.classList.remove("hidden");
  } else {
    originalPreview.classList.add("hidden");
  }
});

// Preview for uploaded image
imageInput.addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      originalPreview.src = e.target.result;
      originalPreview.classList.remove("hidden");
      sampleImages.value = ""; // clear sample image selection
    };
    reader.readAsDataURL(file);
  } else {
    originalPreview.classList.add("hidden");
  }
});
