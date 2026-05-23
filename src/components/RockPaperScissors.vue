<script setup>
import { ref } from 'vue';
import gsap from 'gsap';
import rpsBg from '@/assets/rps-bg.png';

const emit = defineEmits(['back']);

const choices = [
  { id: 'rock', icon: '✊', name: 'Batu' },
  { id: 'paper', icon: '🖐️', name: 'Kertas' },
  { id: 'scissors', icon: '✌️', name: 'Gunting' }
];

const playerChoice = ref(null);
const botChoice = ref(null);
const resultMessage = ref('Pilih Senjatamu!');
const isAnimating = ref(false);

const playerScore = ref(0);
const botScore = ref(0);

const getBotChoice = () => {
  const randomIndex = Math.floor(Math.random() * choices.length);
  return choices[randomIndex];
};

const determineWinner = (player, bot) => {
  if (player.id === bot.id) return 'draw';
  if (
    (player.id === 'rock' && bot.id === 'scissors') ||
    (player.id === 'paper' && bot.id === 'rock') ||
    (player.id === 'scissors' && bot.id === 'paper')
  ) {
    return 'win';
  }
  return 'lose';
};

const playGame = (choice) => {
  if (isAnimating.value) return;
  
  isAnimating.value = true;
  playerChoice.value = choice;
  botChoice.value = null; // Hide bot choice temporarily for animation
  resultMessage.value = 'Suit...';

  // Animation effect
  const tl = gsap.timeline();
  
  tl.to('.battle-arena', {
    y: -20,
    yoyo: true,
    repeat: 3,
    duration: 0.2,
    ease: "power1.inOut"
  }).add(() => {
    const bot = getBotChoice();
    botChoice.value = bot;
    
    const result = determineWinner(choice, bot);
    
    if (result === 'win') {
      resultMessage.value = 'Kamu Menang! 🎉';
      playerScore.value++;
      gsap.fromTo('.player-hand', { scale: 1 }, { scale: 1.5, duration: 0.3, yoyo: true, repeat: 1, ease: "back.out(1.7)" });
    } else if (result === 'lose') {
      resultMessage.value = 'Kamu Kalah! 😢';
      botScore.value++;
      gsap.fromTo('.bot-hand', { scale: 1 }, { scale: 1.5, duration: 0.3, yoyo: true, repeat: 1, ease: "back.out(1.7)" });
    } else {
      resultMessage.value = 'Seri! 🤝';
    }
    
    isAnimating.value = false;
  });
};
</script>

<template>
  <div class="rps-container" :style="{ backgroundImage: `url(${rpsBg})` }">
    <div class="rps-overlay"></div>
    
    <div class="header">
      <button class="back-btn" @click="emit('back')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        Kembali
      </button>
      <h2 class="title">Batu Gunting Kertas</h2>
      <div class="score-board">
        <div class="score">Kamu: <span class="score-number">{{ playerScore }}</span></div>
        <div class="score">Bot: <span class="score-number">{{ botScore }}</span></div>
      </div>
    </div>

    <div class="game-area">
      <div class="battle-arena">
        <div class="hand player-hand" :class="{ 'animating': isAnimating }">
          <div class="hand-label">Kamu</div>
          <div class="hand-icon" v-if="playerChoice">{{ playerChoice.icon }}</div>
          <div class="hand-icon placeholder" v-else>❓</div>
        </div>
        
        <div class="vs-text">VS</div>
        
        <div class="hand bot-hand" :class="{ 'animating': isAnimating }">
          <div class="hand-label">Bot</div>
          <div class="hand-icon" v-if="botChoice">{{ botChoice.icon }}</div>
          <div class="hand-icon placeholder" v-else>🤖</div>
        </div>
      </div>

      <div class="status-panel">
        <div class="message-board">{{ resultMessage }}</div>
        
        <div class="controls" :class="{ disabled: isAnimating }">
          <button 
            v-for="choice in choices" 
            :key="choice.id" 
            class="choice-btn"
            @click="playGame(choice)"
            :disabled="isAnimating"
          >
            <span class="choice-icon">{{ choice.icon }}</span>
            <span class="choice-name">{{ choice.name }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rps-container {
  width: 100%;
  height: 100%;
  position: relative;
  background-size: cover;
  background-position: center;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  color: white;
  font-family: 'Inter', sans-serif;
  box-shadow: inset 0 0 100px rgba(0,0,0,0.8);
}

.rps-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(circle at center, rgba(13, 2, 22, 0.4) 0%, rgba(13, 2, 22, 0.8) 100%);
  z-index: 1;
}

.header, .game-area {
  position: relative;
  z-index: 2;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%);
}

