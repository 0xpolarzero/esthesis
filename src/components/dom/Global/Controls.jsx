import { Divider } from 'antd';
import { RiPlayFill, RiPauseFill } from 'react-icons/ri';
import { MdOutlineSkipPrevious, MdOutlineSkipNext } from 'react-icons/md';
import stores from '@/stores';
import hooks from '@/hooks';
import { useEffect, useRef, useState } from 'react';
import Duration from '../Utils/Duration';

const Controls = () => {
  const { play, pause, navigate, suspended, playing } = stores.useAudio(
    (state) => ({
      play: state.play,
      pause: state.pause,
      navigate: state.navigate,
      suspended: state.suspended,
      playing: state.playing,
    }),
  );
  const tracks = stores.useSpinamp((state) => state.tracks);

  const [existPrev, setExistPrev] = useState(false);
  const [existNext, setExistNext] = useState(false);

  useEffect(() => {
    if (!playing || !tracks) return;

    const index = tracks.items?.findIndex(
      (item) => item.id === playing.data.id,
    );

    if (index === -1) {
      setExistPrev(false);
      setExistNext(false);
    } else {
      if (index < tracks.items?.length - 1) {
        setExistNext(true);
      } else {
        setExistNext(false);
      }

      if (index > 0) {
        setExistPrev(true);
      } else {
        setExistPrev(false);
      }
    }
  }, [playing, tracks]);

  return (
    <div className='controls'>
      {playing ? <Title playing={playing} /> : '_select a track'}
      <div className='buttons'>
        <MdOutlineSkipPrevious
          size={20}
          onClick={() => (existPrev ? navigate('prev') : null)}
          className={existPrev ? '' : 'disabled'}
        />

        {suspended ? (
          <RiPlayFill size={20} onClick={play} />
        ) : (
          <RiPauseFill size={20} onClick={pause} />
        )}

        <MdOutlineSkipNext
          size={20}
          onClick={() => (existNext ? navigate('next') : null)}
          className={existNext ? '' : 'disabled'}
        />
      </div>
      <Slider />
    </div>
  );
};

const Title = ({ playing }) => {
  const { isMobile, windowSize } = hooks.useWindowSize();

  return (
    <div className='scroll'>
      {playing.data.title} {isMobile ? <Duration /> : null}
      {isMobile ? null : (
        <>
          <Divider type='vertical' style={{ margin: '0 2rem' }} />
          {playing.data.artist.name}
          <Divider type='vertical' style={{ margin: '0 2rem' }} />
          <span style={{ opacity: 0.7 }}>
            <Duration />
          </span>
        </>
      )}
    </div>
  );
};

const Slider = () => {
  const playing = stores.useAudio((state) => state.playing);
  // playing.audio.currentTime, playing.audio.duration
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    if (!playing) return;

    const interval = setInterval(() => {
      setPercent((playing.audio.currentTime / playing.audio.duration) * 100);
    }, 100);

    return () => clearInterval(interval);
  }, [playing]);

  return (
    <div className='slider'>
      <div className='progress' style={{ width: `${percent}%` }} />
    </div>
  );
};

export default Controls;
