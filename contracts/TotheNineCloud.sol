// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TotheNineCloud
 * @dev A meme coin that reaches for the clouds! ☁️
 * Features:
 * - Total supply: 1 billion tokens
 * - Burnable tokens to create scarcity
 * - Anti-whale mechanism (max transaction limit)
 * - Pausable for emergency situations
 * - Reflection rewards for holders
 */
contract TotheNineCloud is ERC20, ERC20Burnable, Pausable, Ownable {
    uint256 private constant TOTAL_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    uint256 public maxTransactionAmount = 10_000_000 * 10**18; // 1% of total supply
    uint256 public maxWalletAmount = 20_000_000 * 10**18; // 2% of total supply
    
    // Reflection mechanism
    uint256 private constant MAX = ~uint256(0);
    uint256 private _tTotal = TOTAL_SUPPLY;
    uint256 private _rTotal = (MAX - (MAX % _tTotal));
    uint256 private _tFeeTotal;
    
    mapping(address => uint256) private _rOwned;
    mapping(address => uint256) private _tOwned;
    mapping(address => bool) private _isExcludedFromFee;
    mapping(address => bool) private _isExcludedFromReward;
    address[] private _excluded;
    
    uint256 public reflectionFee = 2; // 2% reflection to holders
    uint256 private _previousReflectionFee = reflectionFee;
    
    event CloudReached(address indexed holder, uint256 amount);
    event AntiWhaleTriggered(address indexed whale, uint256 attemptedAmount);
    
    constructor() ERC20("TotheNineCloud", "T9C") {
        _rOwned[_msgSender()] = _rTotal;
        
        // Exclude owner and contract from fees
        _isExcludedFromFee[owner()] = true;
        _isExcludedFromFee[address(this)] = true;
        
        emit Transfer(address(0), _msgSender(), _tTotal);
    }
    
    function totalSupply() public pure override returns (uint256) {
        return _tTotal;
    }
    
    function balanceOf(address account) public view override returns (uint256) {
        if (_isExcludedFromReward[account]) return _tOwned[account];
        return tokenFromReflection(_rOwned[account]);
    }
    
    function transfer(address to, uint256 amount) public override whenNotPaused returns (bool) {
        _checkTransactionLimits(_msgSender(), to, amount);
        _transfer(_msgSender(), to, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) public override whenNotPaused returns (bool) {
        _checkTransactionLimits(from, to, amount);
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
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
    
    function _transfer(address from, address to, uint256 amount) internal override {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        require(amount > 0, "T9C: Transfer amount must be greater than zero");
        
        bool takeFee = true;
        if (_isExcludedFromFee[from] || _isExcludedFromFee[to]) {
            takeFee = false;
        }
        
        _tokenTransfer(from, to, amount, takeFee);
    }
    
    function _tokenTransfer(address sender, address recipient, uint256 amount, bool takeFee) private {
        if (!takeFee) removeAllFee();
        
        if (_isExcludedFromReward[sender] && !_isExcludedFromReward[recipient]) {
            _transferFromExcluded(sender, recipient, amount);
        } else if (!_isExcludedFromReward[sender] && _isExcludedFromReward[recipient]) {
            _transferToExcluded(sender, recipient, amount);
        } else if (_isExcludedFromReward[sender] && _isExcludedFromReward[recipient]) {
            _transferBothExcluded(sender, recipient, amount);
        } else {
            _transferStandard(sender, recipient, amount);
        }
        
        if (!takeFee) restoreAllFee();
    }
    
    function _transferStandard(address sender, address recipient, uint256 tAmount) private {
        (uint256 rAmount, uint256 rTransferAmount, uint256 rFee, uint256 tTransferAmount, uint256 tFee) = _getValues(tAmount);
        _rOwned[sender] = _rOwned[sender] - rAmount;
        _rOwned[recipient] = _rOwned[recipient] + rTransferAmount;
        _reflectFee(rFee, tFee);
        emit Transfer(sender, recipient, tTransferAmount);
    }
    
    function _transferToExcluded(address sender, address recipient, uint256 tAmount) private {
        (uint256 rAmount, uint256 rTransferAmount, uint256 rFee, uint256 tTransferAmount, uint256 tFee) = _getValues(tAmount);
        _rOwned[sender] = _rOwned[sender] - rAmount;
        _tOwned[recipient] = _tOwned[recipient] + tTransferAmount;
        _rOwned[recipient] = _rOwned[recipient] + rTransferAmount;
        _reflectFee(rFee, tFee);
        emit Transfer(sender, recipient, tTransferAmount);
    }
    
    function _transferFromExcluded(address sender, address recipient, uint256 tAmount) private {
        (uint256 rAmount, uint256 rTransferAmount, uint256 rFee, uint256 tTransferAmount, uint256 tFee) = _getValues(tAmount);
        _tOwned[sender] = _tOwned[sender] - tAmount;
        _rOwned[sender] = _rOwned[sender] - rAmount;
        _rOwned[recipient] = _rOwned[recipient] + rTransferAmount;
        _reflectFee(rFee, tFee);
        emit Transfer(sender, recipient, tTransferAmount);
    }
    
    function _transferBothExcluded(address sender, address recipient, uint256 tAmount) private {
        (uint256 rAmount, uint256 rTransferAmount, uint256 rFee, uint256 tTransferAmount, uint256 tFee) = _getValues(tAmount);
        _tOwned[sender] = _tOwned[sender] - tAmount;
        _rOwned[sender] = _rOwned[sender] - rAmount;
        _tOwned[recipient] = _tOwned[recipient] + tTransferAmount;
        _rOwned[recipient] = _rOwned[recipient] + rTransferAmount;
        _reflectFee(rFee, tFee);
        emit Transfer(sender, recipient, tTransferAmount);
    }
    
    function _reflectFee(uint256 rFee, uint256 tFee) private {
        _rTotal = _rTotal - rFee;
        _tFeeTotal = _tFeeTotal + tFee;
    }
    
    function _getValues(uint256 tAmount) private view returns (uint256, uint256, uint256, uint256, uint256) {
        (uint256 tTransferAmount, uint256 tFee) = _getTValues(tAmount);
        (uint256 rAmount, uint256 rTransferAmount, uint256 rFee) = _getRValues(tAmount, tFee, _getRate());
        return (rAmount, rTransferAmount, rFee, tTransferAmount, tFee);
    }
    
    function _getTValues(uint256 tAmount) private view returns (uint256, uint256) {
        uint256 tFee = calculateReflectionFee(tAmount);
        uint256 tTransferAmount = tAmount - tFee;
        return (tTransferAmount, tFee);
    }
    
    function _getRValues(uint256 tAmount, uint256 tFee, uint256 currentRate) private pure returns (uint256, uint256, uint256) {
        uint256 rAmount = tAmount * currentRate;
        uint256 rFee = tFee * currentRate;
        uint256 rTransferAmount = rAmount - rFee;
        return (rAmount, rTransferAmount, rFee);
    }
    
    function _getRate() private view returns (uint256) {
        (uint256 rSupply, uint256 tSupply) = _getCurrentSupply();
        return rSupply / tSupply;
    }
    
    function _getCurrentSupply() private view returns (uint256, uint256) {
        uint256 rSupply = _rTotal;
        uint256 tSupply = _tTotal;
        for (uint256 i = 0; i < _excluded.length; i++) {
            if (_rOwned[_excluded[i]] > rSupply || _tOwned[_excluded[i]] > tSupply) return (_rTotal, _tTotal);
            rSupply = rSupply - _rOwned[_excluded[i]];
            tSupply = tSupply - _tOwned[_excluded[i]];
        }
        if (rSupply < _rTotal / _tTotal) return (_rTotal, _tTotal);
        return (rSupply, tSupply);
    }
    
    function calculateReflectionFee(uint256 _amount) private view returns (uint256) {
        return _amount * reflectionFee / 100;
    }
    
    function removeAllFee() private {
        if (reflectionFee == 0) return;
        _previousReflectionFee = reflectionFee;
        reflectionFee = 0;
    }
    
    function restoreAllFee() private {
        reflectionFee = _previousReflectionFee;
    }
    
    function tokenFromReflection(uint256 rAmount) public view returns (uint256) {
        require(rAmount <= _rTotal, "T9C: Amount must be less than total reflections");
        uint256 currentRate = _getRate();
        return rAmount / currentRate;
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
    
    function totalFees() external view returns (uint256) {
        return _tFeeTotal;
    }
    
    // Emergency withdrawal function
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    // Accept ETH deposits
    receive() external payable {}
}