'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon } from 'lucide-react';
import { YieldChart } from '@/components/charts/YieldChart';
import { useYieldData } from '@/hooks/useYieldData';

export default function YieldPage() {
  const { yieldData, isLoading, deployFunds, harvestYield } = useYieldData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">加载收益数据中...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">DeFi 收益管理</h1>
        <Badge variant="secondary" className="text-sm">
          实时数据
        </Badge>
      </div>
      
      {/* 总览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              总投资金额
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${yieldData.totalInvested.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              已投入DeFi协议
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              累计收益
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +${yieldData.totalYield.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <TrendingUpIcon className="h-3 w-3 mr-1" />
              APY: {yieldData.currentAPY}%
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              可提取收益
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${yieldData.availableYield.toLocaleString()}</div>
            <Button 
              onClick={harvestYield} 
              size="sm"
              className="mt-2 w-full"
              disabled={yieldData.availableYield === 0}
            >
              <ArrowDownIcon className="h-3 w-3 mr-1" />
              提取收益
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              24h 收益变化
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +${yieldData.dailyYield.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUpIcon className="h-3 w-3 mr-1" />
              +{yieldData.dailyYieldPercent}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 资金分配策略 */}
      <Card>
        <CardHeader>
          <CardTitle>资金分配策略</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Aave 借贷协议</span>
                <div className="text-right">
                  <span className="font-bold">{yieldData.aaveAllocation}%</span>
                  <div className="text-xs text-muted-foreground">
                    ${(yieldData.totalInvested * yieldData.aaveAllocation / 100).toLocaleString()}
                  </div>
                </div>
              </div>
              <Progress value={yieldData.aaveAllocation} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Compound 借贷协议</span>
                <div className="text-right">
                  <span className="font-bold">{yieldData.compoundAllocation}%</span>
                  <div className="text-xs text-muted-foreground">
                    ${(yieldData.totalInvested * yieldData.compoundAllocation / 100).toLocaleString()}
                  </div>
                </div>
              </div>
              <Progress value={yieldData.compoundAllocation} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Uniswap 流动性挖矿</span>
                <div className="text-right">
                  <span className="font-bold">{yieldData.lpAllocation}%</span>
                  <div className="text-xs text-muted-foreground">
                    ${(yieldData.totalInvested * yieldData.lpAllocation / 100).toLocaleString()}
                  </div>
                </div>
              </div>
              <Progress value={yieldData.lpAllocation} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">储备金</span>
                <div className="text-right">
                  <span className="font-bold">{yieldData.reserveRatio}%</span>
                  <div className="text-xs text-muted-foreground">
                    ${(yieldData.totalInvested * yieldData.reserveRatio / 100).toLocaleString()}
                  </div>
                </div>
              </div>
              <Progress value={yieldData.reserveRatio} className="h-2" />
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={deployFunds} variant="outline" size="sm">
              <ArrowUpIcon className="h-3 w-3 mr-1" />
              重新平衡
            </Button>
            <Button variant="outline" size="sm">
              调整策略
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 收益图表 */}
      <Card>
        <CardHeader>
          <CardTitle>收益趋势图</CardTitle>
        </CardHeader>
        <CardContent>
          <YieldChart data={yieldData.historicalYield} />
        </CardContent>
      </Card>

      {/* 协议详情 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <img src="/aave-logo.svg" alt="Aave" className="h-6 w-6 mr-2" />
              Aave Protocol
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>当前APY</span>
                <span className="font-bold text-green-600">8.5%</span>
              </div>
              <div className="flex justify-between">
                <span>投入金额</span>
                <span>${(yieldData.totalInvested * yieldData.aaveAllocation / 100).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>累计收益</span>
                <span className="font-bold">$234</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <img src="/compound-logo.svg" alt="Compound" className="h-6 w-6 mr-2" />
              Compound Protocol
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>当前APY</span>
                <span className="font-bold text-green-600">7.2%</span>
              </div>
              <div className="flex justify-between">
                <span>投入金额</span>
                <span>${(yieldData.totalInvested * yieldData.compoundAllocation / 100).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>累计收益</span>
                <span className="font-bold">$156</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <img src="/uniswap-logo.svg" alt="Uniswap" className="h-6 w-6 mr-2" />
              Uniswap V3
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>当前APY</span>
                <span className="font-bold text-green-600">12.8%</span>
              </div>
              <div className="flex justify-between">
                <span>投入金额</span>
                <span>${(yieldData.totalInvested * yieldData.lpAllocation / 100).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>累计收益</span>
                <span className="font-bold">$89</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}