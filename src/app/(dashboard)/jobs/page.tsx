'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  CalendarIcon, 
  DollarSignIcon, 
  UserIcon, 
  SearchIcon,
  PlusIcon,
  FilterIcon
} from 'lucide-react';
import { useJobsData, type Job } from '@/hooks/useJobsData';
import Link from 'next/link';

export default function JobsPage() {
  const { jobs, agents, isLoading, assignJob } = useJobsData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Job['status']>('all');

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'disputed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Job['status']) => {
    switch (status) {
      case 'open': return '开放中';
      case 'assigned': return '已分配';
      case 'completed': return '已完成';
      case 'disputed': return '有争议';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">加载任务数据中...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">任务管理</h1>
          <p className="text-muted-foreground mt-1">管理和跟踪所有任务</p>
        </div>
        <Link href="/jobs/create">
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            创建任务
          </Button>
        </Link>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索任务..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="all">所有状态</option>
          <option value="open">开放中</option>
          <option value="assigned">已分配</option>
          <option value="completed">已完成</option>
          <option value="disputed">有争议</option>
        </select>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {jobs.filter(j => j.status === 'open').length}
            </div>
            <p className="text-sm text-muted-foreground">开放任务</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {jobs.filter(j => j.status === 'assigned').length}
            </div>
            <p className="text-sm text-muted-foreground">进行中</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">
              {jobs.filter(j => j.status === 'completed').length}
            </div>
            <p className="text-sm text-muted-foreground">已完成</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              ${jobs.reduce((sum, job) => sum + job.payment, 0).toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">总金额</p>
          </CardContent>
        </Card>
      </div>

      {/* 任务列表 */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">没有找到匹配的任务</p>
            </CardContent>
          </Card>
        ) : (
          filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {job.description}
                    </p>
                  </div>
                  <Badge className={getStatusColor(job.status)}>
                    {getStatusText(job.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center text-sm">
                    <DollarSignIcon className="h-4 w-4 mr-2 text-green-600" />
                    <span className="font-semibold">${job.payment}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span>截止: {job.deadline}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <UserIcon className="h-4 w-4 mr-2" />
                    <span>创建者: {job.creator.slice(0, 6)}...{job.creator.slice(-4)}</span>
                  </div>
                  {job.assignedAgent && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <UserIcon className="h-4 w-4 mr-2" />
                      <span>执行者: {job.assignedAgent.slice(0, 6)}...{job.assignedAgent.slice(-4)}</span>
                    </div>
                  )}
                </div>

                {job.deliverable && (
                  <div className="mb-4 p-3 bg-green-50 rounded-md">
                    <p className="text-sm"><strong>交付物:</strong> {job.deliverable}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  {job.status === 'open' && (
                    <Button 
                      size="sm" 
                      onClick={() => assignJob(job.id, '0x9876...5432')}
                    >
                      接受任务
                    </Button>
                  )}
                  {job.status === 'assigned' && (
                    <Button size="sm" variant="outline">
                      查看进度
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    查看详情
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}