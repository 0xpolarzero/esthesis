import { useEffect, useRef, useState } from 'react';
import {
  Collapse,
  InputNumber,
  Popconfirm,
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
import Image from 'next/image';

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
    artworkBg,
    setCount,
    setPattern,
    toggleArtworkBg,
    setScaleEffects,
    setMovementEffects,
    setColorEffects,
  } = stores.useSwarm((state) => ({
    count: state.count,
    pattern: state.pattern,
    effects: state.effects,
    artworkBg: state.artworkBg,
    setCount: state.setCount,
    setPattern: state.setPattern,
    toggleArtworkBg: state.toggleArtworkBg,
    setScaleEffects: state.setScaleEffects,
    setMovementEffects: state.setMovementEffects,
    setColorEffects: state.setColorEffects,
  }));
  const { createPreviewLink, createShareableLink } = stores.useInteract(
    (state) => ({
      createPreviewLink: state.createPreviewLink,
      createShareableLink: state.createShareableLink,
    }),
  );
  const { theme, updateTheme } = stores.useConfig((state) => ({
    theme: state.theme,
    updateTheme: state.updateTheme,
  }));
  const playing = stores.useAudio((state) => state.playing);

  const { isMobile } = hooks.useWindowSize();
  const [isCreatingLink, setIsCreatingLink] = useState(false);

  const notification = useRef(null);

  const copyShareableLink = async () => {
    setIsCreatingLink(true);
    notification.current = toast.loading('creating link...');

    await createShareableLink(playing.data);
    setIsCreatingLink(false);
    toast.dismiss(notification.current);
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
    <div className={`swarm ${isMobile ? 'mobile' : 'desktop'}`}>
      <Collapse
        bordered={false}
        ghost
        expandIcon={() => <AiOutlineLeft size={14} />}
        expandIconPosition='end'>
        <Panel
          header='customize'
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
            <div className='artwork'>
              <span>artwork as background</span>
              <Popconfirm
                title={
                  <>
                    please proceed with caution, as some artworks may contain
                    flashing images;
                    <br />
                    you will see a thumbnail of the artwork when hovering on the
                    track.
                  </>
                }
                onConfirm={toggleArtworkBg}
                disabled={artworkBg}
                okText='continue'
                cancelText='cancel'>
                <Switch
                  checked={artworkBg}
                  onChange={artworkBg ? toggleArtworkBg : null}
                />
              </Popconfirm>
            </div>
            <div className='colors'>
              <span className='header'>audiovisual effects_</span>
              {/* Scale */}
              <span className='with-icon'>
                scale effects
                <Tooltip title='how much should the gain affect the particles scale'>
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
                <Tooltip title='how much should the balance (left/right) affect the swarm rotation'>
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
                <Tooltip title='how much should the average frequency affect the particles color (higher = lighter)'>
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
  const {
    colorA,
    colorB,
    background,
    artworkBg,
    setColorA,
    setColorB,
    setBackground,
  } = stores.useSwarm((state) => ({
    colorA: state.colorA,
    colorB: state.colorB,
    background: state.background,
    artworkBg: state.artworkBg,
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
        disabled={artworkBg}
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
