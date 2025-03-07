// Function to check if this is initial load or refresh
function isInitialLoadOrRefresh() {
    // Check if page is being loaded for the first time in this session
    if (!sessionStorage.getItem('pageLoaded')) {
        sessionStorage.setItem('pageLoaded', 'true');
        return true;
    }
    
    // Check if page is being refreshed
    if (performance.navigation.type === 1) {
        return true;
    }

    return false;
}

// Function to redirect to loading page
function handleLoading() {
    if (isInitialLoadOrRefresh() && window.location.pathname !== '/loading.html') {
        // Save the intended destination
        sessionStorage.setItem('destination', window.location.pathname);
        // Redirect to loading page
        window.location.href = '/loading.html';
    }
}

// Pages to preload
const pagesToPreload = [
    '/pages/gallery.html',
    '/pages/events.html',
    '/pages/about.html',
    '/pages/contact.html'
];

// Cache for preloaded content
const pageCache = new Map();

// Preload pages in background
async function preloadPages() {
    const promises = pagesToPreload.map(async (page) => {
        try {
            const response = await fetch(page);
            const text = await response.text();
            pageCache.set(page, text);
        } catch (error) {
            console.warn(`Failed to preload ${page}:`, error);
        }
    });

    await Promise.all(promises);
}

// Initialize loading animation
function initLoading() {
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.style.display = 'flex';
    }
}

// Hide loading animation
function hideLoading() {
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }
}

// Run on page load
if (document.readyState === 'loading') {
    handleLoading();
}

// Start preloading when the page loads
window.addEventListener('load', () => {
    initLoading();
    
    // Start preloading pages
    preloadPages().then(() => {
        hideLoading();
    });
});
