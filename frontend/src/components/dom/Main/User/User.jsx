import { useEffect, useRef, useState } from 'react';
import { ethers } from 'ethers';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { AiOutlineUser } from 'react-icons/ai';
import ConnectButtonMobile from './ConnectButtonMobile';
import { waitForElem } from '@/systems/utils';
import stores from '@/stores';
import hooks from '@/hooks';

const User = () => {
  const { connected, setConnected, setAddress, setFavorites } =
    stores.useInteract((state) => ({
      connected: state.connected,
      setConnected: state.setConnected,
      setAddress: state.setAddress,
      setFavorites: state.setFavorites,
    }));
  const { address } = useAccount();
  const { isMobile } = hooks.useWindowSize();

  const wrapper = useRef(null);

  const replaceSvg = async () => {
    if (!wrapper.current || !connected) return;

    // const svg = await waitForElem('.iekbcc0.ju367v6.ju367v9 ~ svg');
    const buttonIcon = await waitForElem('.iekbcc0.ju367v6.ju367v9');
    const svg = buttonIcon.nextElementSibling;
    if (svg) {
      svg.remove();
      // Add after
      const newIcon = document.createElement('span');
      newIcon.textContent = '﹀';
      newIcon.style.position = 'relative';
      newIcon.style.top = '0.3rem';
      newIcon.style.paddingLeft = '0.2rem';
      buttonIcon.after(newIcon);
    }
  };

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

  useEffect(() => {
    replaceSvg();
  }, [connected]);

  return (
    <div ref={wrapper} id='a'>
      {isMobile ? (
        <ConnectButtonMobile />
      ) : (
        <ConnectButton
          label={<AiOutlineUser size={20} />}
          accountStatus={{ smallScreen: 'none', largeScreen: 'address' }}
          chainStatus='none'
          showBalance={false}
          style={{ color: 'white' }}
        />
      )}
    </div>
  );
};

export default User;
