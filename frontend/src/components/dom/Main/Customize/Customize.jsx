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

const { Panel } = Collapse;
const { Group } = Radio;

const {
  backgrounds: BACKGROUNDS,
  count: COUNT,
  shaders: SHADERS,
  themes: THEMES,
  blurBg: BLUR_BG,
} = config.options;

const Customize = () => {
  const {
    count,
    pattern,
    effects,
    artworkBg,
    blurBg,
    setCount,
    setPattern,
    toggleArtworkBg,
    setBlurBg,
    initialTheme,
    setInitialTheme,
    setScaleEffects,
    setMovementEffects,
    setColorEffects,
  } = stores.useSwarm((state) => ({
    count: state.count,
    pattern: state.pattern,
    effects: state.effects,
    artworkBg: state.artworkBg,
    blurBg: state.blurBg,
    setCount: state.setCount,
    setPattern: state.setPattern,
    toggleArtworkBg: state.toggleArtworkBg,
    setBlurBg: state.setBlurBg,
    initialTheme: state.initialTheme,
    setInitialTheme: state.setInitialTheme,
    setScaleEffects: state.setScaleEffects,
    setMovementEffects: state.setMovementEffects,
    setColorEffects: state.setColorEffects,
  }));
  const { isAllowed, createPreviewLink, createShareableLink } =
    stores.useInteract((state) => ({
      isAllowed: state.isAllowed,
      createPreviewLink: state.createPreviewLink,
      createShareableLink: state.createShareableLink,
    }));
  const { theme, updateTheme } = stores.useConfig((state) => ({
    theme: state.theme,
    updateTheme: state.updateTheme,
  }));
  const playing = stores.useAudio((state) => state.playing);

  const { isMobile } = hooks.useWindowSize();
  const [isCreatingLink, setIsCreatingLink] = useState(false);

  const copyShareableLink = async () => {
    setIsCreatingLink(true);
    await createShareableLink(playing.data);
    setIsCreatingLink(false);
  };

  const preview = () => {
    const res = createPreviewLink(playing.data);
    if (res.error) {
      toast.error(res.message || 'an error occurred');
    } else {
      window.open(res.data, '_blank');
    }
  };

  return (
    <div className='customize'>
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
              please proceed with caution, as some artworks may contain flashing
              images;
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
        blur background
        <Group
          onChange={(e) => setBlurBg(e.target.value)}
          value={blurBg}
          disabled={!artworkBg}>
          {Object.keys(BLUR_BG).map((key) =>
            key === 'default' ? null : (
              <Radio value={BLUR_BG[key]} key={key}>
                {key}
              </Radio>
            ),
          )}
        </Group>
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
      {/* Initial theme with radio 2 btns */}
      <div className='colors'>
        initial theme
        <Group
          onChange={(e) => setInitialTheme(e.target.value)}
          value={initialTheme}>
          {THEMES.map((t) => (
            <Radio value={t} key={t}>
              {t}
            </Radio>
          ))}
        </Group>
      </div>
      <div className='link'>
        <button
          className='button-primary'
          onClick={preview}
          disabled={!playing}>
          preview
        </button>
        <Tooltip
          title={
            !isAllowed()
              ? 'sign in & request allowlist to create links'
              : !playing
              ? 'choose a song to create a link'
              : ''
          }>
          <button
            className='button-primary special'
            disabled={isCreatingLink || !playing || !isAllowed()}
            onClick={copyShareableLink}>
            copy shareable link
          </button>
        </Tooltip>
        <span className='with-icon interact-svg'>
          <Tooltip title='the link points to an immersive render of this song, using the customized settings'>
            <AiOutlineInfoCircle size={20} />
          </Tooltip>
        </span>
      </div>
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

export default Customize;
