import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // Example deployment for testing
  // In production, these values come from the frontend when organizer creates an event
  
  const eventId = "test-event-uuid-123"; // Backend event UUID
  const name = "Test Concert 2026";
  const symbol = "TC2026";
  
  // Tier prices in wei (0.01 MATIC, 0.05 MATIC)
  const tierPrices = [
    ethers.parseEther("0.01"),  // General: 0.01 MATIC
    ethers.parseEther("0.05")   // VIP: 0.05 MATIC
  ];
  
  // Tier supply
  const tierSupply = [100, 20]; // 100 General, 20 VIP
  
  // Base URI for metadata (can be empty for now)
  const baseURI = "https://api.eventchain.local/metadata/";

  console.log("\nDeploying EventTicket contract...");
  console.log("Event ID:", eventId);
  console.log("Tiers:", tierPrices.length);
  
  const EventTicket = await ethers.getContractFactory("EventTicket");
  const eventTicket = await EventTicket.deploy(
    eventId,
    name,
    symbol,
    tierPrices,
    tierSupply,
    baseURI
  );

  await eventTicket.waitForDeployment();
  
  const contractAddress = await eventTicket.getAddress();
  
  console.log("\n✅ EventTicket deployed!");
  console.log("Contract Address:", contractAddress);
  console.log("Organizer:", deployer.address);
  
  // Log tier info
  console.log("\n📋 Tier Information:");
  for (let i = 0; i < tierPrices.length; i++) {
    const [price, supply, minted] = await eventTicket.getTierInfo(i);
    console.log(`  Tier ${i}: Price=${ethers.formatEther(price)} MATIC, Supply=${supply}, Minted=${minted}`);
  }
  
  console.log("\n🔗 Use this contract address in your backend:");
  console.log(`PUT /events/${eventId}/activate`);
  console.log(`Body: { "contractAddress": "${contractAddress}" }`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
