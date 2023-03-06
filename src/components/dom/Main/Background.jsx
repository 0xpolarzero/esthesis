import { useEffect, useState } from 'react';
import Image from 'next/image';
import stores from '@/stores';

const colorToBase64Pixel = (color) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  return canvas.toDataURL();
};

const Background = () => {
  const playing = stores.useAudio((state) => state.playing);
  const { artworkBg, background } = stores.useSwarm((state) => ({
    artworkBg: state.artworkBg,
    background: state.background,
  }));
  const theme = stores.useConfig((state) => state.theme);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log(loading);
  }, [loading]);

  if (!playing || !artworkBg) return null;
  console.log(colorToBase64Pixel('rgba(0, 0, 0, 0.5)'));

  return (
    <>
      <div className='bg-wrapper'>
        <Image
          src={playing.data.lossyArtworkUrl}
          alt='artwork'
          fill
          onLoadStart={() => console.log('start')}
          onLoadingComplete={() => console.log('complete')}
          // blur with a pixel with var(--bg-color) as the background
          placeholder='blur'
          blurDataURL={colorToBase64Pixel(background[theme])}
          style={{ objectFit: 'cover' }}
        />
        <div className='bg-overlay' />
      </div>
    </>
  );
};

export default Background;
