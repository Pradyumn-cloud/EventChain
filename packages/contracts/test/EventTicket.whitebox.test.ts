import { expect } from "chai";
import { ethers } from "hardhat";
import { EventTicket } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("EventTicket White-Box Tests", function () {
  let organizer: HardhatEthersSigner;
  let buyer1: HardhatEthersSigner;
  let buyer2: HardhatEthersSigner;

  const eventId = "white-box-event-uuid";
  const name = "White-Box Test Event";
  const symbol = "WBT";
  const baseURI = "https://api.eventchain.test/metadata/";

  beforeEach(async function () {
    [organizer, buyer1, buyer2] = await ethers.getSigners();
  });

  describe("Constructor Guards", function () {
    it("Should revert when tier arrays have mismatched lengths", async function () {
      const EventTicketFactory = await ethers.getContractFactory("EventTicket");

      const tierPrices = [ethers.parseEther("0.01"), ethers.parseEther("0.05")];
      const tierSupply = [10]; // Mismatch: 2 prices, 1 supply

      await expect(
        EventTicketFactory.deploy(
          eventId,
          name,
          symbol,
          tierPrices,
          tierSupply,
          baseURI,
        ),
      ).to.be.revertedWith("Tier arrays must match length");
    });

    it("Should revert when tier arrays are empty", async function () {
      const EventTicketFactory = await ethers.getContractFactory("EventTicket");

      const tierPrices: bigint[] = [];
      const tierSupply: number[] = [];

      await expect(
        EventTicketFactory.deploy(
          eventId,
          name,
          symbol,
          tierPrices,
          tierSupply,
          baseURI,
        ),
      ).to.be.revertedWith("Must have at least one tier");
    });

    it("Should deploy successfully with matching non-empty arrays", async function () {
      const EventTicketFactory = await ethers.getContractFactory("EventTicket");

      const tierPrices = [ethers.parseEther("0.01")];
      const tierSupply = [100];

      const eventTicket = await EventTicketFactory.deploy(
        eventId,
        name,
        symbol,
        tierPrices,
        tierSupply,
        baseURI,
      );
      await eventTicket.waitForDeployment();

      expect(await eventTicket.organizer()).to.equal(organizer.address);
      expect(await eventTicket.getTierCount()).to.equal(1);
    });
  });

  describe("mintTicket Branch Behavior", function () {
    let eventTicket: EventTicket;
    const tierPrices = [ethers.parseEther("0.01"), ethers.parseEther("0.05")];
    const tierSupply = [10, 5];

    beforeEach(async function () {
      const EventTicketFactory = await ethers.getContractFactory("EventTicket");
      eventTicket = await EventTicketFactory.deploy(
        eventId,
        name,
        symbol,
        tierPrices,
        tierSupply,
        baseURI,
      );
      await eventTicket.waitForDeployment();
    });

    it("Should revert on invalid tier ID", async function () {
      await expect(
        eventTicket.connect(buyer1).mintTicket(99, { value: tierPrices[0] }),
      ).to.be.revertedWith("Invalid tier");
    });

    it("Should revert when tier is sold out", async function () {
      // Mint all tier 1 tickets (supply = 5)
      for (let i = 0; i < 5; i++) {
        await eventTicket
          .connect(buyer1)
          .mintTicket(1, { value: tierPrices[1] });
      }

      const [, , minted] = await eventTicket.getTierInfo(1);
      expect(minted).to.equal(5);

      await expect(
        eventTicket.connect(buyer2).mintTicket(1, { value: tierPrices[1] }),
      ).to.be.revertedWith("Tier sold out");
    });

    it("Should revert on insufficient payment", async function () {
      const insufficientPayment = tierPrices[0]! - BigInt(1);

      await expect(
        eventTicket
          .connect(buyer1)
          .mintTicket(0, { value: insufficientPayment }),
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should mint successfully with exact payment", async function () {
      const contractBalanceBefore = await ethers.provider.getBalance(
        await eventTicket.getAddress(),
      );

      await eventTicket.connect(buyer1).mintTicket(0, { value: tierPrices[0] });

      const contractBalanceAfter = await ethers.provider.getBalance(
        await eventTicket.getAddress(),
      );

      expect(contractBalanceAfter - contractBalanceBefore).to.equal(
        tierPrices[0],
      );
      expect(await eventTicket.ownerOf(1)).to.equal(buyer1.address);
    });

    it("Should refund excess payment correctly", async function () {
      const excessPayment = tierPrices[0]! + ethers.parseEther("0.1");
      const buyerBalanceBefore = await ethers.provider.getBalance(
        buyer1.address,
      );

      const tx = await eventTicket
        .connect(buyer1)
        .mintTicket(0, { value: excessPayment });
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const buyerBalanceAfter = await ethers.provider.getBalance(
        buyer1.address,
      );
      const contractBalance = await eventTicket.getBalance();

      // Contract should only receive tier price, not excess
      expect(contractBalance).to.equal(tierPrices[0]);

      // Buyer should only pay tier price + gas, not excess + gas
      const expectedBuyerBalance =
        buyerBalanceBefore - tierPrices[0]! - gasUsed;
      expect(buyerBalanceAfter).to.be.closeTo(
        expectedBuyerBalance,
        ethers.parseEther("0.0001"),
      );
    });
  });

  describe("Internal State Invariants", function () {
    let eventTicket: EventTicket;
    const tierPrices = [
      ethers.parseEther("0.01"),
      ethers.parseEther("0.05"),
      ethers.parseEther("0.1"),
    ];
    const tierSupply = [10, 5, 3];

    beforeEach(async function () {
      const EventTicketFactory = await ethers.getContractFactory("EventTicket");
      eventTicket = await EventTicketFactory.deploy(
        eventId,
        name,
        symbol,
        tierPrices,
        tierSupply,
        baseURI,
      );
      await eventTicket.waitForDeployment();
    });

    it("Should increment totalMinted by exactly 1 per mint", async function () {
      const totalMintedBefore = await eventTicket.totalMinted();
      expect(totalMintedBefore).to.equal(0);

      await eventTicket.connect(buyer1).mintTicket(0, { value: tierPrices[0] });
      expect(await eventTicket.totalMinted()).to.equal(1);

      await eventTicket.connect(buyer1).mintTicket(1, { value: tierPrices[1] });
      expect(await eventTicket.totalMinted()).to.equal(2);

      await eventTicket.connect(buyer2).mintTicket(0, { value: tierPrices[0] });
      expect(await eventTicket.totalMinted()).to.equal(3);
    });

    it("Should increment tierMinted[tierId] by exactly 1 per mint", async function () {
      const [, , tier0MintedBefore] = await eventTicket.getTierInfo(0);
      const [, , tier1MintedBefore] = await eventTicket.getTierInfo(1);

      expect(tier0MintedBefore).to.equal(0);
      expect(tier1MintedBefore).to.equal(0);

      await eventTicket.connect(buyer1).mintTicket(0, { value: tierPrices[0] });

      const [, , tier0MintedAfter1] = await eventTicket.getTierInfo(0);
      const [, , tier1MintedAfter1] = await eventTicket.getTierInfo(1);

      expect(tier0MintedAfter1).to.equal(1);
      expect(tier1MintedAfter1).to.equal(0); // Should not change

      await eventTicket.connect(buyer1).mintTicket(1, { value: tierPrices[1] });

      const [, , tier0MintedAfter2] = await eventTicket.getTierInfo(0);
      const [, , tier1MintedAfter2] = await eventTicket.getTierInfo(1);

      expect(tier0MintedAfter2).to.equal(1); // Should not change
      expect(tier1MintedAfter2).to.equal(1);
    });

    it("Should correctly map ticketTier[tokenId] to tierId", async function () {
      await eventTicket.connect(buyer1).mintTicket(1, { value: tierPrices[1] });
      await eventTicket.connect(buyer1).mintTicket(0, { value: tierPrices[0] });
      await eventTicket.connect(buyer2).mintTicket(2, { value: tierPrices[2] });

      expect(await eventTicket.getTicketTier(1)).to.equal(1);
      expect(await eventTicket.getTicketTier(2)).to.equal(0);
      expect(await eventTicket.getTicketTier(3)).to.equal(2);
    });

    it("Should set ownerOf(tokenId) to buyer address", async function () {
      await eventTicket.connect(buyer1).mintTicket(0, { value: tierPrices[0] });
      await eventTicket.connect(buyer2).mintTicket(1, { value: tierPrices[1] });

      expect(await eventTicket.ownerOf(1)).to.equal(buyer1.address);
      expect(await eventTicket.ownerOf(2)).to.equal(buyer2.address);
    });

    it("Should not affect other tier counts when minting a specific tier", async function () {
      const [, , tier0Before] = await eventTicket.getTierInfo(0);
      const [, , tier1Before] = await eventTicket.getTierInfo(1);
      const [, , tier2Before] = await eventTicket.getTierInfo(2);

      expect(tier0Before).to.equal(0);
      expect(tier1Before).to.equal(0);
      expect(tier2Before).to.equal(0);

      await eventTicket.connect(buyer1).mintTicket(1, { value: tierPrices[1] });

      const [, , tier0After] = await eventTicket.getTierInfo(0);
      const [, , tier1After] = await eventTicket.getTierInfo(1);
      const [, , tier2After] = await eventTicket.getTierInfo(2);

      expect(tier0After).to.equal(0);
      expect(tier1After).to.equal(1);
      expect(tier2After).to.equal(0);
    });

    it("Should handle sequential token assignment across mixed tiers", async function () {
      await eventTicket.connect(buyer1).mintTicket(2, { value: tierPrices[2] }); // token 1, tier 2
      await eventTicket.connect(buyer1).mintTicket(0, { value: tierPrices[0] }); // token 2, tier 0
      await eventTicket.connect(buyer1).mintTicket(1, { value: tierPrices[1] }); // token 3, tier 1
      await eventTicket.connect(buyer1).mintTicket(0, { value: tierPrices[0] }); // token 4, tier 0

      expect(await eventTicket.totalMinted()).to.equal(4);
      expect(await eventTicket.getTicketTier(1)).to.equal(2);
      expect(await eventTicket.getTicketTier(2)).to.equal(0);
      expect(await eventTicket.getTicketTier(3)).to.equal(1);
      expect(await eventTicket.getTicketTier(4)).to.equal(0);
    });

    it("Should handle minting up to supply capacity", async function () {
      // Tier 2 has supply of 3
      await eventTicket.connect(buyer1).mintTicket(2, { value: tierPrices[2] });
      await eventTicket.connect(buyer1).mintTicket(2, { value: tierPrices[2] });
      await eventTicket.connect(buyer1).mintTicket(2, { value: tierPrices[2] });

      const [, supply, minted] = await eventTicket.getTierInfo(2);
      expect(minted).to.equal(supply);

      // Next mint should fail
      await expect(
        eventTicket.connect(buyer1).mintTicket(2, { value: tierPrices[2] }),
      ).to.be.revertedWith("Tier sold out");
    });
  });

  describe("getTierInfo Validation", function () {
    let eventTicket: EventTicket;
    const tierPrices = [ethers.parseEther("0.01")];
    const tierSupply = [10];

    beforeEach(async function () {
      const EventTicketFactory = await ethers.getContractFactory("EventTicket");
      eventTicket = await EventTicketFactory.deploy(
        eventId,
        name,
        symbol,
        tierPrices,
        tierSupply,
        baseURI,
      );
      await eventTicket.waitForDeployment();
    });

    it("Should return correct info for valid tier", async function () {
      const [price, supply, minted] = await eventTicket.getTierInfo(0);
      expect(price).to.equal(tierPrices[0]);
      expect(supply).to.equal(tierSupply[0]);
      expect(minted).to.equal(0);
    });

    it("Should revert for invalid tier ID", async function () {
      await expect(eventTicket.getTierInfo(1)).to.be.revertedWith(
        "Invalid tier",
      );

      await expect(eventTicket.getTierInfo(99)).to.be.revertedWith(
        "Invalid tier",
      );
    });
  });

  describe("getTicketTier Validation", function () {
    let eventTicket: EventTicket;
    const tierPrices = [ethers.parseEther("0.01")];
    const tierSupply = [10];

    beforeEach(async function () {
      const EventTicketFactory = await ethers.getContractFactory("EventTicket");
      eventTicket = await EventTicketFactory.deploy(
        eventId,
        name,
        symbol,
        tierPrices,
        tierSupply,
        baseURI,
      );
      await eventTicket.waitForDeployment();
    });

    it("Should revert for tokenId zero", async function () {
      await expect(eventTicket.getTicketTier(0)).to.be.revertedWith(
        "Token does not exist",
      );
    });

    it("Should revert for tokenId beyond totalMinted", async function () {
      await expect(eventTicket.getTicketTier(1)).to.be.revertedWith(
        "Token does not exist",
      );

      await eventTicket.connect(buyer1).mintTicket(0, { value: tierPrices[0] });

      await expect(eventTicket.getTicketTier(2)).to.be.revertedWith(
        "Token does not exist",
      );
    });

    it("Should return correct tier for valid tokenId", async function () {
      await eventTicket.connect(buyer1).mintTicket(0, { value: tierPrices[0] });

      const tier = await eventTicket.getTicketTier(1);
      expect(tier).to.equal(0);
    });
  });

  describe("Withdrawal Authorization and Balance Branches", function () {
    let eventTicket: EventTicket;
    const tierPrices = [ethers.parseEther("0.01"), ethers.parseEther("0.05")];
    const tierSupply = [10, 5];

    beforeEach(async function () {
      const EventTicketFactory = await ethers.getContractFactory("EventTicket");
      eventTicket = await EventTicketFactory.deploy(
        eventId,
        name,
        symbol,
        tierPrices,
        tierSupply,
        baseURI,
      );
      await eventTicket.waitForDeployment();
    });

    it("Should revert when non-organizer attempts withdrawal", async function () {
      // Add some funds first
      await eventTicket.connect(buyer1).mintTicket(0, { value: tierPrices[0] });

      await expect(eventTicket.connect(buyer1).withdraw()).to.be.revertedWith(
        "Only organizer can call this",
      );

      await expect(eventTicket.connect(buyer2).withdraw()).to.be.revertedWith(
        "Only organizer can call this",
      );
    });

    it("Should revert when contract has zero balance", async function () {
      const balance = await eventTicket.getBalance();
      expect(balance).to.equal(0);

      await expect(
        eventTicket.connect(organizer).withdraw(),
      ).to.be.revertedWith("No funds to withdraw");
    });

    it("Should successfully withdraw positive balance to organizer", async function () {
      await eventTicket.connect(buyer1).mintTicket(0, { value: tierPrices[0] });
      await eventTicket.connect(buyer2).mintTicket(1, { value: tierPrices[1] });

      const contractBalanceBefore = await eventTicket.getBalance();
      expect(contractBalanceBefore).to.equal(tierPrices[0]! + tierPrices[1]!);

      const organizerBalanceBefore = await ethers.provider.getBalance(
        organizer.address,
      );

      const tx = await eventTicket.connect(organizer).withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const contractBalanceAfter = await eventTicket.getBalance();
      const organizerBalanceAfter = await ethers.provider.getBalance(
        organizer.address,
      );

      expect(contractBalanceAfter).to.equal(0);
      expect(organizerBalanceAfter).to.equal(
        organizerBalanceBefore + contractBalanceBefore - gasUsed,
      );
    });

    it("Should revert on second consecutive withdrawal (zero balance)", async function () {
      await eventTicket.connect(buyer1).mintTicket(0, { value: tierPrices[0] });

      await eventTicket.connect(organizer).withdraw();
      expect(await eventTicket.getBalance()).to.equal(0);

      await expect(
        eventTicket.connect(organizer).withdraw(),
      ).to.be.revertedWith("No funds to withdraw");
    });

    it("Should emit FundsWithdrawn event with correct amount", async function () {
      await eventTicket.connect(buyer1).mintTicket(0, { value: tierPrices[0] });
      await eventTicket.connect(buyer2).mintTicket(1, { value: tierPrices[1] });

      const balance = await eventTicket.getBalance();

      await expect(eventTicket.connect(organizer).withdraw())
        .to.emit(eventTicket, "FundsWithdrawn")
        .withArgs(organizer.address, balance);
    });
  });

  describe("Edge Cases and Advanced Scenarios", function () {
    it("Should handle single tier with large supply", async function () {
      const EventTicketFactory = await ethers.getContractFactory("EventTicket");
      const largeTierSupply = [1000];
      const largeTierPrices = [ethers.parseEther("0.001")];

      const eventTicket = await EventTicketFactory.deploy(
        eventId,
        name,
        symbol,
        largeTierPrices,
        largeTierSupply,
        baseURI,
      );
      await eventTicket.waitForDeployment();

      expect(await eventTicket.getTierCount()).to.equal(1);

      await eventTicket
        .connect(buyer1)
        .mintTicket(0, { value: largeTierPrices[0] });

      const [, supply, minted] = await eventTicket.getTierInfo(0);
      expect(supply).to.equal(1000);
      expect(minted).to.equal(1);
    });

    it("Should handle multiple tiers with mixed prices in correct order", async function () {
      const EventTicketFactory = await ethers.getContractFactory("EventTicket");
      const tierPrices = [
        ethers.parseEther("0.5"), // Tier 0: Expensive
        ethers.parseEther("0.01"), // Tier 1: Cheap
        ethers.parseEther("0.1"), // Tier 2: Medium
      ];
      const tierSupply = [2, 10, 5];

      const eventTicket = await EventTicketFactory.deploy(
        eventId,
        name,
        symbol,
        tierPrices,
        tierSupply,
        baseURI,
      );
      await eventTicket.waitForDeployment();

      await eventTicket.connect(buyer1).mintTicket(1, { value: tierPrices[1] });
      await eventTicket.connect(buyer1).mintTicket(2, { value: tierPrices[2] });
      await eventTicket.connect(buyer1).mintTicket(0, { value: tierPrices[0] });

      expect(await eventTicket.getTicketTier(1)).to.equal(1);
      expect(await eventTicket.getTicketTier(2)).to.equal(2);
      expect(await eventTicket.getTicketTier(3)).to.equal(0);

      const balance = await eventTicket.getBalance();
      expect(balance).to.equal(
        tierPrices[0]! + tierPrices[1]! + tierPrices[2]!,
      );
    });

    it("Should prevent reentrancy during mint (via nonReentrant modifier)", async function () {
      const EventTicketFactory = await ethers.getContractFactory("EventTicket");
      const tierPrices = [ethers.parseEther("0.01")];
      const tierSupply = [10];

      const eventTicket = await EventTicketFactory.deploy(
        eventId,
        name,
        symbol,
        tierPrices,
        tierSupply,
        baseURI,
      );
      await eventTicket.waitForDeployment();

      // Normal mint should work
      await expect(
        eventTicket.connect(buyer1).mintTicket(0, { value: tierPrices[0] }),
      ).to.not.be.reverted;
    });
  });
});
