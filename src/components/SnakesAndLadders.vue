<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import gsap from 'gsap';
import evanImg from '@/assets/img-evan.png';
import sarahImg from '@/assets/img-sarah.png';

const emit = defineEmits(['back']);

// Board state
const gridSize = 10;
const totalCells = gridSize * gridSize;

// Maps: Easy, Medium, Hard
const maps = [
  // Easy
  {
    snakes: { 16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 98: 79 },
    ladders: { 1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 97 }
  },
  // Medium
  {
    snakes: { 16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 79 },
    ladders: { 1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 97 }
  },
  // Hard
  {
    snakes: { 14: 4, 19: 8, 24: 1, 34: 12, 45: 25, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 79, 99: 10 },
    ladders: { 2: 38, 21: 42, 28: 84, 51: 67, 71: 91, 80: 97 }
  }
];

const currentSnakes = ref({});
const currentLadders = ref({});

const initMap = () => {
  const map = maps[Math.floor(Math.random() * maps.length)];
  currentSnakes.value = map.snakes;
  currentLadders.value = map.ladders;
};

// Game State
const playerPos = ref(0);
const botPos = ref(0);
const isPlayerTurn = ref(true);
const diceValue = ref(1);
const isRolling = ref(false);
const gameStatus = ref('playing'); // playing, player_won, bot_won
const logMessages = ref(['Welcome to Snakes and Ladders!']);

const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    if (type === 'win') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.5);
      osc.start();
      gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 1.5);
      osc.stop(ctx.currentTime + 1.5);
    } else if (type === 'lose') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.8);
      osc.start();
      gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 1.5);
      osc.stop(ctx.currentTime + 1.5);
    }
  } catch (err) {
    console.log("Audio not supported or blocked");
  }
};

const addLog = (msg) => {
  logMessages.value.unshift(msg);
  if (logMessages.value.length > 5) logMessages.value.pop();
};

const getCellCoordinates = (pos) => {
  if (pos === 0) return { r: -1, c: -1, row: -1, col: -1 }; // off-board
  const zeroBased = pos - 1;
  const row = Math.floor(zeroBased / gridSize);
  let col = zeroBased % gridSize;
  if (row % 2 !== 0) {
    col = gridSize - 1 - col;
  }
  return { row: gridSize - 1 - row, col };
};

const cells = computed(() => {
  let grid = [];
  for (let r = 0; r < gridSize; r++) {
    let rowObj = [];
    for (let c = 0; c < gridSize; c++) {
      let num = 0;
      const reversedRow = gridSize - 1 - r;
      if (reversedRow % 2 === 0) {
        num = reversedRow * gridSize + c + 1;
      } else {
        num = reversedRow * gridSize + (gridSize - 1 - c) + 1;
      }
      
      let type = 'normal';
      let target = null;
      if (currentSnakes.value[num]) {
        type = 'snake';
        target = currentSnakes.value[num];
      } else if (currentLadders.value[num]) {
        type = 'ladder';
        target = currentLadders.value[num];
      }
      
      rowObj.push({ num, type, target });
    }
    grid.push(rowObj);
  }
  return grid;
});

const computedSnakes = computed(() => {
  return Object.entries(currentSnakes.value).map(([start, end]) => {
    start = parseInt(start);
    const startCoord = getCellCoordinates(start);
    const endCoord = getCellCoordinates(end);
    const x1 = startCoord.col * 10 + 5;
    const y1 = startCoord.row * 10 + 5;
    const x2 = endCoord.col * 10 + 5;
    const y2 = endCoord.row * 10 + 5;
    
    const dx = x2 - x1;
    const dy = y2 - y1;
    const nx = -dy * 0.25;
    const ny = dx * 0.25;
    
    const cx1 = x1 + dx * 0.33 + nx;
    const cy1 = y1 + dy * 0.33 + ny;
    const cx2 = x1 + dx * 0.66 - nx;
    const cy2 = y1 + dy * 0.66 - ny;

    const path = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
    const headAngle = Math.atan2(y1 - cy1, x1 - cx1) * (180 / Math.PI);
    
    return { start, end, x1, y1, x2, y2, path, headAngle };
  });
});

