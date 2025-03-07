// Fetch content by type
async function fetchContent(type) {
    try {
        const response = await fetch(`/api/content/${type}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch content');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching ${type} content:`, error);
        return []; // Return empty array on error
    }
}

// Update about content
async function updateAboutContent() {
    try {
        const content = await fetchContent('about');
        const aboutSection = document.getElementById('about-content');
        if (aboutSection && content.length > 0) {
            const aboutContent = content[0];
            aboutSection.innerHTML = `
                <h2>${aboutContent.title}</h2>
                ${aboutContent.subtitle ? `<h3>${aboutContent.subtitle}</h3>` : ''}
                <div class="content">${aboutContent.content}</div>
            `;
        }
    } catch (error) {
        console.error('Error updating about content:', error);
    }
}

// Update mission content
async function updateMissionContent() {
    try {
        const content = await fetchContent('mission');
        const missionSection = document.getElementById('mission-content');
        if (missionSection && content.length > 0) {
            const missionContent = content[0];
            missionSection.innerHTML = `
                <h2>${missionContent.title}</h2>
                ${missionContent.subtitle ? `<h3>${missionContent.subtitle}</h3>` : ''}
                <div class="content">${missionContent.content}</div>
            `;
        }
    } catch (error) {
        console.error('Error updating mission content:', error);
    }
}

// Update vision content
async function updateVisionContent() {
    try {
        const content = await fetchContent('vision');
        const visionSection = document.getElementById('vision-content');
        if (visionSection && content.length > 0) {
            const visionContent = content[0];
            visionSection.innerHTML = `
                <h2>${visionContent.title}</h2>
                ${visionContent.subtitle ? `<h3>${visionContent.subtitle}</h3>` : ''}
                <div class="content">${visionContent.content}</div>
            `;
        }
    } catch (error) {
        console.error('Error updating vision content:', error);
    }
}

// Update achievements
async function updateAchievements() {
    try {
        const achievements = await fetchContent('achievement');
        const achievementsContainer = document.getElementById('achievements-container');
        if (achievementsContainer) {
            if (achievements.length > 0) {
                achievementsContainer.innerHTML = achievements
                    .sort((a, b) => a.order - b.order)
                    .map(achievement => `
                        <div class="achievement-card">
                            ${achievement.image ? `<img src="${achievement.image}" alt="${achievement.title}">` : ''}
                            <h3>${achievement.title}</h3>
                            ${achievement.subtitle ? `<h4>${achievement.subtitle}</h4>` : ''}
                            <p>${achievement.content}</p>
                        </div>
                    `).join('');
            } else {
                achievementsContainer.innerHTML = '<p class="text-center">No achievements to display</p>';
            }
        }
    } catch (error) {
        console.error('Error updating achievements:', error);
    }
}

// Update announcements
async function updateAnnouncements() {
    try {
        const announcements = await fetchContent('announcement');
        const announcementsContainer = document.getElementById('announcements-container');
        if (announcementsContainer) {
            if (announcements.length > 0) {
                announcementsContainer.innerHTML = announcements
                    .sort((a, b) => a.order - b.order)
                    .map(announcement => `
                        <div class="announcement-card">
                            ${announcement.image ? `<img src="${announcement.image}" alt="${announcement.title}">` : ''}
                            <h3>${announcement.title}</h3>
                            ${announcement.subtitle ? `<h4>${announcement.subtitle}</h4>` : ''}
                            <p>${announcement.content}</p>
                        </div>
                    `).join('');
            } else {
                announcementsContainer.innerHTML = '<p class="text-center">No announcements to display</p>';
            }
        }
    } catch (error) {
        console.error('Error updating announcements:', error);
    }
}

// Initialize content when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    // Update content sections if they exist on the page
    const contentPromises = [];
    
    if (document.getElementById('about-content')) {
        contentPromises.push(updateAboutContent());
    }
    if (document.getElementById('mission-content')) {
        contentPromises.push(updateMissionContent());
    }
    if (document.getElementById('vision-content')) {
        contentPromises.push(updateVisionContent());
    }
    if (document.getElementById('achievements-container')) {
        contentPromises.push(updateAchievements());
    }
    if (document.getElementById('announcements-container')) {
        contentPromises.push(updateAnnouncements());
    }

    await Promise.all(contentPromises);
});
