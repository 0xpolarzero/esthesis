import { createRef, useEffect, useRef } from 'react';
import stores from '@/stores';
import config from '@/data';

const Audio = () => {
  const sources = stores.useAudio((state) => state.sources);
  const ref = useRef();

  if (!sources.length) return null;

  return (
    <audio
      ref={ref}
      src={sources[0].url}
      loop
      preload='none'
      crossOrigin='anonymous'
    />
  );
};

export default Audio;
