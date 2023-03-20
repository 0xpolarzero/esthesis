const { deployments, network, ethers } = require('hardhat');
const { assert, expect } = require('chai');
const {
  developmentChains,
  TRUSTED_FORWARDER_POLYGON_MUMBAI,
  BASE_DOMAIN,
} = require('../../helper-hardhat-config');

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('Eclipse unit tests', function () {
      let deployer;
      let user;
      let eclipseDeployer;
      let eclipseUser;

      beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        user = accounts[1];
        await deployments.fixture(['main']);
        eclipseDeployer = await ethers.getContract('Eclipse', deployer);
        eclipseUser = await ethers.getContract('Eclipse', user);
      });

      /**
       * @notice Constructor
       */
      describe('constructor', function () {
        it('Should initialize the variables with the right value', async () => {
          assert.equal(await eclipseDeployer.getOwner(), deployer.address);
          assert.equal(
            await eclipseDeployer.getTrustedForwarder(),
            TRUSTED_FORWARDER_POLYGON_MUMBAI,
          );
          assert.equal(await eclipseDeployer.getBaseURL(), BASE_DOMAIN);
        });
      });

      /**
       * @notice Favorites
       */

      describe('addFavorite', function () {
        it('Should revert if already a favorite', async () => {
          await eclipseUser.addFavorite(user.address, '0x1234');
          assert.sameMembers(await eclipseUser.getFavorites(user.address), [
            '0x1234',
          ]);

          await expect(
            eclipseUser.addFavorite(user.address, '0x1234'),
          ).to.be.revertedWith('ECLIPSE__ALREADY_FAVORITE');
        });

        it('Should successfully add a favorite', async () => {
          await expect(await eclipseUser.addFavorite(user.address, '0x1234'))
            .to.emit(eclipseUser, 'ECLIPSE__FAVORITE_ADDED')
            .withArgs(user.address, '0x1234');

          assert.sameMembers(await eclipseUser.getFavorites(user.address), [
            '0x1234',
          ]);

          // better would be
        });
      });
      describe('removeFavorite', function () {
        it('Should revert if not a favorite', async () => {
          await expect(
            eclipseUser.removeFavorite(user.address, '0x1234'),
          ).to.be.revertedWith('ECLIPSE__NOT_FAVORITE');
        });

        it('Should successfully remove a favorite', async () => {
          await eclipseUser.addFavorite(user.address, '0x1234');
          assert.sameMembers(await eclipseUser.getFavorites(user.address), [
            '0x1234',
          ]);

          await expect(await eclipseUser.removeFavorite(user.address, '0x1234'))
            .to.emit(eclipseUser, 'ECLIPSE__FAVORITE_REMOVED')
            .withArgs(user.address, '0x1234');
          assert.sameMembers(await eclipseUser.getFavorites(user.address), []);
        });
      });

      /**
       * @notice URLs
       */

      describe('shortenURL', function () {
        it('Should revert if not starting with the base domain', async () => {
          const invalidURL = 'https://' + 'a'.repeat(BASE_DOMAIN.length - 8);
          await expect(eclipseUser.shortenURL(invalidURL)).to.be.revertedWith(
            'ECLIPSE__INVALID_URL',
          );
        });

        it('Should successfully shorten a URL and return the correct id', async () => {
          const url = `${BASE_DOMAIN}test`;
          const expectedId = 0;

          await expect(await eclipseUser.shortenURL(url))
            .to.emit(eclipseUser, 'ECLIPSE__URL_SHORTENED')
            .withArgs(expectedId, url, user.address);

          assert.equal(await eclipseUser.getShortenedURL(expectedId), url);
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
            eclipseUser.updateTrustedForwarder(user.address),
          ).to.be.revertedWith('ECLIPSE__NOT_OWNER');
        });

        it('Should successfully update the trusted forwarder', async () => {
          const newForwarder = user.address;
          await expect(
            await eclipseDeployer.updateTrustedForwarder(newForwarder),
          )
            .to.emit(
              eclipseDeployer,
              'ERC2771Context__TRUSTED_FORWARDER_UPDATED',
            )
            .withArgs(newForwarder);

          assert.equal(
            await eclipseDeployer.getTrustedForwarder(),
            newForwarder,
          );
        });
      });

      describe('updateBaseURL', function () {
        it('Should revert if not owner', async () => {
          await expect(
            eclipseUser.updateBaseURL(user.address),
          ).to.be.revertedWith('ECLIPSE__NOT_OWNER');
        });

        it('Should successfully update the base URL', async () => {
          const newBaseURL = 'https://test.com/';
          await expect(await eclipseDeployer.updateBaseURL(newBaseURL))
            .to.emit(eclipseDeployer, 'ECLIPSE__BASE_URL_UPDATED')
            .withArgs(newBaseURL);

          assert.equal(await eclipseDeployer.getBaseURL(), newBaseURL);
        });
      });
    });
