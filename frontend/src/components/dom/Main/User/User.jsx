import { useEffect } from 'react';
import Profile from './Profile';
import stores from '@/stores';

const User = () => {
  const { connected, address, initFavorites, resetFavorites } =
    stores.useInteract((state) => ({
      connected: state.connected,
      address: state.address,
      initFavorites: state.initFavorites,
      resetFavorites: state.resetFavorites,
    }));
  const { initPlaylists, resetPlaylists } = stores.useSpinamp((state) => ({
    initPlaylists: state.initPlaylists,
    resetPlaylists: state.resetPlaylists,
  }));

  useEffect(() => {
    if (connected && address) {
      initFavorites();
      initPlaylists();
    } else {
      resetFavorites();
      resetPlaylists();
    }
  }, [connected, address, initFavorites, resetFavorites]);

  return <Profile />;
};

export default User;
