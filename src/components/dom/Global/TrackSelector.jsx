import { useState } from 'react';
import { Collapse, Table, Tooltip } from 'antd';
import stores from '@/stores';
import hooks from '@/hooks';
import ElapsedTime from '../Utils/ElapsedTime';
import { RiPlayFill } from 'react-icons/ri';
import Image from 'next/image';

const { Panel } = Collapse;

const TrackSelector = () => {
  const { tracks, loadingTracks, errorTracks, fetchTracks } = stores.useSpinamp(
    (state) => ({
      tracks: state.tracks,
      loadingTracks: state.loadingTracks,
      errorTracks: state.errorTracks,
      fetchTracks: state.fetchTracks,
    }),
  );
  const start = stores.useAudio((state) => state.start);
  const { isMobile } = hooks.useWindowSize();

  const chooseTrack = (track) => {
    console.log('choosing track', track);
    start(track);
  };

  return (
    <div className='track-selector'>
      <Collapse bordered={false} defaultActiveKey={['1']}>
        <Panel
          header='Library'
          key='1'
          className={`library ${isMobile ? 'mobile' : 'desktop'}`}>
          {tracks?.items
            ? tracks.items.map((track) =>
                // Render a card on mobile, a row on desktop
                isMobile ? (
                  <>
                    <div
                      className='track-card'
                      key={track.id}
                      onClick={() => chooseTrack(track)}>
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
                    onClick={() => chooseTrack(track)}
                  />
                ),
              )
            : 'loading'}
        </Panel>
      </Collapse>
    </div>
  );
};

const TrackRow = ({ track, onClick }) => {
  const playing = stores.useAudio((state) => state.playing);
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
              // display 'loading' image while loading
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
        <a onClick={(e) => e.stopPropagation()}>{track.artist.name}</a>
      </div>
      <div className='track-row__platform'>
        <a
          onClick={(e) => e.stopPropagation()}
          href={track.websiteUrl}
          target='_blank'
          rel='noreferrer'>
          {track.platformId}
        </a>
      </div>
      <div className='track-row__date'>
        {/* {new Date(track.createdAtTime).toLocaleDateString()} */}
        <ElapsedTime time={new Date(track.createdAtTime)} />
      </div>
    </>
  );
};

export default TrackSelector;
