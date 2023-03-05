import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { Collapse, Dropdown, Tooltip } from 'antd';
import {
  AiOutlineFilter,
  AiOutlineHeart,
  AiOutlineInfoCircle,
} from 'react-icons/ai';
import { CiCircleMore } from 'react-icons/ci';
import { RiExternalLinkLine, RiPlayFill } from 'react-icons/ri';
import Search from './Search';
import Utils from '../Utils';
import stores from '@/stores';
import hooks from '@/hooks';

const { ElapsedTime, TableSkeleton } = Utils;

const { Panel } = Collapse;

const Sound = () => {
  const { tracks, filterAll, filterNavigate, filteredBy } = stores.useSpinamp(
    (state) => ({
      tracks: state.tracks,
      filterAll: state.filterAll,
      filterNavigate: state.filterNavigate,
      filteredBy: state.filteredBy,
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

          {filteredBy ? (
            <div className='filter'>
              <span>
                Showing tracks for{' '}
                <span className='emphasize'>{filteredBy.value}</span>
              </span>
              <button className='button-primary' onClick={filterAll}>
                Clear
              </button>
            </div>
          ) : (
            <div className='filter'>Showing all tracks</div>
          )}

          <div className='filter' style={{ marginBottom: '1rem' }}>
            <span style={{ opacity: 0.7 }}>x-x of x results</span>
            {/* if not filtered */}
            {/* if not all tracks loaded */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className='button-primary' onClick={filterNavigate}>
                prev
              </button>
              <button className='button-primary' onClick={filterNavigate}>
                next
              </button>
            </div>
          </div>

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
  const filterBy = stores.useSpinamp((state) => state.filterBy);
  const { isMobile } = hooks.useWindowSize();

  const infoDropdown = [
    {
      key: '1',
      label: 'more info',
      icon: <AiOutlineInfoCircle size={20} />,
    },
    {
      key: '2',
      label: (
        <a
          href={track.websiteUrl}
          target='_blank'
          rel='noreferrer'
          style={{ opacity: 1 }}>
          open in {track.platformId}
        </a>
      ),
      icon: <RiExternalLinkLine size={20} />,
    },
    {
      key: '3',
      label: 'add to favorites',
      icon: <AiOutlineHeart size={20} />,
    },
  ];

  const artistDropdown = [
    {
      key: '1',
      label: (
        <a
          onClick={(e) => {
            e.stopPropagation();
            filterBy('artist', track.artist.name);
          }}>
          tracks by {track.artist.name}
        </a>
      ),
      icon: <AiOutlineFilter size={20} />,
    },
    {
      key: '2',
      type: 'group',
      label: `see profile on`,
      icon: <AiOutlineInfoCircle size={20} />,
      children: Object.keys(track.artist.profiles).map((profile) => ({
        key: track.artist.profiles[profile].platformId,
        label: (
          <a
            href={track.artist.profiles[profile].websiteUrl}
            target='_blank'
            rel='noreferrer'>
            {track.artist.profiles[profile].platformId}
          </a>
        ),
        icon: <RiExternalLinkLine size={20} />,
      })),
    },
  ];

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
          {track.title.length > 40 ? (
            <>
              {track.title.substring(0, 40)}
              <span className='emphasize'>...</span>
            </>
          ) : (
            track.title
          )}
        </div>
      </Tooltip>
      <div className='track-row__artist'>
        <Dropdown menu={{ items: artistDropdown }}>
          <a>{track.artist.name}</a>
        </Dropdown>
      </div>
      <div className='track-row__platform'>
        <a
          onClick={(e) => {
            e.stopPropagation();
            filterBy('platform', track.platformId);
          }}>
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
      <div className='track-row__more'>
        <Dropdown menu={{ items: infoDropdown }} placement='bottomLeft'>
          <CiCircleMore size={20} />
        </Dropdown>
      </div>
    </>
  );
};

export default Sound;
