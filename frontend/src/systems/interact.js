import { ethers } from 'ethers';
import {
  prepareWriteContract,
  writeContract,
  watchContractEvent,
  getNetwork,
} from '@wagmi/core';
import config from '@/data';

const { networkMapping, esthesisAbi } = config;
const esthesisAddress = (chainId) => networkMapping[chainId]['Eclipse'][0];
const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY;
const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

const getClient = async () => {
  const { chain } = getNetwork();
  // Create a provider with the private key and rpc url to interact with the contract
  const provider = new ethers.providers.AlchemyProvider(chain.id, apiKey);
  const wallet = new ethers.Wallet(privateKey, provider);
  const client = new ethers.Contract(
    esthesisAddress(chain.id),
    esthesisAbi,
    wallet,
  );

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
      return { data: tx, success: false, error: 'transaction failed' };
    }
  } catch (err) {
    console.error(err);
    return { data: null, success: false, error: err };
  }
};

const sendTxRegular = async (selector, args) => {
  const { chain } = getNetwork();

  try {
    const config = await prepareWriteContract({
      address: esthesisAddress(chain.id),
      abi: esthesisAbi,
      functionName: selector,
      args,
    });
    const tx = await writeContract(config);
    const data = await tx.wait(1);

    if (data.status === 1) {
      return { data, success: true, error: null };
    } else {
      return { data, success: false, error: 'transaction failed' };
    }
  } catch (err) {
    console.error(err);
    return {
      data: null,
      success: false,
      error: err.code === 4001 ? 'rejected transaction' : err,
    };
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
    return shortened.properties;
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
    ? await sendTxSponsored('addFavorite', [favoriteId, userAddress])
    : await sendTxRegular('addFavorite', [favoriteId, userAddress]);
};

export const removeFavorite = async (userAddress, favoriteId, allowlisted) => {
  return allowlisted
    ? await sendTxSponsored('removeFavorite', [favoriteId, userAddress])
    : await sendTxRegular('removeFavorite', [favoriteId, userAddress]);
};

export const shortenUrl = async (properties, address, allowlisted) => {
  const { chain } = getNetwork();

  const event = new Promise((resolve, reject) => {
    // Set up a listener for the event
    const unwatch = watchContractEvent(
      {
        address: esthesisAddress(chain.id),
        abi: esthesisAbi,
        eventName: 'ECLIPSE__URL_SHORTENED',
      },
      (id, propertiesEmitted, addressEmitted) => {
        unwatch();
        if (propertiesEmitted === properties && addressEmitted === address) {
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

  const tx = allowlisted
    ? await sendTxSponsored('shortenURL', [properties, address])
    : await sendTxRegular('shortenURL', [properties, address]);

  if (!tx.success) {
    return tx;
  }

  return event;
};
