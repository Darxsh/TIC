document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.querySelector('.carousel');
    const cards = document.querySelectorAll('.card');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    const indicators = document.querySelectorAll('.indicator');
    
    let currentIndex = 0;
    const cardWidth = 100; // In percentage
    let startX = 0;
    let isDragging = false;

    // Show TechFusion notification
    function showNotification() {
        const notification = document.createElement('div');
        notification.className = 'techfusion-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="bot-animation">
                    <div class="bot-head">
                        <div class="bot-eye left"></div>
                        <div class="bot-eye right"></div>
                    </div>
                    <div class="bot-body"></div>
                </div>
                <div class="notification-text">
                    <h3>TechFusion 2K25-26</h3>
                    <p>Coming Soon! Stay tuned for dates</p>
                </div>
                <button class="notification-close">×</button>
            </div>
        `;
        document.body.appendChild(notification);

        // Add close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        });

        // Auto hide after 10 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.classList.add('fade-out');
                setTimeout(() => notification.remove(), 300);
            }
        }, 10000);
    }
    
    // Set initial position
    updateCarousel();
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            navigateCarousel('prev');
        } else if (e.key === 'ArrowRight') {
            navigateCarousel('next');
        }
    });

    // Touch events for swipe
    carousel.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        isDragging = true;
    });

    carousel.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        e.preventDefault();
        const currentX = e.touches[0].clientX;
        const diff = startX - currentX;
        
        if (Math.abs(diff) > 50) { // Minimum swipe distance
            if (diff > 0) {
                navigateCarousel('next');
            } else {
                navigateCarousel('prev');
            }
            isDragging = false;
        }
    });

    carousel.addEventListener('touchend', function() {
        isDragging = false;
    });

    function navigateCarousel(direction) {
        if (direction === 'prev' && currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        } else if (direction === 'next' && currentIndex < cards.length - 1) {
            currentIndex++;
            updateCarousel();
        }
    }
    
    // Navigation buttons
    prevBtn.addEventListener('click', () => navigateCarousel('prev'));
    nextBtn.addEventListener('click', () => navigateCarousel('next'));
    
    // Indicator clicks
    indicators.forEach(indicator => {
        indicator.addEventListener('click', function() {
            currentIndex = parseInt(this.dataset.index);
            updateCarousel();
        });
    });
    
    // Update carousel position and indicators
    function updateCarousel() {
        carousel.style.transform = `translateX(-${currentIndex * cardWidth}%)`;
        
        // Update indicators with animation
        indicators.forEach((indicator, index) => {
            if (index === currentIndex) {
                indicator.classList.add('active');
                indicator.style.transform = 'scale(1.2)';
            } else {
                indicator.classList.remove('active');
                indicator.style.transform = 'scale(1)';
            }
        });
        
        // Update arrow visibility with fade effect
        prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
        nextBtn.style.opacity = currentIndex === cards.length - 1 ? '0.5' : '1';
        
        // Add active class to current card for animation
        cards.forEach((card, index) => {
            if (index === currentIndex) {
                card.classList.add('active-card');
            } else {
                card.classList.remove('active-card');
            }
        });
    }
    
    // Auto-play with improved timing
    let autoplayInterval = setInterval(autoPlay, 5000);
    
    function autoPlay() {
        if (currentIndex < cards.length - 1) {
            currentIndex++;
        } else {
            currentIndex = 0;
        }
        updateCarousel();
    }
    
    // Pause autoplay on hover
    carousel.parentElement.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
    carousel.parentElement.addEventListener('mouseleave', () => autoplayInterval = setInterval(autoPlay, 5000));
    
    // Enhanced Register button functionality - Disabled
    const registerBtns = document.querySelectorAll('.register-btn');
    registerBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent any default action
        });
    });
    
    // Show notification on page load
    showNotification();
});