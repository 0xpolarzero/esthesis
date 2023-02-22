import { Divider } from 'antd';
import { RiPlayFill, RiPauseFill } from 'react-icons/ri';
import { MdOutlineSkipPrevious, MdOutlineSkipNext } from 'react-icons/md';
import stores from '@/stores';
import hooks from '@/hooks';
import { useEffect, useState } from 'react';

const Counter = () => {
  const { startAudio, stopAudio, navigate, suspended, playing, sources } =
    stores.useAudio((state) => ({
      startAudio: state.start,
      stopAudio: state.stop,
      navigate: state.navigate,
      suspended: state.suspended,
      playing: state.playing,
      sources: state.sources,
    }));
  const { isMobile } = hooks.useWindowSize();

  const [existPrev, setExistPrev] = useState(false);
  const [existNext, setExistNext] = useState(false);

  useEffect(() => {
    if (!playing) return;

    const index = sources.findIndex((item) => item.url === playing.data.url);
    if (index === -1) {
      setExistPrev(false);
      setExistNext(false);
    } else {
      if (index < sources.length - 1) {
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
  }, [playing, sources]);

  return (
    <div className='counter'>
      {isMobile ? (
        `_${'none'}`
      ) : playing ? (
        <div>
          <span>
            {playing.data.name}
            <Divider type='vertical' style={{ margin: '0 2rem' }} />
            {/* {activeMusic.date} */}other
          </span>
        </div>
      ) : (
        '_select a track'
      )}
      <div className='controls'>
        <MdOutlineSkipPrevious
          size={20}
          onClick={() => (existPrev ? navigate('prev') : null)}
          className={existPrev ? '' : 'disabled'}
        />

        {suspended ? (
          <RiPlayFill
            size={20}
            onClick={() =>
              startAudio({
                name: 'test name',
                url: 'https://arweave.net/_vLxu-ASiBA7o1xJ99kOVfQIYQ3IXBB8JKRgAopZJ24',
              })
            }
          />
        ) : (
          <RiPauseFill size={20} onClick={stopAudio} />
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

export default Counter;
