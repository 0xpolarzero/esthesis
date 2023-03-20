import { useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import ConnectBtn from './ConnectBtn';
import stores from '@/stores';

const User = () => {
  const { connected, setConnected, setAddress, setFavorites } =
    stores.useInteract((state) => ({
      connected: state.connected,
      setConnected: state.setConnected,
      setAddress: state.setAddress,
      setFavorites: state.setFavorites,
    }));
  const { address } = useAccount();

  useEffect(() => {
    if (address) {
      setConnected(true);
      setAddress(address);
      setFavorites(address);
    } else {
      setConnected(false);
      setAddress(null);
      setFavorites(null);
    }
  }, [address, setConnected, setAddress, setFavorites]);

  return <ConnectBtn />;
};

export default User;
