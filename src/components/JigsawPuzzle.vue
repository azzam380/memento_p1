<script setup>
import { ref, onMounted } from 'vue';
import evanImg from '@/assets/img-evan.png';
import linaImg from '@/assets/img-lina.png';
import melissaImg from '@/assets/img-melissa.png';
import sarahImg from '@/assets/img-sarah.png';
import catTankImg from '@/assets/cat-tank.png';
import bgPattern from '@/assets/bg-asteroid.png';

const emit = defineEmits(['back']);

const images = [evanImg, linaImg, melissaImg, sarahImg, catTankImg];
const currentImage = ref('');
const isComplete = ref(false);

const gridSize = 3;
const totalPieces = gridSize * gridSize;
const pieces = ref([]);
const draggedIndex = ref(null);

const initGame = () => {
  // Pick random image
  currentImage.value = images[Math.floor(Math.random() * images.length)];
  
  // Create pieces
  let newPieces = [];
  for (let i = 0; i < totalPieces; i++) {
    const row = Math.floor(i / gridSize);
    const col = i % gridSize;
    newPieces.push({
      id: i,
      // For backgroundPosition in percentages:
      // When size is 300%, positions are 0%, 50%, 100%
      bgPosX: col * 50,
      bgPosY: row * 50,
      rotation: [0, 90, 180, 270][Math.floor(Math.random() * 4)]
    });
  }

  // Shuffle pieces array to randomize positions
  for (let i = newPieces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newPieces[i], newPieces[j]] = [newPieces[j], newPieces[i]];
  }

  pieces.value = newPieces;
  isComplete.value = false;
};

const handlePieceClick = (index) => {
  if (isComplete.value) return;
  pieces.value[index].rotation = (pieces.value[index].rotation + 90) % 360;
  checkWin();
};

let touchStartIndex = null;
const onTouchStart = (e, index) => {
  if (isComplete.value) return;
  touchStartIndex = index;
};

const onTouchMove = (e) => {
  if (isComplete.value) return;
  e.preventDefault(); // Stop page scroll while dragging piece
};

const onTouchEnd = (e) => {
  if (isComplete.value || touchStartIndex === null) return;
  const touch = e.changedTouches[0];
  const target = document.elementFromPoint(touch.clientX, touch.clientY);
  if (target) {
    const pieceEl = target.closest('.puzzle-piece');
    if (pieceEl) {
      const dropIndex = parseInt(pieceEl.dataset.index);
      if (!isNaN(dropIndex) && dropIndex !== touchStartIndex) {
        // Swap pieces
        const temp = pieces.value[touchStartIndex];
        pieces.value[touchStartIndex] = pieces.value[dropIndex];
        pieces.value[dropIndex] = temp;
        checkWin();
      }
    }
  }
  touchStartIndex = null;
};

const handleDragStart = (e, index) => {
  if (isComplete.value) return;
  draggedIndex.value = index;
  // Make it visually clear
  e.dataTransfer.effectAllowed = 'move';
};

const handleDragOver = (e) => {
  if (isComplete.value) return;
  e.preventDefault(); // Necessary to allow dropping
};

const handleDrop = (e, index) => {
  if (isComplete.value) return;
  e.preventDefault();
  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    // Swap the pieces
    const temp = pieces.value[index];
    pieces.value[index] = pieces.value[draggedIndex.value];
    pieces.value[draggedIndex.value] = temp;
    checkWin();
  }
  draggedIndex.value = null;
};

const checkWin = () => {
  const won = pieces.value.every((p, index) => p.id === index && p.rotation === 0);
  if (won) {
    isComplete.value = true;
  }
};

onMounted(() => {
  initGame();
});

</script>

