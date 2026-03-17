import gsap from 'gsap';

const centralHand = document.querySelector('.central-hand');
const sparkleLeft = document.getElementById('sparkle-left');
const sparkleRight = document.getElementById('sparkle-right');
const cards = document.querySelectorAll('.card');

// GSAP context for better cleanup if needed
let handAnimation;
let idleAnimation;

function startIdleAnimation() {
    idleAnimation = gsap.to(centralHand, {
        y: 10,
        rotation: 1,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });
}

// Start idle animation initially
startIdleAnimation();

// Function to calculate angle and animate
function pointHandAt(element) {
    if (idleAnimation) idleAnimation.pause();
    
    const handRect = centralHand.getBoundingClientRect();
    const cardRect = element.getBoundingClientRect();
    
    // PivotX tetap di tengah horizontal tangan
    const pivotX = handRect.left + handRect.width / 2;
    
    // PIVOT Y: Kita paksa porosnya ada di area logo. 
    // Karena margin-top negatif, handRect.top biasanya sudah masuk ke area logo.
    // Kita tambahkan offset kecil (misal 10-20px) agar beneran terasa di tengah badge logo.
    const pivotY = handRect.top + 20; 

    // Hitung sudut
    const cardCenterX = cardRect.left + cardRect.width / 2;
    const cardCenterY = cardRect.top + cardRect.height / 2;
    
    const angleRad = Math.atan2(cardCenterY - pivotY, cardCenterX - pivotX);
    const angleDeg = (angleRad * 180 / Math.PI) - 90; // Adjust biar 0deg itu lurus ke bawah
    
    // Batasi sudut biar tangan gak patah (opsional tapi bagus buat estetika)
    const clampedAngle = Math.max(Math.min(angleDeg, 45), -45);

    if (handAnimation) handAnimation.kill();
    
    handAnimation = gsap.to(centralHand, {
        rotation: clampedAngle,
        scale: 1.05, // Sedikit membesar saat menunjuk
        y: 0,
        duration: 0.6, // Percepat sedikit biar responsif
        ease: "back.out(1.7)", // Efek pegas biar keren
        overwrite: true
    });
}

function resetHand() {
    if (handAnimation) handAnimation.kill();
    
    handAnimation = gsap.to(centralHand, {
        rotation: 0,
        scale: 1,
        y: 0,
        duration: 1.2,
        ease: "power2.out",
        onComplete: () => {
            if (idleAnimation) idleAnimation.play();
        }
    });
}

cards.forEach((card, index) => {
    card.addEventListener('mouseenter', () => {
        pointHandAt(card);
        
        if (index < 2) {
            sparkleLeft.classList.add('active');
        } else {
            sparkleRight.classList.add('active');
        }
    });

    card.addEventListener('mouseleave', () => {
        resetHand();
        sparkleLeft.classList.remove('active');
        sparkleRight.classList.remove('active');
    });

    card.addEventListener('click', () => {
        const title = card.querySelector('.card-title').textContent;
        const cardId = card.id;
        
        // Create Sparkle Burst
        createSparkleBurst(card);
        
        // Brief delay for animation before navigating
        setTimeout(() => {
            if (cardId === 'card-info') {
                window.location.href = 'info.html';
            } else if (cardId === 'card-work') {
                window.location.href = 'work.html';
            } else if (cardId === 'card-play') {
                window.location.href = 'play.html';
            } else {
                window.location.href = `service.html?title=${title}`;
            }
        }, 500);
    });
});

function createSparkleBurst(card) {
    const container = document.createElement('div');
    container.className = 'card-sparkle-container';
    card.appendChild(container);

    // Positions for: Top, Bottom, Right, Left, and diagonals
    const directions = [
        { x: 0, y: -180 },   // Top
        { x: 0, y: 180 },    // Bottom
        { x: 180, y: 0 },    // Right
        { x: -180, y: 0 },   // Left
        { x: 140, y: -140 }, // Top-Right
        { x: -140, y: -140 },// Top-Left
        { x: 140, y: 140 },  // Bottom-Right
        { x: -140, y: 140 }  // Bottom-Left
    ];

    directions.forEach(dir => {
        const particle = document.createElement('div');
        particle.className = 'sparkle-particle animate';
        particle.style.setProperty('--tx', `${dir.x}px`);
        particle.style.setProperty('--ty', `${dir.y}px`);
        container.appendChild(particle);
    });

    // Remove element after animation finishes
    setTimeout(() => {
        container.remove();
    }, 1000);
}

