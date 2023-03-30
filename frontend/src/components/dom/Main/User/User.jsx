import { useEffect } from 'react';
import Profile from './Profile';
import stores from '@/stores';

const User = () => {
  const { connected, address, setFavorites } = stores.useInteract((state) => ({
    connected: state.connected,
    address: state.address,
    setFavorites: state.setFavorites,
  }));

  useEffect(() => {
    if (connected && address) {
      setFavorites(address);
    } else {
      setFavorites(null);
    }
  }, [connected, address, setFavorites]);

  return <Profile />;
};

export default User;
