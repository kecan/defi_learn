"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Download, TrendingUp, Calendar, Filter, ExternalLink } from "lucide-react";

interface YieldRecord {
  date: string;
  totalValue: number;
  yieldEarned: number;
  apy: number;
  transactions: Array<{
    type: 'deposit' | 'withdraw' | 'yield' | 'rebalance';
    amount: number;
    protocol: string;
    txHash: string;
  }>;
}

export function YieldHistory() {
  const [yieldHistory, setYieldHistory] = useState<YieldRecord[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchYieldHistory();
  }, [selectedPeriod]);

  const fetchYieldHistory = async () => {
    setLoading(true);
    try {
      // 模拟数据
      const mockData: YieldRecord[] = [
        {
          date: '2024-01-01',
          totalValue: 1000,
          yieldEarned: 0,
          apy: 8.2,
          transactions: [
            {
              type: 'deposit',
              amount: 1000,
              protocol: 'Aave',
              txHash: '0x123...abc',
            },
          ],
        },
        {
          date: '2024-01-05',
          totalValue: 1015.5,
          yieldEarned: 15.5,
          apy: 8.5,
          transactions: [
            {
              type: 'yield',
              amount: 15.5,
              protocol: 'Aave',
              txHash: '0x124...def',
            },
          ],
        },
        {
          date: '2024-01-10',
          totalValue: 1032.8,
          yieldEarned: 32.8,
          apy: 8.8,
          transactions: [
            {
              type: 'yield',
              amount: 17.3,
              protocol: 'Aave',
              txHash: '0x125...ghi',
            },
          ],
        },
        {
          date: '2024-01-15',
          totalValue: 1550.2,
          yieldEarned: 50.2,
          apy: 9.0,
          transactions: [
            {
              type: 'deposit',
              amount: 500,
              protocol: 'Compound',
              txHash: '0x126...jkl',
            },
            {
              type: 'yield',
              amount: 17.4,
              protocol: 'Compound',
              txHash: '0x127...mno',
            },
          ],
        },
        {
          date: '2024-01-20',
          totalValue: 1625.7,
          yieldEarned: 75.7,
          apy: 8.7,
          transactions: [
            {
              type: 'rebalance',
              amount: 0,
              protocol: 'Multiple',
              txHash: '0x128...pqr',
            },
            {
              type: 'yield',
              amount: 25.5,
              protocol: 'Multiple',
              txHash: '0x129...stu',
            },
          ],
        },
      ];
      
      setYieldHistory(mockData);
    } catch (error) {
      console.error('Error fetching yield history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'deposit':
        return '存入';
      case 'withdraw':
        return '提取';
      case 'yield':
        return '收益';
      case 'rebalance':
        return '重新平衡';
      default:
        return type;
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
      case 'withdraw':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      case 'yield':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'rebalance':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleExportData = () => {
    // 将来实现数据导出功能
    alert('数据导出功能开发中...');
  };

  const totalYieldEarned = yieldHistory.reduce((sum, record) => sum + record.yieldEarned, 0);
  const currentValue = yieldHistory.length > 0 ? yieldHistory[yieldHistory.length - 1].totalValue : 0;
  const initialValue = yieldHistory.length > 0 ? yieldHistory[0].totalValue : 0;
  const totalReturn = initialValue > 0 ? ((currentValue - initialValue) / initialValue) * 100 : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-32 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">总收益</p>
                <p className="text-xl font-bold text-green-600">
                  +${totalYieldEarned.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">当前价值</p>
                <p className="text-xl font-bold">${currentValue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-lg">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">总回报率</p>
                <p className="text-xl font-bold text-purple-600">
                  +{totalReturn.toFixed(2)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 dark:bg-orange-900/20 p-2 rounded-lg">
                <Filter className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">交易次数</p>
                <p className="text-xl font-bold">
                  {yieldHistory.reduce((sum, record) => sum + record.transactions.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Period Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>收益趋势图</CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex bg-secondary/50 rounded-lg p-1">
                {(['7d', '30d', '90d', '1y'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                      selectedPeriod === period
                        ? 'bg-white dark:bg-slate-800 shadow-sm text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {period === '7d' && '7天'}
                    {period === '30d' && '30天'}
                    {period === '90d' && '90天'}
                    {period === '1y' && '1年'}
                  </button>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-1" />
                导出
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yieldHistory}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  className="text-xs"
                />
                <YAxis className="text-xs" />
                <Tooltip 
                  formatter={(value: any, name: string) => {
                    if (name === 'totalValue') return [`$${value.toFixed(2)}`, '总价值'];
                    if (name === 'yieldEarned') return [`$${value.toFixed(2)}`, '累计收益'];
                    return [value, name];
                  }}
                  labelFormatter={(date) => `日期: ${new Date(date).toLocaleDateString('zh-CN')}`}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="totalValue" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="yieldEarned" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-muted-foreground">总价值</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-muted-foreground">累计收益</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>交易历史</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {yieldHistory.map((record, recordIndex) => (
              <div key={recordIndex}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-sm font-medium">
                    {new Date(record.date).toLocaleDateString('zh-CN')}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    APY: {record.apy}%
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  {record.transactions.map((tx, txIndex) => (
                    <div 
                      key={txIndex}
                      className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <Badge className={getTransactionTypeColor(tx.type)}>
                          {getTransactionTypeLabel(tx.type)}
                        </Badge>
                        <div>
                          <p className="text-sm font-medium">
                            {tx.type === 'yield' || tx.type === 'deposit' ? '+' : ''}
                            {tx.amount > 0 ? `$${tx.amount.toFixed(2)}` : '操作成功'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {tx.protocol}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-sm font-mono text-muted-foreground">
                            {tx.txHash}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => window.open(`https://sepolia.etherscan.io/tx/${tx.txHash.replace('...', '1234')}`, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {yieldHistory.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">暂无交易记录</p>
                <p className="text-xs text-muted-foreground mt-1">
                  开始使用DeFi功能后将显示交易历史
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}