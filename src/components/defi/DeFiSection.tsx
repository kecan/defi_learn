"use client";

import { useState } from "react";
import { YieldDashboard } from "./YieldDashboard";
import { StrategySelector } from "./StrategySelector";
import { YieldHistory } from "./YieldHistory";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TrendingUp, Zap, Shield, Info } from "lucide-react";

export function DeFiSection() {
  const [activeTab, setActiveTab] = useState<'overview' | 'strategy' | 'history'>('overview');

  const tabs = [
    {
      id: 'overview' as const,
      label: '收益总览',
      icon: TrendingUp,
    },
    {
      id: 'strategy' as const,
      label: '策略配置',
      icon: Zap,
    },
    {
      id: 'history' as const,
      label: '收益历史',
      icon: Shield,
    },
  ];

  return (
    <div className="space-y-6">
      {/* DeFi Info Banner */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg text-blue-900 dark:text-blue-100">
                DeFi 收益管理
              </CardTitle>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                您在平台上的闲置资金将自动部署到安全的DeFi协议中获得收益
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-blue-800 dark:text-blue-200">已集成 Aave V3</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <span className="text-blue-800 dark:text-blue-200">Compound (开发中)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full" />
              <span className="text-blue-800 dark:text-blue-200">更多协议即将推出</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex bg-secondary/30 rounded-lg p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <Button
              key={tab.id}
              variant={isActive ? "default" : "ghost"}
              className={`flex items-center space-x-2 flex-1 ${
                isActive 
                  ? "bg-gradient-to-r from-primary to-purple-600 text-white shadow-sm" 
                  : "hover:bg-secondary/60"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'overview' && <YieldDashboard />}
        {activeTab === 'strategy' && <StrategySelector />}
        {activeTab === 'history' && <YieldHistory />}
      </div>
    </div>
  );
}