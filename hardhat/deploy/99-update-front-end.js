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

  const eclipse = await ethers.getContract('Eclipse');

  if (chainId in contractAddresses) {
    if (!contractAddresses[chainId]['Eclipse'].includes(eclipse.address))
      contractAddresses[chainId]['Eclipse'].push(eclipse.address);
  } else {
    contractAddresses[chainId] = {
      Eclipse: [eclipse.address],
    };
  }

  fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses));

  console.log('Front end updated!');
}

async function updateAbi(chainId) {
  const eclipse = await ethers.getContract('Eclipse');
  fs.writeFileSync(
    `${frontEndAbiFolder}Eclipse.json`,
    eclipse.interface.format(ethers.utils.FormatTypes.json),
  );
}

module.exports.tags = ['all', 'frontend'];
