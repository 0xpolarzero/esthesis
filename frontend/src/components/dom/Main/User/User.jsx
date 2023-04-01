import { useEffect } from 'react';
import Profile from './Profile';
import stores from '@/stores';

const User = () => {
  const {
    connected,
    address,
    initFavorites,
    resetFavorites,
    initUserInstance,
    resetUserInstance,
  } = stores.useInteract((state) => ({
    connected: state.connected,
    address: state.address,
    initFavorites: state.initFavorites,
    resetFavorites: state.resetFavorites,
    initUserInstance: state.initUserInstance,
    resetUserInstance: state.resetUserInstance,
  }));
  const { initPlaylists, resetPlaylists } = stores.useSpinamp((state) => ({
    initPlaylists: state.initPlaylists,
    resetPlaylists: state.resetPlaylists,
  }));

  useEffect(() => {
    if (connected && address) {
      initUserInstance().then(() => initFavorites());
      initPlaylists();
    } else {
      resetUserInstance();
      resetFavorites();
      resetPlaylists();
    }
  }, [
    connected,
    address,
    initFavorites,
    resetFavorites,
    initPlaylists,
    resetPlaylists,
    initUserInstance,
    resetUserInstance,
  ]);

  return <Profile />;
};

export default User;
