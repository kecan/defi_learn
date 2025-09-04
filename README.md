# DeFi Jobs Platform - Web3 学习项目

这是一个用于学习前端与Web3 DeFi业务交互的实战项目。通过构建一个去中心化的任务平台，学习DeFi核心概念和智能合约交互。

## 项目简介

**业务场景**：用户可以创建任务并支付USDT，Agent接取任务完成后获得报酬。未匹配的资金可以投入DeFi协议获得收益。

## 核心功能

### 基础功能
- 🔗 钱包连接 (MetaMask)
- 💼 创建和管理任务
- 👤 Agent注册和任务接取
- 💰 USDT支付和托管
- ⭐ 简单的信誉系统

### DeFi功能
- 📈 闲置资金收益管理
- 🔄 集成Aave借贷协议
- 📊 收益数据可视化
- ⚖️ 多策略资金分配
- 🔔 实时APY显示

## 技术栈

### 前端
- **框架**: Next.js 14 + TypeScript
- **样式**: TailwindCSS + shadcn/ui
- **Web3**: ethers.js v6 + wagmi v2
- **钱包**: RainbowKit
- **图表**: Recharts
- **状态管理**: Zustand

### 智能合约
- **开发**: Hardhat + Solidity 0.8.24
- **测试网**: Sepolia
- **DeFi集成**: Aave V3

### 部署
- **前端**: Vercel
- **合约**: Sepolia测试网

## 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/kecan/defi_learn.git
cd defi_learn
```

### 2. 安装依赖
```bash
# 前端依赖
npm install

# 合约依赖
cd contracts
npm install
```

### 3. 环境配置
```bash
# 复制环境变量模板
cp .env.example .env.local

# 填入必要的配置
# NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
# NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key
```

### 4. 启动开发服务器
```bash
npm run dev
```

### 5. 部署合约 (可选)
```bash
cd contracts
npx hardhat deploy --network sepolia
```

## 项目结构

```
defi_learn/
├── src/                      # 前端源码
│   ├── components/           # React组件
│   │   ├── jobs/            # 任务相关组件
│   │   ├── defi/            # DeFi功能组件
│   │   ├── wallet/          # 钱包连接组件
│   │   └── ui/              # 基础UI组件
│   ├── hooks/               # 自定义Hook
│   ├── store/               # 状态管理
│   ├── utils/               # 工具函数
│   ├── contracts/           # 合约ABI和地址
│   └── app/                 # Next.js App Router
├── contracts/               # 智能合约
│   ├── contracts/          # Solidity源码
│   ├── scripts/            # 部署脚本
│   ├── test/               # 合约测试
│   └── hardhat.config.ts   # Hardhat配置
├── public/                  # 静态资源
└── docs/                    # 项目文档
```

## 学习路线

### 阶段一：基础Web3交互
1. 钱包连接和账户管理
2. 智能合约读写操作
3. 交易状态跟踪和错误处理
4. ERC20代币交互

### 阶段二：业务逻辑实现
1. 任务创建和资金托管
2. Agent注册和质押机制
3. 工作提交和验收流程
4. 争议处理和仲裁

### 阶段三：DeFi集成
1. Aave协议集成
2. 收益策略实现
3. APY计算和展示
4. 风险管理机制

## 核心概念学习

### DeFi相关
- **流动性挖矿**: 向协议提供资金获得收益
- **APY计算**: 年化收益率的动态计算
- **协议集成**: 与Aave等DeFi协议的交互
- **风险管理**: 资金分散和风险控制

### Web3技术
- **智能合约**: Solidity合约开发和部署
- **ethers.js**: 与区块链的JavaScript交互
- **钱包集成**: MetaMask等钱包的连接
- **事件监听**: 合约事件的实时监控

## 演示地址

- **前端演示**: [https://defi-learn.vercel.app](https://defi-learn.vercel.app) (待部署)
- **合约地址**: [Sepolia Etherscan](https://sepolia.etherscan.io) (待部署)

## 贡献指南

1. Fork 本项目
2. 创建特性分支: `git checkout -b feature/new-feature`
3. 提交更改: `git commit -am 'Add new feature'`
4. 推送分支: `git push origin feature/new-feature`
5. 提交Pull Request

## 许可证

MIT License - 详情请查看 [LICENSE](LICENSE) 文件

## 联系方式

如有问题或建议，请提交Issue或联系项目维护者。

---

**学习目标**：通过实战项目掌握Web3前端开发和DeFi业务场景，为进入Web3行业做好准备。