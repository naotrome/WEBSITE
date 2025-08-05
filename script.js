// DOM Elements
const mobileMenu = document.getElementById('mobile-menu');
const navMenu = document.querySelector('.nav-menu');
const navbar = document.querySelector('.navbar');
const statNumbers = document.querySelectorAll('.stat-number');
const buyBtn = document.getElementById('buy-btn');
const newsletterForm = document.querySelector('.newsletter-form');

// Mobile Navigation Toggle
mobileMenu.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    
    // Animate hamburger menu
    const bars = mobileMenu.querySelectorAll('.bar');
    bars.forEach((bar, index) => {
        bar.style.transform = navMenu.classList.contains('active') 
            ? `rotate(${index === 0 ? 45 : index === 2 ? -45 : 0}deg) translate(${index === 1 ? '100px' : '0'}, ${index === 0 ? '8px' : index === 2 ? '-8px' : '0'})`
            : 'none';
        bar.style.opacity = navMenu.classList.contains('active') && index === 1 ? '0' : '1';
    });
});

// Close mobile menu when clicking on nav links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const bars = mobileMenu.querySelectorAll('.bar');
        bars.forEach(bar => {
            bar.style.transform = 'none';
            bar.style.opacity = '1';
        });
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;
    
    // Navbar background opacity
    if (scrolled > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }

    // Scroll progress indicator
    updateScrollIndicator();
});

// Scroll Progress Indicator
function updateScrollIndicator() {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
    const clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
    const scrolled = (scrollTop / (scrollHeight - clientHeight)) * 100;
    
    // Create scroll indicator if it doesn't exist
    let indicator = document.querySelector('.scroll-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'scroll-indicator';
        document.body.appendChild(indicator);
    }
    
    indicator.style.width = scrolled + '%';
}

// Counter Animation for Hero Stats
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 16);
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Animate counters when hero stats come into view
            if (entry.target.classList.contains('hero-stats')) {
                statNumbers.forEach(stat => {
                    const target = parseInt(stat.getAttribute('data-target'));
                    animateCounter(stat, target);
                });
            }
            
            // Add loading animation to sections
            entry.target.classList.add('loaded');
        }
    });
}, observerOptions);

// Observe elements for animations
document.addEventListener('DOMContentLoaded', () => {
    // Observe hero stats
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        observer.observe(heroStats);
    }
    
    // Observe all cards for loading animation
    document.querySelectorAll('.about-card, .timeline-item, .community-link').forEach(card => {
        card.classList.add('loading');
        observer.observe(card);
    });
});

// Tokenomics Chart
function createTokenomicsChart() {
    const ctx = document.getElementById('tokenomicsChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Liquidity Pool', 'Community', 'Marketing', 'Team'],
            datasets: [{
                data: [50, 30, 15, 5],
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#ff6b6b',
                    '#4ade80'
                ],
                borderWidth: 0,
                cutout: '60%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#fff',
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 14,
                            weight: '500'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#667eea',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                duration: 2000,
                easing: 'easeOutQuart'
            }
        }
    });
}

// Buy Button Click Handler
buyBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Add loading animation
    const originalText = buyBtn.innerHTML;
    buyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
    buyBtn.style.pointerEvents = 'none';
    
    // Simulate connection delay
    setTimeout(() => {
        buyBtn.innerHTML = originalText;
        buyBtn.style.pointerEvents = 'auto';
        
        // Show alert (in real implementation, this would connect to a wallet)
        showNotification('🚀 Wallet connection would happen here! This is a demo.', 'info');
    }, 2000);
});

