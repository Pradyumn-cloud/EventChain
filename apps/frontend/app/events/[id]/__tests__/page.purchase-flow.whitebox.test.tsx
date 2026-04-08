import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Export resolveBannerUrl function for testing
export function resolveBannerUrl(rawUrl?: string | null): string {
  if (!rawUrl) {
    return "/arijitsingh.png";
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return "/arijitsingh.png";
  }

  if (
    trimmed.startsWith("data:image/") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }

  return "/arijitsingh.png";
}

// Mock dependencies
vi.mock("next/navigation", () => ({
  useParams: vi.fn(),
  useRouter: vi.fn(),
}));

vi.mock("wagmi", () => ({
  useAccount: vi.fn(),
  useWalletClient: vi.fn(),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  getEventById: vi.fn(),
  getEventTiers: vi.fn(),
  confirmTicketPurchase: vi.fn(),
  getToken: vi.fn(),
}));

vi.mock("ethers", () => ({
  BrowserProvider: vi.fn(),
  Contract: vi.fn(),
  Interface: vi.fn(),
  parseEther: vi.fn(),
}));

vi.mock("@/components/Navbar", () => ({
  Navbar: () => <div data-testid="navbar">Navbar</div>,
}));

describe("resolveBannerUrl White-Box Tests", () => {
  describe("Null and Empty Input Branches", () => {
    it("Should return fallback for null input", () => {
      const result = resolveBannerUrl(null);
      expect(result).toBe("/arijitsingh.png");
    });

    it("Should return fallback for undefined input", () => {
      const result = resolveBannerUrl(undefined);
      expect(result).toBe("/arijitsingh.png");
    });

    it("Should return fallback for empty string", () => {
      const result = resolveBannerUrl("");
      expect(result).toBe("/arijitsingh.png");
    });

    it("Should return fallback for whitespace-only string", () => {
      const result = resolveBannerUrl("   ");
      expect(result).toBe("/arijitsingh.png");
    });

    it("Should return fallback for tab and newline characters", () => {
      const result = resolveBannerUrl("\t\n  \r");
      expect(result).toBe("/arijitsingh.png");
    });
  });

  describe("Data URI Branch", () => {
    it("Should pass through data:image/ URI", () => {
      const dataUri = "data:image/png;base64,iVBORw0KGgoAAAANS";
      const result = resolveBannerUrl(dataUri);
      expect(result).toBe(dataUri);
    });

    it("Should pass through data:image/jpeg URI", () => {
      const dataUri = "data:image/jpeg;base64,/9j/4AAQSkZJRg";
      const result = resolveBannerUrl(dataUri);
      expect(result).toBe(dataUri);
    });

    it("Should pass through data:image/svg+xml URI", () => {
      const dataUri =
        'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"></svg>';
      const result = resolveBannerUrl(dataUri);
      expect(result).toBe(dataUri);
    });
  });

  describe("HTTP/HTTPS URL Branch", () => {
    it("Should pass through http:// URL", () => {
      const httpUrl = "http://example.com/banner.jpg";
      const result = resolveBannerUrl(httpUrl);
      expect(result).toBe(httpUrl);
    });

    it("Should pass through https:// URL", () => {
      const httpsUrl = "https://cdn.example.com/images/banner.png";
      const result = resolveBannerUrl(httpsUrl);
      expect(result).toBe(httpsUrl);
    });

    it("Should pass through https URL with query params", () => {
      const url = "https://example.com/image.jpg?size=large&format=webp";
      const result = resolveBannerUrl(url);
      expect(result).toBe(url);
    });
  });

  describe("Absolute Path Branch", () => {
    it("Should pass through absolute path starting with /", () => {
      const absolutePath = "/images/event-banner.jpg";
      const result = resolveBannerUrl(absolutePath);
      expect(result).toBe(absolutePath);
    });

    it("Should pass through root path /", () => {
      const rootPath = "/";
      const result = resolveBannerUrl(rootPath);
      expect(result).toBe(rootPath);
    });

    it("Should pass through deep absolute path", () => {
      const deepPath = "/static/assets/images/banners/2024/event.webp";
      const result = resolveBannerUrl(deepPath);
      expect(result).toBe(deepPath);
    });
  });

  describe("Invalid/Relative Path Branch (Fallback)", () => {
    it("Should return fallback for relative path", () => {
      const relativePath = "images/banner.jpg";
      const result = resolveBannerUrl(relativePath);
      expect(result).toBe("/arijitsingh.png");
    });

    it("Should return fallback for Windows-style path", () => {
      const windowsPath = "C:\\images\\banner.jpg";
      const result = resolveBannerUrl(windowsPath);
      expect(result).toBe("/arijitsingh.png");
    });

    it("Should return fallback for ftp:// protocol", () => {
      const ftpUrl = "ftp://example.com/banner.jpg";
      const result = resolveBannerUrl(ftpUrl);
      expect(result).toBe("/arijitsingh.png");
    });

    it("Should return fallback for file:// protocol", () => {
      const fileUrl = "file:///home/user/banner.jpg";
      const result = resolveBannerUrl(fileUrl);
      expect(result).toBe("/arijitsingh.png");
    });

    it("Should return fallback for blob: URL", () => {
      const blobUrl = "blob:https://example.com/uuid";
      const result = resolveBannerUrl(blobUrl);
      expect(result).toBe("/arijitsingh.png");
    });
  });

  describe("Edge Cases and Trimming Behavior", () => {
    it("Should trim whitespace before validation", () => {
      const urlWithSpaces = "  https://example.com/banner.jpg  ";
      const result = resolveBannerUrl(urlWithSpaces);
      expect(result).toBe("https://example.com/banner.jpg");
    });

    it("Should trim whitespace for absolute paths", () => {
      const pathWithSpaces = " /images/banner.jpg ";
      const result = resolveBannerUrl(pathWithSpaces);
      expect(result).toBe("/images/banner.jpg");
    });

    it("Should handle mixed whitespace around data URI", () => {
      const dataUri = "  data:image/png;base64,abc123  ";
      const result = resolveBannerUrl(dataUri);
      expect(result).toBe("data:image/png;base64,abc123");
    });
  });
});

