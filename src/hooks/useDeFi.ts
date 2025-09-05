import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { useContract, useEthereumProvider } from './useWeb3';
import { useUserStore } from '@/store/userStore';
import { CONTRACT_ADDRESSES } from '@/contracts/addresses';
import { TREASURY_CONTRACT_ABI, YIELD_STRATEGY_CONTRACT_ABI, AAVE_POOL_ABI } from '@/contracts/abis';
import { parseTokenAmount, ensureTokenApproval } from '@/utils/web3';
import { 
  calculateAPY, 
  getAaveProtocolData, 
  getCompoundProtocolData, 
  getUniswapLPData,
  calculateOptimalAllocation,
  YieldStrategy
} from '@/utils/defi';

/**
 * DeFi 相关的自定义 Hooks
 */

interface YieldData {
  totalAssets: number;
  totalYield: number;
  currentAPY: number;
  idleAmount: number;
  distribution: Array<{
    protocol: string;
    amount: number;
    percentage: number;
    apy: number;
    color: string;
  }>;
}

interface ProtocolData {
  name: string;
  apy: number;
  tvl: string;
  risk: 'low' | 'medium' | 'high';
  available: boolean;
}

// DeFi 收益数据 Hook
export function useYieldData() {
  const [yieldData, setYieldData] = useState<YieldData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();
  const { provider } = useEthereumProvider();
  const { funds } = useUserStore();
  
  const treasuryContract = useContract(
    CONTRACT_ADDRESSES.TREASURY_CONTRACT,
    TREASURY_CONTRACT_ABI
  );

  const fetchYieldData = useCallback(async () => {
    if (!address || !treasuryContract) return;

    setLoading(true);
    setError(null);

    try {
      // 从合约获取用户资金信息
      const userFunds = await treasuryContract.getUserFunds(address);
      
      // 模拟收益数据
      const mockYieldData: YieldData = {
        totalAssets: parseFloat(funds?.totalBalance || '0'),
        totalYield: 125.30,
        currentAPY: 8.5,
        idleAmount: parseFloat(funds?.idleAmount || '0'),
        distribution: [
          {
            protocol: 'Aave',
            amount: 850.75,
            percentage: 68,
            apy: 9.2,
            color: '#1FC7D4',
          },
          {
            protocol: 'Compound',
            amount: 200.0,
            percentage: 16,
            apy: 7.8,
            color: '#7645D9',
          },
          {
            protocol: '闲置资金',
            amount: parseFloat(funds?.idleAmount || '0'),
            percentage: 16,
            apy: 0,
            color: '#E2E8F0',
          },
        ],
      };
      
      setYieldData(mockYieldData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch yield data';
      setError(errorMessage);
      console.error('Fetch yield data error:', err);
    } finally {
      setLoading(false);
    }
  }, [address, treasuryContract, funds]);

  useEffect(() => {
    fetchYieldData();
    
    // 每30秒刷新一次
    const interval = setInterval(fetchYieldData, 30000);
    return () => clearInterval(interval);
  }, [fetchYieldData]);

  return { yieldData, fetchYieldData, loading, error };
}

// 协议数据 Hook
export function useProtocolsData() {
  const [protocolsData, setProtocolsData] = useState<ProtocolData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { provider } = useEthereumProvider();

  const fetchProtocolsData = useCallback(async () => {
    if (!provider) return;

    setLoading(true);
    setError(null);

    try {
      const [aaveData, compoundData, uniswapData] = await Promise.all([
        getAaveProtocolData(provider),
        getCompoundProtocolData(provider),
        getUniswapLPData(provider),
      ]);

      const protocols: ProtocolData[] = [
        {
          name: 'Aave',
          apy: aaveData.apy,
          tvl: aaveData.tvl,
          risk: 'low',
          available: aaveData.available,
        },
        {
          name: 'Compound',
          apy: compoundData.apy,
          tvl: compoundData.tvl,
          risk: 'low',
          available: compoundData.available,
        },
        {
          name: 'Uniswap',
          apy: uniswapData.apy,
          tvl: uniswapData.tvl,
          risk: 'medium',
          available: uniswapData.available,
        },
      ];

      setProtocolsData(protocols);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch protocols data';
      setError(errorMessage);
      console.error('Fetch protocols data error:', err);
    } finally {
      setLoading(false);
    }
  }, [provider]);

  useEffect(() => {
    fetchProtocolsData();
    
    // 每分钟刷新一次
    const interval = setInterval(fetchProtocolsData, 60000);
    return () => clearInterval(interval);
  }, [fetchProtocolsData]);

  return { protocolsData, fetchProtocolsData, loading, error };
}

// 资金部署 Hook
export function useDeployFunds() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();
  const { signer } = useEthereumProvider();
  const { updateFunds, addActivity } = useUserStore();
  
  const treasuryContract = useContract(
    CONTRACT_ADDRESSES.TREASURY_CONTRACT,
    TREASURY_CONTRACT_ABI,
    true
  );

  const deployIdleFunds = useCallback(async () => {
    if (!address || !signer || !treasuryContract) {
      throw new Error('Wallet not connected or contract not available');
    }

    setLoading(true);
    setError(null);

    try {
      // 调用合约部署闲置资金
      const tx = await treasuryContract.deployIdleFunds();
      const receipt = await tx.wait();

      // 更新本地状态
      updateFunds({ idleAmount: '0' });
      
      // 添加活动记录
      addActivity({
        id: Date.now().toString(),
        type: 'funds_deployed',
        timestamp: new Date().toISOString(),
        description: '部署闲置资金到DeFi协议',
        txHash: receipt.hash,
      });

      return { success: true, txHash: receipt.hash };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Deploy funds error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [address, signer, treasuryContract, updateFunds, addActivity]);

  const deployToProtocol = useCallback(async (protocol: string, amount: string) => {
    if (!address || !signer) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const amountBigInt = parseTokenAmount(amount, 6);
      let tx;

      // 根据协议类型调用不同的部署函数
      if (protocol.toLowerCase() === 'aave') {
        const { deployToAave } = await import('@/utils/defi');
        tx = await deployToAave(amountBigInt, signer);
      } else {
        throw new Error(`Protocol ${protocol} not supported yet`);
      }

      const receipt = await tx.wait();
      
      // 添加活动记录
      addActivity({
        id: Date.now().toString(),
        type: 'funds_deployed',
        timestamp: new Date().toISOString(),
        description: `部署 ${amount} USDT 到 ${protocol}`,
        amount,
        txHash: receipt.hash,
      });

      return { success: true, txHash: receipt.hash };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Deploy to protocol error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [address, signer, addActivity]);

  return { deployIdleFunds, deployToProtocol, loading, error };
}

// 收益策略 Hook
export function useYieldStrategy() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStrategy, setCurrentStrategy] = useState<any>(null);
  const { address } = useAccount();
  const { signer } = useEthereumProvider();
  const { addActivity } = useUserStore();
  
  const strategyContract = useContract(
    CONTRACT_ADDRESSES.YIELD_STRATEGY_CONTRACT,
    YIELD_STRATEGY_CONTRACT_ABI,
    true
  );

  const applyStrategy = useCallback(async (allocation: {
    aave: number;
    compound: number;
    uniswap: number;
  }) => {
    if (!address || !signer || !strategyContract) {
      throw new Error('Wallet not connected or contract not available');
    }

    setLoading(true);
    setError(null);

    try {
      // 调用合约重新平衡策略
      const tx = await strategyContract.rebalanceStrategy(
        allocation.aave,
        allocation.compound,
        allocation.uniswap
      );
      const receipt = await tx.wait();

      // 更新当前策略
      setCurrentStrategy(allocation);
      
      // 添加活动记录
      addActivity({
        id: Date.now().toString(),
        type: 'funds_deployed',
        timestamp: new Date().toISOString(),
        description: '应用新的收益策略',
        txHash: receipt.hash,
      });

      return { success: true, txHash: receipt.hash };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Apply strategy error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [address, signer, strategyContract, addActivity]);

  const getCurrentStrategy = useCallback(async () => {
    if (!strategyContract) return;

    try {
      const strategy = await strategyContract.getCurrentStrategy();
      setCurrentStrategy({
        aave: Number(strategy.aaveAllocation),
        compound: Number(strategy.compoundAllocation),
        uniswap: Number(strategy.lpAllocation),
        totalDeployed: Number(strategy.totalDeployed),
        totalYield: Number(strategy.totalYield),
      });
    } catch (err) {
      console.error('Get current strategy error:', err);
    }
  }, [strategyContract]);

  const getOptimalStrategy = useCallback((riskTolerance: number = 0.5) => {
    // 模拟协议数据
    const protocols = [
      { name: 'aave', apy: 9.2, risk: 0.1, maxAllocation: 70 },
      { name: 'compound', apy: 7.8, risk: 0.15, maxAllocation: 60 },
      { name: 'uniswap', apy: 12.5, risk: 0.3, maxAllocation: 50 },
    ];

    return calculateOptimalAllocation(protocols, riskTolerance);
  }, []);

  useEffect(() => {
    getCurrentStrategy();
  }, [getCurrentStrategy]);

  return { 
    applyStrategy, 
    getCurrentStrategy, 
    getOptimalStrategy,
    currentStrategy, 
    loading, 
    error 
  };
}

// APY 计算 Hook
export function useAPYCalculator() {
  const calculateRealTimeAPY = useCallback((principal: number, earned: number, days: number) => {
    return calculateAPY(principal, earned, days);
  }, []);

  const calculateProjectedReturn = useCallback((principal: number, apy: number, days: number) => {
    const dailyRate = apy / 100 / 365;
    const compoundReturn = principal * Math.pow(1 + dailyRate, days) - principal;
    return compoundReturn;
  }, []);

  const getAPYComparison = useCallback(() => {
    // 返回不同协议的APY比较
    return [
      { protocol: 'Aave', apy: 9.2, risk: 'Low' },
      { protocol: 'Compound', apy: 7.8, risk: 'Low' },
      { protocol: 'Uniswap LP', apy: 12.5, risk: 'Medium' },
      { protocol: '传统储蓄', apy: 2.0, risk: 'Very Low' },
    ];
  }, []);

  return {
    calculateRealTimeAPY,
    calculateProjectedReturn,
    getAPYComparison,
  };
}

// 收益历史 Hook
export function useYieldHistory(period: '7d' | '30d' | '90d' | '1y' = '30d') {
  const [history, setHistory] = useState<Array<{
    date: string;
    totalValue: number;
    yieldEarned: number;
    apy: number;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const { address } = useAccount();

  const fetchHistory = useCallback(async () => {
    if (!address) return;

    setLoading(true);
    
    try {
      // 模拟历史数据
      const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
      const mockHistory = [];
      
      for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const baseValue = 1000;
        const growth = (days - i) * 0.5; // 模拟收益增长
        
        mockHistory.push({
          date: date.toISOString().split('T')[0],
          totalValue: baseValue + growth,
          yieldEarned: growth,
          apy: 8.5 + (Math.random() - 0.5) * 2, // 8.5% ± 1%
        });
      }
      
      setHistory(mockHistory);
    } catch (error) {
      console.error('Error fetching yield history:', error);
    } finally {
      setLoading(false);
    }
  }, [address, period]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, fetchHistory, loading };
}

// 实时APY Hook
export function useRealTimeAPY() {
  const [apy, setAPY] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const { protocolsData } = useProtocolsData();

  useEffect(() => {
    if (protocolsData.length === 0) return;

    setLoading(true);
    
    try {
      // 计算加权平均APY
      const totalAPY = protocolsData.reduce((sum, protocol) => {
        return sum + protocol.apy * (protocol.available ? 1 : 0);
      }, 0);
      
      const activeProtocols = protocolsData.filter(p => p.available).length;
      const averageAPY = activeProtocols > 0 ? totalAPY / activeProtocols : 0;
      
      setAPY(averageAPY);
    } catch (error) {
      console.error('Error calculating real-time APY:', error);
    } finally {
      setLoading(false);
    }
  }, [protocolsData]);

  return { apy, loading };
}

// DeFi 风险评估 Hook
export function useRiskAssessment() {
  const assessPortfolioRisk = useCallback((allocation: Record<string, number>) => {
    const riskWeights = {
      aave: 0.1,
      compound: 0.15,
      uniswap: 0.3,
    };
    
    let totalRisk = 0;
    let totalAllocation = 0;
    
    Object.entries(allocation).forEach(([protocol, percent]) => {
      const weight = riskWeights[protocol as keyof typeof riskWeights] || 0.5;
      totalRisk += weight * percent;
      totalAllocation += percent;
    });
    
    const averageRisk = totalAllocation > 0 ? totalRisk / totalAllocation : 0;
    
    return {
      riskScore: averageRisk * 100,
      riskLevel: averageRisk < 0.2 ? 'Low' : averageRisk < 0.4 ? 'Medium' : 'High',
      recommendations: [
        averageRisk > 0.4 ? '考虑增加稳健协议的分配' : null,
        averageRisk < 0.15 ? '可以适当增加高收益协议的比例' : null,
      ].filter(Boolean),
    };
  }, []);

  return { assessPortfolioRisk };
}