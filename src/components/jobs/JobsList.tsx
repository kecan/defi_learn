"use client";

import { useEffect, useState } from "react";
import { JobCard } from "./JobCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Search, Filter, SortAsc } from "lucide-react";

export interface Job {
  id: string;
  title: string;
  description: string;
  payment: string;
  deadline: string;
  category: string;
  status: 'open' | 'in_progress' | 'completed' | 'disputed';
  creator: string;
  agent?: string;
  createdAt: string;
  requirements: string[];
}

interface JobsListProps {
  userType: 'creator' | 'agent';
}

export function JobsList({ userType }: JobsListProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'payment' | 'deadline'>('newest');

  const categories = ['all', 'development', 'design', 'writing', 'marketing', 'other'];
  const categoryLabels = {
    all: '全部',
    development: '开发',
    design: '设计',
    writing: '写作',
    marketing: '市场',
    other: '其他',
  };

  useEffect(() => {
    fetchJobs();
  }, [userType, selectedCategory, sortBy]);

  const fetchJobs = async () => {
    setLoading(true);
    // 模拟 API 调用
    setTimeout(() => {
      const mockJobs: Job[] = [
        {
          id: '1',
          title: '开发React DeFi仪表板',
          description: '需要一个React组件来展示DeFi数据，包括TVL、APY等指标',
          payment: '500',
          deadline: '2024-01-15',
          category: 'development',
          status: 'open',
          creator: '0x1234...5678',
          createdAt: '2024-01-01',
          requirements: ['React', 'TypeScript', 'Web3']
        },
        {
          id: '2',
          title: '设计NFT收藏平台UI',
          description: '为 NFT 收藏平台设计现代化的用户界面',
          payment: '800',
          deadline: '2024-01-20',
          category: 'design',
          status: 'in_progress',
          creator: '0xabcd...efgh',
          agent: '0x9999...1111',
          createdAt: '2024-01-02',
          requirements: ['Figma', 'UI/UX', 'Web3 Design']
        },
        {
          id: '3',
          title: '编写DeFi协议文档',
          description: '为新的流动性挖矿协议编写技术文档和用户指南',
          payment: '300',
          deadline: '2024-01-18',
          category: 'writing',
          status: 'open',
          creator: '0x5555...7777',
          createdAt: '2024-01-03',
          requirements: ['DeFi知识', '技术写作', '英文']
        }
      ];
      
      setJobs(mockJobs);
      setLoading(false);
    }, 800);
  };

  const filteredJobs = jobs
    .filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory;
      const matchesUserType = userType === 'creator' ? true : job.status === 'open';
      
      return matchesSearch && matchesCategory && matchesUserType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'payment':
          return parseInt(b.payment) - parseInt(a.payment);
        case 'deadline':
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="搜索任务..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setSelectedCategory(category)}
            >
              {categoryLabels[category as keyof typeof categoryLabels]}
            </Badge>
          ))}
        </div>
        
        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 border border-input bg-background rounded-md text-sm"
        >
          <option value="newest">最新发布</option>
          <option value="payment">报酬最高</option>
          <option value="deadline">截止最近</option>
        </select>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-card rounded-lg border p-6 animate-pulse">
              <div className="h-6 bg-muted rounded mb-4" />
              <div className="h-4 bg-muted rounded mb-2" />
              <div className="h-4 bg-muted rounded w-3/4 mb-4" />
              <div className="flex justify-between">
                <div className="h-4 bg-muted rounded w-20" />
                <div className="h-4 bg-muted rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-2">没有找到相关任务</div>
          <p className="text-sm text-muted-foreground">试试调整搜索条件或分类筛选</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} userType={userType} />
          ))}
        </div>
      )}
    </div>
  );
}