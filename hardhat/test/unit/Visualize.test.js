const { deployments, network, ethers } = require('hardhat');
const { assert, expect } = require('chai');
const { developmentChains } = require('../../helper-hardhat-config');

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('Visualize unit tests', function () {
      let deployer;
      let user;
      let visualizeDeployer;
      let visualizeUser;

      beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        user = accounts[1];
        await deployments.fixture(['main']);
        visualizeDeployer = await ethers.getContract('Visualize', deployer);
        visualizeUser = await ethers.getContract('Visualize', user);
      });

      /**
       * @notice Constructor
       */
      describe('constructor', function () {
        it('Should initialize the variables with the right value', async () => {
          //
        });
      });
    });
