import Image from 'next/image';
import stores from '@/stores';

const Background = () => {
  const playing = stores.useAudio((state) => state.playing);
  const artworkBg = stores.useSwarm((state) => state.artworkBg);

  if (!playing || !artworkBg) return null;

  return (
    <>
      <div className='bg-wrapper'>
        <Image
          key={playing.data.id}
          src={playing.data.lossyArtworkUrl}
          alt='artwork'
          fill
          style={{ objectFit: 'cover' }}
        />
        <div className='bg-overlay' />
      </div>
    </>
  );
};

export default Background;
