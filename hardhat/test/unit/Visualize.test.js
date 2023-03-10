const { deployments, network, ethers } = require('hardhat');
const { assert, expect } = require('chai');
const {
  developmentChains,
  TRUSTED_FORWARDER_POLYGON_MUMBAI,
  BASE_DOMAIN,
} = require('../../helper-hardhat-config');

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
          assert.equal(await visualizeDeployer.getOwner(), deployer.address);
          assert.equal(
            await visualizeDeployer.getTrustedForwarder(),
            TRUSTED_FORWARDER_POLYGON_MUMBAI,
          );
          assert.equal(await visualizeDeployer.getBaseURL(), BASE_DOMAIN);
        });
      });

      /**
       * @notice Favorites
       */

      describe('addFavorite', function () {
        it('Should revert if already a favorite', async () => {
          await visualizeUser.addFavorite(user.address, '0x1234');
          assert.sameMembers(await visualizeUser.getFavorites(user.address), [
            '0x1234',
          ]);

          await expect(
            visualizeUser.addFavorite(user.address, '0x1234'),
          ).to.be.revertedWith('VISUALIZE__ALREADY_FAVORITE');
        });

        it('Should successfully add a favorite', async () => {
          await expect(await visualizeUser.addFavorite(user.address, '0x1234'))
            .to.emit(visualizeUser, 'VISUALIZE__FAVORITE_ADDED')
            .withArgs(user.address, '0x1234');

          assert.sameMembers(await visualizeUser.getFavorites(user.address), [
            '0x1234',
          ]);

          // better would be
        });
      });
      describe('removeFavorite', function () {
        it('Should revert if not a favorite', async () => {
          await expect(
            visualizeUser.removeFavorite(user.address, '0x1234'),
          ).to.be.revertedWith('VISUALIZE__NOT_FAVORITE');
        });

        it('Should successfully remove a favorite', async () => {
          await visualizeUser.addFavorite(user.address, '0x1234');
          assert.sameMembers(await visualizeUser.getFavorites(user.address), [
            '0x1234',
          ]);

          await expect(
            await visualizeUser.removeFavorite(user.address, '0x1234'),
          )
            .to.emit(visualizeUser, 'VISUALIZE__FAVORITE_REMOVED')
            .withArgs(user.address, '0x1234');
          assert.sameMembers(
            await visualizeUser.getFavorites(user.address),
            [],
          );
        });
      });

      /**
       * @notice URLs
       */

      describe('shortenURL', function () {
        it('Should revert if not starting with the base domain', async () => {
          const invalidURL = 'https://' + 'a'.repeat(BASE_DOMAIN.length - 8);
          await expect(visualizeUser.shortenURL(invalidURL)).to.be.revertedWith(
            'VISUALIZE__INVALID_URL',
          );
        });

        it('Should successfully shorten a URL and return the correct id', async () => {
          const url = `${BASE_DOMAIN}test`;
          const expectedId = 0;

          await expect(await visualizeUser.shortenURL(url))
            .to.emit(visualizeUser, 'VISUALIZE__URL_SHORTENED')
            .withArgs(expectedId, url, user.address);

          assert.equal(await visualizeUser.getShortenedURL(expectedId), url);
        });
      });

      /**
       * @notice Dev functions
       */
      // updateTrustedForwarder
      // updateBaseURL
      describe('updateTrustedForwarder', function () {
        it('Should revert if not owner', async () => {
          await expect(
            visualizeUser.updateTrustedForwarder(user.address),
          ).to.be.revertedWith('VISUALIZE__NOT_OWNER');
        });

        it('Should successfully update the trusted forwarder', async () => {
          const newForwarder = user.address;
          await expect(
            await visualizeDeployer.updateTrustedForwarder(newForwarder),
          )
            .to.emit(
              visualizeDeployer,
              'ERC2771Context__TRUSTED_FORWARDER_UPDATED',
            )
            .withArgs(newForwarder);

          assert.equal(
            await visualizeDeployer.getTrustedForwarder(),
            newForwarder,
          );
        });
      });

      describe('updateBaseURL', function () {
        it('Should revert if not owner', async () => {
          await expect(
            visualizeUser.updateBaseURL(user.address),
          ).to.be.revertedWith('VISUALIZE__NOT_OWNER');
        });

        it('Should successfully update the base URL', async () => {
          const newBaseURL = 'https://test.com/';
          await expect(await visualizeDeployer.updateBaseURL(newBaseURL))
            .to.emit(visualizeDeployer, 'VISUALIZE__BASE_URL_UPDATED')
            .withArgs(newBaseURL);

          assert.equal(await visualizeDeployer.getBaseURL(), newBaseURL);
        });
      });
    });
