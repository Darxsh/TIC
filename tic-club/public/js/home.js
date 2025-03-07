// Function to load and display hero section content
async function updateHeroSection() {
    try {
        const response = await fetch('/api/content?type=hero');
        const heroContent = await response.json();
        
        if (heroContent && heroContent.length > 0) {
            const content = heroContent[0]; // Get the first active hero content
            document.querySelector('.hero-content h1').textContent = content.title;
            document.querySelector('.hero-content p:first-of-type').textContent = content.subtitle;
            document.querySelector('.hero-content p:last-of-type').textContent = content.content;
            if (content.imageUrl) {
                document.querySelector('.hero-image img').src = content.imageUrl;
            }
        }
    } catch (error) {
        console.error('Error updating hero section:', error);
    }
}

// Function to load and display mission section content
async function updateMissionSection() {
    try {
        const response = await fetch('/api/content?type=mission');
        const missionContent = await response.json();
        
        if (missionContent && missionContent.length > 0) {
            const missionCards = document.querySelector('.mission-cards');
            missionCards.innerHTML = missionContent
                .sort((a, b) => a.order - b.order)
                .map(content => `
                    <div class="mission-card animate-fadeInUp">
                        <div class="icon"><i class="${content.icon || 'fas fa-check'}"></i></div>
                        <h3>${content.title}:</h3>
                        <p>${content.content}</p>
                    </div>
                `).join('');
        }
    } catch (error) {
        console.error('Error updating mission section:', error);
    }
}

// Function to load and display vision section content
async function updateVisionSection() {
    try {
        const response = await fetch('/api/content?type=vision');
        const visionContent = await response.json();
        
        if (visionContent && visionContent.length > 0) {
            const visionCards = document.querySelector('.vision-cards');
            visionCards.innerHTML = visionContent
                .sort((a, b) => a.order - b.order)
                .map(content => `
                    <div class="vision-card animate-fadeInUp">
                        <div class="icon"><i class="${content.icon || 'fas fa-check'}"></i></div>
                        <h3>${content.content}</h3>
                    </div>
                `).join('');
        }
    } catch (error) {
        console.error('Error updating vision section:', error);
    }
}

// Function to load and display events preview section
async function updateEventsPreview() {
    try {
        const response = await fetch('/api/content?type=event');
        const eventsContent = await response.json();
        
        if (eventsContent && eventsContent.length > 0) {
            const eventCards = document.querySelector('.event-cards');
            eventCards.innerHTML = eventsContent
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map(content => `
                    <div class="event-card animate-fadeInUp">
                        <div class="event-image">
                            ${content.imageUrl ? `<img src="${content.imageUrl}" alt="${content.title}">` : ''}
                        </div>
                        <div class="event-content">
                            <h3>${content.title}</h3>
                            <div class="date">
                                <i class="fas fa-calendar"></i> 
                                ${new Date(content.date).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </div>
                            <p>${content.content}</p>
                        </div>
                    </div>
                `).join('');
        }
    } catch (error) {
        console.error('Error updating events preview:', error);
    }
}

// Function to initialize Swiper for achievements
function initializeAchievementsSwiper() {
    const achievementsContainer = document.querySelector('.achievements .swiper-wrapper');
    if (!achievementsContainer) return;

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
            320: {
                slidesPerView: 1,
                spaceBetween: 10
            },
            480: {
                slidesPerView: 2,
                spaceBetween: 15
            },
            768: {
                slidesPerView: 3,
                spaceBetween: 20
            },
            1024: {
                slidesPerView: 4,
                spaceBetween: 20
            }
        }
    });
}

// Function to load and display achievements
async function updateAchievements() {
    try {
        const response = await fetch('/api/content?type=achievement');
        const achievements = await response.json();
        
        if (achievements && achievements.length > 0) {
            const achievementsWrapper = document.querySelector('.achievements .swiper-wrapper');
            achievementsWrapper.innerHTML = achievements
                .sort((a, b) => b.createdAt - a.createdAt)
                .map(achievement => `
                    <div class="swiper-slide">
                        <div class="achievement-card">
                            ${achievement.imageUrl ? 
                                `<img src="${achievement.imageUrl}" alt="${achievement.title}">` : 
                                '<div class="placeholder-image"></div>'
                            }
                            <h3>${achievement.title}</h3>
                            <p>${achievement.content}</p>
                        </div>
                    </div>
                `).join('');
            
            // Initialize Swiper if more than 4 achievements
            if (achievements.length > 4) {
                initializeAchievementsSwiper();
            }
        }
    } catch (error) {
        console.error('Error updating achievements:', error);
    }
}

// Load upcoming events
async function loadUpcomingEvents() {
    try {
        const response = await fetch('/api/events?limit=3&upcoming=true');
        if (!response.ok) {
            throw new Error('Failed to fetch events');
        }
        const events = await response.json();
        displayEvents(events);
    } catch (error) {
        console.error('Error loading events:', error);
    }
}

// Display events in the container
function displayEvents(events) {
    const container = document.getElementById('events-container');
    container.innerHTML = '';

    events.forEach(event => {
        const date = new Date(event.date);
        const card = document.createElement('div');
        card.className = 'col-md-4 mb-4';
        card.innerHTML = `
            <div class="card h-100">
                ${event.image ? `<img src="${event.image}" class="card-img-top" alt="${event.title}">` : ''}
                <div class="card-body">
                    <h5 class="card-title">${event.title}</h5>
                    <p class="card-text">${event.description}</p>
                    <p class="card-text">
                        <small class="text-muted">
                            <i class="far fa-calendar"></i> ${date.toLocaleDateString()}
                            <br>
                            <i class="far fa-clock"></i> ${event.time}
                        </small>
                    </p>
                </div>
                <div class="card-footer bg-transparent">
                    <a href="/pages/events.html#${event._id}" class="btn btn-primary btn-sm">Learn More</a>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Load featured projects
async function loadFeaturedProjects() {
    try {
        const response = await fetch('/api/projects?featured=true&limit=3');
        if (!response.ok) {
            throw new Error('Failed to fetch projects');
        }
        const projects = await response.json();
        displayProjects(projects);
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// Display projects in the container
function displayProjects(projects) {
    const container = document.getElementById('projects-container');
    container.innerHTML = '';

    projects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'col-md-4 mb-4';
        card.innerHTML = `
            <div class="card h-100">
                ${project.image ? `<img src="${project.image}" class="card-img-top" alt="${project.title}">` : ''}
                <div class="card-body">
                    <h5 class="card-title">${project.title}</h5>
                    <p class="card-text">${project.description}</p>
                    <div class="project-tech">
                        ${project.technologies.map(tech => `
                            <span class="badge bg-secondary me-1">${tech}</span>
                        `).join('')}
                    </div>
                </div>
                <div class="card-footer bg-transparent">
                    <a href="/pages/projects.html#${project._id}" class="btn btn-primary btn-sm">View Project</a>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Initialize all sections when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([
        updateHeroSection(),
        updateMissionSection(),
        updateVisionSection(),
        updateEventsPreview(),
        updateAchievements(),
        loadUpcomingEvents(),
        loadFeaturedProjects()
    ]);
});
