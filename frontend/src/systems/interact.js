import { ethers } from 'ethers';
import {
  prepareWriteContract,
  writeContract,
  watchContractEvent,
} from '@wagmi/core';
import config from '@/data';

const { networkMapping, eclipseAbi, chainId } = config;
const eclipseAddress = networkMapping[chainId]['Eclipse'][0];
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

const sendTxSponsored = async (selector, args) => {
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
    console.error(err);
    return { data: null, success: false, error: err };
  }
};

const sendTxRegular = async (selector, args) => {
  try {
    const config = await prepareWriteContract({
      address: eclipseAddress,
      abi: eclipseAbi,
      functionName: selector,
      args,
    });
    const tx = await writeContract(config);
    const data = await tx.wait(1);

    if (data.status === 1) {
      return { data, success: true, error: null };
    } else {
      return { data, success: false, error: 'Transaction failed' };
    }
  } catch (err) {
    console.error(err);
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

export const getShortenedUrl = async (id) => {
  try {
    const client = await getClient();
    const shortened = await client.getShortenedURL(id);
    return shortened.url;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getAllShortenedUrls = async () => {
  try {
    const client = await getClient();
    const shortened = await client.getShortenedURLs();
    return shortened;
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const addFavorite = async (userAddress, favoriteId, allowlisted) => {
  return allowlisted
    ? await sendTxSponsored('addFavorite', [userAddress, favoriteId])
    : await sendTxRegular('addFavorite', [userAddress, favoriteId]);
};

export const removeFavorite = async (userAddress, favoriteId, allowlisted) => {
  return allowlisted
    ? await sendTxSponsored('removeFavorite', [userAddress, favoriteId])
    : await sendTxRegular('removeFavorite', [userAddress, favoriteId]);
};

export const shortenUrl = async (url, allowlisted) => {
  const event = new Promise((resolve, reject) => {
    // Set up a listener for the event
    const unwatch = watchContractEvent(
      {
        address: eclipseAddress,
        abi: eclipseAbi,
        eventName: 'ECLIPSE__URL_SHORTENED',
      },
      (id, urlEmitted) => {
        unwatch();
        if (urlEmitted === `${config.baseUrl}${url}`) {
          resolve({
            data: `${config.baseUrl}shared?id=${id.toString()}`,
            success: true,
            error: null,
          });
        }
      },
    );

    // Give 3 minutes for the event to fire
    setTimeout(() => {
      unwatch();
      reject({ data: null, success: false, error: 'Timeout' });
    }, 180000);
  });

  allowlisted
    ? await sendTxSponsored('shortenURL', [`${config.baseUrl}${url}`])
    : await sendTxRegular('shortenURL', [`${config.baseUrl}${url}`]);

  return event;
};
