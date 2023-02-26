import { useEffect, useRef, useState } from 'react';
import { Divider, Tooltip } from 'antd';
import { RiPlayFill, RiPauseFill } from 'react-icons/ri';
import { MdOutlineSkipPrevious, MdOutlineSkipNext } from 'react-icons/md';
import Utils from '../Utils';
import stores from '@/stores';
import hooks from '@/hooks';

const { Duration } = Utils;

const Controls = ({ type }) => {
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
        {type === 'shared' ? null : (
          <MdOutlineSkipPrevious
            size={20}
            onClick={() => (existPrev ? navigate('prev') : null)}
            className={existPrev ? '' : 'disabled'}
          />
        )}

        {suspended ? (
          <RiPlayFill size={20} onClick={play} />
        ) : (
          <RiPauseFill size={20} onClick={pause} />
        )}

        {type === 'shared' ? null : (
          <MdOutlineSkipNext
            size={20}
            onClick={() => (existNext ? navigate('next') : null)}
            className={existNext ? '' : 'disabled'}
          />
        )}
      </div>
      <Slider />
    </div>
  );
};

const Title = ({ playing }) => {
  const duration = stores.useAudio((state) => state.duration);
  const { isMobile } = hooks.useWindowSize();

  return (
    <div className='scroll'>
      {playing.data.title}{' '}
      {isMobile ? (
        <span style={{ opacity: 0.8 }}>
          (<Duration time={duration} />)
        </span>
      ) : null}
      {isMobile ? null : (
        <>
          <Divider type='vertical' style={{ margin: '0 2rem' }} />
          {playing.data.artist.name}
          <Divider type='vertical' style={{ margin: '0 2rem' }} />
          <span style={{ opacity: 0.7 }}>
            <Duration time={duration} />
          </span>
        </>
      )}
    </div>
  );
};

const Slider = () => {
  const { playing, updateTime } = stores.useAudio((state) => ({
    playing: state.playing,
    updateTime: state.updateTime,
  }));
  const [percent, setPercent] = useState(0);

  const slider = useRef(null);
  const interval = useRef(null);

  const scrollTimeline = (e) => {
    if (!playing || !slider.current) return;
    if (e.buttons !== 1) return;

    setPercent((e.clientX / slider.current.offsetWidth) * 100);
    stopInterval();
  };

  const updateTimeline = (e) => {
    if (!playing || !slider.current) return;

    updateTime(e, slider.current);
    startInterval();
  };

  const startInterval = () => {
    if (!playing || interval.current) return;

    interval.current = setInterval(() => {
      setPercent((playing.audio.currentTime / playing.audio.duration) * 100);
    }, 100);
  };

  const stopInterval = () => {
    if (!playing || !interval.current) return;

    clearInterval(interval.current);
    interval.current = null;
  };

  useEffect(() => {
    setPercent(0);
    startInterval();
    return () => stopInterval();
  }, [playing]);

  return (
    <Tooltip
      title={playing ? <Duration time={playing.audio.currentTime} /> : null}>
      <div
        ref={slider}
        onPointerMove={scrollTimeline}
        onPointerUp={updateTimeline}
        onPointerOut={startInterval}
        className='slider'>
        <div className='progress' style={{ width: `${percent}%` }} />
      </div>
    </Tooltip>
  );
};

export default Controls;
