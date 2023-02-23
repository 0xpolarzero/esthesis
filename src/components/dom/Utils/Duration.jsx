import stores from '@/stores';
import { Skeleton } from 'antd';
import { useEffect, useState } from 'react';

const Duration = () => {
  const duration = stores.useAudio((state) => state.duration);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    setMinutes(Math.floor(duration / 60));
    setSeconds((duration % 60).toFixed(0));
  }, [duration]);

  if (duration === 0) return <span className='duration'>_</span>;

  return (
    <span className='duration'>
      {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
    </span>
  );
};

export default Duration;
