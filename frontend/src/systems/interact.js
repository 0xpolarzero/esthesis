import { ethers } from 'ethers';
import config from '@/data';

const { networkMapping, eclipseAbi, chainId } = config;
const eclipseAddress = networkMapping[chainId]['Visualize'][0];
const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY;
const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

const getClient = async () => {
  // Create a provider with the private key and rpc url to interact with the contract
  const provider = new ethers.providers.AlchemyProvider(chainId, apiKey, {
    name: 'mumbai',
    chainId: 80001,
  });
  const wallet = new ethers.Wallet(privateKey, provider);
  const client = new ethers.Contract(eclipseAddress, eclipseAbi, wallet);

  return client;
};

const sendTx = async (selector, args) => {
  try {
    const client = await getClient();
    const tx = await client[selector](...args, {
      gasLimit: 1000000,
    });
    const receipt = await tx.wait(1);

    if (receipt.status === 1) {
      return { data: tx, success: true, error: null };
    } else {
      return { data: tx, success: false, error: 'Transaction failed' };
    }
  } catch (err) {
    return { data: null, success: false, error: err };
  }
};

export const getFavorites = async (userAddress) => {
  try {
    const client = await getClient();
    const favorites = await client.getFavorites(userAddress);
    return favorites;
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const addFavorite = async (userAddress, favoriteId) => {
  return await sendTx('addFavorite', [userAddress, favoriteId]);
};

export const removeFavorite = async (userAddress, favoriteId) => {
  return await sendTx('removeFavorite', [userAddress, favoriteId]);
};
