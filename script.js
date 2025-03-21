class WheelPicker {
    constructor() {
        this.canvas = document.getElementById('wheelCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.names = [
            'Ram',
            'Shyam',
            'Radhe',
            'Rahul',
            'Ayush',
            'Atharv',
            'Kusum'
        ];
        this.currentRotation = 0;
        this.isSpinning = false;
        this.wheelColor = '#FF5733';
        this.textColor = '#FFFFFF';
        this.spinDuration = 5;
        this.lastWinner = null;
        this.confettiPieces = [];
        this.spinningSound = document.getElementById('spinningSound');
        this.celebrationSound = document.getElementById('celebrationSound');
        this.winningSound = document.getElementById('winningSound');
        this.confettiInterval = null;

        this.setupCanvas();
        this.setupEventListeners();
        this.drawWheel(); // Draw wheel immediately with default names
    }

    setupCanvas() {
        // Set canvas size to match container
        const container = this.canvas.parentElement;
        this.canvas.width = container.offsetWidth;
        this.canvas.height = container.offsetHeight;
    }

    setupEventListeners() {
        document.getElementById('spinButton').addEventListener('click', () => this.spin());
        document.getElementById('addButton').addEventListener('click', () => this.addNames());
        document.getElementById('clearButton').addEventListener('click', () => this.clearNames());
        document.getElementById('removeWinner').addEventListener('click', () => this.removeWinner());
        document.getElementById('keepWinner').addEventListener('click', () => this.keepWinner());
        document.getElementById('wheelColor').addEventListener('input', (e) => this.updateWheelColor(e.target.value));
        document.getElementById('textColor').addEventListener('input', (e) => this.updateTextColor(e.target.value));
        document.getElementById('spinDuration').addEventListener('input', (e) => this.updateSpinDuration(e.target.value));

        // Add color box selection
        const colorBoxes = document.querySelectorAll('.color-box');
        colorBoxes.forEach(box => {
            box.addEventListener('click', () => {
                // Remove active class from all boxes
                colorBoxes.forEach(b => b.classList.remove('active'));
                // Add active class to clicked box
                box.classList.add('active');
                // Update wheel color
                this.updateWheelColor(box.dataset.color);
            });
        });

        // Set initial active color
        colorBoxes[0].classList.add('active');

        // Window resize
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.drawWheel();
        });
    }

    drawWheel() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.names.length === 0) {
            this.drawEmptyWheel(centerX, centerY, radius);
            return;
        }

        const sliceAngle = (2 * Math.PI) / this.names.length;

        for (let i = 0; i < this.names.length; i++) {
            // Adjust the angle to align with the pointer at the top
            const startAngle = i * sliceAngle + this.currentRotation - Math.PI / 2;
            const endAngle = (i + 1) * sliceAngle + this.currentRotation - Math.PI / 2;

            // Draw slice
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            this.ctx.closePath();
            this.ctx.fillStyle = this.wheelColor;
            this.ctx.fill();
            this.ctx.stroke();

            // Draw text
            this.ctx.save();
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate(startAngle + sliceAngle / 2);
            this.ctx.textAlign = 'right';
            this.ctx.fillStyle = this.textColor;
            this.ctx.font = 'bold 16px Roboto';
            this.ctx.fillText(this.names[i], radius - 20, 5);
            this.ctx.restore();
        }
    }

    drawEmptyWheel(centerX, centerY, radius) {
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = this.wheelColor;
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = this.textColor;
        this.ctx.font = 'bold 20px Roboto';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Add names to begin', centerX, centerY);
    }

    createConfetti() {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        // Random position
        const left = Math.random() * 100;
        confetti.style.left = left + 'vw';
        
        // Random delay
        const delay = Math.random() * 2;
        confetti.style.animationDelay = delay + 's';
        
        // Random size
        const size = 5 + Math.random() * 10;
        confetti.style.width = size + 'px';
        confetti.style.height = size + 'px';
        
        // Random color
        const colors = ['#FFD700', '#FF0000', '#00FF00', '#0000FF', '#FF00FF', '#00FFFF', '#FFA500'];
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Random shape
        if (Math.random() > 0.5) {
            confetti.style.borderRadius = '50%';
        } else {
            confetti.style.borderRadius = '0';
        }
        
        document.body.appendChild(confetti);
        this.confettiPieces.push(confetti);

        // Remove confetti after animation
        setTimeout(() => {
            confetti.remove();
            this.confettiPieces = this.confettiPieces.filter(c => c !== confetti);
        }, 5000 + delay * 1000);
    }

    startConfetti() {
        // Create initial confetti
        for (let i = 0; i < 150; i++) { // Increased initial confetti
            this.createConfetti();
        }

        // Continue creating confetti
        this.confettiInterval = setInterval(() => {
            if (this.confettiPieces.length < 300) { // Increased max confetti
                this.createConfetti();
            }
        }, 50);
    }

    stopConfetti() {
        clearInterval(this.confettiInterval);
        this.confettiPieces.forEach(confetti => confetti.remove());
        this.confettiPieces = [];
    }

    showCelebration(winner) {
        const celebrationOverlay = document.querySelector('.celebration-overlay');
        const celebrationWinner = document.getElementById('celebrationWinner');
        
        celebrationWinner.textContent = winner;
        celebrationOverlay.style.display = 'flex';
        this.startConfetti();
        this.celebrationSound.play();

        // Prevent scrolling
        document.body.style.overflow = 'hidden';

        // Hide celebration after 5 seconds
        setTimeout(() => {
            celebrationOverlay.style.display = 'none';
            this.stopConfetti();
            this.showWinnerAnnouncement(winner);
        }, 5000);
    }

    spin() {
        this.isSpinning = true;
        const spinButton = document.getElementById('spinButton');
        spinButton.disabled = true;

        // Play spinning sound
        this.spinningSound.currentTime = 0;
        this.spinningSound.play();

        const startTime = Date.now();
        const totalRotation = 5 + Math.random() * 5;
        const duration = this.spinDuration * 1000;

        const animate = () => {
            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const easing = 1 - Math.pow(1 - progress, 3);
            this.currentRotation = totalRotation * 2 * Math.PI * easing;

            this.drawWheel();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isSpinning = false;
                spinButton.disabled = false;
                this.spinningSound.pause();
                this.announceWinner();
            }
        };

        animate();
    }

    showWinnerAnnouncement(winner) {
        const overlay = document.querySelector('.overlay');
        const announcement = document.querySelector('.winner-announcement');
        const winnerName = document.getElementById('winnerName');
        
        winnerName.textContent = winner;
        overlay.style.display = 'block';
        announcement.style.display = 'block';
        
        // Play winning sound
        this.winningSound.play();
        
        // Keep scrolling disabled
        document.body.style.overflow = 'hidden';
    }

    hideWinnerAnnouncement() {
        const overlay = document.querySelector('.overlay');
        const announcement = document.querySelector('.winner-announcement');
        
        overlay.style.display = 'none';
        announcement.style.display = 'none';
        
        // Re-enable scrolling
        document.body.style.overflow = 'auto';
    }

    announceWinner() {
        const sliceAngle = (2 * Math.PI) / this.names.length;
        const normalizedRotation = (this.currentRotation - Math.PI / 2) % (2 * Math.PI);
        const winnerIndex = Math.floor(
            (2 * Math.PI - normalizedRotation) / sliceAngle
        ) % this.names.length;
        
        this.lastWinner = this.names[winnerIndex];
        this.showCelebration(this.lastWinner);
    }

    updateWheelColor(color) {
        this.wheelColor = color;
        this.drawWheel();
    }

    updateTextColor(color) {
        this.textColor = color;
        this.drawWheel();
    }

    updateSpinDuration(duration) {
        this.spinDuration = parseInt(duration);
    }

    addNames() {
        const input = document.getElementById('nameInput');
        const newNames = input.value.split('\n').filter(name => name.trim());
        this.names = [...this.names, ...newNames];
        input.value = '';
        this.drawWheel();
    }

    clearNames() {
        this.names = [];
        this.drawWheel();
    }

    removeWinner() {
        if (this.lastWinner) {
            this.names = this.names.filter(name => name !== this.lastWinner);
            this.drawWheel();
            this.hideWinnerAnnouncement();
        }
    }

    keepWinner() {
        this.hideWinnerAnnouncement();
    }
}

// Initialize the wheel picker when the page loads
window.addEventListener('load', () => {
    new WheelPicker();
}); 