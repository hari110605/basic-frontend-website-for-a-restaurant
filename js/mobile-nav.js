// ===============================================================================
//                    MOBILE NAVIGATION ENHANCEMENT
// ===============================================================================

// Mobile navigation state
let isMobileMenuOpen = false;

// Initialize mobile navigation
function initializeMobileNav() {
    setupMobileMenuHandlers();
    handleOrientationChange();
    setupTouchNavigation();
    highlightActivePage();
}

// Setup mobile menu event handlers
function setupMobileMenuHandlers() {
    const toggleButton = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (!toggleButton || !navLinks) return;

    // Toggle button click
    toggleButton.addEventListener('click', toggleMobileMenu);

    // Close menu when clicking nav links
    navLinks.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            closeMobileMenu();
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (isMobileMenuOpen && !e.target.closest('.menu')) {
            closeMobileMenu();
        }
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMobileMenuOpen) {
            closeMobileMenu();
        }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && isMobileMenuOpen) {
            closeMobileMenu();
        }
    });
}



// Toggle mobile menu
function toggleMobileMenu() {
    if (isMobileMenuOpen) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

// Open mobile menu
function openMobileMenu() {
    const toggleButton = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (!toggleButton || !navLinks) return;
    
    isMobileMenuOpen = true;
    toggleButton.classList.add('active');
    navLinks.classList.add('mobile-open');
    toggleButton.setAttribute('aria-expanded', 'true');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Focus management
    const firstLink = navLinks.querySelector('a');
    if (firstLink) {
        setTimeout(() => firstLink.focus(), 300);
    }
}

// Close mobile menu
function closeMobileMenu() {
    const toggleButton = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (!toggleButton || !navLinks) return;
    
    isMobileMenuOpen = false;
    toggleButton.classList.remove('active');
    navLinks.classList.remove('mobile-open');
    toggleButton.setAttribute('aria-expanded', 'false');
    
    // Restore body scroll
    document.body.style.overflow = '';
}

// Handle orientation change
function handleOrientationChange() {
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            if (isMobileMenuOpen) {
                closeMobileMenu();
            }
        }, 100);
    });
}

// Setup touch navigation for better mobile experience
function setupTouchNavigation() {
    let touchStartX = 0;
    let touchStartY = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
        if (!e.changedTouches[0]) return;
        
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        
        // Swipe right to open menu (from left edge)
        if (deltaX > 50 && Math.abs(deltaY) < 100 && touchStartX < 50 && !isMobileMenuOpen) {
            openMobileMenu();
        }
        
        // Swipe left to close menu
        if (deltaX < -50 && Math.abs(deltaY) < 100 && isMobileMenuOpen) {
            closeMobileMenu();
        }
    }, { passive: true });
}

// Add active page highlighting
function highlightActivePage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkPage = link.getAttribute('href');
        
        if (linkPage === currentPage || 
            (currentPage === '' && linkPage === 'index.html') ||
            (currentPage === 'index.html' && linkPage === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeMobileNav();
    highlightActivePage();
});

// Export functions for global access
if (typeof window !== 'undefined') {
    window.toggleMobileMenu = toggleMobileMenu;
    window.openMobileMenu = openMobileMenu;
    window.closeMobileMenu = closeMobileMenu;
    window.initializeMobileNav = initializeMobileNav;
}