const computedLadders = computed(() => {
  return Object.entries(currentLadders.value).map(([start, end]) => {
    start = parseInt(start);
    const startCoord = getCellCoordinates(start);
    const endCoord = getCellCoordinates(end);
    const x1 = startCoord.col * 10 + 5;
    const y1 = startCoord.row * 10 + 5;
    const x2 = endCoord.col * 10 + 5;
    const y2 = endCoord.row * 10 + 5;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx*dx + dy*dy);
    const ux = dx / len;
    const uy = dy / len;
    const nx = -uy;
    const ny = ux;
    
    const w = 2.5; 
    const r1x1 = x1 + nx * w;
    const r1y1 = y1 + ny * w;
    const r1x2 = x2 + nx * w;
    const r1y2 = y2 + ny * w;
    
    const r2x1 = x1 - nx * w;
    const r2y1 = y1 - ny * w;
    const r2x2 = x2 - nx * w;
    const r2y2 = y2 - ny * w;
    
    const numRungs = Math.floor(len / 4);
    const rungs = [];
    for(let i=1; i<=numRungs; i++) {
      const frac = i / (numRungs + 1);
      const rx = x1 + dx * frac;
      const ry = y1 + dy * frac;
      rungs.push({
        x1: rx + nx * w,
        y1: ry + ny * w,
        x2: rx - nx * w,
        y2: ry - ny * w
      });
    }

    return { start, end, r1x1, r1y1, r1x2, r1y2, r2x1, r2y1, r2x2, r2y2, rungs };
  });
});

const rollDice = async () => {
  if (isRolling.value || gameStatus.value !== 'playing') return;
  
  isRolling.value = true;
  
  const diceEl = document.querySelector('.dice-container');
  if (diceEl) {
    gsap.to(diceEl, { rotation: "+=720", duration: 0.6, ease: 'power2.out' });
  }

  let rolls = 0;
  let fakeRollInterval = setInterval(() => {
    diceValue.value = Math.floor(Math.random() * 6) + 1;
    rolls++;
    if (rolls > 8) {
      clearInterval(fakeRollInterval);
      const finalRoll = Math.floor(Math.random() * 6) + 1;
      diceValue.value = finalRoll;
      handleMove(finalRoll);
    }
  }, 60);
};

