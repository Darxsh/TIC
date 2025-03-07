document.addEventListener('DOMContentLoaded', function() {
    const eventsGrid = document.querySelector('.events-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Function to fetch events from events.html
    async function fetchEvents() {
        try {
            const response = await fetch('/pages/events.html');
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const carouselCards = doc.querySelectorAll('.carousel .card');
            
            return Array.from(carouselCards).map(card => ({
                title: card.querySelector('.card-title').textContent,
                date: card.querySelector('.card-date').textContent,
                description: card.querySelector('.event-details').textContent,
                coordinator: card.querySelector('.coordinator-name')?.textContent || '',
                faculty: card.querySelector('.faculty-name')?.textContent || '',
                time: card.querySelector('.event-time')?.textContent || '',
                status: determineEventStatus(card.querySelector('.card-date').textContent),
                image: card.querySelector('.event-image')?.getAttribute('src') || '/images/events/default.jpg'
            }));
        } catch (error) {
            console.error('Error fetching events:', error);
            return [];
        }
    }
    
    // Determine event status based on date
    function determineEventStatus(dateStr) {
        const eventDate = new Date(dateStr);
        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;
        
        if (eventDate < now - oneDay) {
            return 'past';
        } else if (eventDate > now + oneDay) {
            return 'upcoming';
        } else {
            return 'ongoing';
        }
    }
    
    // Create event card HTML
    function createEventCard(event) {
        return `
            <div class="event-card" data-status="${event.status}">
                <div class="event-image-container">
                    <img src="${event.image}" alt="${event.title}" class="event-image">
                </div>
                <div class="event-content">
                    <h3 class="event-title">${event.title}</h3>
                    <div class="event-date">${event.date}</div>
                    <div class="event-time">${event.time}</div>
                    <p class="event-description">${event.description}</p>
                    <div class="event-coordinators">
                        ${event.coordinator ? `<p>Coordinator: ${event.coordinator}</p>` : ''}
                        ${event.faculty ? `<p>Faculty: ${event.faculty}</p>` : ''}
                    </div>
                    <div class="event-footer">
                        <span class="event-status status-${event.status}">
                            ${event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </span>
                        <button class="register-btn" ${event.status === 'past' ? 'disabled' : ''}>
                            ${event.status === 'past' ? 'Event Ended' : 'Register Now'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Render events with loading state
    async function renderEvents(filter = 'all') {
        // Show loading state
        eventsGrid.innerHTML = '<div class="loading-spinner">Loading events...</div>';
        
        // Fetch and render events
        const events = await fetchEvents();
        const filteredEvents = filter === 'all' 
            ? events 
            : events.filter(event => event.status === filter);
        
        if (filteredEvents.length === 0) {
            eventsGrid.innerHTML = `
                <div class="no-events">
                    <i class="fas fa-calendar-times"></i>
                    <p>No ${filter} events found</p>
                </div>
            `;
            return;
        }
        
        eventsGrid.innerHTML = filteredEvents.map(createEventCard).join('');
        
        // Add event listeners to register buttons
        document.querySelectorAll('.register-btn').forEach(btn => {
            if (!btn.disabled) {
                btn.addEventListener('click', function(e) {
                    const card = this.closest('.event-card');
                    const title = card.querySelector('.event-title').textContent;
                    const date = card.querySelector('.event-date').textContent;
                    showRegistrationModal(title, date);
                });
            }
        });
    }
    
    // Filter button click handlers
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderEvents(this.dataset.filter);
        });
    });
    
    // Create and show notification
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

    // Show notification and initial render
    showNotification();
    renderEvents();
});
