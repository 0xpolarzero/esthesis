const { ethers, network } = require('hardhat');
const fs = require('fs');

const frontEndContractsFile =
  '../frontend/src/data/constants/networkMapping.json';
const frontEndAbiFolder = '../frontend/src/data/constants/';

module.exports = async () => {
  if (process.env.UPDATE_FRONT_END) {
    console.log('Updating front end...');
    const chainId = network.config.chainId;
    await updateContractAddresses(chainId);
    await updateAbi(chainId);
  }
};

async function updateContractAddresses(chainId) {
  const contractAddresses = JSON.parse(
    fs.readFileSync(frontEndContractsFile, 'utf8'),
  );

  const visualize = await ethers.getContract('Visualize');

  if (chainId in contractAddresses) {
    if (!contractAddresses[chainId]['Visualize'].includes(visualize.address))
      contractAddresses[chainId]['Visualize'].push(visualize.address);
  } else {
    contractAddresses[chainId] = {
      Visualize: [visualize.address],
    };
  }

  fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses));

  console.log('Front end updated!');
}

async function updateAbi(chainId) {
  const visualize = await ethers.getContract('Visualize');
  fs.writeFileSync(
    `${frontEndAbiFolder}Visualize.json`,
    visualize.interface.format(ethers.utils.FormatTypes.json),
  );
}

module.exports.tags = ['all', 'frontend'];
