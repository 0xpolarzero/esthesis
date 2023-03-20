import { ConnectButton } from '@rainbow-me/rainbowkit';
import { AiOutlineUser, AiOutlineWarning } from 'react-icons/ai';
import hooks from '@/hooks';
import { MdKeyboardArrowDown } from 'react-icons/md';

const ConnectBtn = () => {
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
                  <AiOutlineUser
                    size={20}
                    onClick={openAccountModal}
                    style={{ fill: 'var(--text-link)' }}
                  />
                </span>
              ) : (
                <a className='with-icon' onClick={openAccountModal}>
                  {account.name ??
                    `${account.address.slice(0, 6)}...${account.address.slice(
                      -4,
                    )}`}{' '}
                  <MdKeyboardArrowDown size={20} />
                </a>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default ConnectBtn;
