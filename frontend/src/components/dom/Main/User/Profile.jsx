import { useEffect, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Dropdown, Tooltip } from 'antd';
import {
  AiOutlineHeart,
  AiOutlineLogout,
  AiOutlineShareAlt,
  AiOutlineUser,
} from 'react-icons/ai';
import { MdKeyboardArrowRight } from 'react-icons/md';
import stores from '@/stores';
import hooks from '@/hooks';
import LinksDrawer from './LinksDrawer';
import { useAccount, useNetwork, useSignMessage } from 'wagmi';
import { SiweMessage } from 'siwe';
import {
  RiExternalLinkLine,
  RiPlayListAddLine,
  RiPlayListLine,
} from 'react-icons/ri';

const Profile = () => {
  const { isSigned, setIsSigned, setAddress } = stores.useInteract((state) => ({
    isSigned: state.connected,
    setIsSigned: state.setConnected,
    setAddress: state.setAddress,
  }));
  const { isConnected } = useAccount();
  const [linksDrawerOpen, setLinksDrawerOpen] = useState(false);

  useEffect(() => {
    const handler = async () => {
      try {
        const res = await fetch('/api/user');
        const json = await res.json();
        if (json.address) {
          setAddress(json.address);
          setIsSigned(true);
        }
      } catch (err) {
        console.error(err);
      }
    };

    // Page loads, and user is already logged in
    handler();

    // Window is focused
    window.addEventListener('focus', handler);
    return () => window.removeEventListener('focus', handler);
  }, [setAddress]);

  if (!isConnected) return <ConnectBtn />;
  if (!isSigned) return <SignBtn />;

  return (
    <>
      <Menu setLinksDrawerOpen={setLinksDrawerOpen} />
      <LinksDrawer open={linksDrawerOpen} setOpen={setLinksDrawerOpen} />
    </>
  );
};

const ConnectBtn = () => {
  return (
    <>
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          const ready = mounted && authenticationStatus !== 'loading';
          return (
            <div
              {...(!ready && {
                'aria-hidden': true,
                style: {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              })}>
              {(() => (
                <a onClick={openConnectModal}>connect</a>
              ))()}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </>
  );
};

const SignBtn = () => {
  // Stores
  const { setConnected, setAddress } = stores.useInteract((state) => ({
    setConnected: state.setConnected,
    setAddress: state.setAddress,
  }));
  // Wagmi
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { signMessageAsync } = useSignMessage();
  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nonce, setNonce] = useState(0);

  const signIn = async () => {
    try {
      const chainId = chain?.id;
      if (!address || !chainId) return;

      setLoading(true);

      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in to esthesis with Ethereum',
        uri: window.location.origin,
        version: '1',
        chainId,
        nonce,
      });
      const signature = await signMessageAsync({
        message: message.prepareMessage(),
      });

      // Verify signature
      const verifyRes = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, signature }),
      });
      if (!verifyRes.ok) throw new Error('Signature verification failed');

      setAddress(address);
      setConnected(true);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err);
      setNonce(null);
      setLoading(false);
      fetchNonce();
    }
  };

  const fetchNonce = async () => {
    try {
      const res = await fetch('/api/nonce');
      const nonce = await res.text();
      setNonce(nonce);
    } catch (err) {
      console.error(err);
      setError(err);
    }
  };

  useEffect(() => {
    fetchNonce();
  }, []);

  return (
    <a
      onClick={!nonce || loading ? null : signIn}
      className={!nonce || loading ? 'disabled' : ''}>
      sign in
    </a>
  );
};

const Menu = ({ setLinksDrawerOpen }) => {
  const { address, favoritesLoaded, isAllowed, setAddress, setConnected } =
    stores.useInteract((state) => ({
      address: state.address,
      favoritesLoaded: state.favoritesLoaded,
      isAllowed: state.isAllowed,
      setAddress: state.setAddress,
      setConnected: state.setConnected,
    }));
  const { filterBy, playlists, playlistsLoaded, getPlaylistsMenu } =
    stores.useSpinamp((state) => ({
      filterBy: state.filterBy,
      playlists: state.playlists,
      playlistsLoaded: state.playlistsLoaded,
      getPlaylistsMenu: state.getPlaylistsMenu,
    }));
  const { isMobile, isWideScreen } = hooks.useWindowSize();

  const signOut = async () => {
    await fetch('/api/logout');
    setAddress('');
    setConnected(false);
  };

  const itemsAllowlisted = [
    {
      key: '1',
      label: 'favorites',
      icon: <AiOutlineHeart size={20} />,
      onClick: () =>
        filterBy(
          'favorites',
          <Tooltip title={address}>
            <a>
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null}
            </a>
          </Tooltip>,
        ),
      disabled: !favoritesLoaded,
    },
    {
      key: '2',
      label: 'playlists',
      icon: <RiPlayListLine size={20} />,
      disabled: !playlistsLoaded,
      children: getPlaylistsMenu(),
    },
    {
      key: '3',
      label: 'created links',
      icon: <AiOutlineShareAlt size={20} />,
      onClick: () => setLinksDrawerOpen(true),
    },
    {
      key: '4',
      label: 'sign out',
      icon: <AiOutlineLogout size={20} />,
      onClick: signOut,
    },
  ];

  const itemsNotAllowlisted = [
    {
      key: '1',
      label: 'request access',
      icon: <RiExternalLinkLine size={20} />,
      onClick: () => null, // TODO Form to request access (take the address as input)
    },
    itemsAllowlisted.find((item) => item.label === 'sign out'),
  ];

  if (isMobile)
    return (
      <span className='with-icon'>
        <Dropdown
          menu={{
            items: isAllowed() ? itemsAllowlisted : itemsNotAllowlisted,
          }}>
          <a>
            <AiOutlineUser
              size={20}
              // onClick={openAccountModal}
              // style={{ fill: 'var(--text-link)' }}
            />
          </a>
        </Dropdown>
      </span>
    );

  if (isWideScreen)
    return (
      <div className='links-wide'>
        {(isAllowed() ? itemsAllowlisted : itemsNotAllowlisted).map((item) => {
          if (item.children)
            return (
              <Dropdown
                key={item.key}
                menu={{ items: item.children }}
                className='with-icon'>
                <a className={item.disabled ? 'disabled' : ''}>
                  {item.icon}
                  {item.label}
                </a>
              </Dropdown>
            );
          return (
            <a
              key={item.key}
              onClick={item.onClick}
              className={item.disabled ? 'disabled with-icon' : 'with-icon'}>
              {item.icon}
              {item.label}
            </a>
          );
        })}
      </div>
    );

  return (
    <Dropdown
      menu={{ items: isAllowed() ? itemsAllowlisted : itemsNotAllowlisted }}>
      <a className='with-icon'>
        {' '}
        {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null}{' '}
        <MdKeyboardArrowRight size={20} />
      </a>
    </Dropdown>
  );
};

export default Profile;
