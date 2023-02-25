import { Collapse, InputNumber, Select, Slider, Switch } from 'antd';
import { AiOutlineCheck, AiOutlineClose, AiOutlineLeft } from 'react-icons/ai';
import stores from '@/stores';
import hooks from '@/hooks';
import config from '@/data';
import { useEffect } from 'react';

const { Panel } = Collapse;
const {
  backgrounds: BACKGROUNDS,
  count: COUNT,
  shaders: SHADERS,
} = config.options;

const Swarm = () => {
  const {
    count,
    allowDynamicCount,
    pattern,
    setCount,
    setAllowDynamicCount,
    setPattern,
  } = stores.useSwarm((state) => ({
    count: state.count,
    allowDynamicCount: state.allowDynamicCount,
    pattern: state.pattern,
    setCount: state.setCount,
    setAllowDynamicCount: state.setAllowDynamicCount,
    setPattern: state.setPattern,
  }));
  const { isMobile } = hooks.useWindowSize();

  useEffect(() => {
    // Set the count back to default after it's been initialized with the max value
    // to prevent buffer issues
    const repairCount = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCount(COUNT.default);
    };
    repairCount();
  }, [setCount]);

  return (
    <div className='swarm'>
      <Collapse
        bordered={false}
        defaultActiveKey={['1']}
        expandIcon={() => <AiOutlineLeft size={14} />}
        expandIconPosition='end'>
        <Panel
          header='swarm'
          key='1'
          className={`panel ${isMobile ? 'mobile' : 'desktop'}`}>
          <Tab type='dark' />
          <br />
          <Tab type='light' />
          <br />
          <br />
          <Select
            defaultValue={pattern.name}
            onChange={setPattern}
            bordered={false}
            options={SHADERS.vertex.map((v, i) => ({
              value: i,
              label: v.name,
            }))}
          />
          <br />
          <br />
          Count
          <br />
          <Slider
            min={COUNT.min}
            max={COUNT.max}
            value={count}
            onChange={setCount}
          />
          <InputNumber
            min={COUNT.min}
            max={COUNT.max}
            value={count}
            onChange={setCount}
          />
          <br />
          <br />
          Allow dynamic count
          <br />
          <Switch checked={allowDynamicCount} onChange={setAllowDynamicCount} />
          <br />
          <br />
          Create link
        </Panel>
      </Collapse>
    </div>
  );
};

const Tab = ({ type }) => {
  const { colorA, colorB, background, setColorA, setColorB, setBackground } =
    stores.useSwarm((state) => ({
      colorA: state.colorA,
      colorB: state.colorB,
      background: state.background,
      setColorA: state.setColorA,
      setColorB: state.setColorB,
      setBackground: state.setBackground,
    }));
  const theme = stores.useConfig((state) => state.theme);

  return (
    <>
      colors {type}
      <br />
      <input
        type='color'
        value={colorA[type]}
        onChange={(e) => setColorA(e.target.value, type)}
      />
      <input
        type='color'
        value={colorB[type]}
        onChange={(e) => setColorB(e.target.value, type)}
      />
      <br />
      background {type}
      <br />
      <input
        type='color'
        list={`colors-${type}`}
        value={background[type]}
        onChange={(e) => setBackground(e.target.value, type)}
      />
      <datalist id={`colors-${type}`}>
        {BACKGROUNDS[type].map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
    </>
  );
};

export default Swarm;
