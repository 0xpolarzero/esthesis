import { Divider } from 'antd';
import { RiPlayFill, RiPauseFill } from 'react-icons/ri';
import stores from '@/stores';
import hooks from '@/hooks';

let activeMusic = null;

const Counter = () => {
  const { startAudio, stopAudio, suspended } = stores.useAudio((state) => ({
    startAudio: state.start,
    stopAudio: state.stop,
    suspended: state.suspended,
  }));
  const { isMobile } = hooks.useWindowSize();

  return (
    <div className='counter'>
      {isMobile ? (
        `_${'none'}`
      ) : activeMusic ? (
        <div>
          <span>
            {activeMusic.title}
            <Divider type='vertical' style={{ margin: '0 2rem' }} />
            {activeMusic.date}
          </span>
        </div>
      ) : (
        '_scroll to explore'
      )}
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
    </div>
  );
};

export default Counter;