const handleMove = async (roll) => {
  let currentPos = isPlayerTurn.value ? playerPos.value : botPos.value;
  let targetPos = currentPos + roll;
  
  const playerName = isPlayerTurn.value ? 'Player' : 'Bot';
  addLog(`${playerName} rolled a ${roll}`);

  if (targetPos > 100) {
    addLog(`${playerName} needs exact roll. Staying at ${currentPos}.`);
    targetPos = currentPos;
  }

  // Animate step by step
  for (let i = currentPos + 1; i <= targetPos; i++) {
    if (isPlayerTurn.value) playerPos.value = i;
    else botPos.value = i;
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  let finalPos = targetPos;
  
  // Check snake or ladder
  if (currentSnakes.value[finalPos]) {
    addLog(`Oh no! ${playerName} got swallowed by a snake to ${currentSnakes.value[finalPos]}`);
    finalPos = currentSnakes.value[finalPos];
  } else if (currentLadders.value[finalPos]) {
    addLog(`Yay! ${playerName} climbed a ladder to ${currentLadders.value[finalPos]}`);
    finalPos = currentLadders.value[finalPos];
  }
  
  if (finalPos !== targetPos) {
    await new Promise(resolve => setTimeout(resolve, 500)); 
    if (isPlayerTurn.value) {
      playerPos.value = finalPos;
    } else {
      botPos.value = finalPos;
    }
  }

  if (finalPos === 100) {
    gameStatus.value = isPlayerTurn.value ? 'player_won' : 'bot_won';
    addLog(`${playerName} reached 100 and WON!`);
    playSound(isPlayerTurn.value ? 'win' : 'lose');
    isRolling.value = false;
    return;
  }

  isPlayerTurn.value = !isPlayerTurn.value;
  isRolling.value = false;
};

// Bot logic
watch(isPlayerTurn, (val) => {
  if (!val && gameStatus.value === 'playing') {
    setTimeout(() => {
      rollDice();
    }, 1200);
  }
});

const resetGame = () => {
  initMap();
  playerPos.value = 0;
  botPos.value = 0;
  isPlayerTurn.value = true;
  diceValue.value = 1;
  isRolling.value = false;
  gameStatus.value = 'playing';
  logMessages.value = ['Game reset. Player\'s turn!'];
};

onMounted(() => {
  initMap();
});
</script>

<template>
  <div class="sal-container">
    <div class="sal-header">
      <button class="back-btn" @click="emit('back')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        Back
      </button>
      <h2 class="game-title">Snakes & Ladders</h2>
    </div>

    <div class="game-content">
      <!-- Left Panel: Board -->
      <div class="board-wrapper">
        <div class="sal-board">
          <svg class="board-connections" viewBox="0 0 100 100" preserveAspectRatio="none">
            <!-- LADDERS -->
            <template v-for="lad in computedLadders" :key="'l'+lad.start">
              <line :x1="lad.r1x1" :y1="lad.r1y1" :x2="lad.r1x2" :y2="lad.r1y2" stroke="#d4af37" stroke-width="1" stroke-linecap="round"/>
              <line :x1="lad.r2x1" :y1="lad.r2y1" :x2="lad.r2x2" :y2="lad.r2y2" stroke="#d4af37" stroke-width="1" stroke-linecap="round"/>
              <line v-for="(rung, idx) in lad.rungs" :key="idx" :x1="rung.x1" :y1="rung.y1" :x2="rung.x2" :y2="rung.y2" stroke="#d4af37" stroke-width="0.8"/>
            </template>
            
            <!-- SNAKES -->
            <template v-for="snk in computedSnakes" :key="'s'+snk.start">
              <path :d="snk.path" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path :d="snk.path" fill="none" stroke="#166534" stroke-width="2.5" stroke-dasharray="1 1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <g :transform="`translate(${snk.x1}, ${snk.y1}) rotate(${snk.headAngle})`">
                <polygon points="0,-1.5 2,0 0,1.5 -1.5,0" fill="#22c55e"/>
                <circle cx="-0.2" cy="-0.5" r="0.3" fill="red"/>
                <circle cx="-0.2" cy="0.5" r="0.3" fill="red"/>
                <polyline points="2,0 3.5,-0.5 2,0 3.5,0.5" stroke="#ef4444" stroke-width="0.3" fill="none"/>
              </g>
            </template>
          </svg>

          <div v-for="(row, r) in cells" :key="r" class="board-row">
            <div 
              v-for="cell in row" 
              :key="cell.num" 
              class="board-cell"
              :class="{ 'snake-start': cell.type === 'snake', 'ladder-start': cell.type === 'ladder' }"
            >
              <span class="cell-num">{{ cell.num }}</span>
              
              <!-- Crown at 100 -->
              <svg v-if="cell.num === 100" class="crown-icon" viewBox="0 0 24 24" fill="var(--accent-gold)">
                <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
              </svg>

              <!-- Player Tokens -->
              <div class="tokens">
                <img v-if="playerPos === cell.num" :src="evanImg" class="token player-token" alt="Player">
                <img v-if="botPos === cell.num" :src="sarahImg" class="token bot-token" alt="Bot">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel: Controls -->
      <div class="controls-panel">
        <div class="status-card" v-if="gameStatus === 'playing'">
          <h3 :class="{ 'text-gold': isPlayerTurn, 'text-red': !isPlayerTurn }">
            {{ isPlayerTurn ? "Your Turn" : "Bot's Turn" }}
          </h3>
          <div class="dice-container" @click="isPlayerTurn ? rollDice() : null" :class="{ 'disabled': !isPlayerTurn || isRolling }">
            <div class="dice" :data-value="diceValue">
              <div v-for="n in diceValue" :key="n" class="dot"></div>
            </div>
          </div>
          <button class="roll-btn" :disabled="!isPlayerTurn || isRolling" @click="rollDice">
            {{ isRolling ? 'Rolling...' : 'ROLL DICE' }}
          </button>
        </div>
        
        <div class="status-card victory" v-else>
          <h2 :class="gameStatus === 'player_won' ? 'text-green' : 'text-red'">
            {{ gameStatus === 'player_won' ? 'Congratulations!' : 'You Lost!' }}
          </h2>
          <button class="roll-btn" @click="resetGame">Play Again</button>
        </div>

        <div class="controls-info">
          <div class="log-card">
            <h4>Game Log</h4>
            <div class="log-list">
              <div v-for="(msg, i) in logMessages" :key="i" class="log-item" :class="{'latest': i === 0}">
                {{ msg }}
              </div>
            </div>
          </div>

          <div class="legend-card">
            <h4>Legend</h4>
            <div class="legend-items">
              <div class="legend-item"><span class="box player-box"></span> You (Evan)</div>
              <div class="legend-item"><span class="box bot-box"></span> Bot (Sarah)</div>
              <div class="legend-item"><span class="line snake-line"></span> Snake</div>
              <div class="legend-item"><span class="line ladder-line"></span> Ladder</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sal-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 30px;
  background-color: rgba(10, 5, 20, 0.9);
  border-radius: 12px;
}