// Newsletter Form Handler
newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = newsletterForm.querySelector('input[type="email"]').value;
    const button = newsletterForm.querySelector('button');
    const originalText = button.innerHTML;
    
    // Validate email
    if (!isValidEmail(email)) {
        showNotification('❌ Please enter a valid email address', 'error');
        return;
    }
    
    // Show loading state
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
    button.style.pointerEvents = 'none';
    
    // Simulate API call
    setTimeout(() => {
        button.innerHTML = originalText;
        button.style.pointerEvents = 'auto';
        newsletterForm.reset();
        showNotification('🎉 Welcome to the moon mission! Check your email for confirmation.', 'success');
    }, 1500);
});

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '100px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '10px',
        color: 'white',
        fontSize: '14px',
        fontWeight: '500',
        maxWidth: '400px',
        zIndex: '10000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
        opacity: '0',
        transform: 'translateX(100%)',
        transition: 'all 0.3s ease',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
    });
    
    // Set background color based on type
    const colors = {
        success: 'linear-gradient(135deg, #4ade80, #22c55e)',
        error: 'linear-gradient(135deg, #ef4444, #dc2626)',
        info: 'linear-gradient(135deg, #667eea, #764ba2)'
    };
    notification.style.background = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        margin-left: 10px;
    `;
    
    const closeNotification = () => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    };
    
    closeBtn.addEventListener('click', closeNotification);
    
    // Auto close after 5 seconds
    setTimeout(closeNotification, 5000);
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero && scrolled < hero.offsetHeight) {
        const rate = scrolled * -0.5;
        hero.style.transform = `translate3d(0, ${rate}px, 0)`;
    }
});

// Add hover effects to community links
document.querySelectorAll('.community-link').forEach(link => {
    link.addEventListener('mouseenter', () => {
        link.style.transform = 'translateY(-5px) scale(1.02)';
    });
    
    link.addEventListener('mouseleave', () => {
        link.style.transform = 'translateY(0) scale(1)';
    });
});

// Floating animation for hero elements
function addFloatingAnimation() {
    const floatingElements = document.querySelectorAll('.realistic-dog, .moon, .star');
    
    floatingElements.forEach((element, index) => {
        const amplitude = 8 + (index * 3);
        const frequency = 0.015 + (index * 0.008);
        let startTime = Date.now();
        
        function animate() {
            const elapsed = Date.now() - startTime;
            const y = Math.sin(elapsed * frequency) * amplitude;
            
            // For the realistic dog, combine floating with breathing animation
            if (element.classList.contains('realistic-dog')) {
                const breathingScale = 1 + Math.sin(elapsed * 0.01) * 0.02;
                element.style.transform = `translateY(${y}px) scale(${breathingScale})`;
            } else {
                element.style.transform = `translateY(${y}px)`;
            }
            requestAnimationFrame(animate);
        }
        
        animate();
    });
}

// Add interactive dog features
function addDogInteractivity() {
    const realisticDog = document.querySelector('.realistic-dog');
    const dogTongue = document.querySelector('.dog-tongue');
    const dogEars = document.querySelectorAll('.dog-ear-left, .dog-ear-right');
    
    if (realisticDog) {
        // Dog responds to clicks
        realisticDog.addEventListener('click', () => {
            // Happy panting animation
            dogTongue.style.animation = 'tongueWag 0.5s ease-in-out 3';
            
            // Ear wiggle
            dogEars.forEach(ear => {
                ear.style.animation = 'earFlap 0.8s ease-in-out 2';
            });
            
            // Show notification
            showNotification('🐕 Woof! DogeMoon says hello! Much interactive! 🚀', 'success');
            
            // Reset animations after completion
            setTimeout(() => {
                dogTongue.style.animation = 'tongueWag 2s ease-in-out infinite';
                dogEars.forEach(ear => {
                    ear.style.animation = 'earFlap 4s ease-in-out infinite';
                });
            }, 2000);
        });
        
        // Dog follows mouse slightly
        document.addEventListener('mousemove', (e) => {
            const rect = realisticDog.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const deltaX = (e.clientX - centerX) * 0.02;
            const deltaY = (e.clientY - centerY) * 0.02;
            
            const eyes = document.querySelectorAll('.dog-eye-left, .dog-eye-right');
            eyes.forEach(eye => {
                eye.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
            });
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create tokenomics chart
    createTokenomicsChart();
    
    // Add floating animations
    addFloatingAnimation();
    
    // Add dog interactivity
    addDogInteractivity();
    
    // Add loading class to sections for animation
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('loading');
        observer.observe(section);
    });
    
    // Initialize scroll indicator
    updateScrollIndicator();
    
    console.log('🚀 DogeMoon website loaded with realistic dog! Ready for moon mission!');
});

// Add some Easter eggs for fun
let konamiCode = [];
const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.keyCode);
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    
    if (konamiCode.length === konamiSequence.length && 
        konamiCode.every((code, index) => code === konamiSequence[index])) {
        showNotification('🎮 Konami Code activated! Much wow, very secret! 🚀🌙', 'success');
        
        // Add rainbow animation to the logo
        const logo = document.querySelector('.nav-logo');
        logo.style.animation = 'rainbow 2s linear infinite';
        
        // Add rainbow keyframes if they don't exist
        if (!document.querySelector('#rainbow-keyframes')) {
            const style = document.createElement('style');
            style.id = 'rainbow-keyframes';
            style.textContent = `
                @keyframes rainbow {
                    0% { filter: hue-rotate(0deg); }
                    100% { filter: hue-rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        konamiCode = [];
    }
});

// Add click counter for logo (another Easter egg)
let logoClicks = 0;
document.querySelector('.nav-logo').addEventListener('click', () => {
    logoClicks++;
    if (logoClicks === 10) {
        showNotification('🐕 Wow! Much clicks! Such dedication! Have a treat! 🦴', 'success');
        logoClicks = 0;
        
        // Add bouncing bone emoji
        const bone = document.createElement('div');
        bone.innerHTML = '🦴';
        bone.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            font-size: 3rem;
            z-index: 10000;
            animation: bounce 1s ease-in-out 3;
            pointer-events: none;
        `;
        document.body.appendChild(bone);
        
        setTimeout(() => bone.remove(), 3000);
    }
});

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to scroll events
const debouncedScrollHandler = debounce(() => {
    updateScrollIndicator();
}, 10);

window.addEventListener('scroll', debouncedScrollHandler, { passive: true });