require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-etherscan');
require('hardhat-deploy');
require('solidity-coverage');
require('hardhat-gas-reporter');
require('hardhat-contract-sizer');
require('dotenv').config();

const ARBITRUM_RPC_URL = process.env.ARBITRUM_RPC_URL || '';
const ARBITRUM_GOERLI_RPC_URL = process.env.ARBITRUM_GOERLI_RPC_URL || '';
const TEST_PRIVATE_KEY = process.env.TEST_PRIVATE_KEY;
const TEST_PRIVATE_KEY_SECOND = process.env.TEST_PRIVATE_KEY_SECOND;
const PROD_PRIVATE_KEY = process.env.PROD_PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const ARBISCAN_API_KEY = process.env.ARBISCAN_API_KEY;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: '0.8.16',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1_000,
          },
        },
      },
    ],
  },
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: 31337,
      blockConfirmations: 1,
    },
    localhost: {
      url: 'http://127.0.0.1:8545/',
      chainId: 31337,
    },
    arbitrum: {
      url: ARBITRUM_RPC_URL,
      accounts: [PROD_PRIVATE_KEY],
      chainId: 42161,
      blockConfirmations: 5,
    },
    arbitrumGoerli: {
      url: ARBITRUM_GOERLI_RPC_URL,
      accounts: [TEST_PRIVATE_KEY, TEST_PRIVATE_KEY_SECOND],
      chainId: 421613,
      blockConfirmations: 5,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    user: {
      default: 1,
    },
  },
  etherscan: {
    apiKey: {
      arbitrum: ARBISCAN_API_KEY,
      arbitrumGoerli: ARBISCAN_API_KEY,
    },
    customChains: [
      {
        network: 'arbitrum',
        chainId: 42161,
        urls: {
          apiURL: 'https://api.arbiscan.io/api',
          browserURL: 'https://arbiscan.io/',
        },
      },
      {
        network: 'arbitrumGoerli',
        chainId: 421613,
        urls: {
          apiURL: 'https://api-goerli.arbiscan.io/api',
          browserURL: 'https://goerli.arbiscan.io/',
        },
      },
    ],
  },
  gasReporter: {
    enabled: true,
    outputFile: 'gas-report.txt',
    noColors: true,
    currency: 'USD',
    coinmarketcap: COINMARKETCAP_API_KEY,
  },
  mocha: {
    timeout: 300000,
  },
};
