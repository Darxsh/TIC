document.addEventListener('DOMContentLoaded', function() {
    const previewContainer = document.querySelector('.techfusion-preview');
    
    // Function to fetch events from events.html
    async function fetchPreviewEvents() {
        try {
            const response = await fetch('/pages/events.html');
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const carouselCards = Array.from(doc.querySelectorAll('.carousel .card')).slice(0, 3);
            
            return carouselCards.map(card => ({
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
    
    // Create preview card HTML
    function createPreviewCard(event) {
        return `
            <div class="preview-card">
                <div class="preview-image-container">
                    <img src="${event.image}" alt="${event.title}" class="preview-image">
                </div>
                <div class="preview-content">
                    <h3 class="preview-title">${event.title}</h3>
                    <div class="preview-date">${event.date}</div>
                    <p class="preview-description">${event.description}</p>
                </div>
            </div>
        `;
    }
    
    // Render preview events
    async function renderPreviewEvents() {
        const events = await fetchPreviewEvents();
        
        if (events.length === 0) {
            previewContainer.innerHTML = '<p class="no-preview">Stay tuned for upcoming events!</p>';
            return;
        }
        
        previewContainer.innerHTML = `
            <div class="preview-header">
                <h2>TechFusion Preview</h2>
                <a href="/pages/events.html" class="view-all-btn">View All Events</a>
            </div>
            <div class="preview-grid">
                ${events.map(createPreviewCard).join('')}
            </div>
        `;
    }
    
    // Initial render
    renderPreviewEvents();
});