.back-btn {
  background: rgba(26, 11, 46, 0.8);
  border: 2px solid var(--accent-gold, #d4af37);
  border-radius: 30px;
  padding: 10px 24px;
  color: var(--accent-gold, #d4af37);
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  font-weight: 800;
  font-size: 1rem;
  letter-spacing: 1px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  backdrop-filter: blur(10px);
}

.back-btn:hover {
  background: var(--accent-gold, #d4af37);
  color: #1a0b2e;
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
  transform: translateY(-2px);
}

.back-btn svg { width: 20px; }

.title {
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  margin: 0;
  color: #fcf6ba;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 4px 15px rgba(0,0,0,0.8);
}

.score-board {
  display: flex;
  gap: 30px;
  font-size: 1.2rem;
  font-weight: 600;
  background: rgba(26, 11, 46, 0.8);
  padding: 12px 30px;
  border-radius: 30px;
  border: 2px solid rgba(212, 175, 55, 0.5);
  box-shadow: 0 4px 15px rgba(0,0,0,0.5);
  backdrop-filter: blur(10px);
}

.score-number {
  color: var(--accent-gold, #d4af37);
  font-size: 1.4rem;
  font-weight: 800;
  margin-left: 5px;
}

.game-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  padding: 20px 40px 40px;
}

.battle-arena {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 80px;
  width: 100%;
  max-width: 800px;
  perspective: 1000px;
}

.hand {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 25px 30px 40px;
  border: 2px solid rgba(212, 175, 55, 0.3);
  width: 200px;
  height: 240px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.5), inset 0 0 20px rgba(212, 175, 55, 0.1);
  backdrop-filter: blur(12px);
  transition: all 0.3s ease;
}

.hand.animating {
  border-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.4);
}

.hand-label {
  font-size: 1.1rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 3px;
  background: rgba(0,0,0,0.4);
  padding: 6px 16px;
  border-radius: 20px;
}

.hand-icon {
  font-size: 6.5rem;
  line-height: 1;
  filter: drop-shadow(0 10px 15px rgba(0,0,0,0.6));
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.placeholder {
  opacity: 0.3;
  font-size: 5rem;
}

.vs-text {
  font-family: 'Playfair Display', serif;
  font-size: 4rem;
  font-weight: 900;
  color: #ff3366;
  text-shadow: 0 0 20px rgba(255,51,102,0.6), 0 4px 10px rgba(0,0,0,0.8);
  font-style: italic;
  position: relative;
  z-index: 10;
  animation: pulse 2s infinite alternate;
}

@keyframes pulse {
  0% { transform: scale(1); text-shadow: 0 0 20px rgba(255,51,102,0.6); }
  100% { transform: scale(1.1); text-shadow: 0 0 40px rgba(255,51,102,0.9); }
}

.status-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  width: 100%;
}

.message-board {
  font-size: 3.5rem;
  font-weight: 900;
  text-shadow: 0 4px 15px rgba(0,0,0,0.8), 0 0 20px rgba(212, 175, 55, 0.4);
  color: var(--accent-gold, #fcf6ba);
  text-align: center;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 1px;
}

.controls {
  display: flex;
  gap: 25px;
  justify-content: center;
  padding: 20px;
  background: rgba(0,0,0,0.3);
  border-radius: 30px;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255,255,255,0.1);
}

.controls.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.choice-btn {
  background: linear-gradient(135deg, rgba(44, 27, 77, 0.9) 0%, rgba(26, 11, 46, 0.9) 100%);
  border: 2px solid var(--accent-gold, #d4af37);
  border-radius: 20px;
  padding: 15px 35px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  color: white;
  box-shadow: 0 8px 20px rgba(0,0,0,0.4);
  backdrop-filter: blur(10px);
}

.choice-btn:hover {
  transform: translateY(-12px) scale(1.08);
  box-shadow: 0 20px 40px rgba(212, 175, 55, 0.4);
  background: linear-gradient(135deg, rgba(61, 38, 107, 0.9) 0%, rgba(42, 18, 76, 0.9) 100%);
  border-color: #fff;
}

.choice-icon {
  font-size: 3rem;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5));
}

.choice-name {
  font-weight: 800;
  font-size: 1.2rem;
  letter-spacing: 2px;
  text-transform: uppercase;
}

@media (max-width: 1024px) {
  .battle-arena {
    gap: 40px;
  }
  .hand {
    width: 160px;
    height: 200px;
    padding: 15px 20px 25px;
  }
  .hand-icon {
    font-size: 5rem;
  }
  .vs-text {
    font-size: 3rem;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 15px 20px;
    flex-wrap: wrap;
    justify-content: center;
    gap: 15px;
  }
  .title {
    font-size: 1.8rem;
    order: -1;
    width: 100%;
    text-align: center;
  }
  .score-board {
    padding: 8px 20px;
    font-size: 1rem;
    gap: 20px;
  }
  .score-number {
    font-size: 1.2rem;
  }
  .game-area {
    padding: 10px 20px 20px;
  }
  .battle-arena {
    gap: 20px;
  }
  .hand {
    width: 120px;
    height: 150px;
    padding: 10px 15px 15px;
    border-radius: 16px;
  }
  .hand-icon {
    font-size: 3.5rem;
  }
  .placeholder {
    font-size: 3rem;
  }
  .hand-label {
    font-size: 0.8rem;
    padding: 4px 10px;
  }
  .vs-text {
    font-size: 2.2rem;
  }
  .message-board {
    font-size: 2.2rem;
    min-height: 50px;
  }
  .controls {
    flex-wrap: wrap;
    gap: 15px;
    padding: 15px;
  }
  .choice-btn {
    padding: 10px 25px;
    border-radius: 16px;
  }
  .choice-icon {
    font-size: 2rem;
  }
  .choice-name {
    font-size: 1rem;
  }
}
</style>
