import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Dropdown, Tooltip } from 'antd';
import {
  AiOutlineHeart,
  AiOutlineShareAlt,
  AiOutlineUser,
  AiOutlineWarning,
} from 'react-icons/ai';
import { MdKeyboardArrowRight } from 'react-icons/md';
import stores from '@/stores';
import hooks from '@/hooks';

const ConnectBtn = () => {
  const filterBy = stores.useSpinamp((state) => state.filterBy);
  const retrieveLinksForUser = stores.useInteract(
    (state) => state.retrieveLinksForUser,
  );
  const { isMobile } = hooks.useWindowSize();

  return (
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
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated');

        const menuItems = [
          {
            key: '1',
            label: 'show favorites',
            icon: <AiOutlineHeart size={20} />,
            onClick: () =>
              filterBy(
                'favorites',
                <Tooltip title={account.address}>
                  <a>
                    {account.name ??
                      `${account.address.slice(0, 6)}...${account.address.slice(
                        -4,
                      )}`}
                  </a>
                </Tooltip>,
              ),
          },
          {
            key: '2',
            label: 'created links',
            icon: <AiOutlineShareAlt size={20} />,
            onClick: async () => console.log(await retrieveLinksForUser()),
          },
          {
            key: '3',
            label: 'account',
            icon: <AiOutlineUser size={20} />,
            onClick: openAccountModal,
          },
        ];

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
            {(() => {
              if (!connected) {
                return isMobile ? (
                  <span className='with-icon'>
                    <AiOutlineUser size={20} onClick={openConnectModal} />
                  </span>
                ) : (
                  <a onClick={openConnectModal}>connect</a>
                );
              }

              if (chain.unsupported) {
                return (
                  <button onClick={openChainModal} type='button'>
                    {isMobile ? (
                      <AiOutlineWarning size={20} />
                    ) : (
                      'Wrong network'
                    )}
                  </button>
                );
              }

              return isMobile ? (
                <span className='with-icon'>
                  <Dropdown menu={{ items: menuItems }}>
                    <a>
                      <AiOutlineUser
                        size={20}
                        // onClick={openAccountModal}
                        // style={{ fill: 'var(--text-link)' }}
                      />
                    </a>
                  </Dropdown>
                </span>
              ) : (
                <Dropdown menu={{ items: menuItems }}>
                  <a className='with-icon' onClick={openAccountModal}>
                    {account.name ??
                      `${account.address.slice(0, 6)}...${account.address.slice(
                        -4,
                      )}`}{' '}
                    <MdKeyboardArrowRight size={20} />
                  </a>
                </Dropdown>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default ConnectBtn;
