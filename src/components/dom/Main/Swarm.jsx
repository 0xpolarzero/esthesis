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
    allowDynamicEffects,
    pattern,
    setCount,
    setAllowDynamicEffects,
    setPattern,
  } = stores.useSwarm((state) => ({
    count: state.count,
    allowDynamicEffects: state.allowDynamicEffects,
    pattern: state.pattern,
    setCount: state.setCount,
    setAllowDynamicEffects: state.setAllowDynamicEffects,
    setPattern: state.setPattern,
  }));
  const { createPreviewLink, createShareableLink } = stores.useShare(
    (state) => ({
      createPreviewLink: state.createPreviewLink,
      createShareableLink: state.createShareableLink,
    }),
  );
  const updateTheme = stores.useConfig((state) => state.updateTheme);
  const { isMobile } = hooks.useWindowSize();
  const [isCreatingLink, setIsCreatingLink] = useState(false);

  const notification = useRef(null);

  const copyShareableLink = async () => {
    setIsCreatingLink(true);
    notification.current = toast.loading('creating link...');

    const res = await createShareableLink();
    setIsCreatingLink(false);

    if (res.error) {
      toast.update(notification.current, {
        render: res.message || 'an error occurred',
        type: 'error',
        isLoading: false,
        autoClose: 2000,
      });
    } else {
      navigator.clipboard.writeText(res.data);
      toast.update(notification.current, {
        render: 'link copied to clipboard',
        type: 'info',
        isLoading: false,
        autoClose: 2000,
      });
    }
  };

  const preview = () => {
    const res = createPreviewLink();
    if (res.error) {
      toast.error(res.message || 'an error occurred');
    } else {
      window.open(res.data, '_blank');
    }
  };

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
            <div className='colors'>
              <span className='with-icon'>
                allow dynamic background
                <Tooltip title='if checked, the background will change based on the frequencies'>
                  <AiOutlineInfoCircle size={20} />
                </Tooltip>
              </span>
              <Switch
                checked={allowDynamicEffects}
                onChange={setAllowDynamicEffects}
              />
            </div>
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
            </div>
            <div className='link'>
              <button className='button-primary' onClick={preview}>
                preview
              </button>
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
