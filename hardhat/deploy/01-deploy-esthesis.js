const { network, ethers } = require('hardhat');
const { developmentChains, FORWARDER } = require('../helper-hardhat-config');
const { verify } = require('../utils/verify');

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const args = [FORWARDER[network.name]];

  const esthesis = await deploy('Esthesis', {
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
    await verify(esthesis.address, args);
  }
};

module.exports.tags = ['all', 'mainnet', 'main'];
