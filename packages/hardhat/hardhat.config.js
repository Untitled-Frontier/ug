const defaultAccounts = require("./scripts/wallet-utils.js");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-web3");
require("hardhat-gas-reporter");
require("@nomiclabs/hardhat-etherscan");

let infuraID = process.env.REACT_APP_INFURA_ID; 
let CMC = process.env.CMC_KEY; // used for gas reporter

const deployAccounts = defaultAccounts();

module.exports = {
  defaultNetwork: 'localhost',
  networks: {
    localhost: {
      url: 'http://localhost:8545',
      blockGasLimit: 10000000000
    },
    hardhat: {
      accounts: defaultAccounts(),
      blockGasLimit: 50000000
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${infuraID}`,
      accounts: [deployAccounts[0].privateKey],
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${infuraID}`,
      accounts: [deployAccounts[0].privateKey],
    }
  },
  etherscan: {
    apiKey: ''
  },
  solidity: {
    version : "0.8.12",
  },
  gasReporter: {
    currency: 'USD',
    gasPrice: 34,
    coinmarketcap: CMC,
    enabled: true
  },
  mocha: {
    timeout: 100000000
  }
}