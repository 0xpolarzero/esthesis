const { deployments, network, ethers } = require('hardhat');
const { assert, expect } = require('chai');
const { developmentChains, FORWARDER } = require('../../helper-hardhat-config');

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('Esthesis unit tests', function () {
      let deployer;
      let forwarder;
      let user;
      let esthesisDeployer;
      let esthesisForwarder;
      let esthesisUser;

      beforeEach(async () => {
        [deployer, forwarder, user] = await ethers.getSigners();
        await deployments.fixture(['main']);
        esthesisDeployer = await ethers.getContract('Esthesis', deployer);
        esthesisForwarder = await ethers.getContract('Esthesis', forwarder);
        esthesisUser = await ethers.getContract('Esthesis', user);
      });

      /**
       * @notice Constructor
       */
      describe('constructor', function () {
        it('Should initialize the variables with the right value', async () => {
          assert.equal(await esthesisDeployer.getOwner(), deployer.address);
          assert.equal(
            await esthesisDeployer.getForwarder(),
            FORWARDER[network.name],
          );
        });
      });

      /**
       * @notice Favorites
       */

      describe('addFavorite', function () {
        // it('Should revert if already a favorite', async () => {
        //   await esthesisUser.addFavorite('0x1234', user.address);
        //   assert.sameMembers(await esthesisUser.getFavorites(user.address), [
        //     '0x1234',
        //   ]);

        //   await expect(
        //     esthesisUser.addFavorite('0x1234', user.address),
        //   ).to.be.revertedWith('ESTHESIS__ALREADY_FAVORITE');
        // });

        it('Should successfully add a favorite and emit the correct event', async () => {
          await expect(await esthesisUser.addFavorite('0x1234', user.address))
            .to.emit(esthesisUser, 'ESTHESIS__FAVORITE_ADDED')
            .withArgs(user.address, '0x1234');

          assert.sameMembers(await esthesisUser.getFavorites(user.address), [
            '0x1234',
          ]);
        });

        it('Should set the correct address when called or not by the forwarder', async () => {
          await esthesisForwarder.addFavorite('0x1234', user.address);
          assert.sameMembers(
            await esthesisForwarder.getFavorites(user.address),
            ['0x1234'],
          );

          await esthesisUser.addFavorite('0x5678', deployer.address);
          // Should not be able to set an arbitrary address
          assert.sameMembers(await esthesisUser.getFavorites(user.address), [
            '0x1234',
            '0x5678',
          ]);
          assert.sameMembers(
            await esthesisUser.getFavorites(deployer.address),
            [],
          );
        });
      });
      describe('removeFavorite', function () {
        it('Should revert if not a favorite', async () => {
          await expect(
            esthesisUser.removeFavorite('0x1234', user.address),
          ).to.be.revertedWith('ESTHESIS__NOT_FAVORITE');
        });

        it('Should successfully remove a favorite and emit the correct event', async () => {
          await esthesisUser.addFavorite('0x1234', user.address);
          assert.sameMembers(await esthesisUser.getFavorites(user.address), [
            '0x1234',
          ]);

          await expect(
            await esthesisUser.removeFavorite('0x1234', user.address),
          )
            .to.emit(esthesisUser, 'ESTHESIS__FAVORITE_REMOVED')
            .withArgs(user.address, '0x1234');
          assert.sameMembers(await esthesisUser.getFavorites(user.address), []);
        });

        it('Should work using the forwarder and not allow to remove a favorite from another address', async () => {
          await esthesisForwarder.addFavorite('0x1234', user.address);
          await esthesisForwarder.addFavorite('0x5678', user.address);
          assert.sameMembers(
            await esthesisForwarder.getFavorites(user.address),
            ['0x1234', '0x5678'],
          );

          await esthesisForwarder.removeFavorite('0x1234', user.address);
          assert.sameMembers(
            await esthesisForwarder.getFavorites(user.address),
            ['0x5678'],
          );

          await expect(
            esthesisDeployer.removeFavorite('0x1234', user.address),
          ).to.be.revertedWith('ESTHESIS__NOT_FAVORITE');
        });
      });

      /**
       * @notice URLs
       */

      describe('shortenURL', function () {
        it('Should successfully shorten a URL, return the correct id and emit the correct event', async () => {
          const properties = `test_properties`;
          const expectedId = 0;

          await expect(await esthesisUser.shortenURL(properties, user.address))
            .to.emit(esthesisUser, 'ESTHESIS__URL_SHORTENED')
            .withArgs(expectedId, properties, user.address);

          const returned = await esthesisUser.getShortenedURL(expectedId);
          assert.equal(returned.id.toString(), expectedId);
          assert.equal(returned.properties, properties);
          assert.equal(returned.sender, user.address);
        });

        it('Should set the correct address when called or not by the forwarder', async () => {
          const properties = `test_properties`;
          const expectedIds = [0, 1];

          await esthesisForwarder.shortenURL(properties, user.address);
          await esthesisUser.shortenURL(properties, deployer.address);

          const returned = await esthesisForwarder.getShortenedURLs();

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
            esthesisUser.updateForwarder(user.address),
          ).to.be.revertedWith('ESTHESIS__NOT_OWNER');
        });

        it('Should successfully update the trusted forwarder', async () => {
          const newForwarder = user.address;
          await expect(await esthesisDeployer.updateForwarder(newForwarder))
            .to.emit(esthesisDeployer, 'ESTHESIS__FORWARDER_UPDATED')
            .withArgs(newForwarder);

          assert.equal(await esthesisDeployer.getForwarder(), newForwarder);
        });
      });
    });
