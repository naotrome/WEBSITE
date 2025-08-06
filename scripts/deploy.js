const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying TotheNineCloud (T9C) meme coin...");
  
  // Get the contract factory
  const TotheNineCloud = await ethers.getContractFactory("TotheNineCloud");
  
  // Deploy the contract
  console.log("⏳ Deploying contract...");
  const totheNineCloud = await TotheNineCloud.deploy();
  
  // Wait for deployment to complete
  await totheNineCloud.waitForDeployment();
  
  const contractAddress = await totheNineCloud.getAddress();
  console.log("✅ TotheNineCloud deployed to:", contractAddress);
  
  // Get deployment details
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const deployerBalance = await totheNineCloud.balanceOf(deployerAddress);
  
  console.log("\n📊 Deployment Summary:");
  console.log("====================");
  console.log("Contract Address:", contractAddress);
  console.log("Deployer Address:", deployerAddress);
  console.log("Token Name:", await totheNineCloud.name());
  console.log("Token Symbol:", await totheNineCloud.symbol());
  console.log("Total Supply:", ethers.formatEther(await totheNineCloud.totalSupply()), "T9C");
  console.log("Deployer Balance:", ethers.formatEther(deployerBalance), "T9C");
  console.log("Max Transaction Amount:", ethers.formatEther(await totheNineCloud.maxTransactionAmount()), "T9C");
  console.log("Max Wallet Amount:", ethers.formatEther(await totheNineCloud.maxWalletAmount()), "T9C");
  console.log("Reflection Fee:", await totheNineCloud.reflectionFee(), "%");
  
  // Save deployment info
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    contractAddress: contractAddress,
    deployerAddress: deployerAddress,
    blockNumber: await ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
    transactionHash: totheNineCloud.deploymentTransaction()?.hash
  };
  
  console.log("\n💾 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  // Verify contract on Etherscan (if not on localhost)
  const network = await ethers.provider.getNetwork();
  if (network.chainId !== 1337n && network.chainId !== 31337n) {
    console.log("\n🔍 Waiting for block confirmations...");
    await totheNineCloud.deploymentTransaction()?.wait(5);
    
    console.log("📝 Verifying contract on Etherscan...");
    try {
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on Etherscan");
    } catch (error) {
      console.log("❌ Error verifying contract:", error.message);
    }
  }
  
  console.log("\n🎉 Deployment completed successfully!");
  console.log("☁️ TotheNineCloud is ready to reach the clouds! ☁️");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });