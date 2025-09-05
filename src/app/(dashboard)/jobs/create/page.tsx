'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export default function CreateJobPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    payment: '',
    deadline: '',
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const handleCreateJob = async () => {
    if (!formData.payment || !formData.description) {
      alert('请填写完整信息');
      return;
    }

    try {
      const paymentAmount = parseUnits(formData.payment, 6); // USDT uses 6 decimals
      
      // 这里需要根据实际合约地址和ABI进行调用
      // writeContract({
      //   address: JOBS_CONTRACT_ADDRESS,
      //   abi: JOBS_CONTRACT_ABI,
      //   functionName: 'createJob',
      //   args: [formData.description, paymentAmount],
      // });
      
      // 模拟成功创建
      alert('任务创建成功！');
      setFormData({ title: '', description: '', payment: '', deadline: '' });
    } catch (error) {
      console.error('创建任务失败:', error);
      alert('创建任务失败，请重试');
    }
  };

  const isLoading = isPending || isConfirming;

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">创建新任务</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>任务详情</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">任务标题</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="输入任务标题"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">任务描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="详细描述任务要求"
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment">支付金额 (USDT)</Label>
                <Input
                  id="payment"
                  type="number"
                  value={formData.payment}
                  onChange={(e) => setFormData(prev => ({ ...prev, payment: e.target.value }))}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deadline">截止日期</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                />
              </div>
            </div>
            
            <Button 
              onClick={handleCreateJob} 
              disabled={isLoading || !formData.payment || !formData.description}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  创建中...
                </>
              ) : (
                '创建任务'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}