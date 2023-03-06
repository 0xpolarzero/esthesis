import { useEffect, useRef, useState } from 'react';
import { Collapse } from 'antd';
import Search from '../Search';
import Utils from '../../Utils';
import stores from '@/stores';
import hooks from '@/hooks';
import More from './More';
import Navigation from './Navigation';
import TrackRow from './TrackRow';

const { TableSkeleton } = Utils;

const { Panel } = Collapse;

const Sound = () => {
  const { tracks, setModalContent } = stores.useSpinamp((state) => ({
    tracks: state.tracks,
    setModalContent: state.setModalContent,
  }));
  const start = stores.useAudio((state) => state.start);
  const { isMobile, windowSize } = hooks.useWindowSize();

  const ref = useRef(null);

  useEffect(() => {
    // Keep the width of the panel header in sync with the width of the panel
    // content
    if (!ref.current) return;

    const header = ref.current.querySelector('.ant-collapse-header');
    const content = ref.current.querySelector('.ant-collapse-content-box');

    if (!header || !content) return;

    header.style.width = `${content.offsetWidth}px`;
  }, [windowSize]);

  return (
    <div className={`sound ${isMobile ? 'mobile' : 'desktop'}`}>
      <Collapse bordered={false} ghost defaultActiveKey={['1']}>
        <Panel
          ref={ref}
          header='sound'
          key='1'
          className={`panel ${isMobile ? 'mobile' : 'desktop'}`}>
          <Search />

          <Navigation />

          {tracks?.items ? (
            tracks.items.map((track) =>
              // Render a card on mobile, a row on desktop
              isMobile ? (
                <>
                  <div
                    className='track-card'
                    key={track.id}
                    onClick={() => start(track)}>
                    <TrackRow track={track} setModalContent={setModalContent} />
                  </div>
                  {tracks.items.indexOf(track) !== tracks.items.length - 1 ? (
                    <span className='separator horizontal' />
                  ) : null}
                </>
              ) : (
                <TrackRow
                  key={track.id}
                  track={track}
                  onClick={() => start(track)}
                  setModalContent={setModalContent}
                />
              ),
            )
          ) : isMobile ? (
            <TableSkeleton colCount={1} rowCount={10} noHeader={true} />
          ) : (
            <TableSkeleton
              colCount={4}
              rowCount={10}
              style={{ gridColumn: 'span 4' }}
              noHeader={true}
            />
          )}
        </Panel>
      </Collapse>

      <More />
    </div>
  );
};

export default Sound;
