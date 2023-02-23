import { Divider } from 'antd';
import { RiPlayFill, RiPauseFill } from 'react-icons/ri';
import { MdOutlineSkipPrevious, MdOutlineSkipNext } from 'react-icons/md';
import stores from '@/stores';
import hooks from '@/hooks';
import { useEffect, useState } from 'react';

const Controls = () => {
  const { startAudio, play, pause, navigate, suspended, playing } =
    stores.useAudio((state) => ({
      startAudio: state.start,
      play: state.play,
      pause: state.pause,
      navigate: state.navigate,
      suspended: state.suspended,
      playing: state.playing,
    }));
  const tracks = stores.useSpinamp((state) => state.tracks);
  const { isMobile } = hooks.useWindowSize();

  const [existPrev, setExistPrev] = useState(false);
  const [existNext, setExistNext] = useState(false);

  useEffect(() => {
    if (!playing || !tracks) return;

    const index = tracks.items?.findIndex(
      (item) => item.id === playing.data.id,
    );
    console.log(index);
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

  useEffect(() => {
    console.log(tracks);
  }, [tracks]);

  return (
    <div className='controls'>
      {playing ? (
        <div>
          <span>
            {playing.data.title}
            {isMobile ? null : (
              <>
                <Divider type='vertical' style={{ margin: '0 2rem' }} />
                {playing.data.artist.name}
              </>
            )}
          </span>
        </div>
      ) : (
        '_select a track'
      )}
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
    </div>
  );
};

export default Controls;
