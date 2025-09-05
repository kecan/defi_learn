import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // USDT address on Sepolia (you might need to deploy a mock USDT for testing)
  const USDT_ADDRESS = "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06"; // Example address
  
  // Deploy YieldStrategyContract first
  console.log("Deploying YieldStrategyContract...");
  const YieldStrategy = await ethers.getContractFactory("YieldStrategyContract");
  const yieldStrategy = await YieldStrategy.deploy(
    USDT_ADDRESS,
    "0x0000000000000000000000000000000000000000", // Aave Pool address (placeholder)
    "0x0000000000000000000000000000000000000000", // Compound cToken address (placeholder)
    "0x0000000000000000000000000000000000000000", // Uniswap Router address (placeholder)
    "0x0000000000000000000000000000000000000000"  // Treasury address (will be updated later)
  );
  await yieldStrategy.waitForDeployment();
  console.log("YieldStrategyContract deployed to:", await yieldStrategy.getAddress());

  // Deploy TreasuryContract
  console.log("Deploying TreasuryContract...");
  const Treasury = await ethers.getContractFactory("TreasuryContract");
  const treasury = await Treasury.deploy(
    USDT_ADDRESS,
    await yieldStrategy.getAddress()
  );
  await treasury.waitForDeployment();
  console.log("TreasuryContract deployed to:", await treasury.getAddress());

  // Update YieldStrategy with Treasury address
  console.log("Updating YieldStrategy with Treasury address...");
  await yieldStrategy.setTreasuryContract(await treasury.getAddress());

  // Deploy JobsContract
  console.log("Deploying JobsContract...");
  const Jobs = await ethers.getContractFactory("JobsContract");
  const jobs = await Jobs.deploy(
    USDT_ADDRESS,
    await treasury.getAddress()
  );
  await jobs.waitForDeployment();
  console.log("JobsContract deployed to:", await jobs.getAddress());

  // Authorize JobsContract in Treasury
  console.log("Authorizing JobsContract in Treasury...");
  await treasury.addAuthorizedContract(await jobs.getAddress());

  console.log("\n=== Deployment Summary ===");
  console.log("USDT Token:", USDT_ADDRESS);
  console.log("YieldStrategyContract:", await yieldStrategy.getAddress());
  console.log("TreasuryContract:", await treasury.getAddress());
  console.log("JobsContract:", await jobs.getAddress());

  console.log("\n=== Next Steps ===");
  console.log("1. Update DeFi protocol addresses in YieldStrategy");
  console.log("2. Configure yield distribution parameters");
  console.log("3. Test contract interactions");
  console.log("4. Update frontend contract addresses");

  // Save deployment addresses to a file
  const deploymentInfo = {
    network: await ethers.provider.getNetwork(),
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      USDT: USDT_ADDRESS,
      YieldStrategy: await yieldStrategy.getAddress(),
      Treasury: await treasury.getAddress(),
      Jobs: await jobs.getAddress(),
    },
  };

  console.log("\n=== Deployment Info ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });