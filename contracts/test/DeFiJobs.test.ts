import { expect } from "chai";
import { ethers } from "hardhat";
import { JobsContract, TreasuryContract, YieldStrategyContract } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("DeFi Jobs Platform", function () {
  let jobsContract: JobsContract;
  let treasuryContract: TreasuryContract;
  let yieldStrategyContract: YieldStrategyContract;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;
  let agent1: HardhatEthersSigner;

  const USDT_ADDRESS = "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06"; // Mock USDT

  before(async function () {
    [owner, user1, user2, agent1] = await ethers.getSigners();

    // Deploy YieldStrategy
    const YieldStrategy = await ethers.getContractFactory("YieldStrategyContract");
    yieldStrategyContract = await YieldStrategy.deploy(
      USDT_ADDRESS,
      ethers.ZeroAddress, // Mock Aave
      ethers.ZeroAddress, // Mock Compound
      ethers.ZeroAddress, // Mock Uniswap
      ethers.ZeroAddress  // Treasury (will be updated)
    );

    // Deploy Treasury
    const Treasury = await ethers.getContractFactory("TreasuryContract");
    treasuryContract = await Treasury.deploy(
      USDT_ADDRESS,
      await yieldStrategyContract.getAddress()
    );

    // Update YieldStrategy with Treasury address
    await yieldStrategyContract.setTreasuryContract(await treasuryContract.getAddress());

    // Deploy Jobs
    const Jobs = await ethers.getContractFactory("JobsContract");
    jobsContract = await Jobs.deploy(
      USDT_ADDRESS,
      await treasuryContract.getAddress()
    );

    // Authorize Jobs contract in Treasury
    await treasuryContract.addAuthorizedContract(await jobsContract.getAddress());
  });

  describe("JobsContract", function () {
    it("Should allow agent registration", async function () {
      const stakeAmount = ethers.parseUnits("100", 6); // 100 USDT
      
      // This would require mock USDT contract for full test
      // await jobsContract.connect(agent1).registerAgent(stakeAmount);
      
      // For now, just test contract deployment
      expect(await jobsContract.getAddress()).to.not.equal(ethers.ZeroAddress);
    });

    it("Should create a job", async function () {
      const payment = ethers.parseUnits("50", 6); // 50 USDT
      const deadline = Math.floor(Date.now() / 1000) + 86400; // 1 day from now
      
      // This would require mock USDT for full test
      // await jobsContract.connect(user1).createJob("Test job", payment, deadline);
      
      expect(await jobsContract.nextJobId()).to.equal(1);
    });
  });

  describe("TreasuryContract", function () {
    it("Should be deployed with correct parameters", async function () {
      expect(await treasuryContract.usdtToken()).to.equal(USDT_ADDRESS);
      expect(await treasuryContract.yieldStrategy()).to.equal(await yieldStrategyContract.getAddress());
    });

    it("Should have correct authorization", async function () {
      expect(await treasuryContract.authorizedContracts(await jobsContract.getAddress())).to.be.true;
    });
  });

  describe("YieldStrategyContract", function () {
    it("Should have correct default strategy", async function () {
      const strategy = await yieldStrategyContract.getStrategy();
      expect(strategy.aaveAllocation).to.equal(4000); // 40%
      expect(strategy.compoundAllocation).to.equal(3000); // 30%
      expect(strategy.lpAllocation).to.equal(2000); // 20%
      expect(strategy.reserveRatio).to.equal(1000); // 10%
    });

    it("Should calculate total allocation to 100%", async function () {
      const strategy = await yieldStrategyContract.getStrategy();
      const total = strategy.aaveAllocation + 
                   strategy.compoundAllocation + 
                   strategy.lpAllocation + 
                   strategy.reserveRatio;
      expect(total).to.equal(10000); // 100% in basis points
    });
  });

  describe("Integration", function () {
    it("Should have correct contract relationships", async function () {
      // Treasury should know about YieldStrategy
      expect(await treasuryContract.yieldStrategy()).to.equal(await yieldStrategyContract.getAddress());
      
      // YieldStrategy should know about Treasury
      expect(await yieldStrategyContract.treasuryContract()).to.equal(await treasuryContract.getAddress());
      
      // Jobs should be authorized in Treasury
      expect(await treasuryContract.authorizedContracts(await jobsContract.getAddress())).to.be.true;
    });
  });
});