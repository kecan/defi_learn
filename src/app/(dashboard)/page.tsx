'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUpIcon, 
  BriefcaseIcon, 
  DollarSignIcon,
  UsersIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from 'lucide-react';
import { YieldChart } from '@/components/charts/YieldChart';
import { useYieldData } from '@/hooks/useYieldData';
import { useJobsData } from '@/hooks/useJobsData';
import Link from 'next/link';

export default function DashboardPage() {
  const { yieldData, isLoading: yieldLoading } = useYieldData();
  const { jobs, agents, isLoading: jobsLoading } = useJobsData();

  const isLoading = yieldLoading || jobsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">加载仪表板数据中...</div>
      </div>
    );
  }

  const openJobs = jobs.filter(job => job.status === 'open').length;
  const activeJobs = jobs.filter(job => job.status === 'assigned').length;
  const completedJobs = jobs.filter(job => job.status === 'completed').length;
  const totalJobValue = jobs.reduce((sum, job) => sum + job.payment, 0);

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">DeFi Jobs 仪表板</h1>
          <p className="text-muted-foreground mt-1">
            Web3 任务平台 + DeFi 收益优化
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/jobs/create">
            <Button>创建任务</Button>
          </Link>
          <Link href="/yield">
            <Button variant="outline">管理收益</Button>
          </Link>
        </div>
      </div>

      {/* 核心指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <DollarSignIcon className="h-4 w-4 mr-2" />
              DeFi 总收益
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +${yieldData.totalYield.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUpIcon className="h-3 w-3 mr-1" />
              APY {yieldData.currentAPY}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <BriefcaseIcon className="h-4 w-4 mr-2" />
              活跃任务
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeJobs}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {openJobs} 个开放任务
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <TrendingUpIcon className="h-4 w-4 mr-2" />
              投资金额
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${yieldData.totalInvested.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              已部署到 DeFi 协议
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <UsersIcon className="h-4 w-4 mr-2" />
              平台总价值
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalJobValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {jobs.length} 个总任务
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 收益趋势图 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>DeFi 收益趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <YieldChart data={yieldData.historicalYield} />
          </CardContent>
        </Card>

        {/* 资金分配 */}
        <Card>
          <CardHeader>
            <CardTitle>资金分配</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Aave 协议</span>
                <div className="text-right">
                  <div className="font-semibold">{yieldData.aaveAllocation}%</div>
                  <div className="text-xs text-muted-foreground">8.5% APY</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Compound 协议</span>
                <div className="text-right">
                  <div className="font-semibold">{yieldData.compoundAllocation}%</div>
                  <div className="text-xs text-muted-foreground">7.2% APY</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Uniswap LP</span>
                <div className="text-right">
                  <div className="font-semibold">{yieldData.lpAllocation}%</div>
                  <div className="text-xs text-muted-foreground">12.8% APY</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">储备金</span>
                <div className="text-right">
                  <div className="font-semibold">{yieldData.reserveRatio}%</div>
                  <div className="text-xs text-muted-foreground">安全缓冲</div>
                </div>
              </div>
            </div>

            <Button className="w-full" size="sm">
              <TrendingUpIcon className="h-3 w-3 mr-1" />
              优化策略
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 最近任务和活动 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 最近任务 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>最近任务</CardTitle>
            <Link href="/jobs">
              <Button variant="outline" size="sm">查看全部</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobs.slice(0, 3).map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{job.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      ${job.payment} • {job.deadline}
                    </p>
                  </div>
                  <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
                    {job.status === 'open' ? '开放' : 
                     job.status === 'assigned' ? '进行中' : 
                     job.status === 'completed' ? '完成' : '争议'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Agent 概览 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Agent 概览</CardTitle>
            <Link href="/agents">
              <Button variant="outline" size="sm">管理 Agents</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {agents.filter(a => a.isActive).length}
                  </div>
                  <p className="text-xs text-muted-foreground">活跃 Agents</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(agents.reduce((sum, a) => sum + a.successRate, 0) / agents.length)}%
                  </div>
                  <p className="text-xs text-muted-foreground">平均成功率</p>
                </div>
              </div>
              
              <div className="space-y-2">
                {agents.slice(0, 3).map((agent) => (
                  <div key={agent.address} className="flex items-center justify-between text-sm">
                    <span>{agent.address.slice(0, 6)}...{agent.address.slice(-4)}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{agent.successRate}%</span>
                      <Badge variant={agent.isActive ? 'default' : 'secondary'}>
                        {agent.isActive ? '在线' : '离线'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}