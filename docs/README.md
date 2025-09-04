# DeFi Jobs Platform - 开发文档

## 项目概述

DeFi Jobs Platform 是一个去中心化的任务平台，结合了传统的Gig Economy模式和DeFi收益管理。用户可以发布任务、接取任务，同时将闲置资金投入DeFi协议获得收益。

## 技术架构

### 前端技术栈

- **框架**: Next.js 14 with App Router
- **语言**: TypeScript
- **样式**: TailwindCSS + Custom CSS Variables
- **状态管理**: Zustand
- **Web3 集成**: ethers.js v6 + wagmi v2
- **钱包连接**: RainbowKit
- **图表**: Recharts
- **UI 组件**: 自定义组件库 + Radix UI

### 智能合约

- **开发框架**: Hardhat
- **语言**: Solidity ^0.8.24
- **网络**: Sepolia 测试网
- **DeFi 集成**: Aave V3, Compound

### 核心合约

1. **JobsContract**: 任务管理合约
2. **TreasuryContract**: 资金管理合约
3. **YieldStrategyContract**: 收益策略合约

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css         # 全局样式
│   ├── layout.tsx          # 根布局
│   └── page.tsx            # 主页面
│
├── components/             # React 组件
│   ├── jobs/               # 任务相关组件
│   │   ├── JobsSection.tsx
│   │   ├── JobsList.tsx
│   │   ├── JobCard.tsx
│   │   ├── CreateJobModal.tsx
│   │   └── JobStats.tsx
│   │
│   ├── defi/               # DeFi 相关组件
│   │   ├── DeFiSection.tsx
│   │   ├── YieldDashboard.tsx
│   │   ├── StrategySelector.tsx
│   │   └── YieldHistory.tsx
│   │
│   ├── wallet/             # 钱包相关组件
│   │   └── ConnectWallet.tsx
│   │
│   ├── layout/             # 布局组件
│   │   ├── Header.tsx
│   │   └── Navigation.tsx
│   │
│   ├── providers/          # Context Providers
│   │   ├── Web3Provider.tsx
│   │   └── QueryProvider.tsx
│   │
│   └── ui/                 # 基础 UI 组件
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Dialog.tsx
│       ├── Badge.tsx
│       └── ...
│
├── hooks/                  # 自定义 Hooks
│   ├── useJobs.ts
│   ├── useDeFi.ts
│   └── useWeb3.ts
│
├── store/                  # Zustand 状态管理
│   ├── userStore.ts
│   └── jobsStore.ts
│
├── contracts/              # 合约相关
│   ├── addresses.ts        # 合约地址配置
│   └── abis.ts             # 合约 ABI 定义
│
└── utils/                  # 工具函数
    ├── web3.ts             # Web3 工具函数
    └── defi.ts             # DeFi 相关工具
```

## 核心功能实现

### 1. 钱包连接

使用 RainbowKit 和 wagmi 实现钱包连接：

```typescript
// components/providers/Web3Provider.tsx
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

const config = getDefaultConfig({
  appName: "DeFi Jobs Platform",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
  chains: [sepolia],
});
```

### 2. 任务管理

任务的创建、申请、完成流程：

```typescript
// 创建任务
const createJob = async (jobData) => {
  // 1. 授权 USDT
  await approveUSDT(jobData.totalAmount);
  
  // 2. 调用合约
  const tx = await jobsContract.createJob(
    jobData.requirements,
    ethers.parseUnits(jobData.payment, 6),
    jobData.deadline,
    jobData.enableYield
  );
  
  await tx.wait();
};
```

### 3. DeFi 收益管理

集成 Aave 协议实现收益管理：

```typescript
// utils/defi.ts
export async function deployToAave(amount: bigint, signer: ethers.Signer) {
  const aavePool = new ethers.Contract(AAVE_POOL_ADDRESS, AAVE_POOL_ABI, signer);
  
  // 授权 USDT
  await approveToken(USDT_ADDRESS, AAVE_POOL_ADDRESS, amount, signer);
  
  // 供应到 Aave
  return await aavePool.supply(USDT_ADDRESS, amount, signerAddress, 0);
}
```

## 状态管理

### 用户状态 (Zustand)

```typescript
// store/userStore.ts
interface UserState {
  profile: UserProfile | null;
  funds: UserFunds | null;
  activities: UserActivity[];
  
  setProfile: (profile: UserProfile) => void;
  updateFunds: (updates: Partial<UserFunds>) => void;
  addActivity: (activity: UserActivity) => void;
}
```

### 任务状态

```typescript
// store/jobsStore.ts
interface JobsState {
  jobs: Job[];
  userJobs: Job[];
  applications: JobApplication[];
  filters: JobsFilter;
  
  setJobs: (jobs: Job[]) => void;
  addJob: (job: Job) => void;
  updateFilters: (filters: Partial<JobsFilter>) => void;
}
```

## UI 组件设计

### 设计系统

使用 CSS Variables 和 TailwindCSS 实现主题系统：

```css
/* app/globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 224 71.4% 4.1%;
  --primary: 262.1 83.3% 57.8%;
  --secondary: 220 14.3% 95.9%;
  /* ... */
}

