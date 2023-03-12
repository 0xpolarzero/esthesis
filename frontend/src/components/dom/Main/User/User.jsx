import { useEffect, useState } from 'react';
import { Magic } from 'magic-sdk';
import { ethers } from 'ethers';
import { recoverPersonalSignature } from '@metamask/eth-sig-util';
import stores from '@/stores';

const User = () => {
  const { setConnected, setAddress } = stores.useInteract((state) => ({
    setConnected: state.setConnected,
    setAddress: state.setAddress,
  }));
  const [magic, setMagic] = useState(null);

  const connect = async () => {
    const magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_API_KEY, {
      network: {
        rpcUrl: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
        chainId: 80001,
      },
    });

    const provider = new ethers.providers.Web3Provider(magic.rpcProvider);
    const accounts = await magic.wallet.connectWithUI();

    if (!magic) setMagic(magic);
    console.log(accounts);

    if (accounts) await signAndVerify(provider, accounts[0]);
  };

  const signAndVerify = async (provider, address) => {
    const message =
      'Please sign this message to verify that you own this address.';
    const signer = provider.getSigner();

    try {
      // Sign a message with the address
      const signature = await signer.signMessage(message);
      // Recover the address from the signature
      const recoveredAddress = recoverPersonalSignature({
        data: message,
        signature,
      });

      if (recoveredAddress === address) {
        setConnected(true);
        setAddress(address);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return <button onClick={connect}>user</button>;
};

export default User;
