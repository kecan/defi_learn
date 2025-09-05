import { useState, useEffect } from 'react';

export interface Job {
  id: string;
  title: string;
  description: string;
  payment: number;
  deadline: string;
  status: 'open' | 'assigned' | 'completed' | 'disputed';
  creator: string;
  assignedAgent?: string;
  createdAt: string;
  deliverable?: string;
}

export interface Agent {
  address: string;
  stakeAmount: number;
  reputation: number;
  isActive: boolean;
  completedJobs: number;
  successRate: number;
}

export function useJobsData() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 模拟获取任务数据
  useEffect(() => {
    const mockJobs: Job[] = [
      {
        id: '1',
        title: 'Website Development',
        description: 'Build a responsive website using React and TypeScript',
        payment: 500,
        deadline: '2024-10-15',
        status: 'open',
        creator: '0x1234...5678',
        createdAt: '2024-09-01',
      },
      {
        id: '2',
        title: 'Smart Contract Audit',
        description: 'Audit a DeFi smart contract for security vulnerabilities',
        payment: 800,
        deadline: '2024-10-20',
        status: 'assigned',
        creator: '0xabcd...efgh',
        assignedAgent: '0x9876...5432',
        createdAt: '2024-09-02',
      },
      {
        id: '3',
        title: 'UI/UX Design',
        description: 'Design user interface for mobile trading app',
        payment: 350,
        deadline: '2024-10-10',
        status: 'completed',
        creator: '0xqwer...tyui',
        assignedAgent: '0xasdf...ghjk',
        createdAt: '2024-08-25',
        deliverable: 'Design files and prototypes delivered successfully',
      },
    ];

    const mockAgents: Agent[] = [
      {
        address: '0x9876...5432',
        stakeAmount: 1000,
        reputation: 95,
        isActive: true,
        completedJobs: 25,
        successRate: 96,
      },
      {
        address: '0xasdf...ghjk',
        stakeAmount: 750,
        reputation: 88,
        isActive: true,
        completedJobs: 18,
        successRate: 94,
      },
      {
        address: '0xzxcv...bnm',
        stakeAmount: 500,
        reputation: 72,
        isActive: false,
        completedJobs: 8,
        successRate: 75,
      },
    ];

    setTimeout(() => {
      setJobs(mockJobs);
      setAgents(mockAgents);
      setIsLoading(false);
    }, 1000);
  }, []);

  const createJob = (jobData: Omit<Job, 'id' | 'status' | 'createdAt'>) => {
    const newJob: Job = {
      ...jobData,
      id: Date.now().toString(),
      status: 'open',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setJobs(prev => [newJob, ...prev]);
    return newJob;
  };

  const assignJob = (jobId: string, agentAddress: string) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, status: 'assigned', assignedAgent: agentAddress }
        : job
    ));
  };

  const completeJob = (jobId: string, deliverable: string) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, status: 'completed', deliverable }
        : job
    ));
  };

  const disputeJob = (jobId: string) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, status: 'disputed' }
        : job
    ));
  };

  return {
    jobs,
    agents,
    isLoading,
    createJob,
    assignJob,
    completeJob,
    disputeJob,
  };
}