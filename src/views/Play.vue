<script setup>
import { onMounted, ref } from 'vue';
import gsap from 'gsap';
import logoImg from '@/assets/img-logo.png';

const activeGame = ref(null);
const randomizedCards = ref([]);
const showScore = ref(false);
const timerSeconds = ref(0);
const gameScore = ref(0);
let timerInterval = null;

const startTimer = () => {
  timerSeconds.value = 0;
  timerInterval = setInterval(() => {
    timerSeconds.value++;
  }, 1000);
};

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const calculateScore = () => {
  let totalCells = 0;
  let correctCells = 0;
  
  activeGame.value.grid.forEach(row => {
    row.forEach(cell => {
      if (cell) {
        totalCells++;
        if (cell.value.toUpperCase() === cell.answer) {
          correctCells++;
        }
      }
    });
  });
  
  gameScore.value = Math.round((correctCells / totalCells) * 100);
  showScore.value = true;
};

const finishGame = () => {
  stopTimer();
  calculateScore();
};

const resetToArena = () => {
  activeGame.value = null;
  showScore.value = false;
  randomizedCards.value = shuffleArray(ttsData);
};

const ttsData = [
  {
    id: 1, title: '1', difficulty: 'MUDAH', 
    gridSize: 6,
    words: [
      { id: 1, number: 1, clue: 'Pemain video game profesional', answer: 'GAMER', x: 1, y: 1, dir: 'across' },
      { id: 2, number: 1, clue: 'Pantulan suara dalam ruangan', answer: 'GEMA', x: 1, y: 1, dir: 'down' },
      { id: 3, number: 2, clue: 'Logam mulia berwarna kuning', answer: 'EMAS', x: 4, y: 1, dir: 'down' },
      { id: 4, number: 3, clue: 'Alat untuk melihat', answer: 'MATA', x: 1, y: 3, dir: 'across' }
    ]
  },
  {
    id: 2, title: '2', difficulty: 'MENENGAH',
    gridSize: 6,
    words: [
      { id: 1, number: 1, clue: 'Sangat mengasyikkan', answer: 'SERU', x: 1, y: 1, dir: 'across' },
      { id: 2, number: 1, clue: 'Angka setelah nol', answer: 'SATU', x: 1, y: 1, dir: 'down' },
      { id: 3, number: 4, clue: 'Dilakukan berulang kali', answer: 'ULANG', x: 4, y: 1, dir: 'down' },
      { id: 4, number: 3, clue: 'Suara saat merasa lucu', answer: 'TAWA', x: 1, y: 3, dir: 'across' }
    ]
  },
  {
    id: 3, title: '3', difficulty: 'MENENGAH',
    gridSize: 7,
    words: [
      { id: 1, number: 1, clue: 'Game buatan anak bangsa', answer: 'LOKAL', x: 1, y: 1, dir: 'across' },
      { id: 2, number: 1, clue: 'Tahapan dalam sebuah game', answer: 'LEVEL', x: 1, y: 1, dir: 'down' },
      { id: 3, number: 2, clue: 'Musuh besar kancil', answer: 'BUAYA', x: 5, y: 1, dir: 'down' },
      { id: 4, number: 3, clue: 'Tidak mahal', answer: 'MURAH', x: 1, y: 5, dir: 'across' },
      { id: 5, number: 4, clue: 'Hasil akhir atau capaian', answer: 'HASIL', x: 5, y: 5, dir: 'across' }
    ]
  },
  {
    id: 4, title: '4', difficulty: 'SULIT',
    gridSize: 8,
    words: [
      { id: 1, number: 1, clue: 'Cerita dalam sebuah game', answer: 'NARASI', x: 1, y: 1, dir: 'across' },
      { id: 2, number: 1, clue: 'Dibutuhkan untuk online', answer: 'NETWORK', x: 1, y: 1, dir: 'down' },
      { id: 3, number: 2, clue: 'Tokoh dalam permainan', answer: 'KARAKTER', x: 4, y: 0, dir: 'down' },
      { id: 4, number: 3, clue: 'Tugas yang harus selesai', answer: 'MISI', x: 1, y: 5, dir: 'across' }
    ]
  },
  {
    id: 5, title: '5', difficulty: 'MEMENTO',
    gridSize: 8,
    words: [
      { id: 1, number: 1, clue: 'Studio game pengembang ini', answer: 'MEMENTO', x: 0, y: 1, dir: 'across' },
      { id: 2, number: 1, clue: 'Ayo segera ... game ini!', answer: 'MAINKAN', x: 0, y: 1, dir: 'down' },
      { id: 3, number: 2, clue: 'Hal berharga untuk disimpan', answer: 'MEMORI', x: 2, y: 0, dir: 'down' },
      { id: 4, number: 3, clue: 'Lawan dari offline', answer: 'ONLINE', x: 0, y: 5, dir: 'across' }
    ]
  }
];

