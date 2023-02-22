import { createRef, useEffect, useRef } from 'react';
import stores from '@/stores';
import config from '@/data';

const Audio = () => {
  const setSources = stores.useAudio((state) => state.setSources);

  const refs = useRef(
    Array(config.audio.files.length)
      .fill()
      .map((_, i) => createRef()),
  );

  useEffect(() => {
    setSources(refs.current);
  }, [setSources]);

  return (
    <>
      {config.audio.files.map((value, i) => {
        return (
          <audio
            ref={refs.current[i]}
            key={i}
            src={value.src}
            loop
            preload='none'
            crossOrigin='anonymous'
          />
        );
      })}
    </>
  );
};

export default Audio;
