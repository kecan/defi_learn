"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Calendar, DollarSign, User, Clock, ExternalLink } from "lucide-react";
import type { Job } from "./JobsList";

interface JobCardProps {
  job: Job;
  userType: 'creator' | 'agent';
}

export function JobCard({ job, userType }: JobCardProps) {
  const [isApplying, setIsApplying] = useState(false);

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'open':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'completed':
        return 'secondary';
      case 'disputed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: Job['status']) => {
    switch (status) {
      case 'open':
        return '待接取';
      case 'in_progress':
        return '进行中';
      case 'completed':
        return '已完成';
      case 'disputed':
        return '争议中';
      default:
        return '未知';
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      development: '开发',
      design: '设计',
      writing: '写作',
      marketing: '市场',
      other: '其他',
    };
    return labels[category as keyof typeof labels] || category;
  };

  const handleApplyJob = async () => {
    setIsApplying(true);
    // 这里将来会调用智能合约的申请方法
    setTimeout(() => {
      setIsApplying(false);
      alert('申请已提交！等待任务发布者确认');
    }, 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const daysLeft = getDaysUntilDeadline(job.deadline);

  return (
    <Card className="card-hover h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight mb-2 line-clamp-2">
              {job.title}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={getStatusColor(job.status)} className="text-xs">
                {getStatusLabel(job.status)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {getCategoryLabel(job.category)}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
          {job.description}
        </p>

        {/* Requirements */}
        <div className="mb-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">技能要求：</p>
          <div className="flex flex-wrap gap-1">
            {job.requirements.slice(0, 3).map((req, index) => (
              <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                {req}
              </Badge>
            ))}
            {job.requirements.length > 3 && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                +{job.requirements.length - 3}
              </Badge>
            )}
          </div>
        </div>

        {/* Job Info */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span className="font-medium text-foreground">{job.payment} USDT</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>截止: {formatDate(job.deadline)}</span>
            <Badge 
              variant={daysLeft <= 3 ? "destructive" : daysLeft <= 7 ? "warning" : "secondary"}
              className="text-xs ml-auto"
            >
              {daysLeft > 0 ? `${daysLeft}天` : '已过期'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span className="text-xs">
              {job.creator.slice(0, 6)}...{job.creator.slice(-4)}
            </span>
            {job.agent && (
              <>
                <span className="text-xs">→</span>
                <span className="text-xs text-primary font-medium">
                  {job.agent.slice(0, 6)}...{job.agent.slice(-4)}
                </span>
              </>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <div className="w-full">
          {userType === 'agent' && job.status === 'open' ? (
            <Button 
              onClick={handleApplyJob}
              disabled={isApplying}
              className="w-full bg-gradient-to-r from-primary to-purple-600 text-white"
            >
              {isApplying ? (
                <>
                  <div className="loading-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  申请中...
                </>
              ) : (
                '申请任务'
              )}
            </Button>
          ) : userType === 'creator' ? (
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" size="sm">
                <ExternalLink className="h-4 w-4 mr-1" />
                查看详情
              </Button>
              {job.status === 'in_progress' && (
                <Button variant="default" className="flex-1" size="sm">
                  验收作品
                </Button>
              )}
            </div>
          ) : (
            <Button variant="outline" className="w-full" disabled>
              {getStatusLabel(job.status)}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}