.dark {
  --background: 224 71.4% 4.1%;
  --foreground: 210 20% 98%;
  /* ... */
}
```

### 可复用组件

构建了一套一致的 UI 组件库：

- `Button` - 按钮组件，支持多种风格
- `Card` - 卡片组件，用于内容分组
- `Dialog` - 弹窗组件，基于 Radix UI
- `Badge` - 标签组件，显示状态信息

## 数据流

### 用户操作流程

1. **连接钱包** → `Web3Provider` 初始化
2. **创建任务** → `JobsContract.createJob()` → 更新 `jobsStore`
3. **申请任务** → `JobsContract.applyForJob()` → 更新状态
4. **部署资金** → `TreasuryContract.deployIdleFunds()` → 更新 `userStore`

### 事件监听

监听合约事件实现实时更新：

```typescript
// utils/web3.ts
export function watchContractEvent(
  contract: ethers.Contract,
  eventName: string,
  callback: (...args: any[]) => void
) {
  contract.on(eventName, callback);
  return () => contract.off(eventName, callback);
}
```

## 开发指南

### 环境配置

1. **克隆仓库**
```bash
git clone https://github.com/kecan/defi_learn.git
cd defi_learn
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
cp .env.example .env.local
# 填入必要的配置项
```

4. **启动开发服务器**
```bash
npm run dev
```

### 合约开发 (可选)

如果需要修改或部署智能合约：

```bash
cd contracts
npm install
npx hardhat compile
npx hardhat test
npx hardhat deploy --network sepolia
```

## 部署指南

### 前端部署 (Vercel)

1. **连接 GitHub 仓库**
   - 在 Vercel 控制台中导入项目

2. **配置环境变量**
   ```env
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
   NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key
   NEXT_PUBLIC_JOBS_CONTRACT_ADDRESS=deployed_contract_address
   ```

3. **部署**
   - Vercel 会自动构建和部署

### 智能合约部署

1. **准备部署环境**
   ```bash
   cd contracts
   cp .env.example .env
   # 配置 PRIVATE_KEY 和 RPC_URL
   ```

2. **编译合约**
   ```bash
   npx hardhat compile
   ```

3. **部署到 Sepolia**
   ```bash
   npx hardhat deploy --network sepolia
   ```

4. **验证合约** (可选)
   ```bash
   npx hardhat verify --network sepolia CONTRACT_ADDRESS
   ```

## 测试指南

### 前端测试

```bash
# 运行单元测试
npm run test

# 运行 E2E 测试
npm run test:e2e

# 运行类型检查
npm run type-check
```

### 合约测试

```bash
cd contracts

# 运行合约测试
npx hardhat test

# 运行覆盖率测试
npx hardhat coverage

# 运行 Gas 报告
npx hardhat test --gas
```

## 安全注意事项

### 智能合约安全

1. **重入防护**: 使用 `ReentrancyGuard`
2. **权限控制**: 使用 `AccessControl`
3. **数学安全**: 使用 SafeMath 或 Solidity ^0.8.0
4. **合约升级**: 使用透明代理模式

### 前端安全

1. **私钥保护**: 不要在前端存储私钥
2. **RPC 节点**: 使用可信的 RPC 提供商
3. **数据验证**: 对用户输入进行严格验证
4. **网络检查**: 确保用户连接到正确网络

## 性能优化

### 前端优化

1. **代码分割**: 使用 Next.js 动态导入
2. **图片优化**: 使用 Next.js Image 组件
3. **数据缓存**: 使用 React Query 缓存
4. **状态优化**: 避免不必要的重新渲染

### 区块链交互优化

1. **批量请求**: 合并多个区块链查询
2. **事件缓存**: 缓存合约事件数据
3. **Gas 优化**: 预估和优化 Gas 使用
4. **错误重试**: 实现智能的错误重试机制

## 未来路线图

### 短期目标 (1-3 个月)

- [ ] 完成合约开发和测试
- [ ] 集成更多 DeFi 协议 (Compound, Uniswap)
- [ ] 添加移动端适配
- [ ] 实现实时通知功能

### 中期目标 (3-6 个月)

- [ ] 添加 NFT 奖励系统
- [ ] 实现跨链支持
- [ ] 添加 DAO 治理功能
- [ ] 优化 DeFi 收益策略

### 长期目标 (6-12 个月)

- [ ] 实现去中心化争议解决
- [ ] 添加AI辅助功能
- [ ] 构建开发者生态
- [ ] 启动代币经济模式

## 贡献指南

### 参与开发

1. **Fork 仓库**
2. **创建特性分支**
   ```bash
   git checkout -b feature/new-feature
   ```
3. **提交更改**
   ```bash
   git commit -am 'Add new feature'
   ```
4. **推送分支**
   ```bash
   git push origin feature/new-feature
   ```
5. **提交 Pull Request**

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 和 Prettier 配置
- 编写单元测试
- 添加适当的注释和文档

### 问题报告

如果发现 bug 或有功能建议，请：

1. 搜索现有 Issues 避免重复
2. 使用合适的 Issue 模板
3. 提供详细的重现步骤
4. 包含相关的错误信息和截图

## 常见问题

### Q: 如何获取测试代币？
A: 可以从以下 faucet 获取 Sepolia ETH：
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [Chainlink Sepolia Faucet](https://faucets.chain.link/sepolia)

### Q: 合约地址在哪里配置？
A: 合约地址在 `src/contracts/addresses.ts` 文件中配置。

### Q: 如何添加新的 DeFi 协议？
A: 需要：
1. 添加协议合约 ABI 到 `src/contracts/abis.ts`
2. 在 `src/utils/defi.ts` 中添加协议交互函数
3. 更新前端组件以支持新协议

### Q: 项目支持哪些钱包？
A: 目前支持所有 WalletConnect 兼容的钱包，包括 MetaMask、WalletConnect、Coinbase Wallet 等。

## 许可证

本项目采用 MIT 许可证。详情请参阅 [LICENSE](../LICENSE) 文件。

## 联系方式

- **GitHub**: [https://github.com/kecan/defi_learn](https://github.com/kecan/defi_learn)
- **Issues**: [https://github.com/kecan/defi_learn/issues](https://github.com/kecan/defi_learn/issues)

---

感谢您对 DeFi Jobs Platform 的关注和贡献！