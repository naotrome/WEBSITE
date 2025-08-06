// TotheNineCloud (T9C) Web3 Integration
class TotheNineCloudApp {
    constructor() {
        this.web3 = null;
        this.account = null;
        this.contract = null;
        this.contractAddress = null; // Will be set after deployment
        this.contractABI = [
            // Essential ABI for TotheNineCloud contract
            "function name() view returns (string)",
            "function symbol() view returns (string)",
            "function decimals() view returns (uint8)",
            "function totalSupply() view returns (uint256)",
            "function balanceOf(address) view returns (uint256)",
            "function transfer(address to, uint256 amount) returns (bool)",
            "function allowance(address owner, address spender) view returns (uint256)",
            "function approve(address spender, uint256 amount) returns (bool)",
            "function transferFrom(address from, address to, uint256 amount) returns (bool)",
            "function maxTransactionAmount() view returns (uint256)",
            "function maxWalletAmount() view returns (uint256)",
            "function reflectionFee() view returns (uint256)",
            "function totalFees() view returns (uint256)",
            "function isExcludedFromFee(address) view returns (bool)",
            "function burn(uint256 amount)",
            "event Transfer(address indexed from, address indexed to, uint256 value)",
            "event CloudReached(address indexed holder, uint256 amount)",
            "event AntiWhaleTriggered(address indexed whale, uint256 attemptedAmount)"
        ];
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.initializeAnimations();
        this.createTokenomicsChart();
        this.startCloudAnimation();
        this.checkWalletConnection();
    }

    setupEventListeners() {
        // Wallet connection
        document.getElementById('connectWallet')?.addEventListener('click', () => this.connectWallet());
        document.getElementById('disconnectWallet')?.addEventListener('click', () => this.disconnectWallet());
        document.getElementById('closeWallet')?.addEventListener('click', () => this.closeWalletPanel());
        document.getElementById('refreshBalance')?.addEventListener('click', () => this.refreshBalance());

        // Token actions
        document.getElementById('buyTokenBtn')?.addEventListener('click', () => this.showBuyModal());
        document.getElementById('viewChartBtn')?.addEventListener('click', () => this.openChart());

        // Mobile menu
        document.getElementById('mobileMenuToggle')?.addEventListener('click', () => this.toggleMobileMenu());

        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Scroll effects
        window.addEventListener('scroll', () => this.handleScroll());
    }

