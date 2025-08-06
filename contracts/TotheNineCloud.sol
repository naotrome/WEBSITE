// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TotheNineCloud
 * @dev A meme coin that reaches for the clouds! ☁️
 * Features:
 * - Total supply: 1 billion tokens
 * - Burnable tokens to create scarcity
 * - Anti-whale mechanism (max transaction limit)
 * - Pausable for emergency situations
 * - Reflection rewards for holders (simplified version)
 */
contract TotheNineCloud is ERC20, ERC20Burnable, Pausable, Ownable {
    uint256 private constant TOTAL_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    uint256 public maxTransactionAmount = 10_000_000 * 10**18; // 1% of total supply
    uint256 public maxWalletAmount = 20_000_000 * 10**18; // 2% of total supply
    
    mapping(address => bool) private _isExcludedFromFee;
    uint256 public reflectionFee = 2; // 2% reflection to holders
    uint256 private _totalFeesCollected;
    
    event CloudReached(address indexed holder, uint256 amount);
    event AntiWhaleTriggered(address indexed whale, uint256 attemptedAmount);
    event FeesCollected(uint256 amount);
    
    constructor() ERC20("TotheNineCloud", "T9C") Ownable(msg.sender) {
        _mint(msg.sender, TOTAL_SUPPLY);
        
        // Exclude owner and contract from fees
        _isExcludedFromFee[msg.sender] = true;
        _isExcludedFromFee[address(this)] = true;
    }
    
    function transfer(address to, uint256 amount) public override whenNotPaused returns (bool) {
        address owner = _msgSender();
        _checkTransactionLimits(owner, to, amount);
        
        if (_isExcludedFromFee[owner] || _isExcludedFromFee[to]) {
            _transfer(owner, to, amount);
        } else {
            uint256 fee = (amount * reflectionFee) / 100;
            uint256 transferAmount = amount - fee;
            
            _transfer(owner, to, transferAmount);
            if (fee > 0) {
                _transfer(owner, address(this), fee);
                _totalFeesCollected += fee;
                emit FeesCollected(fee);
            }
        }
        
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) public override whenNotPaused returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _checkTransactionLimits(from, to, amount);
        
        if (_isExcludedFromFee[from] || _isExcludedFromFee[to]) {
            _transfer(from, to, amount);
        } else {
            uint256 fee = (amount * reflectionFee) / 100;
            uint256 transferAmount = amount - fee;
            
            _transfer(from, to, transferAmount);
            if (fee > 0) {
                _transfer(from, address(this), fee);
                _totalFeesCollected += fee;
                emit FeesCollected(fee);
            }
        }
        
        return true;
    }
    
    function _checkTransactionLimits(address from, address to, uint256 amount) private {
        // Anti-whale mechanism
        if (!_isExcludedFromFee[from] && !_isExcludedFromFee[to]) {
            require(amount <= maxTransactionAmount, "T9C: Transaction amount exceeds limit");
            
            if (to != owner() && to != address(this)) {
                require(balanceOf(to) + amount <= maxWalletAmount, "T9C: Wallet amount exceeds limit");
            }
            
            if (amount > maxTransactionAmount / 2) {
                emit AntiWhaleTriggered(from, amount);
            }
        }
        
        // Emit special event for large holdings
        if (balanceOf(to) + amount >= maxWalletAmount / 2) {
            emit CloudReached(to, balanceOf(to) + amount);
        }
    }
    
    // Owner functions
    function pause() public onlyOwner {
        _pause();
    }
    
    function unpause() public onlyOwner {
        _unpause();
    }
    
    function updateMaxTransactionAmount(uint256 _maxTransactionAmount) external onlyOwner {
        require(_maxTransactionAmount >= (totalSupply() / 1000), "T9C: Max transaction amount too low");
        maxTransactionAmount = _maxTransactionAmount;
    }
    
    function updateMaxWalletAmount(uint256 _maxWalletAmount) external onlyOwner {
        require(_maxWalletAmount >= (totalSupply() / 500), "T9C: Max wallet amount too low");
        maxWalletAmount = _maxWalletAmount;
    }
    
    function excludeFromFee(address account) external onlyOwner {
        _isExcludedFromFee[account] = true;
    }
    
    function includeInFee(address account) external onlyOwner {
        _isExcludedFromFee[account] = false;
    }
    
    function setReflectionFeePercent(uint256 _reflectionFee) external onlyOwner {
        require(_reflectionFee <= 10, "T9C: Reflection fee cannot exceed 10%");
        reflectionFee = _reflectionFee;
    }
    
    // View functions
    function isExcludedFromFee(address account) external view returns (bool) {
        return _isExcludedFromFee[account];
    }
    
    function totalFeesCollected() external view returns (uint256) {
        return _totalFeesCollected;
    }
    
    // Function to distribute collected fees to holders (simplified version)
    function distributeFees() external onlyOwner {
        uint256 feesToDistribute = balanceOf(address(this));
        require(feesToDistribute > 0, "T9C: No fees to distribute");
        
        // For simplicity, send fees back to owner who can redistribute manually
        // In a production version, this would distribute proportionally to all holders
        _transfer(address(this), owner(), feesToDistribute);
    }
    
    // Emergency withdrawal function
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    // Accept ETH deposits
    receive() external payable {}
}