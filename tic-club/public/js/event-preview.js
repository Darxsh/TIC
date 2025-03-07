document.addEventListener('DOMContentLoaded', function() {
    const eventCards = document.querySelector('.event-cards');
    
    // Function to fetch events from events.html
    async function fetchPreviewEvents() {
        try {
            const response = await fetch('/pages/events.html');
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const carouselCards = Array.from(doc.querySelectorAll('.carousel .card'));
            
            // Find the Gaming Zone event
            const gamingEvent = carouselCards.find(card => 
                card.querySelector('.card-title').textContent.toLowerCase().includes('gaming')
            );
            
            // Get first two non-gaming events
            const otherEvents = carouselCards
                .filter(card => !card.querySelector('.card-title').textContent.toLowerCase().includes('gaming'))
                .slice(0, 2);
            
            // Combine events with gaming in the middle
            const events = [
                otherEvents[0],
                gamingEvent,
                otherEvents[1]
            ];
            
            return events.map(card => ({
                title: card.querySelector('.card-title').textContent,
                date: card.querySelector('.card-date').textContent,
                description: card.querySelector('.event-details').textContent,
                image: card.querySelector('.event-image')?.getAttribute('src') || '/images/events/default.jpg'
            }));
        } catch (error) {
            console.error('Error fetching preview events:', error);
            return [];
        }
    }
    
    // Update existing event cards with fetched data
    async function updateEventCards() {
        const events = await fetchPreviewEvents();
        const eventCardElements = document.querySelectorAll('.event-card');
        
        events.forEach((event, index) => {
            if (eventCardElements[index]) {
                const card = eventCardElements[index];
                card.querySelector('.event-image').style.backgroundImage = `url('${event.image}')`;
                card.querySelector('h3').textContent = event.title;
                card.querySelector('.date').innerHTML = `<i class="fas fa-calendar"></i> ${event.date}`;
                card.querySelector('p').textContent = event.description;
            }
        });
    }
    
    // Initial update
    updateEventCards();
});
