import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { Collapse, Tooltip } from 'antd';
import { RiPlayFill } from 'react-icons/ri';
import stores from '@/stores';
import hooks from '@/hooks';
import Search from './Search';
import Utils from '../Utils';

const { ElapsedTime, TableSkeleton } = Utils;

const { Panel } = Collapse;

const Sound = () => {
  const { tracks, filterAll, filteredByArtist } = stores.useSpinamp(
    (state) => ({
      tracks: state.tracks,
      filterAll: state.filterAll,
      filteredByArtist: state.filteredByArtist,
    }),
  );
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
    <div className='sound'>
      <Collapse bordered={false} ghost defaultActiveKey={['1']}>
        <Panel
          ref={ref}
          header='sound'
          key='1'
          className={`panel ${isMobile ? 'mobile' : 'desktop'}`}>
          <Search />

          {filteredByArtist ? (
            <div className='filter'>
              <span>
                Showing tracks for{' '}
                <span className='emphasize'>{filteredByArtist}</span>
              </span>
              <button className='button-primary' onClick={filterAll}>
                Clear
              </button>
            </div>
          ) : null}
          {tracks?.items ? (
            tracks.items.map((track) =>
              // Render a card on mobile, a row on desktop
              isMobile ? (
                <>
                  <div
                    className='track-card'
                    key={track.id}
                    onClick={() => start(track)}>
                    <TrackRow track={track} />
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
    </div>
  );
};

const TrackRow = ({ track, onClick }) => {
  const playing = stores.useAudio((state) => state.playing);
  const filterByArtist = stores.useSpinamp((state) => state.filterByArtist);
  const { isMobile } = hooks.useWindowSize();

  return (
    <>
      <Tooltip
        title={
          isMobile ? null : (
            <Image
              src={track.lossyArtworkUrl}
              alt={`Album image for ${track.title} from ${track.artist.name}`}
              width={200}
              height={200}
              placeholder='blur'
              blurDataURL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNMyflfDwAFWwJQh9q4ZQAAAABJRU5ErkJggg=='
            />
          )
        }
        arrow={false}>
        <div
          className={`track-row__title ${
            playing?.data?.id === track.id ? 'active' : ''
          }`}
          onClick={onClick}>
          <RiPlayFill size={20} />
          {track.title}
        </div>
      </Tooltip>
      <div className='track-row__artist'>
        <a
          onClick={(e) => {
            e.stopPropagation();
            filterByArtist(track.artist.name);
          }}>
          {track.artist.name}
        </a>
      </div>
      <div className='track-row__platform'>
        <a
          onClick={(e) => e.stopPropagation()}
          href={track.websiteUrl}
          target='_blank'
          rel='noreferrer'>
          {track.platformId.length > 20 ? (
            <Tooltip title={track.platformId} arrow={false}>
              {track.platformId.substring(0, 6)}...
              {track.platformId.substring(track.platformId.length - 4)}
            </Tooltip>
          ) : (
            track.platformId
          )}
        </a>
      </div>
      <div className='track-row__date'>
        {/* {new Date(track.createdAtTime).toLocaleDateString()} */}
        <ElapsedTime time={new Date(track.createdAtTime)} />
      </div>
    </>
  );
};

export default Sound;
