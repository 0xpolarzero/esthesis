import { ConnectButton } from '@rainbow-me/rainbowkit';
import { AiOutlineUser } from 'react-icons/ai';

const ConnectButtonMobile = () => {
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
                return (
                  <span className='with-icon'>
                    <AiOutlineUser size={20} onClick={openConnectModal} />
                  </span>
                );
              }

              if (chain.unsupported) {
                return (
                  <button onClick={openChainModal} type='button'>
                    Wrong network
                  </button>
                );
              }

              return (
                <span className='with-icon'>
                  <AiOutlineUser
                    size={20}
                    onClick={openAccountModal}
                    style={{ fill: 'var(--text-link)' }}
                  />
                </span>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default ConnectButtonMobile;
