import { expect } from "chai";
import { ethers } from "hardhat";
import { EventTicket } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("EventTicket", function () {
  let eventTicket: EventTicket;
  let organizer: HardhatEthersSigner;
  let buyer1: HardhatEthersSigner;
  let buyer2: HardhatEthersSigner;
  
  const eventId = "test-event-uuid-123";
  const name = "Test Concert";
  const symbol = "TC";
  const baseURI = "https://api.eventchain.local/metadata/";

  const tierPrices = [
    ethers.parseEther("0.01"),
    ethers.parseEther("0.05")
  ];
  const tierSupply = [10, 5];

  beforeEach(async function () {
    [organizer, buyer1, buyer2] = await ethers.getSigners();
    
    const EventTicketFactory = await ethers.getContractFactory("EventTicket");
    eventTicket = await EventTicketFactory.deploy(
      eventId,
      name,
      symbol,
      tierPrices,
      tierSupply,
      baseURI
    );
    await eventTicket.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct organizer", async function () {
      expect(await eventTicket.organizer()).to.equal(organizer.address);
    });

    it("Should set the correct eventId", async function () {
      expect(await eventTicket.eventId()).to.equal(eventId);
    });

    it("Should initialize tiers correctly", async function () {
      const [price0, supply0, minted0] = await eventTicket.getTierInfo(0);
      expect(price0).to.equal(tierPrices[0]);
      expect(supply0).to.equal(tierSupply[0]);
      expect(minted0).to.equal(0);

      const [price1, supply1, minted1] = await eventTicket.getTierInfo(1);
      expect(price1).to.equal(tierPrices[1]);
      expect(supply1).to.equal(tierSupply[1]);
      expect(minted1).to.equal(0);
    });

    it("Should have correct tier count", async function () {
      expect(await eventTicket.getTierCount()).to.equal(2);
    });
  });

  describe("Minting", function () {
    it("Should mint a ticket with correct payment", async function () {
      const tx = await eventTicket.connect(buyer1).mintTicket(0, {
        value: tierPrices[0]
      });
      
      const receipt = await tx.wait();

      expect(await eventTicket.ownerOf(1)).to.equal(buyer1.address);
      expect(await eventTicket.totalMinted()).to.equal(1);

      const [, , minted] = await eventTicket.getTierInfo(0);
      expect(minted).to.equal(1);

      expect(await eventTicket.getTicketTier(1)).to.equal(0);
    });

    it("Should emit TicketMinted event", async function () {
      await expect(eventTicket.connect(buyer1).mintTicket(0, { value: tierPrices[0] }))
        .to.emit(eventTicket, "TicketMinted")
        .withArgs(buyer1.address, 1, 0);
    });

    it("Should refund excess payment", async function () {
      const excessAmount = ethers.parseEther("0.1");
      const balanceBefore = await ethers.provider.getBalance(buyer1.address);
      
      const tx = await eventTicket.connect(buyer1).mintTicket(0, {
        value: excessAmount
      });
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      
      const balanceAfter = await ethers.provider.getBalance(buyer1.address);
      const expectedBalance = balanceBefore - tierPrices[0]! - gasUsed;
      expect(balanceAfter).to.be.closeTo(expectedBalance, ethers.parseEther("0.001"));
    });

    it("Should fail with insufficient payment", async function () {
      await expect(
        eventTicket.connect(buyer1).mintTicket(0, { value: ethers.parseEther("0.005") })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should fail when tier is sold out", async function () {
      for (let i = 0; i < 5; i++) {
        await eventTicket.connect(buyer1).mintTicket(1, { value: tierPrices[1] });
      }
      await expect(
        eventTicket.connect(buyer2).mintTicket(1, { value: tierPrices[1] })
      ).to.be.revertedWith("Tier sold out");
    });

    it("Should fail with invalid tier", async function () {
      await expect(
        eventTicket.connect(buyer1).mintTicket(99, { value: tierPrices[0] })
      ).to.be.revertedWith("Invalid tier");
    });
  });

  describe("Withdrawal", function () {
    beforeEach(async function () {
      await eventTicket.connect(buyer1).mintTicket(0, { value: tierPrices[0] });
      await eventTicket.connect(buyer2).mintTicket(1, { value: tierPrices[1] });
    });

    it("Should allow organizer to withdraw", async function () {
      const contractBalance = await eventTicket.getBalance();
      const organizerBalanceBefore = await ethers.provider.getBalance(organizer.address);
      
      const tx = await eventTicket.connect(organizer).withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      
      const organizerBalanceAfter = await ethers.provider.getBalance(organizer.address);
      
      expect(await eventTicket.getBalance()).to.equal(0);
      expect(organizerBalanceAfter).to.equal(organizerBalanceBefore + contractBalance - gasUsed);
    });

    it("Should emit FundsWithdrawn event", async function () {
      const balance = await eventTicket.getBalance();
      await expect(eventTicket.connect(organizer).withdraw())
        .to.emit(eventTicket, "FundsWithdrawn")
        .withArgs(organizer.address, balance);
    });

    it("Should fail when non-organizer tries to withdraw", async function () {
      await expect(
        eventTicket.connect(buyer1).withdraw()
      ).to.be.revertedWith("Only organizer can call this");
    });

    it("Should fail when no funds to withdraw", async function () {
      await eventTicket.connect(organizer).withdraw();
      await expect(
        eventTicket.connect(organizer).withdraw()
      ).to.be.revertedWith("No funds to withdraw");
    });
  });
});
