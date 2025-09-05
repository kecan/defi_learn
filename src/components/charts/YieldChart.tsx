'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card } from '@/components/ui/card';

interface YieldChartProps {
  data: Array<{
    date: string;
    yield: number;
    apy: number;
  }>;
}

export function YieldChart({ data }: YieldChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground">暂无收益数据</p>
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorAPY" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            stroke="#888"
            fontSize={12}
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }}
          />
          <YAxis 
            stroke="#888"
            fontSize={12}
            yAxisId="yield"
            orientation="left"
          />
          <YAxis 
            stroke="#888"
            fontSize={12}
            yAxisId="apy"
            orientation="right"
          />
          <Tooltip 
            formatter={(value: number, name: string) => [
              name === 'yield' ? `$${value.toLocaleString()}` : `${value.toFixed(2)}%`,
              name === 'yield' ? '累计收益' : 'APY'
            ]}
            labelFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString('zh-CN');
            }}
            contentStyle={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
            }}
          />
          <Area
            yAxisId="yield"
            type="monotone" 
            dataKey="yield" 
            stroke="#8884d8" 
            fillOpacity={1}
            fill="url(#colorYield)"
            strokeWidth={2}
          />
          <Line 
            yAxisId="apy"
            type="monotone" 
            dataKey="apy" 
            stroke="#82ca9d" 
            strokeWidth={2}
            dot={{ fill: '#82ca9d', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, stroke: '#82ca9d', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}