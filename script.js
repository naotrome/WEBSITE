// DOM Elements
const mobileMenu = document.getElementById('mobile-menu');
const navMenu = document.querySelector('.nav-menu');
const navbar = document.querySelector('.navbar');

// Mobile Navigation Toggle
mobileMenu.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    mobileMenu.classList.toggle('active');
});

// Close mobile menu when clicking on nav links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        mobileMenu.classList.remove('active');
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    
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
        indicator.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            height: 4px;
            background: linear-gradient(135deg, #2E8B57, #1E90FF);
            z-index: 9999;
            transition: width 0.3s ease;
        `;
        document.body.appendChild(indicator);
    }
    
    indicator.style.width = scrolled + '%';
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Add loading animation to sections
            entry.target.classList.add('loaded');
        }
    });
}, observerOptions);

// Observe elements for animations
document.addEventListener('DOMContentLoaded', () => {
    // Observe all cards for loading animation
    document.querySelectorAll('.about-card, .community-link').forEach(card => {
        card.classList.add('loading');
        observer.observe(card);
    });
    
    // Initialize Jupiter chart
    createJupiterChart();
});

// Jupiter Chart
function createJupiterChart() {
    const ctx = document.getElementById('jupiterChart');
    if (!ctx) return;
    
    // Generate data points that show exponential growth toward Jupiter
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = [0.00001234, 0.00002456, 0.00005123, 0.00012345, 0.00034567, 0.00089123, 0.00234567, 0.00678901, 0.01234567, 0.03456789, 0.08912345, 0.23456789];
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'ToTheJupiter Coin Price ($)',
                data: data,
                borderColor: '#32CD32',
                backgroundColor: 'rgba(50, 205, 50, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#32CD32',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: '#FFD700',
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#32CD32',
                    borderWidth: 1,
                    cornerRadius: 10,
                    displayColors: false,
                    callbacks: {
                        title: function(context) {
                            return `${context[0].label} 2024`;
                        },
                        label: function(context) {
                            return `$${context.parsed.y.toFixed(8)} 🚀`;
                        },
                        afterLabel: function(context) {
                            const index = context.dataIndex;
                            if (index === data.length - 1) {
                                return 'Destination: Jupiter! 🪐';
                            }
                            return 'Next stop: Jupiter! 🌟';
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'rgba(255, 255, 255, 0.3)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        font: {
                            size: 12,
                            weight: '500'
                        }
                    }
                },
                y: {
                    type: 'logarithmic',
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'rgba(255, 255, 255, 0.3)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        font: {
                            size: 12,
                            weight: '500'
                        },
                        callback: function(value) {
                            return '$' + value.toFixed(8);
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            animation: {
                duration: 3000,
                easing: 'easeOutQuart'
            },
            elements: {
                line: {
                    borderJoinStyle: 'round'
                }
            }
        }
    });
}

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
    const styles = {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: type === 'success' ? 'linear-gradient(135deg, #32CD32, #228B22)' : 
                   type === 'error' ? 'linear-gradient(135deg, #ff6b6b, #ee5a52)' : 
                   'linear-gradient(135deg, #2E8B57, #1E90FF)',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '10px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        zIndex: '10000',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        maxWidth: '400px',
        animation: 'slideInRight 0.3s ease',
        fontSize: '1rem',
        fontWeight: '500'
    };
    
    Object.assign(notification.style, styles);
    
    // Close button styles
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        margin-left: auto;
        opacity: 0.8;
        transition: opacity 0.3s ease;
    `;
    
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Add animation styles for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-close:hover {
        opacity: 1 !important;
    }
    
    .loading {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease;
    }
    
    .loaded {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(notificationStyles);

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add parallax effect to hero background
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const rate = scrolled * -0.5;
    
    if (hero) {
        hero.style.transform = `translateY(${rate}px)`;
    }
});

// Add floating animation to cards on hover
document.querySelectorAll('.about-card, .community-link').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
    });
});

// Random floating particles background effect
function createFloatingParticles() {
    const particleCount = 20;
    const hero = document.querySelector('.hero');
    
    if (!hero) return;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 6 + 2}px;
            height: ${Math.random() * 6 + 2}px;
            background: rgba(144, 238, 144, ${Math.random() * 0.5 + 0.1});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: floatUp ${Math.random() * 20 + 10}s linear infinite;
            pointer-events: none;
        `;
        hero.appendChild(particle);
    }
}

// Add CSS for floating particles
const particleStyles = document.createElement('style');
particleStyles.textContent = `
    @keyframes floatUp {
        0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(particleStyles);

// Initialize floating particles
document.addEventListener('DOMContentLoaded', () => {
    createFloatingParticles();
});