    async connectWallet() {
        try {
            if (typeof window.ethereum === 'undefined') {
                this.showNotification('Please install MetaMask to connect your wallet!', 'error');
                return;
            }

            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            this.account = accounts[0];

            // Initialize ethers
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            this.web3 = provider;

            // Update UI
            this.updateWalletUI();
            this.showWalletPanel();
            this.showNotification('Wallet connected successfully! ☁️', 'success');

            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    this.disconnectWallet();
                } else {
                    this.account = accounts[0];
                    this.updateWalletUI();
                }
            });

            // Listen for network changes
            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });

        } catch (error) {
            console.error('Error connecting wallet:', error);
            this.showNotification('Failed to connect wallet. Please try again.', 'error');
        }
    }

    disconnectWallet() {
        this.account = null;
        this.web3 = null;
        this.contract = null;
        this.updateWalletUI();
        this.closeWalletPanel();
        this.showNotification('Wallet disconnected', 'info');
    }

    async checkWalletConnection() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    this.account = accounts[0];
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    this.web3 = provider;
                    this.updateWalletUI();
                }
            } catch (error) {
                console.error('Error checking wallet connection:', error);
            }
        }
    }

    updateWalletUI() {
        const connectBtn = document.getElementById('connectWallet');
        const walletAddress = document.getElementById('walletAddress');

        if (this.account) {
            connectBtn.innerHTML = `<i class="fas fa-wallet"></i> ${this.account.substring(0, 6)}...${this.account.substring(38)}`;
            connectBtn.classList.add('connected');
            if (walletAddress) {
                walletAddress.textContent = `${this.account.substring(0, 8)}...${this.account.substring(34)}`;
            }
            this.refreshBalance();
        } else {
            connectBtn.innerHTML = '<i class="fas fa-wallet"></i> Connect Wallet';
            connectBtn.classList.remove('connected');
            if (walletAddress) {
                walletAddress.textContent = 'Not connected';
            }
        }
    }

    async refreshBalance() {
        if (!this.account || !this.web3) return;

        try {
            // Get ETH balance
            const ethBalance = await this.web3.getBalance(this.account);
            const ethFormatted = parseFloat(ethers.utils.formatEther(ethBalance)).toFixed(4);
            document.getElementById('ethBalance').textContent = `${ethFormatted} ETH`;

            // Get T9C balance (if contract is deployed)
            if (this.contractAddress && this.contract) {
                const t9cBalance = await this.contract.balanceOf(this.account);
                const t9cFormatted = parseFloat(ethers.utils.formatEther(t9cBalance)).toFixed(2);
                document.getElementById('t9cBalance').textContent = `${t9cFormatted} T9C`;
            } else {
                document.getElementById('t9cBalance').textContent = '0 T9C';
            }
        } catch (error) {
            console.error('Error refreshing balance:', error);
        }
    }

    showWalletPanel() {
        document.getElementById('walletPanel').style.display = 'block';
    }

    closeWalletPanel() {
        document.getElementById('walletPanel').style.display = 'none';
    }

    showBuyModal() {
        if (!this.account) {
            this.showNotification('Please connect your wallet first!', 'warning');
            return;
        }
        
        // For now, show a message about where to buy
        this.showNotification('T9C will be available on DEXs after launch! Stay tuned! ☁️', 'info');
    }

    openChart() {
        // Open DexScreener or similar chart (placeholder)
        this.showNotification('Chart will be available after DEX listing! 📈', 'info');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#4ade80' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 1rem;
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    toggleMobileMenu() {
        const navLinks = document.querySelector('.nav-links');
        const toggle = document.getElementById('mobileMenuToggle');
        
        navLinks.classList.toggle('mobile-active');
        toggle.classList.toggle('active');
    }

    handleScroll() {
        const navbar = document.querySelector('.navbar');
        const scrolled = window.pageYOffset > 100;
        
        if (scrolled) {
            navbar.style.background = 'rgba(26, 26, 46, 0.98)';
        } else {
            navbar.style.background = 'rgba(26, 26, 46, 0.95)';
        }

        // Animate elements on scroll
        this.animateOnScroll();
    }

    animateOnScroll() {
        const elements = document.querySelectorAll('.feature-card, .roadmap-item, .community-link');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('fade-in');
            }
        });
    }

    initializeAnimations() {
        // Add loading animations
        const cards = document.querySelectorAll('.feature-card, .tokenomics-card, .roadmap-item');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });

        // Floating animation for hero elements
        const floatingElements = document.querySelectorAll('.floating-cloud, .token-logo');
        floatingElements.forEach(element => {
            element.style.animation = 'float-up-down 3s ease-in-out infinite';
        });
    }

    startCloudAnimation() {
        // Add dynamic cloud movement
        const clouds = document.querySelectorAll('.cloud');
        clouds.forEach((cloud, index) => {
            const duration = 20 + (index * 5);
            cloud.style.animationDuration = `${duration}s`;
        });
    }

    createTokenomicsChart() {
        const ctx = document.getElementById('tokenomicsChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Liquidity Pool', 'Community', 'Marketing', 'Development', 'Team'],
                datasets: [{
                    data: [40, 30, 15, 10, 5],
                    backgroundColor: [
                        '#4A90E2',
                        '#87CEEB',
                        '#FFD700',
                        '#98FB98',
                        '#DDA0DD'
                    ],
                    borderColor: '#1a1a2e',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#ffffff',
                            padding: 20,
                            font: {
                                size: 12,
                                family: 'Inter'
                            }
                        }
                    }
                }
            }
        });
    }

    // Contract interaction methods (for when contract is deployed)
    async initContract(contractAddress) {
        if (!this.web3 || !contractAddress) return;

        try {
            this.contractAddress = contractAddress;
            this.contract = new ethers.Contract(contractAddress, this.contractABI, this.web3.getSigner());
            
            // Update contract address in UI
            document.getElementById('contractAddress').textContent = contractAddress;
            
            // Refresh balance with contract data
            this.refreshBalance();
            
            this.showNotification('Contract connected successfully! ☁️', 'success');
        } catch (error) {
            console.error('Error initializing contract:', error);
            this.showNotification('Error connecting to contract', 'error');
        }
    }

    async getTokenInfo() {
        if (!this.contract) return null;

        try {
            const [name, symbol, decimals, totalSupply, maxTx, maxWallet, reflectionFee] = await Promise.all([
                this.contract.name(),
                this.contract.symbol(),
                this.contract.decimals(),
                this.contract.totalSupply(),
                this.contract.maxTransactionAmount(),
                this.contract.maxWalletAmount(),
                this.contract.reflectionFee()
            ]);

            return {
                name,
                symbol,
                decimals,
                totalSupply: ethers.utils.formatEther(totalSupply),
                maxTransaction: ethers.utils.formatEther(maxTx),
                maxWallet: ethers.utils.formatEther(maxWallet),
                reflectionFee: reflectionFee.toString()
            };
        } catch (error) {
            console.error('Error getting token info:', error);
            return null;
        }
    }

    // Utility methods
    formatAddress(address) {
        return `${address.substring(0, 6)}...${address.substring(38)}`;
    }

    formatNumber(num) {
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
        return num.toString();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.t9cApp = new TotheNineCloudApp();
});

// Add notification animations to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .nav-links.mobile-active {
        display: flex !important;
        position: fixed;
        top: 80px;
        left: 0;
        right: 0;
        background: var(--background-light);
        flex-direction: column;
        padding: 2rem;
        border-top: 1px solid rgba(74, 144, 226, 0.2);
        z-index: 999;
    }

    .mobile-menu-toggle.active span:nth-child(1) {
        transform: rotate(-45deg) translate(-5px, 6px);
    }

    .mobile-menu-toggle.active span:nth-child(2) {
        opacity: 0;
    }

    .mobile-menu-toggle.active span:nth-child(3) {
        transform: rotate(45deg) translate(-5px, -6px);
    }

    .connect-wallet-btn.connected {
        background: linear-gradient(135deg, #4ade80, #22c55e);
    }

    @media (max-width: 768px) {
        .nav-links {
            display: none;
        }
    }
`;
document.head.appendChild(style);

// Export for global access
window.TotheNineCloudApp = TotheNineCloudApp;