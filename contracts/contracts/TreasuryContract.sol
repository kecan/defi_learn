// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IYieldStrategy.sol";

/**
 * @title TreasuryContract
 * @dev 管理平台资金和DeFi收益优化的核心合约
 */
contract TreasuryContract is ReentrancyGuard, Ownable {
    
    struct UserFunds {
        uint256 lockedAmount;    // 创建Job锁定的资金
        uint256 idleAmount;      // 闲置资金
        uint256 yieldEarned;     // 收益累计
        uint256 lastUpdateTime;  // 最后更新时间
    }
    
    struct PlatformStats {
        uint256 totalDeposited;
        uint256 totalWithdrawn;
        uint256 totalYieldGenerated;
        uint256 totalFeesCollected;
    }
    
    // 状态变量
    IERC20 public immutable usdtToken;
    IYieldStrategy public yieldStrategy;
    
    mapping(address => UserFunds) public userFunds;
    mapping(address => bool) public authorizedContracts; // 授权的合约地址
    
    PlatformStats public platformStats;
    
    uint256 public constant YIELD_UPDATE_INTERVAL = 1 hours;
    uint256 public yieldDistributionRate = 8000; // 80% 分给用户，20% 平台费
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public minimumDeployAmount = 1000 * 10**6; // 1000 USDT
    
    // 事件
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event FundsLocked(address indexed user, uint256 amount);
    event FundsReleased(address indexed user, uint256 amount);
    event YieldDistributed(uint256 totalYield, uint256 userShare, uint256 platformShare);
    event IdleFundsDeployed(uint256 amount);
    event YieldHarvested(address indexed user, uint256 amount);
    
    constructor(
        address _usdtToken,
        address _yieldStrategy
    ) {
        usdtToken = IERC20(_usdtToken);
        yieldStrategy = IYieldStrategy(_yieldStrategy);
    }
    
    modifier onlyAuthorized() {
        require(
            authorizedContracts[msg.sender] || msg.sender == owner(),
            "Not authorized"
        );
        _;
    }
    
    /**
     * @dev 用户存入USDT
     */
    function deposit(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        
        // 转移USDT到合约
        require(
            usdtToken.transferFrom(msg.sender, address(this), _amount),
            "USDT transfer failed"
        );
        
        UserFunds storage user = userFunds[msg.sender];
        
        // 更新用户收益
        _updateUserYield(msg.sender);
        
        user.idleAmount += _amount;
        platformStats.totalDeposited += _amount;
        
        emit Deposited(msg.sender, _amount);
        
        // 如果闲置资金达到阈值，自动部署到DeFi协议
        _autoDeployIdleFunds();
    }
    
    /**
     * @dev 用户提取USDT
     */
    function withdraw(uint256 _amount) external nonReentrant {
        UserFunds storage user = userFunds[msg.sender];
        
        // 更新用户收益
        _updateUserYield(msg.sender);
        
        require(user.idleAmount >= _amount, "Insufficient idle funds");
        
        user.idleAmount -= _amount;
        platformStats.totalWithdrawn += _amount;
        
        require(usdtToken.transfer(msg.sender, _amount), "USDT transfer failed");
        
        emit Withdrawn(msg.sender, _amount);
    }
    
    /**
     * @dev 锁定用户资金 (创建Job时调用)
     */
    function lockFunds(address _user, uint256 _amount) external onlyAuthorized nonReentrant {
        UserFunds storage user = userFunds[_user];
        
        // 更新用户收益
        _updateUserYield(_user);
        
        require(user.idleAmount >= _amount, "Insufficient funds to lock");
        
        user.idleAmount -= _amount;
        user.lockedAmount += _amount;
        
        emit FundsLocked(_user, _amount);
    }
    
    /**
     * @dev 释放锁定的资金 (Job完成或取消时调用)
     */
    function releaseFunds(address _user, uint256 _amount) external onlyAuthorized nonReentrant {
        UserFunds storage user = userFunds[_user];
        
        require(user.lockedAmount >= _amount, "Insufficient locked funds");
        
        user.lockedAmount -= _amount;
        user.idleAmount += _amount;
        
        emit FundsReleased(_user, _amount);
    }
    
    /**
     * @dev 部署闲置资金到DeFi协议
     */
    function deployIdleFunds() external onlyOwner nonReentrant {
        uint256 availableBalance = usdtToken.balanceOf(address(this));
        uint256 totalUserFunds = _calculateTotalUserFunds();
        
        // 保留一部分资金用于提取
        uint256 reserveAmount = totalUserFunds / 10; // 10% 储备
        uint256 deployableAmount = availableBalance > reserveAmount ? 
            availableBalance - reserveAmount : 0;
        
        require(deployableAmount >= minimumDeployAmount, "Amount too small to deploy");
        
        // 批准并部署资金
        require(usdtToken.approve(address(yieldStrategy), deployableAmount), "Approval failed");
        yieldStrategy.deployFunds(deployableAmount);
        
        emit IdleFundsDeployed(deployableAmount);
    }
    
    /**
     * @dev 从DeFi协议收获收益
     */
    function harvestYield() external nonReentrant {
        uint256 yieldAmount = yieldStrategy.harvestYield();
        
        if (yieldAmount > 0) {
            // 分配收益
            uint256 userShare = (yieldAmount * yieldDistributionRate) / BASIS_POINTS;
            uint256 platformShare = yieldAmount - userShare;
            
            platformStats.totalYieldGenerated += yieldAmount;
            platformStats.totalFeesCollected += platformShare;
            
            emit YieldDistributed(yieldAmount, userShare, platformShare);
            
            // 更新所有用户的收益 (简化版本，实际应该按比例分配)
            _distributeYieldToUsers(userShare);
        }
    }
    
    /**
     * @dev 用户提取收益
     */
    function withdrawYield() external nonReentrant {
        UserFunds storage user = userFunds[msg.sender];
        
        // 更新用户收益
        _updateUserYield(msg.sender);
        
        uint256 yieldAmount = user.yieldEarned;
        require(yieldAmount > 0, "No yield to withdraw");
        
        user.yieldEarned = 0;
        
        require(usdtToken.transfer(msg.sender, yieldAmount), "Yield transfer failed");
        
        emit YieldHarvested(msg.sender, yieldAmount);
    }
    
    /**
     * @dev 重新平衡投资组合
     */
    function rebalancePortfolio() external onlyOwner {
        yieldStrategy.rebalancePortfolio();
    }
    
    /**
     * @dev 从DeFi协议提取资金
     */
    function withdrawFromProtocol(uint256 _amount) external onlyOwner nonReentrant {
        yieldStrategy.withdrawFromProtocol(_amount);
    }
    
    /**
     * @dev 更新用户收益
     */
    function _updateUserYield(address _user) internal {
        UserFunds storage user = userFunds[_user];
        
        if (user.lastUpdateTime > 0 && block.timestamp >= user.lastUpdateTime + YIELD_UPDATE_INTERVAL) {
            // 简化的收益计算 - 实际应该基于用户资金比例和时间
            uint256 timeElapsed = block.timestamp - user.lastUpdateTime;
            uint256 totalFunds = user.idleAmount + user.lockedAmount;
            
            if (totalFunds > 0) {
                // 假设年化8%的收益率
                uint256 yield = (totalFunds * 800 * timeElapsed) / (BASIS_POINTS * 365 days);
                user.yieldEarned += yield;
            }
        }
        
        user.lastUpdateTime = block.timestamp;
    }
    
    /**
     * @dev 自动部署闲置资金
     */
    function _autoDeployIdleFunds() internal {
        uint256 availableBalance = usdtToken.balanceOf(address(this));
        uint256 totalUserFunds = _calculateTotalUserFunds();
        uint256 reserveAmount = totalUserFunds / 10; // 10% 储备
        
        if (availableBalance > reserveAmount + minimumDeployAmount) {
            uint256 deployableAmount = availableBalance - reserveAmount;
            
            // 自动部署
            if (usdtToken.approve(address(yieldStrategy), deployableAmount)) {
                yieldStrategy.deployFunds(deployableAmount);
                emit IdleFundsDeployed(deployableAmount);
            }
        }
    }
    
    /**
     * @dev 计算总用户资金
     */
    function _calculateTotalUserFunds() internal view returns (uint256) {
        // 简化版本 - 实际应该遍历所有用户
        return platformStats.totalDeposited - platformStats.totalWithdrawn;
    }
    
    /**
     * @dev 分配收益给用户
     */
    function _distributeYieldToUsers(uint256 _totalYield) internal {
        // 简化版本 - 实际应该按用户资金比例分配
        // 这里只是示例实现
    }
    
    // 查询函数
    function getUserFunds(address _user) external view returns (UserFunds memory) {
        return userFunds[_user];
    }
    
    function getTotalYield() external view returns (uint256) {
        return yieldStrategy.calculateTotalYield();
    }
    
    function getAvailableBalance() external view returns (uint256) {
        return usdtToken.balanceOf(address(this));
    }
    
    function getPlatformStats() external view returns (PlatformStats memory) {
        return platformStats;
    }
    
    // 管理员函数
    function addAuthorizedContract(address _contract) external onlyOwner {
        authorizedContracts[_contract] = true;
    }
    
    function removeAuthorizedContract(address _contract) external onlyOwner {
        authorizedContracts[_contract] = false;
    }
    
    function setYieldStrategy(address _newStrategy) external onlyOwner {
        require(_newStrategy != address(0), "Invalid strategy address");
        yieldStrategy = IYieldStrategy(_newStrategy);
    }
    
    function setYieldDistributionRate(uint256 _newRate) external onlyOwner {
        require(_newRate <= BASIS_POINTS, "Rate too high");
        yieldDistributionRate = _newRate;
    }
    
    function setMinimumDeployAmount(uint256 _newAmount) external onlyOwner {
        minimumDeployAmount = _newAmount;
    }
    
    /**
     * @dev 紧急提取函数 (仅在紧急情况下使用)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = usdtToken.balanceOf(address(this));
        require(usdtToken.transfer(owner(), balance), "Emergency withdraw failed");
    }
}