<template>
  <div class="jigsaw-container">
    <div class="jigsaw-header">
      <button class="back-btn" @click="emit('back')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        Back
      </button>
      <h2 class="game-title">Jigsaw Puzzle</h2>
    </div>

    <div class="game-area">
      <div v-if="isComplete" class="victory-message">
        <h2>Quest Complete!</h2>
        <div class="action-buttons">
          <button class="play-again-btn" @click="initGame">Play Again</button>
          <button class="exit-btn" @click="emit('back')">Exit</button>
        </div>
      </div>

      <div class="puzzle-board" :class="{ 'won': isComplete }">
        <div 
          v-for="(piece, index) in pieces" 
          :key="piece.id"
          class="puzzle-piece"
          :data-index="index"
          :draggable="!isComplete"
          @dragstart="(e) => handleDragStart(e, index)"
          @dragover="handleDragOver"
          @drop="(e) => handleDrop(e, index)"
          @touchstart="onTouchStart($event, index)"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
          @click="handlePieceClick(index)"
        >
          <div 
            class="piece-image"
            :style="{
              backgroundImage: `url(${currentImage}), url(${bgPattern})`,
              backgroundPosition: `${piece.bgPosX}% ${piece.bgPosY}%, ${piece.bgPosX}% ${piece.bgPosY}%`,
              backgroundSize: '300% 300%, 300% 300%',
              transform: `rotate(${piece.rotation}deg)`
            }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.jigsaw-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 40px;
  background-color: rgba(10, 5, 20, 0.8);
  border-radius: 12px;
}

.jigsaw-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.back-btn {
  background: rgba(26, 11, 46, 0.6);
  border: 1px solid var(--accent-gold);
  border-radius: 30px;
  padding: 10px 25px;
  color: var(--accent-gold);
  font-family: 'Inter', sans-serif;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.back-btn:hover {
  background: var(--accent-gold);
  color: #1a0b2e;
}

.back-btn svg {
  width: 20px;
}

.game-title {
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  color: #fcf6ba;
  margin: 0;
  flex: 1;
  text-align: center;
  padding-right: 90px; /* Offset to center title visually */
}

.game-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.puzzle-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  width: 90vw;
  max-width: 500px;
  aspect-ratio: 1;
  gap: 2px;
  background-color: #333;
  border: 4px solid var(--accent-gold);
  border-radius: 8px;
  padding: 2px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  transition: all 0.5s ease;
}

.puzzle-board.won {
  gap: 0;
  border-color: #4CAF50;
  box-shadow: 0 10px 40px rgba(76, 175, 80, 0.6);
}

.puzzle-piece {
  width: 100%;
  height: 100%;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  background-color: #222;
  transition: transform 0.1s ease;
}

.puzzle-piece:active {
  transform: scale(0.95);
  z-index: 2;
}

.piece-image {
  width: 100%;
  height: 100%;
  background-size: 300% 300%;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  pointer-events: none; /* Let drag events fall through to puzzle-piece */
}

.victory-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(26, 11, 46, 0.95);
  padding: 40px;
  border-radius: 20px;
  border: 2px solid #4CAF50;
  text-align: center;
  z-index: 10;
  box-shadow: 0 0 50px rgba(76, 175, 80, 0.4);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popIn {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}

.victory-message h2 {
  color: #4CAF50;
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  margin-top: 0;
  margin-bottom: 20px;
}

.play-again-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 12px 30px;
  font-size: 1.2rem;
  font-weight: bold;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.play-again-btn:hover {
  background: #45a049;
  transform: scale(1.05);
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.exit-btn {
  background: rgba(26, 11, 46, 0.8);
  color: var(--accent-gold);
  border: 1px solid var(--accent-gold);
  padding: 12px 30px;
  font-size: 1.2rem;
  font-weight: bold;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.exit-btn:hover {
  background: var(--accent-gold);
  color: #1a0b2e;
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .jigsaw-container {
    padding: 15px;
  }
  .game-title {
    font-size: 1.5rem;
    padding-right: 0;
  }
  .jigsaw-header {
    flex-wrap: wrap;
    justify-content: center;
    gap: 15px;
  }
  .back-btn {
    padding: 8px 15px;
    font-size: 0.9rem;
    margin-right: 0;
    position: absolute;
    left: 15px;
    top: 15px;
  }
  .game-title {
    margin-top: 50px;
  }
  .victory-message {
    width: 90%;
    padding: 20px;
  }
}
</style>
