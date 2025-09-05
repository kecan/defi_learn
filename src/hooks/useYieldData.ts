import { useState, useEffect } from 'react';

interface YieldData {
  totalInvested: number;
  totalYield: number;
  availableYield: number;
  currentAPY: number;
  dailyYield: number;
  dailyYieldPercent: number;
  aaveAllocation: number;
  compoundAllocation: number;
  lpAllocation: number;
  reserveRatio: number;
  historicalYield: Array<{
    date: string;
    yield: number;
    apy: number;
  }>;
}

export function useYieldData() {
  const [yieldData, setYieldData] = useState<YieldData>({
    totalInvested: 45000,
    totalYield: 2340,
    availableYield: 234,
    currentAPY: 8.75,
    dailyYield: 12.5,
    dailyYieldPercent: 0.53,
    aaveAllocation: 40,
    compoundAllocation: 30,
    lpAllocation: 20,
    reserveRatio: 10,
    historicalYield: [],
  });

  const [isLoading, setIsLoading] = useState(true);

  const deployFunds = () => {
    // 模拟部署资金到DeFi协议
    console.log('Deploying funds to DeFi protocols...');
    // 这里会调用智能合约的 deployIdleFunds 函数
  };

  const harvestYield = () => {
    // 模拟收获收益
    console.log('Harvesting yield...');
    setYieldData(prev => ({
      ...prev,
      availableYield: 0,
      totalYield: prev.totalYield + prev.availableYield,
    }));
  };

  useEffect(() => {
    // 模拟获取历史收益数据
    const generateHistoricalData = () => {
      const data = [];
      const now = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        data.push({
          date: date.toISOString().split('T')[0],
          yield: Math.floor(Math.random() * 100) + (29 - i) * 50,
          apy: 8.5 + Math.random() * 2 - 1, // 7.5-9.5% range
        });
      }
      
      return data;
    };

    // 模拟加载延迟
    setTimeout(() => {
      setYieldData(prev => ({
        ...prev,
        historicalYield: generateHistoricalData(),
      }));
      setIsLoading(false);
    }, 1000);
  }, []);

  return {
    yieldData,
    isLoading,
    deployFunds,
    harvestYield,
  };
}