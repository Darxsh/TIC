// Function to load content by type
async function loadContent(type) {
    try {
        const response = await fetch(`/api/content?type=${type}&isActive=true`);
        if (!response.ok) throw new Error(`Failed to fetch ${type} content`);
        const contents = await response.json();
        return contents.sort((a, b) => a.order - b.order);
    } catch (error) {
        console.error(`Error loading ${type} content:`, error);
        return [];
    }
}

// Update hero section
async function updateHeroSection() {
    const contents = await loadContent('hero');
    if (contents.length === 0) return;

    const heroContent = contents[0]; // Use the first hero content
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;

    const content = heroSection.querySelector('.hero-content');
    if (content) {
        content.innerHTML = `
            <h1>${heroContent.title}</h1>
            ${heroContent.subtitle ? `<p>${heroContent.subtitle}</p>` : ''}
            <p>${heroContent.content}</p>
            <div class="hero-buttons">
                <a href="/pages/membership.html" class="btn-primary">Join TIC</a>
                <a href="/pages/about.html" class="btn-secondary">Learn More</a>
            </div>
        `;
    }

    const image = heroSection.querySelector('.hero-image img');
    if (image && heroContent.image) {
        image.src = heroContent.image;
    }
}

// Update mission section
async function updateMissionSection() {
    const contents = await loadContent('mission');
    const missionCards = document.querySelector('.mission-cards');
    if (!missionCards) return;

    missionCards.innerHTML = contents.map(mission => `
        <div class="mission-card animate-fadeInUp">
            <div class="icon"><i class="fas fa-check"></i></div>
            <h3>${mission.title}:</h3>
            <p>${mission.content}</p>
        </div>
    `).join('');
}

// Update vision section
async function updateVisionSection() {
    const contents = await loadContent('vision');
    const visionCards = document.querySelector('.vision-cards');
    if (!visionCards) return;

    visionCards.innerHTML = contents.map(vision => `
        <div class="vision-card animate-fadeInUp">
            <div class="icon"><i class="fas fa-check"></i></div>
            <h3>${vision.content}</h3>
        </div>
    `).join('');
}

// Update achievements section
async function updateAchievements() {
    const contents = await loadContent('achievement');
    const achievementsContainer = document.querySelector('.achievements .swiper-wrapper');
    if (!achievementsContainer) return;

    achievementsContainer.innerHTML = contents.map(achievement => `
        <div class="swiper-slide">
            <div class="achievement-card">
                ${achievement.image ? `<img src="${achievement.image}" alt="${achievement.title}">` : ''}
                <h3>${achievement.title}</h3>
                <p>${achievement.content}</p>
            </div>
        </div>
    `).join('');

    // Initialize Swiper
    new Swiper('.achievements .swiper', {
        slidesPerView: 'auto',
        spaceBetween: 20,
        pagination: {
            el: '.swiper-pagination',
            clickable: true
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
        },
        breakpoints: {
            640: {
                slidesPerView: 2,
            },
            1024: {
                slidesPerView: 3,
            }
        }
    });
}

// Update events section
async function updateEvents() {
    const contents = await loadContent('event');
    const eventCards = document.querySelector('.event-cards');
    if (!eventCards) return;

    eventCards.innerHTML = contents.map(event => `
        <div class="event-card animate-fadeInUp">
            <div class="event-image">
                ${event.image ? `<img src="${event.image}" alt="${event.title}">` : ''}
            </div>
            <div class="event-content">
                <h3>${event.title}</h3>
                <div class="date"><i class="fas fa-calendar"></i> ${event.subtitle || ''}</div>
                <p>${event.content}</p>
            </div>
        </div>
    `).join('');
}

// Initialize all sections
document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([
        updateHeroSection(),
        updateMissionSection(),
        updateVisionSection(),
        updateAchievements(),
        updateEvents()
    ]);
});
