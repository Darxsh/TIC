document.addEventListener('DOMContentLoaded', function() {
    // Function to include header and footer
    const includeHTML = function() {
        const includes = document.getElementsByTagName('include');
        
        Array.from(includes).forEach(include => {
            const file = include.getAttribute('src');
            
            fetch(file)
                .then(response => {
                    if (response.ok) return response.text();
                    throw new Error('File not found');
                })
                .then(data => {
                    include.insertAdjacentHTML('afterend', data);
                    include.remove();
                    
                    // Initialize components based on included file
                    if (file.includes('header')) {
                        initHeader();
                    } else if (file.includes('footer')) {
                        initFooter();
                    }
                })
                .catch(error => {
                    console.error(`Error including file ${file}:`, error);
                    include.insertAdjacentHTML('afterend', `<div class="error">Failed to load ${file}</div>`);
                    include.remove();
                });
        });
    };
    
    // Initialize header functionality
    const initHeader = function() {
        const header = document.querySelector('header');
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        const navItems = document.querySelectorAll('nav ul li');
        
        if (!header || !mobileMenuToggle || !navMenu) return;

        // Add index for staggered animation
        navItems.forEach((item, index) => {
            item.style.setProperty('--i', index);
        });

        // Handle menu toggle
        mobileMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMenu();
        });

        // Close menu when clicking a link
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    toggleMenu(false);
                }
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 768 && 
                !navMenu.contains(e.target) && 
                !mobileMenuToggle.contains(e.target) && 
                navMenu.classList.contains('active')) {
                toggleMenu(false);
            }
        });

        // Handle scroll behavior
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            // Show/hide header on scroll
            if (currentScroll > lastScroll && currentScroll > 100) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
            
            lastScroll = currentScroll;
        });

        // Toggle menu function
        function toggleMenu(force) {
            const isOpen = force !== undefined ? force : !navMenu.classList.contains('active');
            
            navMenu.classList.toggle('active', isOpen);
            document.body.classList.toggle('menu-open', isOpen);
            
            // Animate nav items
            navItems.forEach(item => {
                if (isOpen) {
                    item.style.transitionDelay = `${parseFloat(item.style.getPropertyValue('--i')) * 0.1}s`;
                } else {
                    item.style.transitionDelay = '0s';
                }
            });
        }

        // Handle window resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (window.innerWidth > 768) {
                    toggleMenu(false);
                }
            }, 250);
        });

        // Set active menu item
        const currentPage = window.location.pathname;
        navItems.forEach(item => {
            const link = item.querySelector('a');
            if (link && (link.getAttribute('href') === currentPage || 
                        currentPage.includes(link.getAttribute('href')))) {
                item.classList.add('active');
            }
        });
    };
    
    // Initialize footer functionality
    const initFooter = function() {
        const newsletterForm = document.querySelector('form');
        
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const emailInput = this.querySelector('input[type="email"]');
                if (emailInput && emailInput.value) {
                    // Show success message
                    const successMsg = document.createElement('p');
                    successMsg.className = 'success-message';
                    successMsg.textContent = 'Thank you for subscribing!';
                    successMsg.style.color = '#1da1f2';
                    
                    // Replace form with success message
                    this.innerHTML = '';
                    this.appendChild(successMsg);
                }
            });
        }
    };
    
    // Run the include HTML function
    includeHTML();
});