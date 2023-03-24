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

  const esthesis = await ethers.getContract('Esthesis');

  if (chainId in contractAddresses) {
    if (!contractAddresses[chainId]['Esthesis'].includes(esthesis.address))
      contractAddresses[chainId]['Esthesis'].push(esthesis.address);
  } else {
    contractAddresses[chainId] = {
      Esthesis: [esthesis.address],
    };
  }

  fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses));

  console.log('Front end updated!');
}

async function updateAbi(chainId) {
  const esthesis = await ethers.getContract('Esthesis');
  fs.writeFileSync(
    `${frontEndAbiFolder}Esthesis.json`,
    esthesis.interface.format(ethers.utils.FormatTypes.json),
  );
}

module.exports.tags = ['all', 'frontend'];
