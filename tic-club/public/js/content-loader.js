class ContentLoader {
    constructor() {
        this.currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'home';
    }

    async loadPageContent() {
        try {
            const response = await fetch(`/api/content/${this.currentPage}`);
            const contents = await response.json();
            
            // Group contents by section
            const contentsBySection = contents.reduce((acc, content) => {
                if (!acc[content.section]) {
                    acc[content.section] = [];
                }
                acc[content.section].push(content);
                return acc;
            }, {});

            // Load content for each section
            Object.entries(contentsBySection).forEach(([section, contents]) => {
                this.renderSectionContent(section, contents);
            });
        } catch (error) {
            console.error('Error loading page content:', error);
        }
    }

    renderSectionContent(section, contents) {
        const sectionElement = document.getElementById(section);
        if (!sectionElement) return;

        switch (section) {
            case 'hero':
                this.renderHeroSection(sectionElement, contents[0]);
                break;
            case 'club-overview':
                this.renderClubOverview(sectionElement, contents[0]);
                break;
            case 'team-member':
                this.renderTeamMembers(sectionElement, contents);
                break;
            case 'history-timeline':
                this.renderHistoryTimeline(sectionElement, contents);
                break;
            case 'event-hero':
                this.renderEventHero(sectionElement, contents[0]);
                break;
            case 'featured-event':
                this.renderFeaturedEvents(sectionElement, contents);
                break;
            case 'workshop':
            case 'hackathon':
            case 'lecture':
            case 'tech-talk':
                this.renderEventCards(sectionElement, contents);
                break;
            case 'gallery-item':
                this.renderGalleryItems(sectionElement, contents);
                break;
            case 'membership-plan':
                this.renderMembershipPlans(sectionElement, contents);
                break;
            case 'membership-benefit':
                this.renderMembershipBenefits(sectionElement, contents);
                break;
            case 'project-item':
                this.renderProjectItems(sectionElement, contents);
                break;
            default:
                this.renderDefaultContent(sectionElement, contents);
        }
    }

    renderHeroSection(element, content) {
        if (!content) return;
        element.innerHTML = `
            <div class="hero-content">
                <h1>${content.title}</h1>
                ${content.subtitle ? `<p class="subtitle">${content.subtitle}</p>` : ''}
                <p>${content.content}</p>
            </div>
            ${content.imageUrl ? `<div class="hero-image"><img src="${content.imageUrl}" alt="${content.title}"></div>` : ''}
        `;
    }

    renderClubOverview(element, content) {
        if (!content) return;
        element.innerHTML = `
            <h2>${content.title}</h2>
            ${content.subtitle ? `<h3>${content.subtitle}</h3>` : ''}
            <div class="overview-content">
                ${content.content.split('\n').map(para => `<p>${para}</p>`).join('')}
            </div>
            ${content.imageUrl ? `<img src="${content.imageUrl}" alt="${content.title}" class="overview-image">` : ''}
        `;
    }

    renderTeamMembers(element, contents) {
        element.innerHTML = `
            <div class="team-grid">
                ${contents.map(member => `
                    <div class="team-card">
                        ${member.imageUrl ? `<img src="${member.imageUrl}" alt="${member.title}" class="member-image">` : ''}
                        <h3>${member.title}</h3>
                        ${member.subtitle ? `<h4>${member.subtitle}</h4>` : ''}
                        <p>${member.content}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderHistoryTimeline(element, contents) {
        element.innerHTML = `
            <div class="timeline">
                ${contents.map((item, index) => `
                    <div class="timeline-item ${index % 2 === 0 ? 'left' : 'right'}">
                        <div class="timeline-content">
                            <h3>${item.title}</h3>
                            ${item.subtitle ? `<div class="timeline-date">${item.subtitle}</div>` : ''}
                            <p>${item.content}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderEventHero(element, content) {
        if (!content) return;
        element.innerHTML = `
            <div class="event-hero">
                <h1>${content.title}</h1>
                ${content.subtitle ? `<p class="event-date">${content.subtitle}</p>` : ''}
                <p class="event-description">${content.content}</p>
                ${content.imageUrl ? `<img src="${content.imageUrl}" alt="${content.title}" class="event-hero-image">` : ''}
            </div>
        `;
    }

    renderFeaturedEvents(element, contents) {
        element.innerHTML = `
            <div class="featured-events-slider">
                ${contents.map(event => `
                    <div class="featured-event-slide">
                        ${event.imageUrl ? `<img src="${event.imageUrl}" alt="${event.title}" class="event-image">` : ''}
                        <div class="event-info">
                            <h3>${event.title}</h3>
                            ${event.subtitle ? `<p class="event-date">${event.subtitle}</p>` : ''}
                            <p>${event.content}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        // Initialize slider if needed
        if (typeof Swiper !== 'undefined' && contents.length > 1) {
            new Swiper('.featured-events-slider', {
                slidesPerView: 1,
                spaceBetween: 30,
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
            });
        }
    }

    renderEventCards(element, contents) {
        element.innerHTML = `
            <div class="event-cards">
                ${contents.map(event => `
                    <div class="event-card">
                        ${event.imageUrl ? `<img src="${event.imageUrl}" alt="${event.title}" class="event-card-image">` : ''}
                        <div class="event-card-content">
                            <h3>${event.title}</h3>
                            ${event.subtitle ? `<p class="event-date">${event.subtitle}</p>` : ''}
                            <p>${event.content}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderGalleryItems(element, contents) {
        element.innerHTML = `
            <div class="gallery-grid">
                ${contents.map(item => `
                    <div class="gallery-item">
                        <img src="${item.imageUrl}" alt="${item.title}" class="gallery-image">
                        <div class="gallery-overlay">
                            <h3>${item.title}</h3>
                            ${item.subtitle ? `<p>${item.subtitle}</p>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderMembershipPlans(element, contents) {
        element.innerHTML = `
            <div class="membership-plans">
                ${contents.map(plan => `
                    <div class="plan-card">
                        <h3>${plan.title}</h3>
                        ${plan.subtitle ? `<div class="price">${plan.subtitle}</div>` : ''}
                        <div class="plan-features">
                            ${plan.content.split('\n').map(feature => `<p>${feature}</p>`).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderMembershipBenefits(element, contents) {
        element.innerHTML = `
            <div class="benefits-grid">
                ${contents.map(benefit => `
                    <div class="benefit-card">
                        ${benefit.imageUrl ? `<img src="${benefit.imageUrl}" alt="${benefit.title}" class="benefit-icon">` : ''}
                        <h3>${benefit.title}</h3>
                        <p>${benefit.content}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderProjectItems(element, contents) {
        element.innerHTML = `
            <div class="projects-grid">
                ${contents.map(project => `
                    <div class="project-card">
                        ${project.imageUrl ? `<img src="${project.imageUrl}" alt="${project.title}" class="project-image">` : ''}
                        <div class="project-content">
                            <h3>${project.title}</h3>
                            ${project.subtitle ? `<p class="project-category">${project.subtitle}</p>` : ''}
                            <p>${project.content}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderDefaultContent(element, contents) {
        element.innerHTML = contents.map(content => `
            <div class="content-block">
                <h3>${content.title}</h3>
                ${content.subtitle ? `<h4>${content.subtitle}</h4>` : ''}
                ${content.imageUrl ? `<img src="${content.imageUrl}" alt="${content.title}">` : ''}
                <div class="content-text">${content.content}</div>
            </div>
        `).join('');
    }
}

// Initialize content loader when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const contentLoader = new ContentLoader();
    contentLoader.loadPageContent();
});
