import { useEffect, useState } from 'react';

const Duration = ({ time }) => {
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    setMinutes(Math.floor(time / 60));
    setSeconds((time % 60).toFixed(0));
  }, [time]);

  if (time === 0) return <span className='duration'>_</span>;

  return (
    <span className='duration'>
      {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
    </span>
  );
};

export default Duration;
