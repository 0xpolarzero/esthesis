import { useEffect, useRef, useState } from 'react';
import {
  Collapse,
  InputNumber,
  Radio,
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
const { Group } = Radio;

const {
  backgrounds: BACKGROUNDS,
  count: COUNT,
  shaders: SHADERS,
} = config.options;

const Swarm = () => {
  const {
    count,
    pattern,
    effects,
    setCount,
    setPattern,
    setScaleEffects,
    setMovementEffects,
    setColorEffects,
  } = stores.useSwarm((state) => ({
    count: state.count,
    pattern: state.pattern,
    effects: state.effects,
    setCount: state.setCount,
    setPattern: state.setPattern,
    setScaleEffects: state.setScaleEffects,
    setMovementEffects: state.setMovementEffects,
    setColorEffects: state.setColorEffects,
  }));
  const { createPreviewLink, createShareableLink } = stores.useShare(
    (state) => ({
      createPreviewLink: state.createPreviewLink,
      createShareableLink: state.createShareableLink,
    }),
  );
  const { theme, updateTheme } = stores.useConfig((state) => ({
    theme: state.theme,
    updateTheme: state.updateTheme,
  }));
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
              defaultActiveKey={theme}
              activeKey={theme}
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
              <span className='header'>audiovisual effects_</span>
              {/* Scale */}
              <span className='with-icon'>
                scale effects
                <Tooltip title='how much should the gain affect the particles scale; 0 = disabled'>
                  <AiOutlineInfoCircle size={20} />
                </Tooltip>
              </span>

              <Group
                onChange={(e) => setScaleEffects(e.target.value)}
                value={effects.scale}>
                <Radio value={0}>none</Radio>
                <Radio value={0.5}>light</Radio>
                <Radio value={1}>med</Radio>
                <Radio value={2}>high</Radio>
              </Group>
              {/* Movement */}
              <span className='with-icon'>
                movement effects
                <Tooltip title='how much should the balance (left/right) affect the swarm rotation; 0 = disabled'>
                  <AiOutlineInfoCircle size={20} />
                </Tooltip>
              </span>
              <Group
                onChange={(e) => setMovementEffects(e.target.value)}
                value={effects.movement}>
                <Radio value={0}>none</Radio>
                <Radio value={0.5}>light</Radio>
                <Radio value={1}>med</Radio>
                <Radio value={2}>high</Radio>
              </Group>
              {/* Color */}
              <span className='with-icon'>
                color effects
                <Tooltip title='how much should the average frequency affect the particles color (higher = lighter); 0 = disabled'>
                  <AiOutlineInfoCircle size={20} />
                </Tooltip>
              </span>
              <Group
                onChange={(e) => setColorEffects(e.target.value)}
                value={effects.color}>
                <Radio value={0}>none</Radio>
                <Radio value={0.5}>light</Radio>
                <Radio value={1}>med</Radio>
                <Radio value={2}>high</Radio>
              </Group>
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
