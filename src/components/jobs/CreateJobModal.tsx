"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DollarSign, Calendar, Tag, X } from "lucide-react";

interface CreateJobModalProps {
  open: boolean;
  onClose: () => void;
}

interface JobForm {
  title: string;
  description: string;
  category: string;
  payment: string;
  deadline: string;
  requirements: string[];
  newRequirement: string;
}

export function CreateJobModal({ open, onClose }: CreateJobModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<JobForm>({
    title: '',
    description: '',
    category: '',
    payment: '',
    deadline: '',
    requirements: [],
    newRequirement: '',
  });

  const categories = [
    { value: 'development', label: '开发' },
    { value: 'design', label: '设计' },
    { value: 'writing', label: '写作' },
    { value: 'marketing', label: '市场' },
    { value: 'other', label: '其他' },
  ];

  const handleInputChange = (field: keyof JobForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const addRequirement = () => {
    if (form.newRequirement.trim() && !form.requirements.includes(form.newRequirement.trim())) {
      setForm(prev => ({
        ...prev,
        requirements: [...prev.requirements, prev.newRequirement.trim()],
        newRequirement: '',
      }));
    }
  };

  const removeRequirement = (index: number) => {
    setForm(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addRequirement();
    }
  };

  const calculateFees = () => {
    const payment = parseFloat(form.payment) || 0;
    const platformFee = payment * 0.05; // 5% 平台手续费
    const total = payment + platformFee;
    
    return {
      payment,
      platformFee: platformFee.toFixed(2),
      total: total.toFixed(2),
    };
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // 这里将来会调用智能合约创建任务
      console.log('Creating job:', form);
      
      // 模拟交易等待
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      alert('任务创建成功！');
      onClose();
      
      // 重置表单
      setForm({
        title: '',
        description: '',
        category: '',
        payment: '',
        deadline: '',
        requirements: [],
        newRequirement: '',
      });
      setStep(1);
      
    } catch (error) {
      console.error('Error creating job:', error);
      alert('创建失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const isStep1Valid = form.title && form.description && form.category;
  const isStep2Valid = form.payment && form.deadline;

  const fees = calculateFees();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-primary to-purple-600 p-2 rounded-lg">
              <Tag className="h-5 w-5 text-white" />
            </div>
            发布新任务
          </DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className={`flex items-center ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 1 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
            }`}>
              1
            </div>
            <span className="ml-2 text-sm">基本信息</span>
          </div>
          <div className="flex-1 h-px bg-muted mx-4" />
          <div className={`flex items-center ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 2 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
            }`}>
              2
            </div>
            <span className="ml-2 text-sm">支付设置</span>
          </div>
          <div className="flex-1 h-px bg-muted mx-4" />
          <div className={`flex items-center ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 3 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
            }`}>
              3
            </div>
            <span className="ml-2 text-sm">确认发布</span>
          </div>
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">任务标题 *</Label>
              <Input
                id="title"
                placeholder="输入任务标题"
                value={form.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">任务描述 *</Label>
              <Textarea
                id="description"
                placeholder="详细描述任务需求和期望的交付物"
                value={form.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">任务类别 *</Label>
              <select
                id="category"
                value={form.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">选择类别</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>技能要求</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="输入技能要求后按Enter"
                  value={form.newRequirement}
                  onChange={(e) => handleInputChange('newRequirement', e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button type="button" onClick={addRequirement} variant="outline">
                  添加
                </Button>
              </div>
              
              {form.requirements.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.requirements.map((req, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {req}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => removeRequirement(index)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setStep(2)}
                disabled={!isStep1Valid}
                className="bg-gradient-to-r from-primary to-purple-600 text-white"
              >
                下一步
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Payment Setup */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payment">任务报酬 (USDT) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="payment"
                  type="number"
                  placeholder="0.00"
                  value={form.payment}
                  onChange={(e) => handleInputChange('payment', e.target.value)}
                  className="pl-10"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">截止日期 *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="deadline"
                  type="date"
                  value={form.deadline}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
                  className="pl-10"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {form.payment && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">费用明细</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>任务报酬:</span>
                    <span>{fees.payment} USDT</span>
                  </div>
                  <div className="flex justify-between">
                    <span>平台手续费 (5%):</span>
                    <span>{fees.platformFee} USDT</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span>总计需支付:</span>
                    <span>{fees.total} USDT</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between">
              <Button onClick={() => setStep(1)} variant="outline">
                上一步
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!isStep2Valid}
                className="bg-gradient-to-r from-primary to-purple-600 text-white"
              >
                下一步
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{form.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{form.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">类别:</span>
                    <span className="ml-2 font-medium">
                      {categories.find(c => c.value === form.category)?.label}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">报酬:</span>
                    <span className="ml-2 font-medium">{form.payment} USDT</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">截止:</span>
                    <span className="ml-2 font-medium">
                      {new Date(form.deadline).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">总费用:</span>
                    <span className="ml-2 font-medium text-primary">{fees.total} USDT</span>
                  </div>
                </div>

                {form.requirements.length > 0 && (
                  <div>
                    <p className="text-muted-foreground text-sm mb-2">技能要求:</p>
                    <div className="flex flex-wrap gap-1">
                      {form.requirements.map((req, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>注意:</strong> 点击“确认发布”后，您的 {fees.total} USDT 将被锁定在智能合约中。
                任务完成后资金将自动释放给Agent。
              </p>
            </div>

            <div className="flex justify-between">
              <Button onClick={() => setStep(2)} variant="outline" disabled={loading}>
                上一步
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-gradient-to-r from-primary to-purple-600 text-white btn-glow"
              >
                {loading ? (
                  <>
                    <div className="loading-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    发布中...
                  </>
                ) : (
                  '确认发布'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}