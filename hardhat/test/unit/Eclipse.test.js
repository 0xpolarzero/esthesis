const { deployments, network, ethers } = require('hardhat');
const { assert, expect } = require('chai');
const { developmentChains, FORWARDER } = require('../../helper-hardhat-config');

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('Eclipse unit tests', function () {
      let deployer;
      let forwarder;
      let user;
      let eclipseDeployer;
      let eclipseForwarder;
      let eclipseUser;

      beforeEach(async () => {
        [deployer, forwarder, user] = await ethers.getSigners();
        await deployments.fixture(['main']);
        eclipseDeployer = await ethers.getContract('Eclipse', deployer);
        eclipseForwarder = await ethers.getContract('Eclipse', forwarder);
        eclipseUser = await ethers.getContract('Eclipse', user);
      });

      /**
       * @notice Constructor
       */
      describe('constructor', function () {
        it('Should initialize the variables with the right value', async () => {
          assert.equal(await eclipseDeployer.getOwner(), deployer.address);
          assert.equal(
            await eclipseDeployer.getForwarder(),
            FORWARDER[network.name],
          );
        });
      });

      /**
       * @notice Favorites
       */

      describe('addFavorite', function () {
        it('Should revert if already a favorite', async () => {
          await eclipseUser.addFavorite('0x1234', user.address);
          assert.sameMembers(await eclipseUser.getFavorites(user.address), [
            '0x1234',
          ]);

          await expect(
            eclipseUser.addFavorite('0x1234', user.address),
          ).to.be.revertedWith('ECLIPSE__ALREADY_FAVORITE');
        });

        it('Should successfully add a favorite and emit the correct event', async () => {
          await expect(await eclipseUser.addFavorite('0x1234', user.address))
            .to.emit(eclipseUser, 'ECLIPSE__FAVORITE_ADDED')
            .withArgs(user.address, '0x1234');

          assert.sameMembers(await eclipseUser.getFavorites(user.address), [
            '0x1234',
          ]);
        });

        it('Should set the correct address when called or not by the forwarder', async () => {
          await eclipseForwarder.addFavorite('0x1234', user.address);
          assert.sameMembers(
            await eclipseForwarder.getFavorites(user.address),
            ['0x1234'],
          );

          await eclipseUser.addFavorite('0x5678', deployer.address);
          // Should not be able to set an arbitrary address
          assert.sameMembers(await eclipseUser.getFavorites(user.address), [
            '0x1234',
            '0x5678',
          ]);
          assert.sameMembers(
            await eclipseUser.getFavorites(deployer.address),
            [],
          );
        });
      });
      describe('removeFavorite', function () {
        it('Should revert if not a favorite', async () => {
          await expect(
            eclipseUser.removeFavorite('0x1234', user.address),
          ).to.be.revertedWith('ECLIPSE__NOT_FAVORITE');
        });

        it('Should successfully remove a favorite and emit the correct event', async () => {
          await eclipseUser.addFavorite('0x1234', user.address);
          assert.sameMembers(await eclipseUser.getFavorites(user.address), [
            '0x1234',
          ]);

          await expect(await eclipseUser.removeFavorite('0x1234', user.address))
            .to.emit(eclipseUser, 'ECLIPSE__FAVORITE_REMOVED')
            .withArgs(user.address, '0x1234');
          assert.sameMembers(await eclipseUser.getFavorites(user.address), []);
        });

        it('Should work using the forwarder and not allow to remove a favorite from another address', async () => {
          await eclipseForwarder.addFavorite('0x1234', user.address);
          await eclipseForwarder.addFavorite('0x5678', user.address);
          assert.sameMembers(
            await eclipseForwarder.getFavorites(user.address),
            ['0x1234', '0x5678'],
          );

          await eclipseForwarder.removeFavorite('0x1234', user.address);
          assert.sameMembers(
            await eclipseForwarder.getFavorites(user.address),
            ['0x5678'],
          );

          await expect(
            eclipseDeployer.removeFavorite('0x1234', user.address),
          ).to.be.revertedWith('ECLIPSE__NOT_FAVORITE');
        });
      });

      /**
       * @notice URLs
       */

      describe('shortenURL', function () {
        it('Should successfully shorten a URL, return the correct id and emit the correct event', async () => {
          const properties = `test_properties`;
          const expectedId = 0;

          await expect(await eclipseUser.shortenURL(properties, user.address))
            .to.emit(eclipseUser, 'ECLIPSE__URL_SHORTENED')
            .withArgs(expectedId, properties, user.address);

          const returned = await eclipseUser.getShortenedURL(expectedId);
          assert.equal(returned.id.toString(), expectedId);
          assert.equal(returned.properties, properties);
          assert.equal(returned.sender, user.address);
        });

        it('Should set the correct address when called or not by the forwarder', async () => {
          const properties = `test_properties`;
          const expectedIds = [0, 1];

          await eclipseForwarder.shortenURL(properties, user.address);
          await eclipseUser.shortenURL(properties, deployer.address);

          const returned = await eclipseForwarder.getShortenedURLs();

          assert.equal(returned[0].id.toString(), expectedIds[0]);
          assert.equal(returned[0].properties, properties);
          assert.equal(returned[0].sender, user.address);

          assert.equal(returned[1].id.toString(), expectedIds[1]);
          assert.equal(returned[1].properties, properties);
          assert.equal(returned[1].sender, user.address);
        });
      });

      /**
       * @notice Dev functions
       */
      describe('updateForwarder', function () {
        it('Should revert if not owner', async () => {
          await expect(
            eclipseUser.updateForwarder(user.address),
          ).to.be.revertedWith('ECLIPSE__NOT_OWNER');
        });

        it('Should successfully update the trusted forwarder', async () => {
          const newForwarder = user.address;
          await expect(await eclipseDeployer.updateForwarder(newForwarder))
            .to.emit(eclipseDeployer, 'ECLIPSE__FORWARDER_UPDATED')
            .withArgs(newForwarder);

          assert.equal(await eclipseDeployer.getForwarder(), newForwarder);
        });
      });
    });