.sal-header {
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
  padding-right: 90px;
}

.game-content {
  display: flex;
  gap: 40px;
  flex: 1;
  overflow: hidden;
}

/* Board Layout */
.board-wrapper {
  flex: 2;
  display: flex;
  justify-content: center;
  align-items: center;
}

.sal-board {
  height: 100%;
  max-height: 600px;
  max-width: 100%;
  aspect-ratio: 1;
  /* background: #1a0b2e; */
  background-image: url('@/assets/bg-grass.png'); /* Ganti dengan bg-classroom.png untuk mencoba background lainnya */
  background-size: cover;
  background-position: center;
  border: 4px solid var(--accent-gold);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

.board-connections {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
}

.board-row {
  display: flex;
  flex: 1;
}

.board-cell {
  flex: 1;
  border: 1px solid rgba(212, 175, 55, 0.2);
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(13, 2, 22, 0.6);
}

.board-cell:nth-child(even) {
  background: rgba(26, 11, 46, 0.6);
}

.board-cell.snake-start { background: rgba(239, 68, 68, 0.15); }
.board-cell.ladder-start { background: rgba(212, 175, 55, 0.15); }

.cell-num {
  position: absolute;
  top: 4px;
  left: 4px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: bold;
}

.crown-icon {
  position: absolute;
  width: 60%;
  height: 60%;
  opacity: 0.2;
  z-index: 1;
}

/* Tokens */
.tokens {
  display: flex;
  gap: 2px;
  z-index: 10;
  position: relative;
}

.token {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #fff;
  object-fit: cover;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: tokenDrop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes tokenDrop {
  0% { transform: scale(1.5) translateY(-10px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

.player-token { border-color: var(--accent-gold); box-shadow: 0 0 10px var(--accent-gold); }
.bot-token { border-color: #ef4444; box-shadow: 0 0 10px #ef4444; }

/* Controls Panel */
.controls-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  padding-right: 10px;
}

.status-card, .log-card, .legend-card {
  background: rgba(26, 11, 46, 0.8);
  border: 1px solid var(--accent-gold);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.status-card h3, .status-card h2 {
  margin-top: 0;
  margin-bottom: 20px;
  font-family: 'Playfair Display', serif;
  font-size: 1.8rem;
  text-align: center;
}

.text-gold { color: var(--accent-gold); }
.text-red { color: #ef4444; }
.text-green { color: #4ade80; }

.dice-container {
  width: 80px;
  height: 80px;
  background: #fff;
  border-radius: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: inset 0 -5px 15px rgba(0,0,0,0.2), 0 5px 15px rgba(0,0,0,0.3);
  margin-bottom: 20px;
}

.dice-container:hover:not(.disabled) {
  transform: translateY(-5px);
}

.dice-container.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dice {
  width: 100%;
  height: 100%;
  padding: 14px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  gap: 4px;
  justify-items: center;
  align-items: center;
}

.dot {
  width: 12px;
  height: 12px;
  background-color: #1a0b2e;
  border-radius: 50%;
}

.dice[data-value="1"] .dot:nth-child(1) { grid-column: 2; grid-row: 2; }
.dice[data-value="2"] .dot:nth-child(1) { grid-column: 1; grid-row: 1; }
.dice[data-value="2"] .dot:nth-child(2) { grid-column: 3; grid-row: 3; }
.dice[data-value="3"] .dot:nth-child(1) { grid-column: 1; grid-row: 1; }
.dice[data-value="3"] .dot:nth-child(2) { grid-column: 2; grid-row: 2; }
.dice[data-value="3"] .dot:nth-child(3) { grid-column: 3; grid-row: 3; }
.dice[data-value="4"] .dot:nth-child(1) { grid-column: 1; grid-row: 1; }
.dice[data-value="4"] .dot:nth-child(2) { grid-column: 3; grid-row: 1; }
.dice[data-value="4"] .dot:nth-child(3) { grid-column: 1; grid-row: 3; }
.dice[data-value="4"] .dot:nth-child(4) { grid-column: 3; grid-row: 3; }
.dice[data-value="5"] .dot:nth-child(1) { grid-column: 1; grid-row: 1; }
.dice[data-value="5"] .dot:nth-child(2) { grid-column: 3; grid-row: 1; }
.dice[data-value="5"] .dot:nth-child(3) { grid-column: 2; grid-row: 2; }
.dice[data-value="5"] .dot:nth-child(4) { grid-column: 1; grid-row: 3; }
.dice[data-value="5"] .dot:nth-child(5) { grid-column: 3; grid-row: 3; }
.dice[data-value="6"] .dot:nth-child(1) { grid-column: 1; grid-row: 1; }
.dice[data-value="6"] .dot:nth-child(2) { grid-column: 1; grid-row: 2; }
.dice[data-value="6"] .dot:nth-child(3) { grid-column: 1; grid-row: 3; }
.dice[data-value="6"] .dot:nth-child(4) { grid-column: 3; grid-row: 1; }
.dice[data-value="6"] .dot:nth-child(5) { grid-column: 3; grid-row: 2; }
.dice[data-value="6"] .dot:nth-child(6) { grid-column: 3; grid-row: 3; }

.roll-btn {
  background: var(--accent-gold);
  color: #1a0b2e;
  border: none;
  border-radius: 30px;
  padding: 12px 30px;
  font-family: 'Inter', sans-serif;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s;
  width: 100%;
}

.roll-btn:disabled {
  background: #555;
  color: #aaa;
  cursor: not-allowed;
}

.roll-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(212, 175, 55, 0.4);
}

.log-card {
  align-items: flex-start;
  flex: 1;
}

.log-card h4, .legend-card h4 {
  color: var(--accent-gold);
  margin-top: 0;
  margin-bottom: 15px;
  font-family: 'Playfair Display', serif;
  font-size: 1.2rem;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.log-item {
  font-size: 0.9rem;
  color: #ddd;
  padding: 8px;
  background: rgba(0,0,0,0.3);
  border-radius: 6px;
  border-left: 3px solid #555;
}

.log-item.latest {
  border-left-color: var(--accent-gold);
  color: #fff;
  font-weight: 500;
  background: rgba(212, 175, 55, 0.1);
}

.legend-card {
  align-items: flex-start;
  width: 100%;
}

.legend-items {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  width: 100%;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
}

.box {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}
.player-box { background: var(--accent-gold); }
.bot-box { background: #ef4444; }

.line {
  width: 20px;
  height: 3px;
}
.snake-line { background: #22c55e; }
.ladder-line { background: #d4af37; }

.controls-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
}

@media (max-width: 900px) {
  .game-content {
    flex-direction: column;
    overflow-y: auto;
    align-items: center;
    gap: 15px; /* Reduce gap between board and controls */
  }
  .board-wrapper {
    flex: none;
    width: 100%;
  }
  .controls-panel {
    padding-right: 0;
    flex-direction: row;
    width: 100%;
    max-width: 800px;
    align-items: flex-start; /* Prevent cards from stretching vertically */
    gap: 15px; /* Reduce gap between columns */
  }
  .status-card, .log-card, .legend-card {
    padding: 12px; /* Reduce padding inside cards */
  }
  .status-card h3, .status-card h2 {
    font-size: 1.4rem;
    margin-bottom: 10px;
  }
  .log-card h4, .legend-card h4 {
    font-size: 1rem;
    margin-bottom: 8px;
  }
  .dice-container {
    width: 60px;
    height: 60px;
    margin-bottom: 15px;
    padding: 8px;
  }
  .dice {
    padding: 8px;
  }
  .dot {
    width: 8px;
    height: 8px;
  }
  .roll-btn {
    padding: 8px 20px;
    font-size: 1rem;
  }
  .controls-info {
    gap: 15px; /* Reduce gap between log and legend */
  }
  .log-item {
    padding: 6px;
    font-size: 0.8rem;
  }
  .legend-item {
    margin-bottom: 5px;
    font-size: 0.8rem;
  }
  .status-card {
    flex: 1;
    min-width: 200px;
  }
  .controls-info {
    flex: 1.5;
    min-width: 200px;
  }
  .sal-board {
    width: min(450px, 100%); /* Slightly smaller board to save vertical space */
  }
}

@media (max-width: 600px) {
  .sal-container {
    padding: 10px;
  }
  .sal-header {
    margin-bottom: 10px;
  }
  .game-title {
    font-size: 1.2rem;
    padding-right: 0;
  }
  .back-btn {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
  .back-btn svg {
    width: 16px;
  }
  .sal-board {
    width: min(320px, 100%);
    border-width: 2px;
  }
  .cell-num {
    font-size: 0.5rem;
    top: 2px;
    left: 2px;
  }
  .token {
    width: 12px;
    height: 12px;
  }
  .game-content {
    gap: 10px;
  }
  .controls-panel {
    flex-direction: row;
    gap: 10px;
  }
  .status-card, .log-card, .legend-card {
    padding: 8px;
  }
  .status-card {
    min-width: 120px;
  }
  .controls-info {
    min-width: 150px;
    gap: 8px;
  }
  .status-card h3, .status-card h2 {
    font-size: 1rem;
    margin-bottom: 8px;
  }
  .dice-container {
    width: 40px;
    height: 40px;
    margin-bottom: 8px;
    padding: 4px;
    border-radius: 8px;
  }
  .dice {
    padding: 4px;
  }
  .dot {
    width: 5px;
    height: 5px;
  }
  .roll-btn {
    padding: 6px 10px;
    font-size: 0.8rem;
  }
  .log-card h4, .legend-card h4 {
    font-size: 0.9rem;
    margin-bottom: 6px;
  }
  .log-item {
    padding: 4px;
    font-size: 0.65rem;
    border-left-width: 2px;
  }
  .legend-items {
    gap: 5px;
  }
  .legend-item {
    font-size: 0.65rem;
  }
  .box {
    width: 10px;
    height: 10px;
  }
  .line {
    width: 12px;
    height: 2px;
  }
}
</style>
