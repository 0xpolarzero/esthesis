import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Collapse, Modal, Tooltip } from 'antd';
import { AiFillHeart, AiOutlineHeart, AiOutlineShareAlt } from 'react-icons/ai';
import { RiExternalLinkLine } from 'react-icons/ri';
import stores from '@/stores';
import hooks from '@/hooks';
import { FavoritesIcon, FavoritesLabel } from './Favorites';
import { getPlatformName } from '@/systems/utils';

const { Panel } = Collapse;

const More = () => {
  const { content, setContent } = stores.useSpinamp((state) => ({
    content: state.modalContent,
    setContent: state.setModalContent,
  }));
  const { isMobile } = hooks.useWindowSize();

  useEffect(() => {
    if (!document.querySelector('.ant-modal')) return;

    document.querySelector(
      '.ant-modal',
    ).style.backgroundImage = `url(${content.lossyArtworkUrl})`;
  }, [content]);

  if (!content) return null;

  return (
    <Modal
      className={`more-modal ${isMobile ? 'mobile' : 'desktop'}`}
      open={content}
      onCancel={() => setContent(null)}
      footer={null}
      title={`${content.artist.name} - ${content.title}`}
      width={isMobile ? '100%' : 'min(90%, 800px)'}>
      {isMobile ? null : <Header content={content} />}
      <Collapse
        bordered={false}
        ghost
        defaultActiveKey={['1']}
        accordion={isMobile}>
        {isMobile ? (
          <Panel header='track' key='1'>
            <Header content={content} />
          </Panel>
        ) : null}
        <Panel header='context' key={isMobile ? '2' : '1'}>
          <div className='description'>
            {content.description &&
            content.description.length > 0 &&
            content.description !== '<br>' ? (
              <span dangerouslySetInnerHTML={{ __html: content.description }} />
            ) : (
              <span className='empty'>
                no description provided for this track
              </span>
            )}
          </div>
        </Panel>
      </Collapse>
      <div className='modal-overlay' />
    </Modal>
  );
};

const Header = ({ content }) => {
  const { isAllowed, favoritesLoaded, toggleFavorite, createShareableLink } =
    stores.useInteract((state) => ({
      isAllowed: state.isAllowed,
      favoritesLoaded: state.favoritesLoaded,
      toggleFavorite: state.toggleFavorite,
      createShareableLink: state.createShareableLink,
    }));
  const { isMobile, windowSize } = hooks.useWindowSize();
  const [artworkSize, setArtworkSize] = useState(200);

  const actions = [
    {
      icon: <FavoritesIcon id={content.id} />,
      text: <FavoritesLabel id={content.id} type='minimal' />,
      mobile: 'favorites',
      onClick: () => toggleFavorite(content.id),
      disabled: !isAllowed || !favoritesLoaded,
    },
    {
      icon: <AiOutlineShareAlt size={20} />,
      text: 'share',
      mobile: 'share',
      onClick: () => createShareableLink(content),
      disabled: !isAllowed,
    },
  ];

  useEffect(() => {
    if (!windowSize.width) return;

    let size;
    if (windowSize.width < 600) size = 200;
    else if (windowSize.width > 1000) size = 400;
    else size = windowSize.width / 3;

    setArtworkSize(size);
  }, [windowSize.width]);

  return (
    <div className='header'>
      <Image
        src={content.lossyArtworkUrl}
        alt={`Album image for ${content.title} from ${content.artist.name}`}
        width={artworkSize}
        height={artworkSize}
        placeholder='blur'
        blurDataURL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNMyflfDwAFWwJQh9q4ZQAAAABJRU5ErkJggg=='
      />
      <div className='links'>
        <a
          className='with-icon'
          href={content.websiteUrl}
          target='_blank'
          rel='noreferrer'>
          <RiExternalLinkLine size={20} /> listen on {getPlatformName(content)}
        </a>
        {isMobile ? <span className='separator horizontal' /> : null}
        <div className='profiles'>
          open profile on{' '}
          <div className='profiles-content'>
            {Object.keys(content.artist.profiles).map((profile) => (
              <a
                className='with-icon'
                key={getPlatformName(content.artist.profiles[profile])}
                href={content.artist.profiles[profile].websiteUrl}
                target='_blank'
                rel='noreferrer'>
                <RiExternalLinkLine size={20} />
                {getPlatformName(content.artist.profiles[profile])}
              </a>
            ))}
          </div>
        </div>
        {isMobile ? <span className='separator horizontal' /> : null}
        <div className='actions'>
          {isMobile
            ? actions.map((action) => (
                <Tooltip
                  title={
                    isAllowed
                      ? null
                      : `you need to sign in & be in the allowlist to perform this action`
                  }
                  key={action.text}>
                  <a
                    className={`with-icon ${action.disabled ? 'disabled' : ''}`}
                    onClick={action.onClick}>
                    {action.icon} {action.mobile}
                  </a>
                </Tooltip>
              ))
            : actions.map((action) => (
                <Tooltip
                  title={
                    isAllowed
                      ? null
                      : `you need to sign in & be in the allowlist to perform this action`
                  }
                  className='button-primary with-icon large'
                  key={action.text}>
                  <button
                    className='button-primary with-icon'
                    style={{ justifyContent: 'flex-start' }}
                    onClick={action.onClick}
                    disabled={action.disabled}>
                    {action.icon} {action.text}
                  </button>
                </Tooltip>
              ))}
        </div>
      </div>
    </div>
  );
};

export default More;
