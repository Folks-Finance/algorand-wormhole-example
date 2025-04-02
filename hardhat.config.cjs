require("@nomicfoundation/hardhat-foundry");
require("@nomicfoundation/hardhat-toolbox-viem");

/** @type {import('hardhat/config').HardhatUserConfig} */
const config = {
  solidity: "0.8.28",
  paths: {
    sources: "./evm/contracts",
    tests: "./evm/test",
    cache: "./evm/cache",
    artifacts: "./evm/artifacts",
  },
};

module.exports = config;
