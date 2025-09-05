// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IAave.sol";
import "./interfaces/ICompound.sol";
import "./interfaces/IUniswapV3.sol";
import "./interfaces/IYieldStrategy.sol";

/**
 * @title YieldStrategyContract
 * @dev DeFi收益策略合约，集成多个协议实现资金优化配置
 */
contract YieldStrategyContract is IYieldStrategy, ReentrancyGuard, Ownable {
    
    struct Strategy {
        uint256 aaveAllocation;     // Aave分配比例 (basis points)
        uint256 compoundAllocation; // Compound分配比例 (basis points)
        uint256 lpAllocation;       // 流动性挖矿分配比例 (basis points)
        uint256 reserveRatio;       // 储备金比例 (basis points)
    }
    
    struct ProtocolBalance {
        uint256 aaveBalance;
        uint256 compoundBalance;
        uint256 lpBalance;
        uint256 reserveBalance;
    }
    
    // 状态变量
    IERC20 public immutable usdtToken;
    
    // DeFi协议接口
    IAave public aavePool;
    ICompound public cToken;
    IUniswapV3 public uniswapRouter;
    
    Strategy public currentStrategy;
    ProtocolBalance public protocolBalances;
    
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public totalDeployed;
    uint256 public totalYieldEarned;
    uint256 public lastRebalanceTime;
    
    address public treasuryContract;
    
    // 事件
    event FundsDeployed(uint256 amount, uint256 aaveAmount, uint256 compoundAmount, uint256 lpAmount);
    event YieldHarvested(uint256 totalYield, uint256 aaveYield, uint256 compoundYield, uint256 lpYield);
    event PortfolioRebalanced(uint256 timestamp);
    event StrategyUpdated(Strategy newStrategy);
    event FundsWithdrawn(uint256 amount);
    
    constructor(
        address _usdtToken,
        address _aavePool,
        address _cToken,
        address _uniswapRouter,
        address _treasuryContract
    ) {
        usdtToken = IERC20(_usdtToken);
        aavePool = IAave(_aavePool);
        cToken = ICompound(_cToken);
        uniswapRouter = IUniswapV3(_uniswapRouter);
        treasuryContract = _treasuryContract;
        
        // 默认策略: 40% Aave, 30% Compound, 20% LP, 10% 储备
        currentStrategy = Strategy({
            aaveAllocation: 4000,
            compoundAllocation: 3000,
            lpAllocation: 2000,
            reserveRatio: 1000
        });
        
        lastRebalanceTime = block.timestamp;
    }
    
    modifier onlyTreasury() {
        require(msg.sender == treasuryContract, "Only treasury can call");
        _;
    }
    
    /**
     * @dev 部署资金到各个DeFi协议
     */
    function deployFunds(uint256 _amount) external override onlyTreasury nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        
        // 从Treasury合约转移USDT
        require(
            usdtToken.transferFrom(treasuryContract, address(this), _amount),
            "USDT transfer failed"
        );
        
        // 计算各协议分配金额
        uint256 aaveAmount = (_amount * currentStrategy.aaveAllocation) / BASIS_POINTS;
        uint256 compoundAmount = (_amount * currentStrategy.compoundAllocation) / BASIS_POINTS;
        uint256 lpAmount = (_amount * currentStrategy.lpAllocation) / BASIS_POINTS;
        uint256 reserveAmount = _amount - aaveAmount - compoundAmount - lpAmount;
        
        // 部署到Aave
        if (aaveAmount > 0) {
            _deployToAave(aaveAmount);
            protocolBalances.aaveBalance += aaveAmount;
        }
        
        // 部署到Compound
        if (compoundAmount > 0) {
            _deployToCompound(compoundAmount);
            protocolBalances.compoundBalance += compoundAmount;
        }
        
        // 部署到Uniswap LP
        if (lpAmount > 0) {
            _deployToUniswap(lpAmount);
            protocolBalances.lpBalance += lpAmount;
        }
        
        // 保留储备金
        protocolBalances.reserveBalance += reserveAmount;
        totalDeployed += _amount;
        
        emit FundsDeployed(_amount, aaveAmount, compoundAmount, lpAmount);
    }
    
    /**
     * @dev 收获所有协议的收益
     */
    function harvestYield() external override onlyTreasury nonReentrant returns (uint256) {
        uint256 aaveYield = _harvestFromAave();
        uint256 compoundYield = _harvestFromCompound();
        uint256 lpYield = _harvestFromUniswap();
        
        uint256 totalYield = aaveYield + compoundYield + lpYield;
        totalYieldEarned += totalYield;
        
        // 转移收益到Treasury合约
        if (totalYield > 0) {
            require(
                usdtToken.transfer(treasuryContract, totalYield),
                "Yield transfer failed"
            );
        }
        
        emit YieldHarvested(totalYield, aaveYield, compoundYield, lpYield);
        
        return totalYield;
    }
    
    /**
     * @dev 重新平衡投资组合
     */
    function rebalancePortfolio() external override onlyOwner nonReentrant {
        // 计算当前总价值
        uint256 currentTotalValue = calculateTotalYield() + totalDeployed;
        
        if (currentTotalValue == 0) return;
        
        // 计算目标分配
        uint256 targetAave = (currentTotalValue * currentStrategy.aaveAllocation) / BASIS_POINTS;
        uint256 targetCompound = (currentTotalValue * currentStrategy.compoundAllocation) / BASIS_POINTS;
        uint256 targetLP = (currentTotalValue * currentStrategy.lpAllocation) / BASIS_POINTS;
        uint256 targetReserve = currentTotalValue - targetAave - targetCompound - targetLP;
        
        // 重新分配资金
        _rebalanceToTarget(targetAave, targetCompound, targetLP, targetReserve);
        
        lastRebalanceTime = block.timestamp;
        emit PortfolioRebalanced(block.timestamp);
    }
    
    /**
     * @dev 从协议中提取资金
     */
    function withdrawFromProtocol(uint256 _amount) external override onlyTreasury nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(_amount <= getTotalBalance(), "Insufficient balance");
        
        uint256 remainingAmount = _amount;
        
        // 优先从储备金提取
        if (remainingAmount > 0 && protocolBalances.reserveBalance > 0) {
            uint256 withdrawFromReserve = remainingAmount > protocolBalances.reserveBalance 
                ? protocolBalances.reserveBalance 
                : remainingAmount;
            
            protocolBalances.reserveBalance -= withdrawFromReserve;
            remainingAmount -= withdrawFromReserve;
        }
        
        // 从Aave提取
        if (remainingAmount > 0 && protocolBalances.aaveBalance > 0) {
            uint256 withdrawFromAave = remainingAmount > protocolBalances.aaveBalance 
                ? protocolBalances.aaveBalance 
                : remainingAmount;
            
            _withdrawFromAave(withdrawFromAave);
            protocolBalances.aaveBalance -= withdrawFromAave;
            remainingAmount -= withdrawFromAave;
        }
        
        // 从Compound提取
        if (remainingAmount > 0 && protocolBalances.compoundBalance > 0) {
            uint256 withdrawFromCompound = remainingAmount > protocolBalances.compoundBalance 
                ? protocolBalances.compoundBalance 
                : remainingAmount;
            
            _withdrawFromCompound(withdrawFromCompound);
            protocolBalances.compoundBalance -= withdrawFromCompound;
            remainingAmount -= withdrawFromCompound;
        }
        
        // 从Uniswap LP提取
        if (remainingAmount > 0 && protocolBalances.lpBalance > 0) {
            uint256 withdrawFromLP = remainingAmount > protocolBalances.lpBalance 
                ? protocolBalances.lpBalance 
                : remainingAmount;
            
            _withdrawFromUniswap(withdrawFromLP);
            protocolBalances.lpBalance -= withdrawFromLP;
            remainingAmount -= withdrawFromLP;
        }
        
        totalDeployed -= (_amount - remainingAmount);
        
        // 转移资金到Treasury合约
        require(
            usdtToken.transfer(treasuryContract, _amount - remainingAmount),
            "Withdrawal transfer failed"
        );
        
        emit FundsWithdrawn(_amount - remainingAmount);
    }
    
    /**
     * @dev 计算总收益
     */
    function calculateTotalYield() external view override returns (uint256) {
        uint256 aaveYield = _calculateAaveYield();
        uint256 compoundYield = _calculateCompoundYield();
        uint256 lpYield = _calculateUniswapYield();
        
        return aaveYield + compoundYield + lpYield;
    }
    
    /**
     * @dev 获取总余额
     */
    function getTotalBalance() public view returns (uint256) {
        return protocolBalances.aaveBalance + 
               protocolBalances.compoundBalance + 
               protocolBalances.lpBalance + 
               protocolBalances.reserveBalance;
    }
    
    // 内部函数 - Aave 相关
    function _deployToAave(uint256 _amount) internal {
        require(usdtToken.approve(address(aavePool), _amount), "Aave approval failed");
        aavePool.supply(address(usdtToken), _amount, address(this), 0);
    }
    
    function _withdrawFromAave(uint256 _amount) internal {
        aavePool.withdraw(address(usdtToken), _amount, address(this));
    }
    
    function _harvestFromAave() internal returns (uint256) {
        // 计算Aave收益并提取
        uint256 currentBalance = aavePool.getBalance(address(usdtToken), address(this));
        if (currentBalance > protocolBalances.aaveBalance) {
            uint256 yield = currentBalance - protocolBalances.aaveBalance;
            aavePool.withdraw(address(usdtToken), yield, address(this));
            return yield;
        }
        return 0;
    }
    
    function _calculateAaveYield() internal view returns (uint256) {
        uint256 currentBalance = aavePool.getBalance(address(usdtToken), address(this));
        return currentBalance > protocolBalances.aaveBalance ? 
            currentBalance - protocolBalances.aaveBalance : 0;
    }
    
    // 内部函数 - Compound 相关
    function _deployToCompound(uint256 _amount) internal {
        require(usdtToken.approve(address(cToken), _amount), "Compound approval failed");
        require(cToken.mint(_amount) == 0, "Compound mint failed");
    }
    
    function _withdrawFromCompound(uint256 _amount) internal {
        require(cToken.redeemUnderlying(_amount) == 0, "Compound redeem failed");
    }
    
    function _harvestFromCompound() internal returns (uint256) {
        uint256 currentBalance = cToken.balanceOfUnderlying(address(this));
        if (currentBalance > protocolBalances.compoundBalance) {
            uint256 yield = currentBalance - protocolBalances.compoundBalance;
            require(cToken.redeemUnderlying(yield) == 0, "Compound yield harvest failed");
            return yield;
        }
        return 0;
    }
    
    function _calculateCompoundYield() internal view returns (uint256) {
        uint256 currentBalance = cToken.balanceOfUnderlying(address(this));
        return currentBalance > protocolBalances.compoundBalance ? 
            currentBalance - protocolBalances.compoundBalance : 0;
    }
    
    // 内部函数 - Uniswap 相关
    function _deployToUniswap(uint256 _amount) internal {
        // 简化版本 - 实际应该实现LP策略
        require(usdtToken.approve(address(uniswapRouter), _amount), "Uniswap approval failed");
        // uniswapRouter.addLiquidity(...);
        // 这里应该实现具体的LP逻辑
    }
    
    function _withdrawFromUniswap(uint256 _amount) internal {
        // uniswapRouter.removeLiquidity(...);
        // 这里应该实现具体的LP移除逻辑
    }
    
    function _harvestFromUniswap() internal returns (uint256) {
        // 收获LP费用和奖励
        // 返回收获的金额
        return 0; // 简化版本
    }
    
    function _calculateUniswapYield() internal view returns (uint256) {
        // 计算LP收益
        return 0; // 简化版本
    }
    
    /**
     * @dev 重新平衡到目标分配
     */
    function _rebalanceToTarget(
        uint256 _targetAave,
        uint256 _targetCompound,
        uint256 _targetLP,
        uint256 _targetReserve
    ) internal {
        // 简化版本的重平衡逻辑
        // 实际应该实现复杂的资金重新分配算法
    }
    
    // 管理员函数
    function updateStrategy(Strategy memory _newStrategy) external onlyOwner {
        require(
            _newStrategy.aaveAllocation + 
            _newStrategy.compoundAllocation + 
            _newStrategy.lpAllocation + 
            _newStrategy.reserveRatio == BASIS_POINTS,
            "Invalid strategy allocation"
        );
        
        currentStrategy = _newStrategy;
        emit StrategyUpdated(_newStrategy);
    }
    
    function setProtocolAddresses(
        address _aavePool,
        address _cToken,
        address _uniswapRouter
    ) external onlyOwner {
        if (_aavePool != address(0)) aavePool = IAave(_aavePool);
        if (_cToken != address(0)) cToken = ICompound(_cToken);
        if (_uniswapRouter != address(0)) uniswapRouter = IUniswapV3(_uniswapRouter);
    }
    
    function setTreasuryContract(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Invalid treasury address");
        treasuryContract = _newTreasury;
    }
    
    // 查询函数
    function getStrategy() external view returns (Strategy memory) {
        return currentStrategy;
    }
    
    function getProtocolBalances() external view returns (ProtocolBalance memory) {
        return protocolBalances;
    }
    
    function getAPY() external view returns (uint256) {
        // 计算加权平均APY
        // 简化版本，返回估计的APY
        return 875; // 8.75%
    }
}