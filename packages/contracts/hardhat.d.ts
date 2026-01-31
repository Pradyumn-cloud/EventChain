import "hardhat/types/runtime";
import { ethers } from "ethers";
import { HardhatEthersHelpers } from "@nomicfoundation/hardhat-ethers/types";

declare module "hardhat/types/runtime" {
  interface HardhatRuntimeEnvironment {
    ethers: typeof ethers & HardhatEthersHelpers;
  }
}

// Re-export ethers from hardhat for scripts/tests
declare module "hardhat" {
  export const ethers: typeof import("ethers") & HardhatEthersHelpers;
}
