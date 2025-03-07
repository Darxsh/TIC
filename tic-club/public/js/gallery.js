document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const galleryItems = document.querySelectorAll('.gallery-item');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.querySelector('.search-input');
    const lightbox = document.querySelector('.lightbox');
    const lightboxContent = document.querySelector('.lightbox-content');
    const lightboxTitle = document.querySelector('.lightbox-title');
    const lightboxDesc = document.querySelector('.lightbox-desc');
    const closeLightbox = document.querySelector('.close-lightbox');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const imageCounter = document.querySelector('.image-counter');
    const loadMoreBtn = document.querySelector('.load-more-btn');
    const viewButtons = document.querySelectorAll('.view-btn');
    const galleryContainer = document.querySelector('.gallery-container');
    
    let currentIndex = 0;
    let visibleItems = [];
    let itemsToShow = 16; // Initial number of items to show
    let currentView = 'grid';
    
    // Initial animation on load with staggered delay
    galleryItems.forEach((item, index) => {
        if (index < itemsToShow) {
            setTimeout(() => {
                item.classList.add('visible');
            }, 100 * index);
        } else {
            item.style.display = 'none';
        }
    });
    
    // Function to update visible items
    function updateVisibleItems() {
        visibleItems = Array.from(galleryItems).filter(item => 
            item.style.display !== 'none' && item.classList.contains('visible')
        );
    }
    
    // Load more functionality
    loadMoreBtn.addEventListener('click', function() {
        let hiddenItems = Array.from(galleryItems).filter(item => 
            item.style.display === 'none'
        );
        
        // If there are more items to show
        if (hiddenItems.length > 0) {
            // Show next batch of items
            let nextBatch = hiddenItems.slice(0, 8); // Show 8 more items
            
            nextBatch.forEach((item, index) => {
                item.style.display = 'block';
                setTimeout(() => {
                    item.classList.add('visible');
                }, 100 * index);
            });
            
            // If no more items to show, hide the button
            if (hiddenItems.length <= 8) {
                loadMoreBtn.style.display = 'none';
            }
        }
    });
    
    // View switching (grid vs masonry)
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const view = this.getAttribute('data-view');
            
            // Remove active class from all view buttons
            viewButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            if (view === 'grid') {
                galleryContainer.classList.remove('masonry-view');
                currentView = 'grid';
            } else if (view === 'masonry') {
                galleryContainer.classList.add('masonry-view');
                currentView = 'masonry';
            }
            
            // Re-arrange items after view change
            rearrangeItems();
        });
    });

    // Function to rearrange items based on current view
    function rearrangeItems() {
        if (currentView === 'masonry') {
            // Reset special size classes for masonry
            galleryItems.forEach(item => {
                item.classList.remove('featured-item', 'wide-item', 'tall-item');
            });
        } else {
            // Restore original classes based on data attributes
            galleryItems.forEach(item => {
                if (item.hasAttribute('data-featured')) {
                    item.classList.add('featured-item');
                }
                if (item.hasAttribute('data-wide')) {
                    item.classList.add('wide-item');
                }
                if (item.hasAttribute('data-tall')) {
                    item.classList.add('tall-item');
                }
            });
        }
    }

    // Filter buttons functionality
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Remove active class from all filter buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Show/hide items based on filter
            galleryItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                // Reset visibility first
                item.style.display = 'none';
                item.classList.remove('visible');
                
                if (filter === 'all' || category === filter) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.classList.add('visible');
                    }, Math.random() * 300); // Random staggered animation
                }
            });
            
            // Update visible items
            setTimeout(updateVisibleItems, 500);
            
            // Show load more button if there are hidden items
            let hiddenItems = Array.from(galleryItems).filter(item => 
                item.style.display === 'none'
            );
            
            loadMoreBtn.style.display = hiddenItems.length > 0 ? 'inline-block' : 'none';
        });
    });

    // Search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        
        galleryItems.forEach(item => {
            const title = item.querySelector('.item-caption h3').textContent.toLowerCase();
            const desc = item.querySelector('.item-caption p').textContent.toLowerCase();
            const tags = item.getAttribute('data-tags') ? item.getAttribute('data-tags').toLowerCase() : '';
            
            // Reset visibility first
            item.style.display = 'none';
            item.classList.remove('visible');
            
            if (searchTerm === '' || 
                title.includes(searchTerm) || 
                desc.includes(searchTerm) || 
                tags.includes(searchTerm)) {
                item.style.display = 'block';
                setTimeout(() => {
                    item.classList.add('visible');
                }, Math.random() * 300);
            }
        });
        
        // Update visible items after search filtering
        setTimeout(updateVisibleItems, 500);
    });

    // Lightbox functionality
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            const title = this.querySelector('.item-caption h3').textContent;
            const desc = this.querySelector('.item-caption p').textContent;
            const isVideo = this.querySelector('.video-indicator') !== null;
            
            lightboxTitle.textContent = title;
            lightboxDesc.textContent = desc;
            
            // Clear previous content
            lightboxContent.innerHTML = '';
            
            if (isVideo) {
                const video = document.createElement('video');
                video.src = this.querySelector('video').src;
                video.controls = true;
                video.autoplay = true;
                lightboxContent.appendChild(video);
            } else {
                const img = document.createElement('img');
                img.src = this.querySelector('img').src;
                img.alt = this.querySelector('img').alt;
                lightboxContent.appendChild(img);
            }
            
            // Add lightbox info back
            const lightboxInfo = document.createElement('div');
            lightboxInfo.className = 'lightbox-info';
            lightboxInfo.innerHTML = `
                <h3 class="lightbox-title">${title}</h3>
                <p class="lightbox-desc">${desc}</p>
            `;
            lightboxContent.appendChild(lightboxInfo);
            
            // Show lightbox
            lightbox.style.display = 'flex';
            setTimeout(() => {
                lightbox.classList.add('visible');
            }, 50);
            
            // Update current index and image counter
            currentIndex = Array.from(visibleItems).indexOf(this);
            updateImageCounter();
            
            // Prevent page scrolling when lightbox is open
            document.body.style.overflow = 'hidden';
        });
    });

    // Update image counter
    function updateImageCounter() {
        imageCounter.textContent = `${currentIndex + 1} / ${visibleItems.length}`;
    }

    // Close lightbox
    closeLightbox.addEventListener('click', function() {
        lightbox.classList.remove('visible');
        setTimeout(() => {
            lightbox.style.display = 'none';
            
            // If video is playing, pause it
            const video = lightboxContent.querySelector('video');
            if (video) {
                video.pause();
            }
        }, 300);
        
        // Re-enable page scrolling
        document.body.style.overflow = 'auto';
    });

    // Lightbox navigation
    prevBtn.addEventListener('click', function() {
        if (currentIndex > 0) {
            currentIndex--;
        } else {
            currentIndex = visibleItems.length - 1; // Loop to the end
        }
        
        showLightboxItem(currentIndex);
    });

    nextBtn.addEventListener('click', function() {
        if (currentIndex < visibleItems.length - 1) {
            currentIndex++;
        } else {
            currentIndex = 0; // Loop to the beginning
        }
        
        showLightboxItem(currentIndex);
    });

    // Show lightbox item based on index
    function showLightboxItem(index) {
        const item = visibleItems[index];
        const title = item.querySelector('.item-caption h3').textContent;
        const desc = item.querySelector('.item-caption p').textContent;
        const isVideo = item.querySelector('.video-indicator') !== null;
        
        // Clear previous content
        lightboxContent.innerHTML = '';
        
        if (isVideo) {
            const video = document.createElement('video');
            video.src = item.querySelector('video').src;
            video.controls = true;
            video.autoplay = true;
            lightboxContent.appendChild(video);
        } else {
            const img = document.createElement('img');
            img.src = item.querySelector('img').src;
            img.alt = item.querySelector('img').alt;
            lightboxContent.appendChild(img);
        }
        
        // Add lightbox info back
        const lightboxInfo = document.createElement('div');
        lightboxInfo.className = 'lightbox-info';
        lightboxInfo.innerHTML = `
            <h3 class="lightbox-title">${title}</h3>
            <p class="lightbox-desc">${desc}</p>
        `;
        lightboxContent.appendChild(lightboxInfo);
        
        // Update image counter
        updateImageCounter();
    }

    // Close lightbox on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.classList.contains('visible')) {
            closeLightbox.click();
        }
        
        // Left arrow key for previous
        if (e.key === 'ArrowLeft' && lightbox.classList.contains('visible')) {
            prevBtn.click();
        }
        
        // Right arrow key for next
        if (e.key === 'ArrowRight' && lightbox.classList.contains('visible')) {
            nextBtn.click();
        }
    });

    // Click outside to close lightbox
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox.click();
        }
    });

    // Initialize visible items
    updateVisibleItems();

    // Add data attributes to store original layout classes
    galleryItems.forEach(item => {
        if (item.classList.contains('featured-item')) {
            item.setAttribute('data-featured', 'true');
        }
        if (item.classList.contains('wide-item')) {
            item.setAttribute('data-wide', 'true');
        }
        if (item.classList.contains('tall-item')) {
            item.setAttribute('data-tall', 'true');
        }
    });

    // Lazy loading images and videos
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const item = entry.target;
                    const img = item.querySelector('img');
                    const video = item.querySelector('video');
                    
                    if (img && img.getAttribute('data-src')) {
                        img.src = img.getAttribute('data-src');
                        img.removeAttribute('data-src');
                    }
                    
                    if (video && video.getAttribute('data-src')) {
                        video.src = video.getAttribute('data-src');
                        video.removeAttribute('data-src');
                    }
                    
                    observer.unobserve(item);
                }
            });
        });
        
        galleryItems.forEach(item => {
            imageObserver.observe(item);
        });
    }

    // Add hover effect for 3D tilt
    galleryItems.forEach(item => {
        item.addEventListener('mousemove', function(e) {
            const itemRect = this.getBoundingClientRect();
            const x = e.clientX - itemRect.left;
            const y = e.clientY - itemRect.top;
            
            const xPercent = x / itemRect.width * 100;
            const yPercent = y / itemRect.height * 100;
            
            const rotateX = (50 - yPercent) / 10;
            const rotateY = (xPercent - 50) / 10;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });

    // Initialize Intersection Observer for videos
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (!entry.isIntersecting) {
                video.pause();
            }
        });
    }, { threshold: 0.5 });

    // Observe all videos
    document.querySelectorAll('.video-item video').forEach(video => {
        videoObserver.observe(video);
        // Set poster if not already set
        if (!video.hasAttribute('poster')) {
            video.setAttribute('poster', '/images/gallery/video-poster.jpg');
        }
    });

    // Filter functionality
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            // Add loading state
            galleryContainer.classList.add('loading');

            // Delay the filter to show loading animation
            setTimeout(() => {
                galleryItems.forEach(item => {
                    const shouldShow = filter === 'all' || item.dataset.category === filter;
                    item.style.display = shouldShow ? 'block' : 'none';
                    
                    // Pause videos that are hidden
                    const video = item.querySelector('video');
                    if (video && !shouldShow) {
                        video.pause();
                    }
                });

                // Remove loading state
                galleryContainer.classList.remove('loading');
            }, 300);
        });
    });

    // Video handling
    document.querySelectorAll('.video-item').forEach(item => {
        const video = item.querySelector('video');
        const playButton = item.querySelector('.video-indicator');

        // Handle click on video items
        item.addEventListener('click', (e) => {
            e.preventDefault();
            openLightbox(item);
        });

        // Handle mouse enter/leave for preview
        item.addEventListener('mouseenter', () => {
            if (video.paused) {
                video.play().catch(() => {
                    // Handle autoplay failure
                    console.log('Autoplay prevented');
                });
            }
        });

        item.addEventListener('mouseleave', () => {
            if (!video.paused) {
                video.pause();
                video.currentTime = 0;
            }
        });
    });

    // Lightbox functionality
    function openLightbox(item) {
        const isVideo = item.classList.contains('video-item');
        const content = isVideo ? item.querySelector('video').cloneNode(true) : item.querySelector('img').cloneNode(true);
        
        lightboxContent.innerHTML = '';
        lightboxContent.appendChild(content);

        if (isVideo) {
            content.controls = true;
            content.autoplay = true;
            content.loop = true;
            currentVideo = content;
            
            // Start playing when ready
            content.addEventListener('loadedmetadata', () => {
                content.play().catch(console.error);
            });
        }

        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Close lightbox
    closeLightbox.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    function closeLightbox() {
        if (currentVideo) {
            currentVideo.pause();
            currentVideo = null;
        }
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Handle keyboard events
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });

    // Lazy loading for videos
    if ('loading' in HTMLImageElement.prototype) {
        document.querySelectorAll('video[loading="lazy"]').forEach(video => {
            video.src = video.dataset.src;
        });
    } else {
        // Fallback for browsers that don't support lazy loading
        const lazyVideoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const video = entry.target;
                    video.src = video.dataset.src;
                    lazyVideoObserver.unobserve(video);
                }
            });
        });

        document.querySelectorAll('video[loading="lazy"]').forEach(video => {
            lazyVideoObserver.observe(video);
        });
    }
});
