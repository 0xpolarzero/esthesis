import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import stores from '@/stores';

const User = () => {
  const { setConnected, setAddress } = stores.useInteract((state) => ({
    setConnected: state.setConnected,
    setAddress: state.setAddress,
  }));
  const { address } = useAccount();

  useEffect(() => {
    if (address) {
      setConnected(true);
      setAddress(address);
    } else {
      setConnected(false);
      setAddress(null);
    }
  }, [address, setConnected, setAddress]);

  return (
    <ConnectButton
      label='Connect'
      accountStatus='address'
      chainStatus='none'
      showBalance={false}
    />
  );
};

export default User;
