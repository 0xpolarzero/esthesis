const { deployments, network, ethers } = require('hardhat');
const { assert, expect } = require('chai');
const { developmentChains, FORWARDER } = require('../../helper-hardhat-config');

developmentChains.includes(network.name)
  ? describe.skip
  : describe('Esthesis staging tests', function () {
      let deployer;
      let forwarder;
      let user;
      let esthesisDeployer;
      let esthesisForwarder;
      let esthesisUser;

      let currentFavorites = [];

      before(async () => {
        [deployer, user] = await ethers.getSigners();
        forwarder = deployer;
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
        it('Should successfully add a favorite and emit the correct event', async () => {
          const newFavorite = '0x1234';
          // Add favorite
          //   const tx = await expect(
          //     await esthesisUser.addFavorite(newFavorite, user.address),
          //   )
          //     .to.emit(esthesisUser, 'ESTHESIS__FAVORITE_ADDED')
          //     .withArgs(user.address, newFavorite);
          //   await tx.wait(1);
          const tx = await esthesisUser.addFavorite(newFavorite, user.address);
          const txReceipt = await tx.wait(1);

          expect(txReceipt.events[0].event).to.equal(
            'ESTHESIS__FAVORITE_ADDED',
          );
          expect(txReceipt.events[0].args[0]).to.equal(user.address);
          expect(txReceipt.events[0].args[1]).to.equal(newFavorite);

          // Check that the favorite was added
          assert.sameMembers(await esthesisUser.getFavorites(user.address), [
            newFavorite,
          ]);

          // Update current favorites
          currentFavorites.push(newFavorite);
        });

        it('Should set the correct address when called or not by the forwarder', async () => {
          const newFavorites = ['0x5678', '0x9012'];
          // Add favorite
          const tx = await esthesisForwarder.addFavorite(
            newFavorites[0],
            user.address,
          );
          await tx.wait(1);
          // Check that the favorite was added
          assert.sameMembers(
            await esthesisForwarder.getFavorites(user.address),
            [...currentFavorites, newFavorites[0]],
          );

          // Add another favorite
          const tx2 = await esthesisUser.addFavorite(
            newFavorites[1],
            deployer.address,
          );
          await tx2.wait(1);

          // Should not be able to set an arbitrary address
          // Check that the favorites were added to the correct address
          assert.sameMembers(await esthesisUser.getFavorites(user.address), [
            ...currentFavorites,
            ...newFavorites,
          ]);
          assert.sameMembers(
            await esthesisUser.getFavorites(deployer.address),
            [],
          );

          // Update current favorites
          currentFavorites.push(...newFavorites);
        });
      });

      describe('removeFavorite', function () {
        it('Should revert if not a favorite', async () => {
          await expect(esthesisUser.removeFavorite('0x1111', user.address)).to
            .be.reverted;
        });

        it('Should successfully remove a favorite and emit the correct event', async () => {
          const favoriteToRemove = '0x1234';
          // Remove favorite
          //   const tx = await expect(
          //     await esthesisUser.removeFavorite('0x1234', user.address),
          //   )
          //     .to.emit(esthesisUser, 'ESTHESIS__FAVORITE_REMOVED')
          //     .withArgs(user.address, favoriteToRemove);
          //   await tx.wait(1);

          const tx = await esthesisUser.removeFavorite(
            favoriteToRemove,
            user.address,
          );
          const txReceipt = await tx.wait(1);

          expect(txReceipt.events[0].event).to.equal(
            'ESTHESIS__FAVORITE_REMOVED',
          );
          expect(txReceipt.events[0].args[0]).to.equal(user.address);
          expect(txReceipt.events[0].args[1]).to.equal(favoriteToRemove);

          // Check that the favorite was removed
          assert.sameMembers(
            await esthesisUser.getFavorites(user.address),
            currentFavorites.filter(
              (favorite) => favorite !== favoriteToRemove,
            ),
          );

          // Update current favorites
          currentFavorites = currentFavorites.filter(
            (favorite) => favorite !== favoriteToRemove,
          );
        });

        it('Should work using the forwarder and not allow to remove a favorite from another address', async () => {
          const favoriteToRemove = '0x5678';
          // Remove favorite
          const tx = await esthesisForwarder.removeFavorite(
            favoriteToRemove,
            user.address,
          );
          await tx.wait(1);

          // Check that the favorite was removed from the correct address
          assert.sameMembers(
            await esthesisForwarder.getFavorites(user.address),
            currentFavorites.filter(
              (favorite) => favorite !== favoriteToRemove,
            ),
          );
          await expect(
            esthesisDeployer.removeFavorite(currentFavorites[0], user.address),
          ).to.be.reverted;
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
          const tx = await esthesisUser.shortenURL(
            properties,
            deployer.address,
          );
          await tx.wait(1);

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
          await expect(esthesisUser.updateForwarder(user.address)).to.be
            .reverted;
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
