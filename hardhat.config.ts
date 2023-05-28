import "@nomicfoundation/hardhat-toolbox";
import "hardhat-gas-reporter";

import { HardhatUserConfig } from "hardhat/config";
import dotenv from "dotenv";

dotenv.config();

const ALCHEMY_HTTPS = process.env.ALCHEMY_HTTPS;
const ALCHEMY_SEPOLIA_HTTPS = process.env.ALCHEMY_SEPOLIA_HTTPS;
const GANACHE_RPC = process.env.GANACHE_RPC;
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const GANACHE_WALLET_PRIVATE_KEY = process.env.GANACHE_WALLET_PRIVATE_KEY;
const CMC_API_KEY = process.env.CMC_API_KEY;
const REPORT_GAS = process.env.REPORT_GAS;

if (
  !ALCHEMY_HTTPS ||
  !ALCHEMY_SEPOLIA_HTTPS ||
  !GANACHE_RPC ||
  !WALLET_PRIVATE_KEY ||
  !GANACHE_WALLET_PRIVATE_KEY ||
  !ETHERSCAN_API_KEY ||
  !CMC_API_KEY ||
  !REPORT_GAS
) {
  throw new Error(
    "Missing ALCHEMY_HTTPS, ALCHEMY_SEPOLIA_HTTPS, GANACHE_RPC, WALLET_PRIVATE_KEY, GANACHE_WALLET_PRIVATE_KEY, ETHERSCAN_API_KEY, CMC_API_KEY or REPORT_GAS environment "
  );
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        // Toggles whether the optimizer is on or off.
        // It's good to keep it off for development
        // and turn on for when getting ready to launch.
        enabled: true,
        // The number of runs specifies roughly how often
        // the deployed code will be executed across the
        // life-time of the contract.
        runs: 300,
      },
    },
  },
  networks: {
    goerli: {
      url: ALCHEMY_HTTPS,
      accounts: [WALLET_PRIVATE_KEY!],
    },
    sepolia: {
      url: ALCHEMY_SEPOLIA_HTTPS,
      accounts: [WALLET_PRIVATE_KEY],
    },
    ganache: {
      url: GANACHE_RPC,
      accounts: [GANACHE_WALLET_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: REPORT_GAS === "true" ? true : false,
    currency: "USD",
    noColors: true,
    coinmarketcap: CMC_API_KEY || "",
    token: "ETH",
  },
};

export default config;
