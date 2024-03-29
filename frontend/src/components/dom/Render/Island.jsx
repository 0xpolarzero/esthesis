import { useEffect, useState } from 'react';
import { Collapse, Divider } from 'antd';
import { RiExternalLinkLine } from 'react-icons/ri';
import stores from '@/stores';
import hooks from '@/hooks';
import ElapsedTime from '../Utils/ElapsedTime';
import { getPlatformName } from '@/systems/utils';

const { Panel } = Collapse;

const needDangerousHTML = [
  '<br>',
  '<br/>',
  '<br />',
  '<p>',
  '</p>',
  '<div>',
  '</div>',
  '<span>',
  '</span>',
];

const Island = () => {
  const playing = stores.useAudio((state) => state.playing);
  const platforms = stores.useSpinamp((state) => state.platforms);
  const { isMobile } = hooks.useWindowSize();

  const [isExpanded, setIsExpanded] = useState(false);
  const [platformName, setPlatformName] = useState('');

  useEffect(() => {
    if (isMobile) setIsExpanded(true);
  }, [isMobile]);

  useEffect(() => {
    if (!playing || !platforms) return;
    setPlatformName(getPlatformName(playing.data, platforms));
  }, [playing, platforms]);

  if (!playing) return null;

  return (
    <div
      className={`island ${isMobile ? 'mobile' : 'desktop'} ${
        isExpanded ? 'expanded' : ''
      }`}>
      <div className='content'>
        <span className='artist'>
          {playing.data.artist.name} <Divider type='vertical' />{' '}
          {playing.data.title}
        </span>
        <a
          className='platform with-icon'
          href={playing.data.websiteUrl}
          target='_blank'
          rel='noreferrer'>
          <RiExternalLinkLine size={20} />
          listen on {platformName}
        </a>
        <Collapse
          bordered={false}
          ghost
          onChange={(e) => setIsExpanded(e.length)}
          defaultActiveKey={isMobile ? ['1'] : []}>
          <Panel header='more' key='1'>
            <div className='expand'>
              <div className='profiles'>
                <span className='label'>open profile on</span>
                <div className='profiles-content'>
                  {Object.keys(playing.data.artist.profiles).map(
                    (profile, i) => (
                      <a
                        key={i}
                        className='profile with-icon'
                        href={playing.data.artist.profiles[profile].websiteUrl}
                        target='_blank'
                        rel='noreferrer'>
                        <RiExternalLinkLine size={20} />
                        {profile}
                      </a>
                    ),
                  )}
                </div>
              </div>
              <div className='date'>
                <span className='label'>date</span>
                {new Date(playing.data.createdAtTime).toLocaleDateString()} (
                <ElapsedTime time={new Date(playing.data.createdAtTime)} />)
              </div>
              <div className='description'>
                <span className='label'>context</span>
                {playing.data.description && playing.data.description.length ? (
                  needDangerousHTML.some((html) =>
                    playing.data.description.includes(html),
                  ) ? (
                    <span
                      dangerouslySetInnerHTML={{
                        __html: playing.data.description,
                      }}
                    />
                  ) : (
                    playing.data.description.split('\n').map((line, i) => (
                      <span key={i}>
                        {line}
                        <br />
                      </span>
                    ))
                  )
                ) : (
                  <span className='empty'>
                    no description provided for this track
                  </span>
                )}
              </div>
            </div>
          </Panel>
        </Collapse>
      </div>
    </div>
  );
};

export default Island;
