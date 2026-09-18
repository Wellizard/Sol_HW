require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    version: "0.8.24", // Має збігатися з версією у Voting.sol
    settings: { evmVersion: "paris" }
  },
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
      chainId: 1337
    }
  }
};