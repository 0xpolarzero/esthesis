import Image from 'next/image';
import { Collapse, Modal } from 'antd';
import { AiOutlineHeart, AiOutlineLink } from 'react-icons/ai';
import { RiExternalLinkLine } from 'react-icons/ri';
import stores from '@/stores';
import hooks from '@/hooks';

const { Panel } = Collapse;

const More = () => {
  const { content, setContent } = stores.useSpinamp((state) => ({
    content: state.modalContent,
    setContent: state.setModalContent,
  }));
  const { isMobile } = hooks.useWindowSize();

  if (!content) return null;

  return (
    <Modal
      className={`more-modal ${isMobile ? 'mobile' : 'desktop'}`}
      open={content}
      onCancel={() => setContent(null)}
      footer={null}
      title={`${content.artist.name} - ${content.title}`}>
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
    </Modal>
  );
};

const Header = ({ content }) => {
  const { isMobile } = hooks.useWindowSize();

  const actions = [
    {
      icon: <AiOutlineHeart size={20} />,
      text: 'add to favorites',
      mobile: 'favorites',
      onClick: () => console.log('add to favorites'),
    },
    {
      icon: <AiOutlineLink size={20} />,
      text: 'copy shareable link',
      mobile: 'get shareable link',
      onClick: () => console.log('share'), // TODO same as createShareableLink but also handle lens connect, open to share
    },
  ];

  return (
    <div className='header'>
      <Image
        src={content.lossyArtworkUrl}
        alt={`Album image for ${content.title} from ${content.artist.name}`}
        width={200}
        height={200}
        placeholder='blur'
        blurDataURL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNMyflfDwAFWwJQh9q4ZQAAAABJRU5ErkJggg=='
      />
      <div className='links'>
        <a
          className='with-icon'
          href={content.websiteUrl}
          target='_blank'
          rel='noreferrer'>
          <RiExternalLinkLine size={20} /> listen on {content.platformId}
        </a>
        {isMobile ? <span className='separator horizontal' /> : null}
        <div className='profiles'>
          open profile on{' '}
          <div className='profiles-content'>
            {Object.keys(content.artist.profiles).map((profile) => (
              <a
                className='with-icon'
                key={content.artist.profiles[profile].platformId}
                href={content.artist.profiles[profile].websiteUrl}
                target='_blank'
                rel='noreferrer'>
                <RiExternalLinkLine size={20} />
                {content.artist.profiles[profile].platformId}
              </a>
            ))}
          </div>
        </div>
        {isMobile ? <span className='separator horizontal' /> : null}
        <div className='actions'>
          {isMobile
            ? actions.map((action) => (
                <a
                  className='with-icon'
                  key={action.text}
                  onClick={action.onClick}>
                  {action.icon} {action.mobile}
                </a>
              ))
            : actions.map((action) => (
                <button
                  className='button-primary with-icon'
                  style={{ justifyContent: 'flex-start' }}
                  key={action.text}
                  onClick={action.onClick}>
                  {action.icon} {action.text}
                </button>
              ))}
        </div>
      </div>
    </div>
  );
};

export default More;
