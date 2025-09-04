"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Briefcase, Users, DollarSign, Clock } from "lucide-react";

interface Stats {
  totalJobs: number;
  activeJobs: number;
  totalAgents: number;
  totalRewards: string;
}

export function JobStats() {
  const [stats, setStats] = useState<Stats>({
    totalJobs: 0,
    activeJobs: 0,
    totalAgents: 0,
    totalRewards: "0",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟数据加载
    const fetchStats = async () => {
      setLoading(true);
      // 这里将来会连接到智能合约获取真实数据
      setTimeout(() => {
        setStats({
          totalJobs: 42,
          activeJobs: 15,
          totalAgents: 128,
          totalRewards: "15,240",
        });
        setLoading(false);
      }, 1000);
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "总任务数",
      value: stats.totalJobs.toString(),
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "活跃任务",
      value: stats.activeJobs.toString(),
      icon: Clock,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "注册Agent",
      value: stats.totalAgents.toString(),
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      title: "总奖励 (USDT)",
      value: stats.totalRewards,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline space-x-2">
                {loading ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    {stat.title.includes('活跃') && (
                      <Badge variant="success" className="text-xs">
                        +12%
                      </Badge>
                    )}
                  </>
                )}
              </div>
              {stat.title.includes('活跃') && (
                <p className="text-xs text-muted-foreground mt-1">
                  迗周新增 3 个任务
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}