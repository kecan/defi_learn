# DeFi Jobs Platform

一个结合 DeFi 收益优化的去中心化任务平台，将传统的 Gig Economy 与 DeFi 协议深度整合。

## 🚀 项目特色

### 核心功能
- **任务管理系统**: 创建、分配、跟踪和完成任务
- **DeFi 收益优化**: 闲置资金自动投入 Aave、Compound 等协议获得收益
- **智能合约托管**: 资金安全托管，自动化支付和结算
- **Agent 信誉系统**: 基于完成度和质量的声誉评分机制

### 技术亮点
- **现代前端技术栈**: Next.js 14 + TypeScript + Tailwind CSS
- **Web3 集成**: wagmi + viem + RainbowKit 标准方案
- **DeFi 协议集成**: Aave、Compound、Uniswap V3
- **实时数据**: React Query 缓存和自动刷新
- **响应式设计**: 支持桌面和移动端

## 🏗️ 架构设计

### 智能合约层
```
JobsContract (任务管理)
├── 任务创建和分配
├── 工作提交和验收
└── 争议解决机制

TreasuryContract (资金管理)
├── USDT 资金托管
├── DeFi 协议集成
└── 收益分配策略

YieldStrategyContract (收益策略)
├── Aave 借贷协议
├── Compound 借贷协议
└── Uniswap 流动性挖矿
```

### 前端架构
```
src/
├── app/                    # Next.js 14 App Router
│   ├── (dashboard)/       # 仪表板路由组
│   │   ├── jobs/         # 任务管理页面
│   │   ├── yield/        # DeFi 收益管理
│   │   └── page.tsx      # 仪表板首页
│   ├── globals.css
│   └── layout.tsx
├── components/            # 可复用组件
│   ├── ui/               # shadcn/ui 组件库
│   ├── charts/           # 数据可视化组件
│   ├── layout/           # 布局组件
│   └── ...
├── hooks/                 # 自定义 Hooks
│   ├── useYieldData.ts   # DeFi 收益数据
│   ├── useJobsData.ts    # 任务数据管理
│   └── useDeFi.ts        # DeFi 协议交互
├── lib/                   # 工具库
│   └── utils.ts          # 通用工具函数
└── types/                 # TypeScript 类型定义
```

## 🛠️ 技术栈

### 前端技术
- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS + shadcn/ui
- **状态管理**: Zustand + React Query
- **图表**: Recharts
- **Web3**: wagmi + viem + ethers.js
- **钱包**: RainbowKit

### 区块链技术
- **智能合约**: Solidity
- **开发框架**: Hardhat
- **测试网络**: Sepolia
- **DeFi 协议**: Aave V3, Compound V3, Uniswap V3

## 📦 安装和运行

### 环境要求
- Node.js 18+
- npm 或 yarn
- MetaMask 或其他 Web3 钱包

### 安装依赖
```bash
npm install
```

### 环境配置
```bash
cp .env.example .env.local
```

填入必要的环境变量：
```env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key
NEXT_PUBLIC_JOBS_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS=0x...
```

### 启动开发服务器
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 🎯 主要功能模块

### 1. 任务管理 (`/jobs`)
- **创建任务**: 发布需求，设置报酬和截止日期
- **任务列表**: 浏览可用任务，支持筛选和搜索
- **任务分配**: Agent 接取任务，开始工作
- **进度跟踪**: 实时查看任务状态和进展

### 2. DeFi 收益管理 (`/yield`)
- **收益概览**: 总投资、累计收益、APY 展示
- **资金分配**: 多协议分散投资策略
- **收益图表**: 历史收益趋势可视化
- **协议详情**: 各 DeFi 协议的详细信息

### 3. 综合仪表板 (`/`)
- **关键指标**: 平台核心数据一览
- **收益趋势**: DeFi 收益变化图表
- **任务概况**: 最新任务和活动
- **快速操作**: 常用功能入口

## 💡 商业价值

### 解决的问题
1. **资金效率低**: 传统平台托管资金无收益
2. **信任成本高**: 需要中心化平台作为中介
3. **手续费高**: 传统支付和结算费用
4. **透明度低**: 资金流向和分配不透明

### 创新方案
1. **DeFi 收益**: 闲置资金自动产生 8-12% APY
2. **智能合约**: 去中心化托管，降低信任成本
3. **链上结算**: 低成本、高效率的支付方案
4. **完全透明**: 所有交易链上可查，公开透明

## 🔧 开发和部署

### 智能合约部署
```bash
# 编译合约
npm run hardhat:compile

# 部署到测试网
npm run hardhat:deploy
```

### 生产环境构建
```bash
npm run build
npm start
```

## 🚦 项目状态

当前版本实现了：
- ✅ 完整的前端界面和交互
- ✅ 模拟数据和业务逻辑
- ✅ DeFi 收益管理功能
- ✅ 任务创建和管理流程
- ✅ 响应式设计和用户体验

待完善功能：
- 🔄 智能合约的实际部署
- 🔄 真实 DeFi 协议集成
- 🔄 钱包签名和交易确认
- 🔄 更多 DeFi 策略和协议

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程
1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🎯 面试要点

这个项目展示了以下技能：

### 技术能力
- **Web3 开发**: 智能合约交互、钱包集成、DeFi 协议
- **现代前端**: Next.js 14、TypeScript、Tailwind CSS
- **系统设计**: 模块化架构、状态管理、数据流设计
- **用户体验**: 响应式设计、交互优化、错误处理

### 业务理解
- **DeFi 生态**: 理解借贷、流动性挖矿、收益优化
- **商业模式**: Gig Economy + DeFi 的创新结合
- **风险控制**: 资金安全、智能合约安全考虑
- **用户需求**: 解决实际痛点，提供真实价值

这个项目不仅是技术展示，更是对 Web3 + DeFi 未来发展方向的深度思考和实践。