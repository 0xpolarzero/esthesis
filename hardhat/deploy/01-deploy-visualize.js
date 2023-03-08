const { network, ethers } = require('hardhat');
const { developmentChains } = require('../helper-hardhat-config');
const { verify } = require('../utils/verify');

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const args = [];

  const visualize = await deploy('Visualize', {
    from: deployer,
    args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ARBISCAN_API_KEY
  ) {
    console.log('Verifying contract...');
    await verify(visualize.address, args);
  }
};

module.exports.tags = ['all', 'mainnet', 'main'];