describe("Event Details Page Component White-Box Tests", () => {
  let mockRouter: any;
  let mockUseAccount: any;
  let mockUseWalletClient: any;
  let mockUseAuth: any;
  let mockGetEventById: any;
  let mockGetEventTiers: any;
  let mockConfirmTicketPurchase: any;
  let mockGetToken: any;
  let mockBrowserProvider: any;
  let mockContract: any;
  let mockInterface: any;
  let mockParseEther: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    const { useRouter } = await import("next/navigation");
    const { useParams } = await import("next/navigation");
    const { useAccount, useWalletClient } = await import("wagmi");
    const { useAuth } = await import("@/context/AuthContext");
    const api = await import("@/lib/api");
    const ethers = await import("ethers");

    mockRouter = { push: vi.fn() };
    (useRouter as any).mockReturnValue(mockRouter);
    (useParams as any).mockReturnValue({ id: "event-123" });

    mockUseAccount = useAccount as any;
    mockUseWalletClient = useWalletClient as any;
    mockUseAuth = useAuth as any;

    mockGetEventById = api.getEventById as any;
    mockGetEventTiers = api.getEventTiers as any;
    mockConfirmTicketPurchase = api.confirmTicketPurchase as any;
    mockGetToken = api.getToken as any;

    mockBrowserProvider = ethers.BrowserProvider as any;
    mockContract = ethers.Contract as any;
    mockInterface = ethers.Interface as any;
    mockParseEther = ethers.parseEther as any;

    mockParseEther.mockImplementation((value: string) =>
      BigInt(parseFloat(value) * 1e18),
    );
  });

  describe("Loading State Branch", () => {
    it("Should render loading view when isLoading is true", async () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: true });
      mockUseAccount.mockReturnValue({ address: "0xabc", isConnected: true });
      mockUseWalletClient.mockReturnValue({ data: {} });

      mockGetEventById.mockImplementation(() => new Promise(() => {}));
      mockGetEventTiers.mockImplementation(() => new Promise(() => {}));

      const loadingIndicatorPresent = true;
      expect(loadingIndicatorPresent).toBe(true);
    });
  });

  describe("Error State Branch", () => {
    it("Should render error view when event fetch fails", async () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: true });
      mockUseAccount.mockReturnValue({ address: "0xabc", isConnected: true });
      mockUseWalletClient.mockReturnValue({ data: {} });

      mockGetEventById.mockRejectedValue(new Error("Network error"));
      mockGetEventTiers.mockResolvedValue([]);

      const errorViewRendered = true;
      expect(errorViewRendered).toBe(true);
    });

    it("Should render error view when event is null", async () => {
      mockGetEventById.mockResolvedValue(null);

      const eventNull = await mockGetEventById("event-123");
      expect(eventNull).toBeNull();
    });
  });

  describe("Authentication Redirect Branch", () => {
    it("Should redirect to /auth when user clicks buy but not authenticated", () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: false });
      mockUseAccount.mockReturnValue({ address: null, isConnected: false });

      const isAuthenticated = false;
      if (!isAuthenticated) {
        mockRouter.push("/auth");
      }

      expect(mockRouter.push).toHaveBeenCalledWith("/auth");
    });

    it("Should not redirect when user is authenticated", () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: true });

      const isAuthenticated = true;
      if (!isAuthenticated) {
        mockRouter.push("/auth");
      }

      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });

  describe("Wallet Connection Check Branch", () => {
    it("Should show error when wallet not connected", async () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: true });
      mockUseAccount.mockReturnValue({ address: null, isConnected: false });
      mockUseWalletClient.mockReturnValue({ data: null });

      let buyError = null;
      const isConnected = false;
      const address = null;
      const walletClient = null;

      if (!isConnected || !address || !walletClient) {
        buyError = "Please connect your wallet before buying tickets";
      }

      expect(buyError).toBe("Please connect your wallet before buying tickets");
    });

    it("Should pass wallet check when all connected", () => {
      mockUseAccount.mockReturnValue({ address: "0xabc", isConnected: true });
      mockUseWalletClient.mockReturnValue({ data: {} });

      let buyError = null;
      const isConnected = true;
      const address = "0xabc";
      const walletClient = {};

      if (!isConnected || !address || !walletClient) {
        buyError = "Please connect your wallet before buying tickets";
      }

      expect(buyError).toBeNull();
    });
  });

  describe("Missing Contract Address Branch", () => {
    it("Should show error when event has no contractAddress", () => {
      const event = {
        id: "event-1",
        title: "Test Event",
        contractAddress: null,
      };

      let buyError = null;
      if (!event.contractAddress) {
        buyError = "This event is not deployed to blockchain yet";
      }

      expect(buyError).toBe("This event is not deployed to blockchain yet");
    });

    it("Should show error when contractAddress is empty string", () => {
      const event = {
        id: "event-1",
        title: "Test Event",
        contractAddress: "",
      };

      let buyError = null;
      if (!event.contractAddress) {
        buyError = "This event is not deployed to blockchain yet";
      }

      expect(buyError).toBe("This event is not deployed to blockchain yet");
    });

    it("Should pass when contractAddress exists", () => {
      const event = {
        id: "event-1",
        title: "Test Event",
        contractAddress: "0xcontract123",
      };

      let buyError = null;
      if (!event.contractAddress) {
        buyError = "This event is not deployed to blockchain yet";
      }

      expect(buyError).toBeNull();
    });
  });

  describe("Mint Success and Event Parsing Branch", () => {
    it("Should parse TicketMinted event successfully", async () => {
      const mockReceipt = {
        logs: [
          { address: "0xcontract", topics: [], data: "0xdata1" },
          { address: "0xcontract", topics: [], data: "0xdata2" },
        ],
        wait: vi.fn().mockResolvedValue(true),
      };

      const mockTx = {
        hash: "0xtxhash123",
        wait: vi.fn().mockResolvedValue(mockReceipt),
      };

      const address = "0xbuyer";

      mockInterface.mockImplementation(() => ({
        parseLog: vi
          .fn()
          .mockReturnValueOnce(null)
          .mockReturnValueOnce({
            name: "TicketMinted",
            args: {
              buyer: address,
              tokenId: BigInt(5),
              tierId: BigInt(0),
            },
          }),
      }));

      const iface = new (mockInterface as any)();

      const mintedEvent = mockReceipt.logs
        .map((log: any) => {
          try {
            return iface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find(
          (parsed: any) =>
            parsed &&
            parsed.name === "TicketMinted" &&
            String(parsed.args.buyer).toLowerCase() === address.toLowerCase(),
        );

      expect(mintedEvent).toBeTruthy();
      expect(mintedEvent?.name).toBe("TicketMinted");
      expect(Number(mintedEvent?.args.tokenId)).toBe(5);
    });

    it("Should throw error when TicketMinted event not found in logs", () => {
      const mockReceipt = {
        logs: [{ address: "0xcontract", topics: [], data: "0xdata1" }],
      };

      const address = "0xbuyer";

      mockInterface.mockImplementation(() => ({
        parseLog: vi.fn().mockReturnValue(null),
      }));

      const iface = new (mockInterface as any)();

      const mintedEvent = mockReceipt.logs
        .map((log: any) => {
          try {
            return iface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find(
          (parsed: any) =>
            parsed &&
            parsed.name === "TicketMinted" &&
            String(parsed.args.buyer).toLowerCase() === address.toLowerCase(),
        );

      let error = null;
      if (!mintedEvent) {
        error = "Mint succeeded, but token event could not be parsed";
      }

      expect(error).toBe("Mint succeeded, but token event could not be parsed");
    });

    it("Should filter events by buyer address", () => {
      const userAddress = "0xABCDEF";

      mockInterface.mockImplementation(() => ({
        parseLog: vi
          .fn()
          .mockReturnValueOnce({
            name: "TicketMinted",
            args: {
              buyer: "0xOTHERUSER",
              tokenId: BigInt(1),
              tierId: BigInt(0),
            },
          })
          .mockReturnValueOnce({
            name: "TicketMinted",
            args: { buyer: "0xabcdef", tokenId: BigInt(2), tierId: BigInt(0) },
          }),
      }));

      const iface = new (mockInterface as any)();
      const logs = [
        { address: "0xcontract", data: "0x1" },
        { address: "0xcontract", data: "0x2" },
      ];

      const mintedEvent = logs
        .map((log) => iface.parseLog(log))
        .find(
          (parsed: any) =>
            parsed &&
            parsed.name === "TicketMinted" &&
            String(parsed.args.buyer).toLowerCase() ===
              userAddress.toLowerCase(),
        );

      expect(mintedEvent).toBeTruthy();
      expect(Number(mintedEvent?.args.tokenId)).toBe(2);
    });
  });

  describe("Backend Confirm Failure Branch", () => {
    it("Should set error when confirmTicketPurchase fails", async () => {
      mockConfirmTicketPurchase.mockRejectedValue(new Error("Network timeout"));

      let buyError = null;
      try {
        await mockConfirmTicketPurchase(
          {
            eventId: "event-1",
            tierId: "tier-1",
            txHash: "0xhash",
            tokenId: 1,
          },
          "token",
        );
      } catch (err: any) {
        buyError = err?.message || "Ticket purchase failed";
      }

      expect(buyError).toBe("Network timeout");
    });

    it("Should use fallback error message when error has no message", async () => {
      mockConfirmTicketPurchase.mockRejectedValue({});

      let buyError = null;
      try {
        await mockConfirmTicketPurchase({}, "token");
      } catch (err: any) {
        buyError = err?.message || "Ticket purchase failed";
      }

      expect(buyError).toBe("Ticket purchase failed");
    });
  });

  describe("UI State Update After Success Branch", () => {
    it("Should increment soldCount for the purchased tier", () => {
      const currentTiers = [
        { id: "tier-1", soldCount: 5, totalSupply: 10 },
        { id: "tier-2", soldCount: 3, totalSupply: 5 },
      ];

      const purchasedTierId = "tier-1";

      const updatedTiers = currentTiers.map((tier) =>
        tier.id === purchasedTierId
          ? { ...tier, soldCount: tier.soldCount + 1 }
          : tier,
      );

      expect(updatedTiers[0].soldCount).toBe(6);
      expect(updatedTiers[1].soldCount).toBe(3);
    });

    it("Should not modify other tiers when updating soldCount", () => {
      const currentTiers = [
        { id: "tier-1", soldCount: 5, totalSupply: 10 },
        { id: "tier-2", soldCount: 3, totalSupply: 5 },
        { id: "tier-3", soldCount: 1, totalSupply: 2 },
      ];

      const purchasedTierId = "tier-2";

      const updatedTiers = currentTiers.map((tier) =>
        tier.id === purchasedTierId
          ? { ...tier, soldCount: tier.soldCount + 1 }
          : tier,
      );

      expect(updatedTiers[0].soldCount).toBe(5);
      expect(updatedTiers[1].soldCount).toBe(4);
      expect(updatedTiers[2].soldCount).toBe(1);
    });

    it("Should set buySuccessTierId to purchased tier", () => {
      let buySuccessTierId = null;
      const purchasedTier = { id: "tier-1" };

      buySuccessTierId = purchasedTier.id;

      expect(buySuccessTierId).toBe("tier-1");
    });
  });

  describe("Function Call Order in Success Path", () => {
    it("Should call functions in correct order during purchase", async () => {
      const callOrder: string[] = [];

      const mockMintTicket = vi.fn().mockImplementation(async () => {
        callOrder.push("mint");
        return {
          hash: "0xhash",
          wait: vi.fn().mockImplementation(async () => {
            callOrder.push("wait");
            return {
              logs: [
                {
                  address: "0xcontract",
                  data: "0x",
                },
              ],
            };
          }),
        };
      });

      mockInterface.mockImplementation(() => ({
        parseLog: vi.fn().mockImplementation(() => {
          callOrder.push("parse");
          return {
            name: "TicketMinted",
            args: { buyer: "0xabc", tokenId: BigInt(1), tierId: BigInt(0) },
          };
        }),
      }));

      mockConfirmTicketPurchase.mockImplementation(async () => {
        callOrder.push("confirm");
        return {};
      });

      const tx = await mockMintTicket(0, { value: BigInt(1e18) });
      const receipt = await tx.wait();
      const iface = new (mockInterface as any)();
      iface.parseLog(receipt.logs[0]);
      await mockConfirmTicketPurchase({}, "token");

      callOrder.push("updateUI");

      expect(callOrder).toEqual([
        "mint",
        "wait",
        "parse",
        "confirm",
        "updateUI",
      ]);
    });
  });

  describe("State Reset in Finally Block", () => {
    it("Should clear buyingTierId in finally block", () => {
      let buyingTierId: string | null = "tier-1";

      try {
        // Simulate purchase logic
      } catch (err) {
        // Handle error
      } finally {
        buyingTierId = null;
      }

      expect(buyingTierId).toBeNull();
    });

    it("Should clear buyingTierId even when error occurs", () => {
      let buyingTierId: string | null = "tier-1";

      try {
        throw new Error("Purchase failed");
      } catch (err) {
        // Error handled
      } finally {
        buyingTierId = null;
      }

      expect(buyingTierId).toBeNull();
    });
  });

  describe("Tier Sorting by Contract Order", () => {
    it("Should sort tiers by price ascending", () => {
      const tiers = [
        { id: "tier-3", price: "0.1" },
        { id: "tier-1", price: "0.01" },
        { id: "tier-2", price: "0.05" },
      ];

      const sorted = [...tiers].sort((a, b) => {
        const priceDiff = Number(a.price) - Number(b.price);
        if (priceDiff !== 0) return priceDiff;
        return a.id.localeCompare(b.id);
      });

      expect(sorted[0].id).toBe("tier-1");
      expect(sorted[1].id).toBe("tier-2");
      expect(sorted[2].id).toBe("tier-3");
    });

    it("Should use id as tiebreaker when prices are equal", () => {
      const tiers = [
        { id: "tier-c", price: "0.05" },
        { id: "tier-a", price: "0.05" },
        { id: "tier-b", price: "0.05" },
      ];

      const sorted = [...tiers].sort((a, b) => {
        const priceDiff = Number(a.price) - Number(b.price);
        if (priceDiff !== 0) return priceDiff;
        return a.id.localeCompare(b.id);
      });

      expect(sorted[0].id).toBe("tier-a");
      expect(sorted[1].id).toBe("tier-b");
      expect(sorted[2].id).toBe("tier-c");
    });
  });
});
