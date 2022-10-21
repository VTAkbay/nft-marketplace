import "@nomicfoundation/hardhat-toolbox";
import "hardhat-abi-exporter";

import { HardhatUserConfig } from "hardhat/config";
import dotenv from "dotenv";

dotenv.config();

const ALCHEMY_HTTPS = process.env.ALCHEMY_HTTPS;
const GANACHE_RPC = process.env.GANACHE_RPC;
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const GANACHE_WALLET_PRIVATE_KEY = process.env.GANACHE_WALLET_PRIVATE_KEY;

if (
  !ALCHEMY_HTTPS ||
  !GANACHE_RPC ||
  !WALLET_PRIVATE_KEY ||
  !GANACHE_WALLET_PRIVATE_KEY ||
  !ETHERSCAN_API_KEY
) {
  throw new Error(
    "Missing ALCHEMY_HTTPS, GANACHE_RPC, WALLET_PRIVATE_KEY, GANACHE_WALLET_PRIVATE_KEY or ETHERSCAN_API_KEY environment "
  );
}

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    goerli: {
      url: ALCHEMY_HTTPS,
      accounts: [WALLET_PRIVATE_KEY!],
    },
    ganache: {
      url: GANACHE_RPC,
      accounts: [GANACHE_WALLET_PRIVATE_KEY],
    },
  },
  abiExporter: {
    path: "frontend/src/abi",
  },
};

export default config;
