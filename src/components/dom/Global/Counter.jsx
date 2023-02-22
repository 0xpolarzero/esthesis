import { Divider } from 'antd';
import hooks from '@/hooks';

let activeMusic = null;

const Counter = () => {
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
      ): (
        '_scroll to explore'
      ) }
      <a>
       other controls
      </a>
    </div>
  );
};

export default Counter;