const cardsRef = ref([]);

const createSparkleBurst = (card) => {
  const container = document.createElement('div');
  container.className = 'card-sparkle-container';
  card.appendChild(container);

  const directions = [
    { x: 0, y: -180 }, { x: 0, y: 180 }, { x: 180, y: 0 }, { x: -180, y: 0 },
    { x: 140, y: -140 }, { x: -140, y: -140 }, { x: 140, y: 140 }, { x: -140, y: 140 }
  ];

  directions.forEach(dir => {
    const particle = document.createElement('div');
    particle.className = 'sparkle-particle animate';
    particle.style.setProperty('--tx', `${dir.x}px`);
    particle.style.setProperty('--ty', `${dir.y}px`);
    container.appendChild(particle);
  });

  setTimeout(() => { container.remove(); }, 1000);
};

const handleCardClick = (event, game) => {
  const card = event.currentTarget;
  createSparkleBurst(card);
    gsap.to(card, {
    scale: 0.95,
    duration: 0.1,
    yoyo: true,
    repeat: 1,
    ease: "power2.inOut",
    onComplete: () => {
      const grid = Array(game.gridSize).fill().map(() => Array(game.gridSize).fill(null));
      
      game.words.forEach(word => {
        for (let i = 0; i < word.answer.length; i++) {
          const r = word.dir === 'down' ? word.y + i : word.y;
          const c = word.dir === 'across' ? word.x + i : word.x;
          if (!grid[r][c]) {
            grid[r][c] = { value: '', answer: word.answer[i], number: i === 0 ? word.number : null };
          } else if (i === 0) {
            grid[r][c].number = word.number;
          }
        }
      });

      activeGame.value = { ...game, grid };
      startTimer();
    }
  });
};

const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

onMounted(() => {
  randomizedCards.value = shuffleArray(ttsData);
});
</script>

<template>
  <div class="game-container">
    <router-link to="/" class="back-button" v-if="!activeGame">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </router-link>

    <header class="logo-header">
      <div class="logo-badge">
        <img :src="logoImg" alt="Memento Logo" class="main-logo-img">
      </div>
    </header>

    <div class="play-content-wrapper" v-if="!activeGame">
      <h1 class="play-title">Play</h1>

      <div class="play-carousel">
        <div 
          v-for="(game, index) in randomizedCards" 
          :key="game.id"
          class="play-card" 
          :class="[
            index === 0 ? 'side-outer left' : '',
            index === 1 ? 'side-inner left' : '',
            index === 2 ? 'central-focus' : '',
            index === 3 ? 'side-inner right' : '',
            index === 4 ? 'side-outer right' : ''
          ]"
          @click="(e) => handleCardClick(e, game)"
        >
          <div class="play-card-inner">
            <span class="game-title">{{ game.title }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- TTS GAME UI (REAL GRID) -->
    <div class="tts-game-container" v-else-if="!showScore">
      <div class="tts-back-header">
        <div class="header-left">
          <button class="tts-back-btn" @click="activeGame = null; stopTimer()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            Back
          </button>
          <div class="game-timer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            {{ formatTime(timerSeconds) }}
          </div>
        </div>
        <h2 class="tts-level-title">{{ activeGame.title }} - {{ activeGame.difficulty }}</h2>
      </div>

      <div class="tts-layout">
        <div class="tts-grid-wrapper">
          <div 
            class="tts-real-grid" 
            :style="{ 
              gridTemplateColumns: `repeat(${activeGame.gridSize}, 1fr)`,
              gridTemplateRows: `repeat(${activeGame.gridSize}, 1fr)`
            }"
          >
            <template v-for="(row, r) in activeGame.grid" :key="r">
              <div 
                v-for="(cell, c) in row" 
                :key="c" 
                class="grid-cell"
                :class="{ 'empty': !cell }"
              >
                <template v-if="cell">
                  <span class="cell-num" v-if="cell.number">{{ cell.number }}</span>
                  <input 
                    type="text" 
                    maxlength="1" 
                    v-model="cell.value"
                    class="cell-input"
                    :class="{ 'correct': cell.value.toUpperCase() === cell.answer }"
                  >
                </template>
              </div>
            </template>
          </div>
        </div>

        <div class="tts-clues-side">
          <div class="clues-section">
            <h3 class="clues-header">Across</h3>
            <div class="clues-list">
              <div v-for="word in activeGame.words.filter(w => w.dir === 'across')" :key="word.id" class="clue-item">
                <span class="clue-number">{{ word.number }}</span>
                <span class="clue-text">{{ word.clue }}</span>
              </div>
            </div>
          </div>
          <div class="clues-section">
            <h3 class="clues-header">Down</h3>
            <div class="clues-list">
              <div v-for="word in activeGame.words.filter(w => w.dir === 'down')" :key="word.id" class="clue-item">
                <span class="clue-number">{{ word.number }}</span>
                <span class="clue-text">{{ word.clue }}</span>
              </div>
            </div>
          </div>
          
          <div class="finish-game-wrapper">
            <button class="finish-game-btn" @click="finishGame">
              Finish Game
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- SCORE SUMMARY VIEW -->
    <div class="score-summary-container" v-else>
      <div class="score-card">
        <h2 class="score-title" :class="gameScore === 100 ? 'success' : 'fail'">
          {{ gameScore === 100 ? 'Quest Complete!' : 'Quest Failed' }}
        </h2>
        
        <div class="score-circle">
          <span class="score-value">{{ gameScore }}%</span>
          <span class="score-label">Accuracy</span>
        </div>

        <div class="score-details">
          <div class="score-detail-item">
            <span class="detail-label">Time Taken</span>
            <span class="detail-value">{{ formatTime(timerSeconds) }}</span>
          </div>
          <div class="score-detail-item">
            <span class="detail-label">Difficulty</span>
            <span class="detail-value">{{ activeGame.difficulty }}</span>
          </div>
        </div>

        <button class="arena-btn" @click="resetToArena">
          Return To Arena
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.play-card-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  pointer-events: none;
}

