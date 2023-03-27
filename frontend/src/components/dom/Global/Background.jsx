import { useState } from 'react';
import Image from 'next/image';
import stores from '@/stores';

const Background = () => {
  const playing = stores.useAudio((state) => state.playing);
  const { artworkBg, blurBg } = stores.useSwarm((state) => ({
    artworkBg: state.artworkBg,
    blurBg: state.blurBg,
  }));
  const [hidden, setHidden] = useState(false);

  if (!playing || !artworkBg) return null;

  return (
    <div className='bg-wrapper'>
      <Image
        key={playing.data.id}
        src={playing.data.lossyArtworkUrl}
        alt='artwork'
        fill
        onError={() => setHidden(true)}
        onLoadingComplete={() => setHidden(false)}
        style={{ objectFit: 'cover' }}
      />
      <div
        className='bg-overlay'
        style={{ backdropFilter: `blur(${blurBg}px)`, opacity: hidden ? 0 : 1 }}
      />
    </div>
  );
};

export default Background;
