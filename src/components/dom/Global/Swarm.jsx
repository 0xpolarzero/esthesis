import { useEffect, useRef, useState } from 'react';
import {
  Collapse,
  InputNumber,
  Select,
  Slider,
  Switch,
  Tabs,
  Tooltip,
} from 'antd';
import { AiOutlineInfoCircle, AiOutlineLeft } from 'react-icons/ai';
import { CiLight, CiDark } from 'react-icons/ci';
import { toast } from 'react-toastify';
import stores from '@/stores';
import hooks from '@/hooks';
import config from '@/data';

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
    createShareableLink,
  } = stores.useSwarm((state) => ({
    count: state.count,
    allowDynamicCount: state.allowDynamicCount,
    pattern: state.pattern,
    setCount: state.setCount,
    setAllowDynamicCount: state.setAllowDynamicCount,
    setPattern: state.setPattern,
    createShareableLink: state.createShareableLink,
  }));
  const updateTheme = stores.useConfig((state) => state.updateTheme);
  const { isMobile } = hooks.useWindowSize();
  const [isCreatingLink, setIsCreatingLink] = useState(false);

  const notification = useRef(null);

  const copyShareableLink = async () => {
    setIsCreatingLink(true);
    notification.current = toast.loading('Creating link...');
    const res = await createShareableLink();
    setIsCreatingLink(false);
    console.log('here');
    if (res.error) {
      toast.update(notification.current, {
        render: res.message || 'An error occurred',
        type: 'error',
        isLoading: false,
        autoClose: 2000,
      });
    } else {
      navigator.clipboard.writeText(res.data);
      toast.update(notification.current, {
        render: 'Link copied to clipboard',
        type: 'info',
        isLoading: false,
        autoClose: 2000,
      });
    }
  };

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
        ghost
        expandIcon={() => <AiOutlineLeft size={14} />}
        expandIconPosition='end'>
        <Panel
          header='swarm'
          key='1'
          className={`panel ${isMobile ? 'mobile' : 'desktop'}`}>
          <div className='wrapper'>
            {/* Colors */}
            <Tabs
              defaultActiveKey='1'
              onChange={updateTheme}
              items={[
                {
                  key: 'dark',
                  label: <CiDark size={20} />,
                  children: <Tab type='dark' />,
                },
                {
                  key: 'light',
                  label: <CiLight size={20} />,
                  children: <Tab type='light' />,
                },
              ]}
            />
            <div className='separator horizontal' style={{ width: '100%' }} />
            <div className='pattern'>
              pattern
              {/* Vertex shader */}
              <Select
                defaultValue={pattern.name}
                onChange={setPattern}
                bordered={false}
                options={SHADERS.vertex.map((v, i) => ({
                  value: i,
                  label: v.name,
                }))}
              />
            </div>
            {/* Particles count */}
            <div className='count'>
              count
              <InputNumber
                min={COUNT.min}
                max={COUNT.max}
                value={count}
                onChange={setCount}
              />
              <Slider
                min={COUNT.min}
                max={COUNT.max}
                value={count}
                onChange={setCount}
              />
              <span className='with-icon'>
                allow dynamic count{' '}
                <Tooltip title='if checked, the particles count will be affected by the frequencies of the music'>
                  <AiOutlineInfoCircle size={20} />
                </Tooltip>
              </span>
              <Switch
                checked={allowDynamicCount}
                onChange={setAllowDynamicCount}
              />
            </div>
            <div className='link'>
              <button className='button-primary'>preview</button>
              <button
                className='button-primary special'
                disabled={isCreatingLink}
                onClick={copyShareableLink}>
                copy shareable link
              </button>
              <Tooltip title='the link points to an immersive render of this song, using the customized settings'>
                <AiOutlineInfoCircle size={20} />
              </Tooltip>
            </div>
          </div>
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

  return (
    <div className='colors'>
      particles
      <div>
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
      </div>
      background
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
    </div>
  );
};

export default Swarm;
