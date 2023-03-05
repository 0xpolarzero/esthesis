import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Collapse, Dropdown, Tooltip } from 'antd';
import {
  AiOutlineFilter,
  AiOutlineHeart,
  AiOutlineInfoCircle,
  AiOutlineLeft,
  AiOutlineRight,
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
  const tracks = stores.useSpinamp((state) => state.tracks);
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
  const { filterBy, loadingAllTracks } = stores.useSpinamp((state) => ({
    filterBy: state.filterBy,
    loadingAllTracks: state.loadingAllTracks,
  }));
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
      mobile: (
        <a href={track.websiteUrl} target='_blank' rel='noreferrer'>
          <RiExternalLinkLine size={20} />
        </a>
      ),
    },
    {
      key: '3',
      label: 'add to favorites',
      icon: <AiOutlineHeart size={20} />,
      mobile: <AiOutlineHeart size={20} />,
    },
  ];

  const artistDropdown = [
    {
      key: '1',
      label: (
        <a
          onClick={(e) => {
            e.stopPropagation();
            if (loadingAllTracks) return;
            filterBy('artist', track.artist.name);
          }}
          className={loadingAllTracks ? 'disabled' : ''}>
          tracks by {track.artist.name}
        </a>
      ),
      icon: <AiOutlineFilter size={20} />,
      disabled: loadingAllTracks,
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
          <a>
            {track.artist.name.length > 20
              ? `${track.artist.name.substring(
                  0,
                  6,
                )}...${track.artist.name.substring(
                  track.artist.name.length - 4,
                )}`
              : track.artist.name}
          </a>
        </Dropdown>
      </div>
      <div className='track-row__platform'>
        <a
          onClick={(e) => {
            e.stopPropagation();
            if (loadingAllTracks) return;
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
        {isMobile ? (
          <span
            style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '0.5rem',
            }}>
            {infoDropdown.map((item, index) =>
              index !== 0 ? item.mobile : null,
            )}
          </span>
        ) : (
          <Dropdown menu={{ items: infoDropdown }} placement='bottomLeft'>
            <CiCircleMore size={20} />
          </Dropdown>
        )}
      </div>
    </>
  );
};

const Navigation = () => {
  const {
    tracks,
    page,
    navigatePage,
    totalCount,
    filterAll,
    filteredBy,
    isSearching,
  } = stores.useSpinamp((state) => ({
    tracks: state.tracks,
    page: state.page,
    navigatePage: state.navigatePage,
    totalCount: state.totalCount,
    filterAll: state.filterAll,
    filteredBy: state.filteredBy,
    isSearching: state.isSearching,
  }));

  return (
    <>
      {isSearching ? (
        <div className='filter'>
          {tracks.items.length === 100 ? (
            <span>
              showing 100 most accurate results for{' '}
              <span className='emphasize'>{isSearching}</span> ; try to be more
              specific to get better results.
            </span>
          ) : (
            <span>
              showing all results for{' '}
              <span className='emphasize'>{isSearching}</span>
            </span>
          )}
        </div>
      ) : filteredBy ? (
        <div className='filter'>
          <span>
            showing tracks {filteredBy.type === 'artist' ? 'from' : 'on'}{' '}
            <span className='emphasize'>{filteredBy.value}</span>
          </span>
          <button className='button-primary' onClick={filterAll}>
            Clear
          </button>
        </div>
      ) : (
        <div className='filter'>showing most recent tracks</div>
      )}

      {tracks ? (
        <div className='filter' style={{ marginBottom: '1rem' }}>
          <span style={{ opacity: 0.7 }}>
            {isSearching
              ? tracks.items.length === 100
                ? 'more than 100 results'
                : `${tracks.items.length} results`
              : `${page * 100 + 1}-${page * 100 + 100} of ${
                  totalCount || '...'
                } results`}
          </span>
          <div className='navigation'>
            <button
              className='button-primary'
              onClick={() => navigatePage('prev')}
              disabled={!tracks.pageInfo?.hasPreviousPage}>
              <AiOutlineLeft size={20} />
            </button>
            <button
              className='button-primary'
              onClick={() => navigatePage('next')}
              disabled={!tracks.pageInfo?.hasNextPage}>
              <AiOutlineRight size={20} />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default Sound;
