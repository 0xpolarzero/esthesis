import { Collapse } from 'antd';
import hooks from '@/hooks';
import { AiOutlineLeft } from 'react-icons/ai';

const { Panel } = Collapse;

const Swarm = () => {
  const { isMobile } = hooks.useWindowSize();

  return (
    <div className='swarm'>
      <Collapse
        bordered={false}
        defaultActiveKey={['1']}
        expandIcon={() => <AiOutlineLeft size={14} />}
        expandIconPosition='end'>
        <Panel
          //   ref={ref}
          header='swarm'
          key='1'
          className={`panel ${isMobile ? 'mobile' : 'desktop'}`}>
          content
          <br />
          content
          <br />
        </Panel>
      </Collapse>
    </div>
  );
};

export default Swarm;