.difficulty-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  color: #bf953f;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 10px;
}

.game-title {
  font-family: 'Playfair Display', serif;
  font-size: 3.5rem; /* Bigger since it's just a number now */
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0;
  text-align: center;
  width: 100%;
}

@media (max-width: 768px) {
  .game-title {
    font-size: 2.5rem;
  }
}

.tts-game-container {
  width: 100%;
  max-width: 1200px;
  height: 100%;
  display: flex;
  flex-direction: column;
  z-index: 100;
  padding: 40px;
}

.tts-back-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.tts-back-btn {
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

.tts-back-btn:hover {
  background: var(--accent-gold);
  color: #1a0b2e;
}

.tts-back-btn svg { width: 20px; }

.tts-level-title {
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  color: #fcf6ba;
  margin: 0;
}

.tts-layout {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 60px;
  flex: 1;
  overflow-y: auto;
}

@media (max-width: 1024px) {
  .tts-layout {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  .tts-game-container {
    padding: 20px;
  }
}


.finish-game-wrapper {
  display: flex;
  width: 100%;
  justify-content: flex-end;
  margin-top: 40px;
}

@media (max-width: 1024px) {
  .finish-game-wrapper {
    justify-content: center;
    margin-bottom: 60px;
  }
  .finish-game-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .tts-game-container {
    padding-top: 40px; /* Space for absolute social icons */
    position: relative;
  }
  .tts-back-header {
    flex-wrap: wrap;
    justify-content: flex-start;
    margin-bottom: 25px;
    position: relative;
  }
  .tts-level-title {
    width: 100%;
    order: -1; 
    text-align: center;
    font-size: 1.6rem;
    margin-bottom: 15px;
  }
  .header-left {
    width: 100%;
    display: flex;
    justify-content: flex-start; /* Anchor back button to left */
    position: relative;
  }
  .game-timer {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    padding: 6px 12px;
    font-size: 0.9rem;
  }
  .tts-back-btn {
    padding: 8px 15px;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .tts-game-container {
    padding-left: 12px;
    padding-right: 12px;
  }
  .tts-level-title {
    font-size: 1.4rem;
    margin-bottom: 10px;
  }
  .game-timer {
    padding: 4px 10px;
    font-size: 0.8rem;
  }
  .tts-back-btn {
    padding: 8px 12px;
    font-size: 0.75rem;
  }
  .mobile-finish-btn {
    padding: 12px 15px;
    font-size: 1rem;
  }
}

.tts-grid-wrapper {
  background: rgba(13, 2, 22, 0.4);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(212, 175, 55, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
}

.tts-real-grid {
  display: grid;
  gap: 2px;
  background: var(--accent-gold); /* Grid line color */
  border: 4px solid var(--accent-gold);
  width: min(500px, 90vw);
  height: min(500px, 90vw);
}
@media (max-width: 768px) {
  .tts-real-grid {
    width: min(350px, 85vw);
    height: min(350px, 85vw);
    border: 2px solid var(--accent-gold);
    gap: 1px;
  }
  .cell-input { font-size: 0.9rem; }
  .cell-num { font-size: 0.5rem; }
}

@media (max-width: 480px) {
  .tts-real-grid {
    width: min(280px, 85vw);
    height: min(280px, 85vw);
  }
  .cell-input { font-size: 0.8rem; }
}

.grid-cell {
  background: #0d0216; /* Black/Dark cells */
  position: relative;
}

.grid-cell.empty {
  background: #0d0216;
}

.cell-num {
  position: absolute;
  top: 2px;
  left: 2px;
  font-size: 0.65rem;
  color: var(--accent-gold);
  z-index: 10;
  font-weight: bold;
}

.cell-input {
  width: 100%;
  height: 100%;
  border: none;
  background: #1a0b2e; /* Playable cells in purple */
  color: white;
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
  text-transform: uppercase;
  outline: none;
  transition: all 0.2s;
}

.cell-input:focus {
  background: rgba(212, 175, 55, 0.2);
}

.cell-input.correct {
  color: var(--accent-gold);
  background: rgba(212, 175, 55, 0.1);
}

.clues-section {
  margin-bottom: 30px;
}

.clues-header {
  font-family: 'Playfair Display', serif;
  font-size: 1.4rem;
  color: var(--accent-gold);
  margin-bottom: 15px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.3);
  padding-bottom: 5px;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.clue-item {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 0.95rem;
  line-height: 1.4;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 30px;
}

.game-timer {
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.4);
  padding: 8px 15px;
  border-radius: 20px;
  color: var(--accent-gold);
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Inter', sans-serif;
  font-weight: bold;
}

.game-timer svg { width: 18px; }

.finish-game-btn {
  background: var(--accent-gold);
  color: #1a0b2e;
  border: none;
  border-radius: 30px;
  padding: 12px 30px;
  font-family: 'Inter', sans-serif;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
}

.finish-game-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
}

.finish-game-btn svg { width: 18px; }

/* SCORE SUMMARY STYLES */
.score-summary-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.score-card {
  background: rgba(26, 11, 46, 0.9);
  border: 2px solid var(--accent-gold);
  border-radius: 24px;
  padding: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 0 50px rgba(0,0,0,0.5);
  backdrop-filter: blur(10px);
}

.score-title {
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  margin-bottom: 40px;
}

.score-title.success { color: #4ade80; }
.score-title.fail { color: #f87171; }

.score-circle {
  width: 180px;
  height: 180px;
  border: 5px solid var(--accent-gold);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 40px;
  box-shadow: 0 0 30px rgba(212, 175, 55, 0.2);
}

.score-value {
  font-size: 3rem;
  font-weight: bold;
  color: white;
}

.score-label {
  font-size: 0.9rem;
  color: var(--accent-gold);
  text-transform: uppercase;
  letter-spacing: 2px;
}

.score-details {
  width: 100%;
  margin-bottom: 50px;
}

.score-detail-item {
  display: flex;
  justify-content: space-between;
  padding: 15px 0;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
}

.detail-label { color: rgba(255, 255, 255, 0.6); }
.detail-value { color: white; font-weight: bold; }

.arena-btn {
  background: transparent;
  border: 1px solid var(--accent-gold);
  color: var(--accent-gold);
  padding: 15px 40px;
  border-radius: 30px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
}

.arena-btn:hover {
  background: var(--accent-gold);
  color: #1a0b2e;
}

@media (max-width: 480px) {
  .score-card {
    padding: 30px 20px;
  }
  .score-title {
    font-size: 1.8rem;
    margin-bottom: 25px;
    text-align: center;
  }
  .score-circle {
    width: 130px;
    height: 130px;
    margin-bottom: 30px;
  }
  .score-value {
    font-size: 2rem;
  }
  .score-details {
    margin-bottom: 30px;
  }
  .score-detail-item {
    font-size: 0.9rem;
  }
  .arena-btn {
    padding: 12px 25px;
    width: 100%;
  }
}
</style>
