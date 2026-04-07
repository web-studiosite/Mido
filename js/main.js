/**
 * MIDO Restaurante v2 - Main JavaScript
 * Funcionalidades comuns a todas as páginas
 */

// ============================================
// DOM ELEMENTS
// ============================================
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
const themeToggle = document.getElementById('themeToggle');

// ============================================
// NAVIGATION SCROLL EFFECT
// ============================================
function handleNavScroll() {
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
}

window.addEventListener('scroll', handleNavScroll, { passive: true });

// ============================================
// MOBILE MENU TOGGLE
// ============================================
if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close mobile menu on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });
}

// ============================================
// THEME TOGGLE (Dark/Light Mode)
// ============================================
function initTheme() {
    const savedTheme = localStorage.getItem('mido-theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    if (newTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('mido-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('mido-theme', 'light');
    }
}

if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}

// Initialize theme on load
initTheme();

// ============================================
// SMOOTH SCROLL
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            const offset = 80;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// SCROLL REVEAL ANIMATIONS
// ============================================
const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// ============================================
// PARALLAX EFFECTS
// ============================================
const parallaxImages = document.querySelectorAll('.about-image img, .feature-card');

function handleParallax() {
    const scrollY = window.scrollY;
    
    parallaxImages.forEach(img => {
        const rect = img.getBoundingClientRect();
        const containerTop = rect.top + scrollY;
        const containerHeight = rect.height;
        
        if (scrollY + window.innerHeight > containerTop && scrollY < containerTop + containerHeight) {
            const progress = (scrollY - containerTop + window.innerHeight) / (window.innerHeight + containerHeight);
            const offset = (progress - 0.5) * 15;
            img.style.transform = `translateY(${offset}px)`;
        }
    });
}

window.addEventListener('scroll', handleParallax, { passive: true });

// ============================================
// BUTTON RIPPLE EFFECT
// ============================================
const buttons = document.querySelectorAll('.hero-btn, .cta-btn, .nav-cta, .form-btn-primary');

buttons.forEach(button => {
    button.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position: absolute;
            background: rgba(255,255,255,0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
            left: ${x}px;
            top: ${y}px;
            width: 100px;
            height: 100px;
            margin-left: -50px;
            margin-top: -50px;
        `;
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    });
});

// Add ripple animation keyframes
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to { transform: scale(4); opacity: 0; }
    }
`;
document.head.appendChild(rippleStyle);

// ============================================
// THROTTLE UTILITY
// ============================================
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================================
// REDUCED MOTION SUPPORT
// ============================================
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function handleReducedMotion() {
    if (prefersReducedMotion.matches) {
        document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
            el.style.transition = 'none';
        });
        window.removeEventListener('scroll', handleParallax);
    }
}

prefersReducedMotion.addEventListener('change', handleReducedMotion);
handleReducedMotion();

// ============================================
// PAGE LOAD ANIMATIONS
// ============================================
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// ============================================
// CONSOLE WELCOME
// ============================================
console.log('%c MIDO Restaurante ', 'background: #0B1E1B; color: #D4A03A; font-size: 20px; font-weight: bold; padding: 10px 20px; border-radius: 8px;');
console.log('%c Comida caseira, feita com cuidado. ', 'color: #6E6A62; font-size: 12px;');
