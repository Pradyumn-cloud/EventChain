import { ethers } from "hardhat";

async function main() {
  const [organizer, buyer] = await ethers.getSigners();

  console.log(" EventChain - Full Flow Test\n");
  console.log("Organizer:", organizer.address);
  console.log("Buyer:", buyer.address);
  console.log(
    "Buyer Balance:",
    ethers.formatEther(await ethers.provider.getBalance(buyer.address)),
    "ETH\n",
  );
  console.log(" STEP 1: Organizer deploys contract...");

  const eventId = "backend-event-uuid-12345";
  const tierPrices = [
    ethers.parseEther("0.01"),
    ethers.parseEther("0.05"),
  ];
  const tierSupply = [100, 20];

  const EventTicket = await ethers.getContractFactory("EventTicket");
  const contract = await EventTicket.connect(organizer).deploy(
    eventId,
    "Summer Festival 2026",
    "SF2026",
    tierPrices,
    tierSupply,
    "https://api.eventchain.local/metadata/",
  );
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log(" Contract deployed at:", contractAddress);
  console.log("   → Now call: PUT /events/" + eventId + "/activate");
  console.log('   → Body: { "contractAddress": "' + contractAddress + '" }\n');

  console.log(" STEP 2: Buyer mints a General ticket (Tier 0)...");

  const tierId = 0;
  const [price] = await contract.getTierInfo(tierId);
  console.log("   Tier 0 price:", ethers.formatEther(price), "ETH");

  const tx = await contract.connect(buyer).mintTicket(tierId, { value: price });
  const receipt = await tx.wait();

  const txHash = receipt?.hash;

  const event = receipt?.logs.find((log) => {
    try {
      const parsed = contract.interface.parseLog({
        topics: log.topics as string[],
        data: log.data,
      });
      return parsed?.name === "TicketMinted";
    } catch {
      return false;
    }
  });

  const parsedEvent = contract.interface.parseLog({
    topics: event?.topics as string[],
    data: event?.data as string,
  });
  const tokenId = parsedEvent?.args?.tokenId;

  console.log(" Ticket minted!");
  console.log("   → txHash:", txHash);
  console.log("   → tokenId:", tokenId?.toString());
  console.log("   → tierId:", tierId);
  console.log("\n   → Now call: POST /tickets/confirm");
  console.log("   → Body: {");
  console.log(`       "eventId": "${eventId}",`);
  console.log(`       "tierId": "<backend-tier-uuid>",`);
  console.log(`       "txHash": "${txHash}",`);
  console.log(`       "tokenId": ${tokenId}`);
  console.log("     }\n");

  console.log("STEP 3: Verifying on-chain data...");

  const owner = await contract.ownerOf(tokenId);
  const ticketTier = await contract.getTicketTier(tokenId);
  const totalMinted = await contract.totalMinted();
  const [, , minted] = await contract.getTierInfo(tierId);

  console.log("   Token owner:", owner);
  console.log("   Token tier:", ticketTier.toString());
  console.log("   Total minted:", totalMinted.toString());
  console.log("   Tier 0 minted:", minted.toString());

  console.log("\n STEP 4: Organizer withdraws earnings...");

  const contractBalance = await contract.getBalance();
  console.log(
    "   Contract balance:",
    ethers.formatEther(contractBalance),
    "ETH",
  );

  const withdrawTx = await contract.connect(organizer).withdraw();
  await withdrawTx.wait();

  console.log(" Funds withdrawn to organizer!");
  console.log(
    "   New contract balance:",
    ethers.formatEther(await contract.getBalance()),
    "ETH",
  );

  console.log("\n Full flow test complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
